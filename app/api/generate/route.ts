import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { DAILY_IP_LIMIT, ROOM_TYPES, STYLES } from '@/lib/constants';

export const runtime = 'nodejs';
export const maxDuration = 60;

// IP당 일일 제한을 관리하기 위한 인메모리 맵
// key: IP주소, value: { count: number, resetAt: number }
const ipLimits = new Map<string, { count: number; resetAt: number }>();

function getIpUsage(ip: string): { allowed: boolean } {
  // 개발 및 퍼포먼스 테스트 환경에서는 IP 생성 제한을 적용하지 않고 100% 허용한다
  return { allowed: true };
}

// 생성 성공 시에만 카운트를 차감해 실패한 요청이 횟수를 소모하지 않도록 한다
function consumeIpUsage(ip: string) {
  const limit = ipLimits.get(ip);
  if (limit) limit.count += 1;
}

export async function POST(req: NextRequest) {
  try {
    // 요청 용량 제한 체크 (~8MB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: '업로드 요청 크기가 제한(8MB)을 초과했습니다. 이미지 해상도를 줄여주세요.' },
        { status: 413 }
      );
    }

    const { image, roomTypeId, styleId, customPrompt, preserveFurniture, redesignMode, mode, count = 1, byokKey } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: '인테리어 디자인을 입힐 원본 방 사진을 업로드해 주세요.' },
        { status: 400 }
      );
    }

    const roomType = ROOM_TYPES.find((r) => r.id === roomTypeId);
    const style = STYLES.find((s) => s.id === styleId);
    if (!roomType || !style) {
      return NextResponse.json(
        { error: '공간 유형과 인테리어 스타일을 선택해 주세요.' },
        { status: 400 }
      );
    }

    const requestedCount = Math.min(4, Math.max(1, Number(count) || 1));

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // API 키 결정 (BYOK 우선, 없으면 서버 환경변수 키)
    const apiKey = (typeof byokKey === 'string' && byokKey.trim()) || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다. 서버 환경변수를 확인해 주세요.' },
        { status: 500 }
      );
    }

    // 데모 모드(서버 제공 키)인 경우에만 IP당 일일 제한 검증
    const isDemoMode = !byokKey;
    if (isDemoMode && !getIpUsage(ip).allowed) {
      return NextResponse.json(
        {
          error: `일일 생성 제한(IP당 하루 ${DAILY_IP_LIMIT}회)을 초과했습니다. 계속 이용하시려면 요금제를 업그레이드해 주세요.`,
        },
        { status: 429 }
      );
    }

    // base64 및 mimeType 파싱
    let mimeType = 'image/jpeg';
    let base64Image = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        base64Image = match[2];
      }
    } else {
      // 상대 경로나 static 샘플 경로인 경우 public 디렉토리에서 읽어서 base64 변환
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const cleanPath = image.split('?')[0].replace(/^\//, '');
        const filePath = path.join(process.cwd(), 'public', cleanPath);
        const fileBuffer = await fs.readFile(filePath);
        base64Image = fileBuffer.toString('base64');
        mimeType = cleanPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      } catch (errFile) {
        console.warn('Failed to convert relative static image to base64:', errFile);
      }
    }

    // 이미지 base64 바이트 사이즈 검증 (~8MB)
    if (base64Image.length > 8 * 1024 * 1024 * 1.33) {
      return NextResponse.json(
        { error: '업로드 이미지 용량이 8MB를 초과합니다. 더 작은 이미지를 업로드해 주세요.' },
        { status: 413 }
      );
    }

    // customPrompt에 위치 교체/맞교체 지시어가 있으면 자동으로 rearrange_layout 모드로 승격
    const hasSwapInstruction = typeof customPrompt === 'string' && (
      customPrompt.toLowerCase().includes('swap') ||
      customPrompt.includes('맞교체') ||
      customPrompt.includes('바꾸기') ||
      customPrompt.includes('위치')
    );

    let effectiveMode = redesignMode || (preserveFurniture ? 'preserve_layout' : 'clear_room');
    if (hasSwapInstruction) {
      effectiveMode = 'rearrange_layout';
    }

    let baseInstruction = '';

    if (mode === 'edit_existing') {
      // 이미 완성된 결과 이미지를 고정하고 사람/반려동물/소품만 자연스럽게 추가/수정하는 인페인팅 모드
      const userReq = (typeof customPrompt === 'string' && customPrompt.trim())
        ? customPrompt.trim()
        : 'Keep the room exact and add high quality detail';

      baseInstruction = `You are a precision photo editor and inpainting master.
TASK: You are given an already finished interior room photo. You MUST PRESERVE the entire room exactly as-is.

ABSOLUTE STRICT CONSTRAINTS (ZERO COLOR DRIFT / ZERO RE-STYLING):
1. COLOR & FABRIC LOCK: Absolutely DO NOT change, shift, recolor, repaint, or replace the colors, fabrics, textures, wood grains, or materials of ANY existing furniture (sofa, chairs, coffee table, rugs, cushions, bed, cabinets, walls, ceiling, flooring). If the sofa is beige, it MUST remain the exact same beige. If the table is walnut wood, it MUST remain the exact same walnut wood.
2. FURNITURE & ARCHITECTURE LOCK: Keep every single piece of furniture, wall decor, windows, lighting fixtures, and floor tiles in the exact same position, shape, angle, and dimensions. DO NOT rearrange or re-render them.
3. INPAINTING ONLY: Your ONLY permitted modification is to seamlessly place/render the following requested addition into the existing room scene:
"${userReq}"
4. REALISTIC BLENDING: If adding a person or animal (dog, cat, etc.), blend them naturally onto/into the existing furniture (e.g. sitting naturally on the existing sofa or resting on the existing rug) with matching camera perspective, scale, and natural soft drop-shadows matching the room's existing light source.
5. PRESERVE ORIGINAL PHOTO TONE: Maintain the exact same white balance, exposure, lighting color, and resolution of the input image.`;
    } else if (effectiveMode === 'preserve_surface' || effectiveMode === 'surface_only') {
      // 🎨🧱 모드 4: 가구/배치 100% 그대로 유지하고 벽지/페인트 색상/바닥재/질감만 변경
      baseInstruction = `You are a precision interior architectural colorist and surface retexturing master.
TASK: Redesign ONLY the wall paint color, wallpaper pattern/material, and flooring material/texture of this ${roomType.prompt} while STRICTLY PRESERVING 100% of all existing furniture, layout, sofa, tables, chairs, lighting fixtures, and decor objects.

ABSOLUTE STRICT CONSTRAINTS:
1. 100% FURNITURE & INTERIOR LAYOUT LOCK: Keep every single sofa, chair, table, cabinet, bed, curtain, lamp, plant, window, and wall decor object in their EXACT same 3D positions, shapes, sizes, colors, and arrangements. DO NOT replace, move, scale, or remove any furniture.
2. SURFACE MODIFICATION ONLY: Your ONLY permitted changes are to update the wall paint/wallpaper color/texture and floor material/texture according to ${style.prompt}.
3. Photorealistic surface rendering, Architectural Digest quality, natural daylight, seamless material texture mapping.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 500);
        baseInstruction += `\n\nUSER SPECIFIC SURFACE REQUIREMENTS: "${trimmedCustom}". Apply these specific paint colors, wallpaper patterns, or flooring textures to the walls and floor while keeping all furniture 100% identical.`;
      }
    } else if (effectiveMode === 'preserve_all') {
      // 🎨 모드 3: 기존 가구 배치 + 원래 색상 + 원래 스타일 완전 보존 (정리정돈 & 고급 조명/스테이징 강화)
      baseInstruction = `You are an elite interior photographer and digital restoration architect.
TASK: Clean up, stage, and professionally photograph this exact ${roomType.prompt} while STRICTLY PRESERVING its existing furniture layout, original colors, wood tones, and core style identity.

RULES:
1. STRICT COLOR & MATERIAL PRESERVATION: Keep the original color palette, wood finishes, upholstery colors, wall paint, and floor materials EXACTLY as they appear in the input photo. DO NOT recolor or re-theme the furniture or walls.
2. PRESERVE FURNITURE POSITIONS & SHAPES: Keep the main furniture (bed, sofa, tables, chairs, cabinets) in their exact positions and shapes.
3. CLEAN UP & DECLUTTER: Remove messy cables, trash, scattered clutter, and temporary junk to make the room look perfectly organized and tidy.
4. PREMIUM RESTORATION & LIGHTING: Enhance the room with architectural-grade ambient lighting, clean glass reflections, balanced window daylight, crisp textures, and subtle high-end styling props that match the existing room's color tone.
5. Ultra-photorealistic photography, Architectural Digest editorial quality, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 500);
        baseInstruction += `\n\nUSER SPECIFIC REQUIREMENTS: "${trimmedCustom}". Seamlessly integrate these details while keeping existing furniture colors and layout intact.`;
      }
    } else if (effectiveMode === 'rearrange_layout' || effectiveMode === 'preserve_layout') {
      // 📐 3D 공간 입체 구조 분석 및 가구 배치 최적화 모드 (과감한 3D 가구 맞교체 & 구역 재배치)
      baseInstruction = `You are a world-class Interior Spatial Architect and 3D Furniture Layout Master.
TASK: Perform a DRAMATIC, HIGH-IMPACT, BOLD 3D furniture repositioning, zone swapping, and spatial layout redesign on this ${roomType.prompt}.

YOUR MANDATE: Create a bold, highly noticeable visual transformation in furniture placement and functional zoning between the before and after photos!

RULES FOR BOLD DRAMATIC LAYOUT REARRANGEMENT:
1. BOLD FURNITURE POSITION SWAPPING & ROTATION: Visually exchange, swap, rotate by 90-180 degrees, and re-stage major movable furniture sets (e.g., completely swap the positions of dining table sets with island counters, move sofas to opposite walls, re-orient study desks towards open room centers, relocate beds, floor lamps, rugs, and potted plants).
2. HIGH-IMPACT SPATIAL RE-ZONING: Perform a bold spatial zoning overhaul where main furniture pieces change their primary locations in the room, creating an immediately distinct Before/After visual comparison.
3. ARCHITECTURAL WALL & WINDOW INTEGRITY: Keep existing structural walls, ceiling plane, floor plane, built-in kitchen wall cabinets, gas stove/sink fixtures, and existing window boundaries intact. DO NOT create new windows or erase existing windows. Keep solid interior walls as solid walls.
4. Photorealistic interior photography, Architectural Digest editorial quality, clean daylighting, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 500);
        baseInstruction += `\n\nUSER SPECIFIC BOLD 3D LAYOUT INSTRUCTION: "${trimmedCustom}". Perform a bold spatial position swap and dramatic furniture movement while strictly preserving structural walls, window glass frames, and kitchen wall cabinets intact without adding new windows.`;
      }
    } else {
      // 🧹 모드 1: 완전 비우기 후 새로운 가구와 인테리어로 배치 (기본)
      baseInstruction = `You are a world-class professional interior architect and 3D visualizer.
TASK: Completely clear out and empty all existing furniture and clutter from this room, then furnish and redesign it from scratch as a brand new ${roomType.prompt} in ${style.prompt}.
RULES:
1. STRICT ARCHITECTURAL CONSTRAINTS: Keep the exact room shell, camera perspective, viewpoint, wall boundaries, ceiling, floor plane, windows, and doors unchanged.
2. COMPLETE DECLUTTER & OBJECT REMOVAL: Erase and remove all existing furniture, beds, sofas, desks, chairs, tables, shelves, clutter, electronics, cables, boxes, and old decor from the room. Treat the space as a clean, empty room.
3. FRESH VIRTUAL STAGING & INTERIOR: Place brand new, stylish, beautifully proportioned modern furniture, designer lighting, curated decor, plants, and textures suited for ${style.prompt}.
4. Photorealistic interior photography, architectural digest quality, realistic ambient lighting, clean reflections, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 500);
        baseInstruction += `\n\nUSER SPECIFIC REQUIREMENTS: "${trimmedCustom}". Seamlessly integrate these requested items, colors, materials, or features into the new design while strictly maintaining the architectural room shell.`;
      }
    }

    // 다중 시안 생성을 위한 고유 뉘앙스 디렉티브 (대표 테마/스타일은 100% 유지하면서 각 시안마다 차별화된 미학 제공)
    const VARIATION_DIRECTIVES = (effectiveMode === 'rearrange_layout' || effectiveMode === 'preserve_layout')
      ? [
          'VARIATION 1 (Bold 180-Degree Zone & Furniture Position Swap): DRAMATICALLY SWAP FURNITURE POSITIONS. Move main movable furniture sets (e.g. dining table set vs kitchen island counter / sofa vs TV accent wall) to completely swapped opposite sides of the room. Invert their spatial positions while preserving 100% of structural walls and windows.',
          'VARIATION 2 (Perpendicular 90-Degree Rotated Layout & Bar Stools): DRAMATICALLY REARRANGE THE FURNITURE. Rotate the main dining table and chairs by 90 degrees into a perpendicular orientation. Add modern wooden bar stools along the island counter. Relocate plant accents to the foreground.',
          'VARIATION 3 (Open Parallel Zoning & Bar Stool Staging): DRAMATICALLY REARRANGE THE FURNITURE. Re-align the dining table and chairs into a parallel zone on the right. Stage 3 Scandinavian bar stools neatly under the island counter. Relocate decor and lighting.',
          'VARIATION 4 (Diagonal Dynamic Staging & Angle Shift): DRAMATICALLY REARRANGE THE FURNITURE. Angle the seating and dining layout dynamically across the space for open visual flow and fresh perspective.',
        ]
      : [
          'VARIATION 1 (Classic Balance): Focus on quintessential style harmony, perfectly balanced proportion, and natural midday ambient daylight.',
          'VARIATION 2 (Atmospheric Mood): Focus on rich layered lighting, cozy evening warm luminescence, and refined statement accent textures.',
          'VARIATION 3 (Spacious Minimal Elegance): Focus on airy open spatial feel, sleek architectural silhouettes, and sophisticated textural contrasts.',
          'VARIATION 4 (Curated Botanical & Luxe): Focus on curated designer decor objects, lush botanical greenery accents, and bespoke editorial touches.',
        ];

    const ai = new GoogleGenAI({ apiKey });

    // requestedCount만큼 병렬 비동기 생성 요청
    const generationPromises = Array.from({ length: requestedCount }).map(async (_, index) => {
      let finalInstruction = baseInstruction;
      if (requestedCount > 1) {
        finalInstruction += `\n\n${VARIATION_DIRECTIVES[index % VARIATION_DIRECTIVES.length]}`;
      }

      let res;
      try {
        res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [
            {
              role: 'user',
              parts: [{ inlineData: { mimeType, data: base64Image } }, { text: finalInstruction }],
            },
          ],
        });
      } catch (err25Img) {
        try {
          console.warn('Gemini 2.5 flash-image model call failed, trying gemini-3.1-flash-image:', err25Img);
          res = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image',
            contents: [
              {
                role: 'user',
                parts: [{ inlineData: { mimeType, data: base64Image } }, { text: finalInstruction }],
              },
            ],
          });
        } catch (err31Img) {
          console.warn('Gemini 3.1 flash-image model call failed, trying gemini-3-pro-image:', err31Img);
          res = await ai.models.generateContent({
            model: 'gemini-3-pro-image',
            contents: [
              {
                role: 'user',
                parts: [{ inlineData: { mimeType, data: base64Image } }, { text: finalInstruction }],
              },
            ],
          });
        }
      }

      const candidate = res.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error('안전 정책에 의해 이미지 생성이 차단되었습니다.');
      }

      const part = candidate?.content?.parts?.find((p) => p.inlineData);
      const data = part?.inlineData?.data;
      if (!data) {
        throw new Error('이미지 생성이 실패했거나 차단되었습니다.');
      }
      return data;
    });

    const generatedImages = await Promise.all(generationPromises);

    if (isDemoMode) {
      // 데모 모드 차감
      for (let i = 0; i < requestedCount; i++) {
        consumeIpUsage(ip);
      }
    }

    return NextResponse.json({
      image: generatedImages[0],
      images: generatedImages,
      count: generatedImages.length,
    });
  } catch (error) {
    console.error('Gemini Generate API Error:', error);
    const errMsg = error instanceof Error ? error.message : '';

    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('invalid api key')
    ) {
      return NextResponse.json(
        { error: 'API 키가 잘못되었습니다. 발급받은 유효한 API 키를 정확히 입력해 주세요.' },
        { status: 401 }
      );
    }

    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('429')) {
      return NextResponse.json(
        { error: 'API 무료 요청 할당량을 초과했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 429 }
      );
    }

    if (errMsg.includes('SAFETY') || errMsg.includes('safety') || errMsg.includes('blocked')) {
      return NextResponse.json(
        { error: '안전 필터에 의해 생성이 거부되었습니다. 다른 사진이나 스타일로 시도해 주세요.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `인테리어 생성 실패: ${errMsg || '알 수 없는 서버 내부 오류'}` },
      { status: 500 }
    );
  }
}
