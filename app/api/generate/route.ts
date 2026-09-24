import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { DAILY_IP_LIMIT, ROOM_TYPES, STYLES, ALL_STYLES } from '@/lib/constants';

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

// 한국어 및 영어 가구 위치 맞교환 대상 분석
function parseFurnitureSwapItems(text: string): { itemA: string; itemB: string } | null {
  if (!text) return null;

  // 부정문 또는 가구 보존/변형 금지 지시문인 경우 swap 명령으로 오인하지 않도록 사전 차단
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes('zero deformation') ||
    lowerText.includes('strictly forbidden') ||
    lowerText.includes('do not replace') ||
    lowerText.includes('do not swap') ||
    lowerText.includes("don't swap") ||
    lowerText.includes('never swap') ||
    lowerText.includes('변형 금지') ||
    lowerText.includes('교체 금지') ||
    lowerText.includes('보존') ||
    lowerText.includes('preserve')
  ) {
    // 단, 명시적 선택적 맞교환 접두어가 있는 경우는 예외 허용
    if (!lowerText.startsWith('selective furniture relocation/swap:')) {
      return null;
    }
  }

  const cleaned = text
    .replace(/^Selective furniture relocation\/swap:\s*/i, '')
    .replace(/^USER (?:CUSTOM )?(?:SPECIFIC )?(?:REQUEST|INSTRUCTION):\s*/i, '')
    .replace(/CRITICAL ZERO DUPLICATION:.*$/i, '')
    .trim();

  // 가구명이 아닌 일반 명사/추상 단어 블랙리스트
  const isGenericOrInvalidNoun = (noun: string): boolean => {
    const n = noun.toLowerCase().trim();
    const invalidWords = [
      'any furniture', 'furniture piece', 'furniture', 'different design', 'different style',
      'different shape', 'different brand', 'different', 'design', 'style', 'shape', 'brand',
      'piece', 'item', 'anything', 'other', 'model', 'all', 'every', 'room', 'space',
      '가구', '어떤 가구', '다른 디자인', '다른 스타일', '디자인', '스타일', '모양', '형태', '변형'
    ];
    return invalidWords.some(w => n === w || n.includes('any furniture') || n.includes('different design'));
  };

  // 한국어 패턴: [가구A](와|과|하고|랑|이랑) [가구B](의)? (위치|자리)(를|을)? (교환|바꿔|맞교체|맞바꿔|변경|이동|스왑)
  const koRegex = /(?:.*?)([가-힣A-Za-z0-9\s]+?)(?:와|과|하고|랑|이랑)\s+([가-힣A-Za-z0-9\s]+?)(?:의)?\s*(?:위치|자리)(?:를|을)?\s*(?:교환|바꿔|맞교체|맞바꿔|스왑)/i;
  const matchKo = cleaned.match(koRegex);
  if (matchKo) {
    const itemA = matchKo[1].trim();
    const itemB = matchKo[2].trim();
    if (itemA && itemB && itemA !== itemB && !isGenericOrInvalidNoun(itemA) && !isGenericOrInvalidNoun(itemB)) {
      return { itemA, itemB };
    }
  }

  // 영어 패턴: swap (the )?([itemA]) (and|with) (the )?([itemB])
  const enRegex = /\bswap\s+(?:the\s+)?([a-zA-Z0-9\s]+?)\s+(?:and|with)\s+(?:the\s+)?([a-zA-Z0-9\s]+)/i;
  const matchEn = cleaned.match(enRegex);
  if (matchEn) {
    const itemA = matchEn[1].trim();
    const itemB = matchEn[2].trim();
    if (itemA && itemB && itemA !== itemB && !isGenericOrInvalidNoun(itemA) && !isGenericOrInvalidNoun(itemB)) {
      return { itemA, itemB };
    }
  }
  return null;
}

function toBilingualFurnitureName(name: string): string {
  const lower = name.toLowerCase().trim();
  const dict: [RegExp, string][] = [
    [/아일랜드(?:\s*식탁)?|island/i, 'kitchen island counter'],
    [/(?:원형|사각)?\s*식탁(?:\s*세트)?|dining/i, 'dining table with dining chairs set'],
    [/소파|쇼파|sofa|couch/i, 'sofa / couch with coffee table'],
    [/tv\s*(?:거실장|장식장|선반|다이|장)|거실장|tv\s*(?:stand|console|unit)/i, 'TV media console cabinet / credenza'],
    [/침대|bed/i, 'bed with headboard'],
    [/책상|desk/i, 'study workstation / desk and chair'],
    [/책장|bookshelf|bookcase/i, 'bookshelf / tall shelving unit'],
    [/화장대|vanity/i, 'vanity dressing table with mirror'],
    [/옷장|붙박이장|wardrobe|closet/i, 'wardrobe / clothes storage closet'],
    [/서랍장|수납장|dresser|credenza/i, 'storage drawer chest / dresser'],
    [/암체어|의자|chair|armchair/i, 'accent armchair / chair'],
    [/테이블|커피테이블|티테이블|coffee\s*table/i, 'coffee table / accent table'],
    [/협탁|nightstand/i, 'bedside nightstand table'],
    [/어린이\s*침대|아이\s*침대|이층침대|child\s*bed|bunk/i, "child's bed / bunk bed"],
    [/장난감\s*(?:정리함|수납장|통)|toy\s*(?:storage|chest|box)/i, 'toy storage organizer chest / bins'],
    [/공부\s*책상|kids?\s*desk/i, "child's study desk and chair"],
    [/놀이\s*매트|키즈\s*러그|play\s*mat/i, "children's play mat / kids area rug"],
    [/식탁의자|바체어|stool/i, 'chairs / stools'],
    [/냉장고|fridge/i, 'refrigerator'],
    [/조명|스탠드|lamp/i, 'floor lamp / lighting fixture'],
  ];

  for (const [regex, en] of dict) {
    if (regex.test(lower)) {
      return `${en} ("${name}")`;
    }
  }
  return `furniture piece "${name}"`;
}

// 모든 방 종류(침실, 거실, 주방, 서재 등)와 모든 가구에 적용되는 범용 위치 교환/재배치 지시문 생성기
function buildUniversalRelocationInstruction(userReq: string, roomPrompt: string = 'interior room'): string {
  const parsedSwap = parseFurnitureSwapItems(userReq);
  const reqLower = userReq.toLowerCase();
  const isDirectSwap = Boolean(parsedSwap) ||
    reqLower.includes('교환') ||
    reqLower.includes('맞교체') ||
    reqLower.includes('맞바꿔') ||
    reqLower.includes('스왑') ||
    reqLower.includes('swap') ||
    /(?:위치|자리).*?(?:바꿔|변경|교환|맞교체|맞바꿔)/.test(reqLower);

  if (isDirectSwap) {
    if (parsedSwap) {
      const { itemA, itemB } = parsedSwap;
      const descA = toBilingualFurnitureName(itemA);
      const descB = toBilingualFurnitureName(itemB);
      return `MANDATORY 1:1 POSITION SWAP FOR ${descA} AND ${descB} (DO NOT LEAVE THEM IN ORIGINAL PLACES):
- User specific request: "${userReq}"
- PRIMARY VISIBLE CHANGE: The spatial positions of ${descA} and ${descB} MUST be visibly swapped!
- ${descA}: Must MOVE to the exact position previously occupied by ${descB}. Its former spot must be completely vacated.
- ${descB}: Must MOVE to the exact position previously occupied by ${descA}. Its former spot must be completely vacated.
- Associated accessories and chairs accompany their primary furniture piece to the new location naturally.
- ZERO DUPLICATION & STRICT 1:1 COUNT (CRITICAL): There must remain strictly ONE ${descA} and strictly ONE ${descB} in the entire ${roomPrompt}. Absolutely DO NOT duplicate or leave ghost copies in their former spots.
- Keep authentic architectural proportions, textures, and silhouettes without warping or cramming.`;
    } else {
      return `MANDATORY 1:1 POSITION SWAP (DO NOT LEAVE FURNITURE IN ORIGINAL PLACES):
- User specific request: "${userReq}"
- PRIMARY VISIBLE CHANGE: The spatial positions of the two primary furniture pieces mentioned MUST be visibly swapped!
- Piece 1 moves to the exact spatial location previously occupied by Piece 2, completely vacating its original position.
- Piece 2 moves to the exact spatial location previously occupied by Piece 1, completely vacating its original position.
- Associated accessories accompany their primary furniture piece to the new location naturally.
- ZERO DUPLICATION & STRICT 1:1 COUNT (CRITICAL): Strictly maintain exactly ONE of each piece in the entire ${roomPrompt}. Absolutely DO NOT duplicate or create extra copies of any furniture.
- Keep authentic architectural proportions, textures, and silhouettes without warping or cramming.`;
    }
  }

  return `TARGETED FURNITURE RELOCATION:
- User specific request: "${userReq}"
- Move the specified furniture piece(s) to the designated new location in the room as requested.
- The original spot previously occupied by the moved furniture must be completely cleared and vacated.
- ZERO DUPLICATION (CRITICAL): Absolutely DO NOT create duplicate copies of any moved furniture. There must remain strictly ONE of each piece in the entire ${roomPrompt}.
- Maintain realistic proportions, clearances, and natural circulation paths.`;
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

    const { image, markedImage, roomTypeId, styleId, customPrompt: rawCustomPrompt, preserveFurniture, redesignMode, mode, count = 1, byokKey, roomDimensions } = await req.json();

    // 📐 방 실측 치수(가로 x 세로 m) 및 가구 비례 구속조건 구축
    let dimensionPromptChunk = '';
    if (roomDimensions && (roomDimensions.width || roomDimensions.length)) {
      const w = Number(roomDimensions.width) || 3.0;
      const l = Number(roomDimensions.length) || 3.3;
      const areaM2 = (w * l).toFixed(1);
      const pyeong = (w * l / 3.3058).toFixed(1);

      const furnitureLines: string[] = [];

      // 침대 규격
      if (roomDimensions.bedType && roomDimensions.bedType !== 'none') {
        let bedDesc = 'Super-Single Bed (1.1m x 2.0m)';
        if (roomDimensions.bedType === 'single') bedDesc = 'Single Bed (1.0m x 2.0m)';
        else if (roomDimensions.bedType === 'super_single') bedDesc = 'Super-Single Bed (1.1m x 2.0m)';
        else if (roomDimensions.bedType === 'queen') bedDesc = 'Queen Bed (1.5m x 2.0m)';
        else if (roomDimensions.bedType === 'king') bedDesc = 'King Bed (1.8m x 2.0m)';
        else if (roomDimensions.bedType === 'twin_two') bedDesc = 'Twin Setup: Two Separate Single Beds (each 1.0m x 2.0m, Total 2 beds)';
        else if (roomDimensions.bedType === 'junior') bedDesc = 'Junior / Kids Bed (0.8m x 1.6m)';
        else if (roomDimensions.bedType === 'bunk_bed') bedDesc = 'Bunk Bed / 2-Tier Kids Bed (1.0m x 2.0m footprint)';
        furnitureLines.push(`  * Bed Specification: ${bedDesc}, placed against solid perimeter wall ensuring entrance and window clearances.`);
      }

      // 소파 규격
      if (roomDimensions.sofaType && roomDimensions.sofaType !== 'none') {
        let sofaDesc = 'Standard 3-Person Sofa (2.2m x 0.95m)';
        if (roomDimensions.sofaType === 'one_seater') sofaDesc = '1-Person Armchair (0.9m x 0.9m)';
        else if (roomDimensions.sofaType === 'two_seater') sofaDesc = 'Compact 2-Person Loveseat (1.6m x 0.9m)';
        else if (roomDimensions.sofaType === 'four_seater') sofaDesc = 'Large 4-Person / Chaise Sectional Sofa (2.8m x 1.6m)';
        furnitureLines.push(`  * Living Sofa: ${sofaDesc}, placed facing the focal wall/TV or open conversation angle with generous walking clearance.`);
      }

      // 식탁 규격
      if (roomDimensions.diningTableType && roomDimensions.diningTableType !== 'none') {
        let diningDesc = '4-Person Dining Table (1.4m x 0.8m)';
        if (roomDimensions.diningTableType === 'two_person') diningDesc = '2-Person Cafe/Dining Table (0.8m x 0.8m)';
        else if (roomDimensions.diningTableType === 'six_person') diningDesc = 'Large 6-Person Family Dining Table (1.8m x 0.9m)';
        else if (roomDimensions.diningTableType === 'island_bar') diningDesc = 'Kitchen Island Counter / Home Bar (1.6m x 0.8m)';
        furnitureLines.push(`  * Dining Table: ${diningDesc}, arranged with ergonomic chair pull-out clearance (minimum 60cm behind chairs).`);
      }

      // 책상 규격
      if (roomDimensions.deskType && roomDimensions.deskType !== 'none') {
        let deskDesc = 'Standard Study Desk (1.2m x 0.6m)';
        if (roomDimensions.deskType === 'compact') deskDesc = 'Compact Desk (1.0m x 0.6m)';
        else if (roomDimensions.deskType === 'wide') deskDesc = 'Wide Executive Desk (1.5m x 0.7m)';
        furnitureLines.push(`  * Desk / Workstation: ${deskDesc}, neatly positioned along the perimeter wall with natural task lighting.`);
      }

      const furnitureSection = furnitureLines.length > 0
        ? `- PROPORTIONALLY SIZED KEY FURNITURE:\n${furnitureLines.join('\n')}`
        : '- FURNITURE: Minimalist open floor space without bulky furniture blocks.';

      const maxWallLength = Math.max(w, l);

      dimensionPromptChunk = `[REAL-WORLD SPATIAL DIMENSIONS & HUMAN-SCALE CLEARANCE CONSTRAINTS]
- EXACT PHYSICAL ROOM ENCLOSURE: Strictly ${w}m (width) by ${l}m (length) [Total Floor Area: ${areaM2} m² / approx. ${pyeong} pyeong], standard 2.4m ceiling height.
${furnitureSection}
- MATHEMATICAL WALL LENGTH & MULTI-BED COLLISION CONSTRAINTS (CRITICAL):
  * The sum of furniture lengths placed along any wall MUST NOT exceed that wall's physical measurement (${w}m or ${l}m).
  * MULTI-BED / TWIN / KIDS ROOM PLACEMENT RULE:
    - If there are TWO beds in the room (such as in a kids/siblings bedroom), each 2.0m bed requires 2.0m length (total 4.0m+ for end-to-end line).
    - In this room (${w}m x ${l}m, maximum wall length is only ${maxWallLength}m), NEVER place two 2.0m beds in a straight end-to-end line along the ${l}m wall! Placing two 2.0m beds end-to-end along a ${l}m wall is mathematically and physically impossible, causes unnatural furniture distortion, and crowds the window.
    - INSTEAD, strictly arrange dual beds using one of these authentic, realistic layouts:
      1) PARALLEL (11-SHAPE) LAYOUT: Place both beds parallel to each other with their headboards against the wall, separated by a 50~60cm walking lane. (Total width required: 1.0m + 0.6m + 1.0m = 2.6m, which perfectly fits within ${Math.min(w, l)}m+).
      2) L-SHAPED CORNER LAYOUT: Place one bed along the long wall and the second bed along the perpendicular adjoining wall in an L-configuration, keeping the center room and window open.
      3) BUNK / LOFT BED: Stack vertically to occupy only a single 1.0m x 2.0m floor footprint.
- MANDATORY HUMAN CLEARANCES & ERGONOMICS:
  * Maintain at least 50-70cm of unobstructed pedestrian walking pathways around furniture.
  * Window openings, natural daylight, and curtains must NEVER be obstructed or jammed flush by large bed frames. Keep clear breathing room in front of windows.
  * Door swing arcs must remain completely unobstructed without colliding with any furniture corners.
- STRICT REALISTIC PROPORTIONS:
  * DO NOT render an artificially elongated or massive mansion room.
  * DO NOT shrink furniture into miniature dollhouse scale.
  * Sizing and clearance must strictly reflect real-world human scale within this ${w}m x ${l}m space envelope.`;
    }

    let customPrompt = typeof rawCustomPrompt === 'string' ? rawCustomPrompt : '';
    if (dimensionPromptChunk) {
      customPrompt = customPrompt ? `${dimensionPromptChunk}\n\n${customPrompt}` : dimensionPromptChunk;
    }

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: '인테리어 디자인을 입힐 원본 방 사진을 업로드해 주세요.' },
        { status: 400 }
      );
    }

    const roomType = ROOM_TYPES.find((r) => r.id === roomTypeId) || ROOM_TYPES[0];
    const style = ALL_STYLES.find((s) => s.id === styleId) || STYLES.find((s) => s.id === styleId) || STYLES[0];

    const requestedCount = 1; // 모든 프로젝트 결과물은 단일 1개 고품질 시안으로 생성

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

    const ai = new GoogleGenAI({ apiKey });

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

    // markedImage (사용자가 지우고자 붉은색 등으로 마킹/색칠한 오버레이 이미지) 파싱
    let base64MarkedImage: string | null = null;
    let markedMimeType = 'image/jpeg';
    if (typeof markedImage === 'string' && markedImage.trim()) {
      if (markedImage.startsWith('data:')) {
        const mMatch = markedImage.match(/^data:([^;]+);base64,(.*)$/);
        if (mMatch) {
          markedMimeType = mMatch[1];
          base64MarkedImage = mMatch[2];
        }
      } else {
        base64MarkedImage = markedImage;
      }
    }

    // 이미지 base64 바이트 사이즈 검증 (~8MB)
    if (base64Image.length > 8 * 1024 * 1024 * 1.33) {
      return NextResponse.json(
        { error: '업로드 이미지 용량이 8MB를 초과합니다. 더 작은 이미지를 업로드해 주세요.' },
        { status: 413 }
      );
    }

    // 기본 모드는 interior_staging (실내인테리어 디자인)
    let effectiveMode = redesignMode || (preserveFurniture ? 'preserve_layout' : 'interior_staging');

    // 가구 이동/배치 변경 키워드 감지 (음성 입력 또는 커스텀 프롬프트 지원)
    const hasMoveInstruction = typeof customPrompt === 'string' && (
      customPrompt.toLowerCase().includes('swap') ||
      customPrompt.toLowerCase().includes('move') ||
      customPrompt.toLowerCase().includes('relocate') ||
      customPrompt.toLowerCase().includes('rearrange') ||
      customPrompt.toLowerCase().includes('reposition') ||
      customPrompt.includes('침대') ||
      customPrompt.includes('옮겨') ||
      customPrompt.includes('움직') ||
      customPrompt.includes('이동') ||
      customPrompt.includes('바꿔') ||
      customPrompt.includes('교환') ||
      customPrompt.includes('위치') ||
      customPrompt.includes('자리') ||
      customPrompt.includes('맞교체') ||
      customPrompt.includes('가구 맞교체') ||
      customPrompt.includes('가구 위치') ||
      customPrompt.includes('배치 변경') ||
      customPrompt.includes('재배치')
    );
    const roomId = (roomType.id || '').toLowerCase();
    const promptStr = typeof customPrompt === 'string' ? customPrompt.toLowerCase() : '';

    const isGarden = roomId.includes('garden') ||
      roomId.includes('patio') ||
      promptStr.includes('garden') ||
      promptStr.includes('patio') ||
      promptStr.includes('정원') ||
      promptStr.includes('테라스') ||
      (roomType.category === 'outdoor');

    const isExterior = !isGarden && (
      roomId.includes('exterior') ||
      promptStr.includes('exterior') ||
      promptStr.includes('facade') ||
      promptStr.includes('외관') ||
      promptStr.includes('건물') ||
      (roomType.category === 'exterior')
    );

    const isPartyRoom = !isExterior && !isGarden && (roomId === 'party_room' || roomId.includes('party') || (typeof styleId === 'string' && styleId.startsWith('party_')) || promptStr.includes('party') || promptStr.includes('파티'));

    if (hasMoveInstruction && mode !== 'edit_existing' && effectiveMode !== 'preserve_surface' && effectiveMode !== 'preserve_all' && effectiveMode !== 'object_removal' && effectiveMode !== 'cleanup' && effectiveMode !== 'replace_furniture' && effectiveMode !== 'replace' && effectiveMode !== 'party_styling' && !isPartyRoom && !isExterior && !isGarden) {
      effectiveMode = 'rearrange_layout';
    }

    const isKidsRoom = !isExterior && !isGarden && (roomId === 'kids_room' || roomId.includes('kid') || promptStr.includes('kids') || promptStr.includes('아이들방') || promptStr.includes('어린이') || promptStr.includes('아이방'));
    const isBedroom = !isKidsRoom && !isExterior && !isGarden && (roomId === 'bedroom' || promptStr.includes('bed') || promptStr.includes('침대') || promptStr.includes('침실'));
    const isKitchen = !isExterior && !isGarden && (roomId === 'kitchen' || promptStr.includes('kitchen') || promptStr.includes('dining') || promptStr.includes('island') || promptStr.includes('주방') || promptStr.includes('식탁') || promptStr.includes('아일랜드'));
    const isLivingRoom = !isExterior && !isGarden && (roomId === 'living_room' || promptStr.includes('living') || promptStr.includes('sofa') || promptStr.includes('couch') || promptStr.includes('거실') || promptStr.includes('소파'));
    const isStudy = !isExterior && !isGarden && (roomId === 'study' || roomId === 'home_office' || promptStr.includes('study') || promptStr.includes('office') || promptStr.includes('desk') || promptStr.includes('서재') || promptStr.includes('책상') || promptStr.includes('오피스'));

    const BEDROOM_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this bedroom:
1. STRICT CAMERA LOCK & SPACE PRESERVATION (DO NOT FLIP/MIRROR): Maintain the EXACT original camera perspective (window on left, solid wall in back, wood wall on right). 100% PRESERVE the forest/garden view outside the window and oak flooring. Absolutely DO NOT change the outdoor view to a city or balcony.
2. MAJOR FURNITURE RELOCATION (CONCEPT 1: DUAL-SIDE CIRCULATION & CENTERED BED):
   - The bed MUST MOVE from the right wood wall to the CENTER of the back solid wall.
   - Symmetrically flanked by two matching bedside nightstands with warm designer lighting.
   - The bed completely vacates the right wood wall.
3. REORGANIZED DRESSING & RELAXATION ZONE:
   - The wooden dresser and single vanity mirror are relocated to the right wood wall where the bed was, alongside a comfortable accent armchair.
   - The back wall behind the bed has NO mirror. There is strictly ONE mirror in the room, on the right wood wall.
4. CIRCULATION OPTIMIZATION:
   - Unobstructed dual-side walking clearance around the bed, allowing easy access to the window, dresser, and doorway.
Photorealistic architectural photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this bedroom:
1. STRICT CAMERA LOCK & SPACE PRESERVATION (DO NOT FLIP/MIRROR): Maintain the EXACT original camera perspective (window on left, solid wall in back, wood wall on right). 100% PRESERVE the forest/garden view outside the window and oak flooring. Absolutely DO NOT change the outdoor view to a city or balcony.
2. MAJOR FURNITURE RELOCATION (CONCEPT 2: SPACIOUS OPEN-FLOW & READING LOUNGE):
   - The bed MUST MOVE from the right wood wall to the back solid wall, styled with floating minimalist nightstands and soft cove lighting.
   - The right-hand wood wall is transformed into a sleek, open circulation area featuring a low architectural credenza, a tall potted olive tree, and a bespoke reading lounge chair.
   - NO mirror behind the bed.
3. CIRCULATION OPTIMIZATION:
   - Maximizes floor walkway width, creating an airy hotel-suite atmosphere with effortless movement between sleep and lounge areas.
Photorealistic architectural photography, 8k resolution.`
    ];

    const KITCHEN_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this kitchen and dining space:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, perspective angle, eye-level, walls, and flooring as the original photo. Window MUST remain on left, kitchen cabinets in back, living room transition on right.
2. MAJOR FURNITURE RELOCATION (CONCEPT 1: 1:1 MUTUAL POSITION SWAP - 식탁과 아일랜드 위치 맞교체):
   - CRITICAL REQUIREMENT: Visibly SWAP the spatial positions of the wooden dining table set and the kitchen island counter!
   - The wooden dining table and chairs set MUST MOVE to the LEFT / FOREGROUND area (where the island was).
   - The kitchen island with marble countertop MUST MOVE to the RIGHT / MIDGROUND area adjacent to the cabinets.
   - Former positions of both pieces must be completely vacated and restored with matching flooring.
   - DECLUTTER IF TIGHT: If the space feels tight or cramped, remove redundant side chairs or clutter to establish a relaxed, airy walking circulation.
3. PRESERVE FURNITURE INTEGRITY & ZERO DUPLICATION:
   - Exactly ONE dining table set and strictly ONE kitchen island in the room. NEVER duplicate either piece.
   - Keep the original furniture models, wood finishes, and marble tops without warping or distortion.
4. CIRCULATION OPTIMIZATION:
   - Wide, unobstructed walking pathways between cooking prep zones and dining seating, eliminating all bottlenecks.
Photorealistic architectural editorial photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this kitchen and dining space:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, perspective angle, eye-level, walls, and flooring as the original photo. Window MUST remain on left, kitchen cabinets in back, living room transition on right.
2. MAJOR FURNITURE RELOCATION (CONCEPT 2: SUNLIT WINDOW DINING NOOK & OPEN CORRIDOR - 창가 재배치 및 동선 전면 개방):
   - The wooden dining table and chairs set is completely RELOCATED to the LEFT under the large sunlit garden window, creating a serene, picturesque breakfast dining area.
   - The large potted plant is relocated to the right living room entrance partition.
   - DECLUTTER & REMOVE CRAMPED FURNITURE: If the room feels tight, remove awkward, unnecessary chairs or bulky items blocking pedestrian flow.
3. WIDE OPEN PASSAGEWAY TO LIVING ROOM:
   - The entire right-side floor area leading to the living room is completely cleared, creating an expansive, wide-open walking corridor.
4. PRESERVE INTEGRITY & ZERO DUPLICATION:
   - Exactly ONE dining table set and strictly ONE kitchen island in the room.
   - Keep authentic furniture silhouettes and room architecture 100% faithful.
Photorealistic architectural editorial photography, 8k resolution.`
    ];

    const LIVING_ROOM_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this living room:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, eye-level, and angle as the original photo.
2. MAJOR FURNITURE RELOCATION (CONCEPT 1: OPEN-FLOW MAIN CORRIDOR):
   - The main sofa/couch is relocated away from its current position to the opposite wall or facing the window with an accompanying area rug and sculptural coffee table.
   - The former sofa location is COMPLETELY VACATED, opening a wide, clear walking corridor between the entrance and the balcony/window.
3. PRESERVE INTEGRITY & ZERO DUPLICATION: Exactly ONE main sofa in the room. Natural walking clearances without crammed furniture.
Photorealistic architectural photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this living room:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, eye-level, and angle as the original photo.
2. MAJOR FURNITURE RELOCATION (CONCEPT 2: CONVERSATIONAL L-SHAPED CLUSTER):
   - The sofa and two accent armchairs are configured into an open 90-degree conversational L-shape grouping.
   - The opposite perimeter wall is styled with a low floating media console and a tall indoor plant, leaving the central circulation completely open and fluid.
3. CIRCULATION OPTIMIZATION:
   - Walkways around the seating cluster are open and unobstructed so moving through the room never disturbs people seated on the sofa.
Photorealistic architectural photography, 8k resolution.`
    ];

    const STUDY_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this study and home office:
1. STRICT CAMERA LOCK: Maintain the EXACT original camera viewpoint and angle. Do NOT mirror or flip the room.
2. MAJOR FURNITURE RELOCATION (CONCEPT 1: DAYLIGHT PERIMETER WORKSTATION):
   - The study desk is relocated along the perimeter wall under direct natural window daylight with an ergonomic chair.
   - The central floor is cleared, creating an open walking pathway and a cozy reading corner with an armchair and floor lamp.
3. ZERO DUPLICATION: Exactly ONE desk in the room.
Photorealistic architectural photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this study and home office:
1. STRICT CAMERA LOCK: Maintain the EXACT original camera viewpoint and angle. Do NOT mirror or flip the room.
2. MAJOR FURNITURE RELOCATION (CONCEPT 2: COMMANDING EXECUTIVE FLOATING DESK):
   - The desk is pulled away from the wall to float proudly in the center, facing the room entrance/window.
   - The back wall is lined with streamlined modular shelving.
   - Former desk spot is completely cleared, providing a 360-degree walking circulation path around the entire workspace.
Photorealistic architectural photography, 8k resolution.`
    ];

    const UNIVERSAL_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this ${roomType.prompt}:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, eye-level, and angle as the original photo.
2. MAJOR FURNITURE RELOCATION (CONCEPT 1: OPEN-CORRIDOR FLOW):
   - The primary large furniture pieces (tables, main seating, or beds) MUST RELOCATE away from their current side of the room to the opposite wall or perimeter.
   - The vacated area is completely cleared, creating an open, unhindered main circulation pathway through the space.
3. ZERO DUPLICATION: Strictly ONE set of each primary furniture piece. No duplicate or ghost copies.
4. PRESERVE INTEGRITY: Authentic proportions without warped geometry or crammed chairs.
Photorealistic architectural interior photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this ${roomType.prompt}:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT same camera viewpoint, eye-level, and angle as the original photo.
2. MAJOR FURNITURE RELOCATION (CONCEPT 2: 90-DEGREE FUNCTIONAL REALIGNMENT):
   - The centerpiece furniture is rotated 90 degrees and repositioned to create a dedicated functional zone, separating living/working activity from pedestrian walkways.
   - Secondary furniture is streamlined along the perimeter, widening primary movement paths.
3. ZERO DUPLICATION: Strictly ONE set of each primary furniture piece.
4. PRESERVE INTEGRITY: Natural spacing and clear knee/legroom.
Photorealistic architectural interior photography, 8k resolution.`
    ];

    const KIDS_ROOM_LAYOUT_PROMPTS = [
      `A realistic 3D furniture layout and ergonomic circulation optimization of this children's kids room (아이들방):
1. STRICT CAMERA LOCK & SPACE PRESERVATION (DO NOT FLIP/MIRROR): Maintain the EXACT original camera perspective, walls, windows, and flooring. 100% PRESERVE the outdoor view outside the window.
2. MAJOR FURNITURE RELOCATION & POSITION SWAP (CONCEPT 1: DAYLIGHT STUDY NOOK & COZY SLEEP ZONE - 책상과 침대 맞교체 및 햇살 공부존):
   - The child's bed and study desk positions are thoughtfully swapped or relocated to optimize natural daylight.
   - The study desk is placed near the window for healthy natural daylight study.
   - The child's bed is positioned along the protected solid wall creating a cozy, safe sleeping haven.
   - Toy organizers and bookshelves are neatly arranged along the perimeter, vacating a wide central floor play area.
   - DECLUTTER IF TIGHT: If the room is tight or cluttered, remove bulky unnecessary items to ensure maximum safe floor play space.
3. PRESERVE INTEGRITY: Keep authentic furniture models, child-friendly pastel/wood tones, and safe rounded contours without distortion.
Photorealistic architectural interior photography, 8k resolution.`,

      `A realistic 3D furniture layout and ergonomic circulation optimization of this children's kids room (아이들방):
1. STRICT CAMERA LOCK & SPACE PRESERVATION (DO NOT FLIP/MIRROR): Maintain the EXACT original camera perspective, walls, windows, and flooring. 100% PRESERVE the outdoor view outside the window.
2. MAJOR FURNITURE RELOCATION & OPEN PLAY CORRIDOR (CONCEPT 2: CENTRAL PLAYGROUND & PERIMETER STORAGE - 중앙 놀이공간 확보 및 벽면 수납):
   - Reconfigure furniture along perimeter walls to create an expansive, unobstructed central play and activity carpet zone.
   - Bed is nestled comfortably in the corner or alcove.
   - Study desk and low modular toy storage bins are streamlined together, creating an intuitive flow between study, play, and rest.
   - DECLUTTER IF CRAMPED: Remove redundant clutter or oversized chairs to maximize freedom of movement for children.
3. PRESERVE INTEGRITY & SAFETY: Maintain exact furniture silhouettes, gentle child-safe finishes, and warm ambient room lighting.
Photorealistic architectural interior photography, 8k resolution.`
    ];

    let activeLayoutPrompts = UNIVERSAL_LAYOUT_PROMPTS;
    if (isKidsRoom) {
      activeLayoutPrompts = KIDS_ROOM_LAYOUT_PROMPTS;
    } else if (isBedroom) {
      activeLayoutPrompts = BEDROOM_LAYOUT_PROMPTS;
    } else if (isKitchen) {
      activeLayoutPrompts = KITCHEN_LAYOUT_PROMPTS;
    } else if (isLivingRoom) {
      activeLayoutPrompts = LIVING_ROOM_LAYOUT_PROMPTS;
    } else if (isStudy) {
      activeLayoutPrompts = STUDY_LAYOUT_PROMPTS;
    }

    let baseInstruction = '';

    if (mode === 'edit_existing') {
      const userReq = (typeof customPrompt === 'string' && customPrompt.trim())
        ? customPrompt.trim()
        : 'Keep the room exact and add high quality detail';

      let compiledDirectives = '';
      try {
        const compileParts: any[] = [];
        if (base64Image) {
          compileParts.push({
            inlineData: {
              mimeType,
              data: base64Image
            }
          });
        }
        compileParts.push({
          text: `You are an elite interior architecture prompt compiler for an image-to-image AI photo editor.
The user has provided an interior room photo (${roomType.prompt}) and wants to apply this specific modification:
User Request: "${userReq}"

Based on the actual objects and spatial layout visible in the provided photo, compile this request into 2-3 concise, imperative, crystal-clear English directives for the image generation model:
CRITICAL CONSTRAINTS:
- DO NOT invent, assume, or add removals/additions that the user did NOT request! (e.g. If the user did not ask to remove rugs, lamps, or shelves, KEEP THEM).
- BED DIRECTION & LAYOUT (e.g., 같은 방향, 나란히, 11자, parallel, 침대방향, 쌍둥이): Instruct to place TWO MATCHING SINGLE BEDS PARALLEL TO EACH OTHER side-by-side (twin beds parallel layout), both extending perpendicularly from the back window wall forward into the room with a walkway between them, completely eliminating the L-shaped bed arrangement.
- ITEM REPLACEMENT (e.g., rug, sofa, chair, lighting, desk): Visually identify only the item mentioned and instruct to replace it in-place with the requested new design, pattern, color, and material.
- PRESERVATION: Strictly preserve all other non-mentioned furniture, storage units, rugs, lamps, wall decor, windows, walls, and flooring.

Output ONLY the numbered directives, nothing else.`
        });

        const compileRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{
            role: 'user',
            parts: compileParts
          }]
        });
        compiledDirectives = compileRes.text?.trim() || '';
      } catch (errCompile) {
        console.warn('Failed to compile prompt with gemini-2.5-flash, using fallback:', errCompile);
      }

      if (!compiledDirectives) {
        compiledDirectives = `1. FULFILL USER REQUEST: ${userReq}
2. PRESERVE UNTOUCHED ELEMENTS: Keep walls, windows, and flooring architecture identical.`;
      }

      baseInstruction = `You are a world-class interior architectural photo editor.
TASK: Edit this ${roomType.prompt} photo strictly according to these directives:
${compiledDirectives}
Photorealistic interior photography, Architectural Digest editorial quality, 8k resolution.`;
    } else if (effectiveMode === 'preserve_surface' || effectiveMode === 'surface_only') {
      // 🎨🧱 모드 4: 가구/배치 100% 그대로 유지하고 지정된 벽지/페인트/천장/바닥재 재료 및 색상만 정밀 변경
      baseInstruction = `You are a precision interior architectural colorist, master painter, and surface retexturing master.
TASK: Redesign and retexture ONLY the specified room surfaces (such as wall paint/wallpaper, flooring, ceiling, accent walls, moldings) of this ${roomType.prompt} while STRICTLY PRESERVING 100% of all existing furniture, sofa, beds, tables, chairs, cabinetry, lighting fixtures, and decor objects.

ABSOLUTE ARCHITECTURAL & FURNITURE CONSTRAINTS:
1. 100% FURNITURE & LAYOUT LOCK:
   - Keep every single piece of furniture (sofa, chairs, tables, beds, cabinets, lamps, appliances, and decor items) in their exact existing positions, orientations, shapes, and materials.
   - DO NOT move, replace, displace, or re-stage any furniture.
2. SELECTIVE SURFACE TRANSFORMATION & ARCHITECTURAL OVERHAUL:
   - Change ONLY the designated surfaces (e.g., walls, floor, ceiling, accent walls) strictly applying the requested materials (matte paint, textured wallpaper, exposed brick, Italian marble/porcelain tile, natural wood flooring, micro-cement) and color tones.
   - MANDATORY FLOORING OVERHAUL: If flooring is designated for modification, you MUST completely strip away the old floor finish across the entire visible room area and reinstall the designated floor material (e.g. large format marble tiles with fine grout, rich hardwood planks, or seamless micro-cement) with full photorealistic specular reflection and ambient occlusion beneath existing furniture legs.
   - MANDATORY CEILING REFINEMENT: If ceiling is designated for modification, apply a clean, uniform, and flawless ceiling finish across the entire upper plane, eliminating discoloration while keeping lighting fixtures and structural moldings intact.
   - Render photorealistic material physics: authentic surface relief, tactile grain, specular sheen, and natural grout/plank lines under existing room daylight.
3. ARCHITECTURAL INTEGRITY: Keep all windows, outdoor views, sliding glass, doors, structural columns, and original camera perspective 100% identical.
4. Editorial architectural photography, Architectural Digest editorial quality, balanced ambient light, photorealistic textures, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1500);
        baseInstruction += `\n\nUSER SPECIFIC SURFACE & MATERIAL SPECIFICATIONS:\n${trimmedCustom}\nStrictly apply these specific materials, colors, and textures to the designated surfaces while keeping all furniture 100% identical.`;
      }
    } else if (effectiveMode === 'object_removal' || effectiveMode === 'cleanup') {
      // 🧹 모드 5: 지정된 가구/소품/쓰레기 완전 삭제 & 바닥/벽면 무결점 인페인팅 복원 모드
      const hasMarkedImage = Boolean(base64MarkedImage);
      baseInstruction = `You are a precision interior architectural photo retoucher and inpainting restoration expert.
TASK: Completely REMOVE and ERASE the targeted furniture, clutter, and objects from this ${roomType.prompt}, and seamlessly inpaint and restore the floor and walls underneath.

${hasMarkedImage ? `INPUT IMAGES PROVIDED:
- Image 1: The original clean interior photograph.
- Image 2: The reference image showing the EXACT objects/furniture to be removed, highlighted with translucent red brush strokes and/or red markers.

INPAINTING & REMOVAL INSTRUCTIONS:
1. COMPLETE OBJECT REMOVAL (ZERO TRACE):
   - Locate every piece of furniture, fixture, counter, table, chair, box, or clutter that is covered by the red highlights or markers in Image 2.
   - COMPLETELY ERASE and DELETE these highlighted items from Image 1.
   - ABSOLUTELY DO NOT leave any remnants, ghost outlines, legs, shadows, or silhouettes of the removed items.
   - DO NOT replace the removed items with any new furniture or props. The targeted area must be left completely empty, open, and clean.

2. SEAMLESS FLOOR & WALL RESTORATION (INPAINTING):
   - Inpaint the vacated floor area where the removed object stood with the EXACT matching continuous flooring (matching the surrounding wood grain, plank direction, tile pattern, grout lines, reflectivity, and sheen).
   - Inpaint any vacated wall areas with matching wall paint color, baseboards, and texture.
   - Render natural, continuous ambient room lighting and drop shadows from the remaining architecture and fixtures.` : `INPAINTING & REMOVAL INSTRUCTIONS:
1. COMPLETE TARGET REMOVAL:
   - Completely erase and remove all unwanted clutter, messy items, and designated redundant furniture from the room.
   - Leave zero trace, zero ghost silhouettes, and zero replacements.
2. SEAMLESS RESTORATION:
   - Restore the vacated area with continuous floor texture (wood/tile) matching the surrounding floor seamlessly.`}

3. 100% PRESERVATION OF UNTARGETED ELEMENTS & ARCHITECTURE:
   - Keep 100% of all other furniture, cabinetry, appliances, windows, walls, ceilings, doors, and views that were NOT highlighted completely identical.
   - STRICT CAMERA PERSPECTIVE LOCK: Maintain the exact same camera angle, focal length, field of view, and eye-level. DO NOT crop, tilt, or alter the room geometry.
4. Ultra-photorealistic interior photography, Architectural Digest editorial quality, clean daylight, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1500);
        baseInstruction += `\n\nUSER SPECIFIC REMOVAL TARGETS:\n${trimmedCustom}`;
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
        const trimmedCustom = customPrompt.trim().slice(0, 1500);
        baseInstruction += `\n\nUSER SPECIFIC REQUIREMENTS: "${trimmedCustom}". Seamlessly integrate these details while keeping existing furniture colors and layout intact.`;
      }
    } else if (isExterior) {
      // 🏛️ 건물 외관 리모델링 모드: 건물 층수/뼈대/면적 100% 보존 + 선택 요소(창문, 지붕, 외벽마감, 조명, 정원 등) 정밀 현대화
      baseInstruction = `You are an elite architectural exterior designer, facade restoration specialist, and high-end landscape architect.
TASK: Redesign and modernize the exterior facade and architecture of this exact building in the refined style of "${style.label}" (${style.prompt}).

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. STRICT STRUCTURAL PRESERVATION (ZERO SCALE DRIFT):
   - Retain 100% of the building's physical massing, core structural envelope, footprint, ceiling/roof height, stories, floor count, and perspective angle.
   - Maintain the exact camera eye-level, viewing perspective, and scale 1:1.
   - DO NOT expand the building volume, add non-existent stories, or alter the core building boundary.
2. ARCHITECTURAL RENOVATION TARGETS:
   - Modernize the exterior facade materials (such as warm timber louvers, natural stone cladding, sleek micro-cement, or architectural zinc panels).
   - Upgrade window systems with clean modern profiles, panoramic thermal glass, and slim framing.
   - Refine the roofline, eaves, modern gutter details, and front entry porch/canopy.
   - Enhance the surrounding landscape: manicured green lawn, organic stone pathway, curated specimen trees, garden flowerbeds, and warm architectural exterior downlighting.
3. Ultra-photorealistic architectural exterior photography, Architectural Digest exterior issue, balanced natural daylight, crisp 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1000);
        baseInstruction += `\n\nUSER SPECIFIC EXTERIOR RENOVATION REQUIREMENTS:
${trimmedCustom}
Strictly incorporate these exterior requirements while maintaining the structural footprint and camera perspective of the original building.`;
      }
    } else if (isGarden) {
      // 🌿 정원 & 테라스 리모델링 모드: 대지 경계 및 건물 외형 100% 보존 + 선택된 야외 시설/구조물(수영장, 거목, 개집, 바베큐 등)과 정원 스타일 정밀 합성
      baseInstruction = `You are an elite landscape architect, master horticulturist, and outdoor living specialist.
TASK: Redesign, landscape, and stage the outdoor garden, patio, and terrace of this exact property in the refined style of "${style.label}" (${style.prompt}).

CRITICAL OUTDOOR LANDSCAPE CONSTRAINTS:
1. STRICT BOUNDARY & FOOTPRINT PRESERVATION:
   - Retain 100% of the property footprint, background house architecture, walls, permanent fences, and original camera perspective angle 1:1.
   - Do NOT alter the main building shape or remove existing permanent structural boundaries.
2. HARMONIOUS OUTDOOR LIVING & GREENERY INTEGRATION:
   - Introduce healthy botanicals, manicured lawn turf, specimen shade trees, blooming garden borders, and natural stone pathways.
   - Elegantly arrange outdoor living elements (such as private pool/jacuzzi, shade trees, dog house, outdoor dining, BBQ kitchen, fire pit lounge, pergola, or path lighting).
   - Ensure all outdoor furniture and structural features look permanently built-in, photorealistic, and grounded naturally in the landscape.
3. Editorial landscape architectural photography, Architectural Digest outdoor living issue, natural golden-hour daylight, crisp 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1000);
        baseInstruction += `\n\nUSER SPECIFIC GARDEN & TERRACE REQUIREMENTS:
${trimmedCustom}
Strictly incorporate these requested outdoor amenities, structures, and landscaping features while maintaining the property boundaries and house facade.`;
      }
    } else if (effectiveMode === 'replace_furniture' || effectiveMode === 'replace') {
      // 🛋️ 가구 교체 & 소재/질감 융합 창작 모드: 가구 디자인 스타일 뼈대 + 좌방석/등받이/쿠션 재질 & 컬러 정밀 결합 ("창조하는 작업")
      baseInstruction = `You are an elite master furniture artisan, bespoke industrial designer, and architectural interior stylist.
TASK: Creatively remodel, redesign, and fabricate the PRIMARY central furniture piece in this ${roomType.prompt} (e.g. main sofa/couch, bed with headboard, or dining set) into an ORIGINAL BESPOKE MASTERPIECE through a strict two-stage hierarchical creation process:

======================================================================
[HIERARCHICAL CREATIVE DESIGN PIPELINE - "창조와 융합의 예술"]
======================================================================
STAGE 1: FOUNDATIONAL STRUCTURAL ARCHITECTURE & DESIGN STYLE (1ST PRIORITY - 기본 뼈대 & 고유 조형미)
- The fundamental skeletal frame, structural silhouette, joinery details, and contours MUST strictly follow the designated Furniture Design Style:
  * Traditional Hanok / Oriental: The structural skeleton must be authentic handcrafted natural Korean timber, visible traditional joinery (사개맞춤/장부맞춤), subtle Hanok window-lattice (살림) or gentle roofline curvature motifs, elegant wooden armrests, and serene woodcraft.
  * French Classic / European Royal: The outer frame must feature ornate neoclassical cabriole legs, subtle antique wood carvings or gilded molding trims, and graceful curved European royal silhouettes.
  * Mid-Century Modern: The frame must showcase iconic 1950s-1960s organic curves, sculpted walnut/teak wooden shells, and angled tapered peg legs.
  * Industrial / Vintage Loft: The frame must feature bold blackened steel tubing or distressed iron framework with authentic industrial fasteners.
  * Modern Minimalist: The frame must feature razor-sharp geometric lines, low-profile architectural stance, and sleek floating proportions.
  * Nordic Scandinavian: Warm light oak wood framing, organic functional contours, and cozy hygge proportions.
  * Natural Japandi / Zen: Earthy low-profile solid timber platform bench framing with raw wabi-sabi simplicity.
  * Luxury Hotel Lounge: Substantial tailored proportions, brushed brass metal accents, and opulent five-star boutique hotel presence.

STAGE 2: BESPOKE CONTACT SURFACE UPHOLSTERY & TEXTURE MAPPING (2ND PRIORITY - 방석, 등받이, 쿠션에 소재와 색상 결합)
- Onto that distinctive structural framework, precisely craft, upholster, and wrap ONLY the functional contact surfaces:
  * SEATING CUSHIONS (좌방석 부분)
  * BACKREST CUSHIONS (등받이 부분)
  * ARMREST PADDING & ACCENT CUSHIONS (팔걸이 패딩 및 쿠션)
- Strictly apply the user's SPECIFIED COLOR PALETTE and SPECIFIED MATERIAL TEXTURE to these cushions:
  * Italian Top-Grain Leather: Render supple, butter-soft natural leather grain, realistic crease folds, subtle satin sheen, and tailored French stitching seams on the cushions and backrest.
  * Premium Woven Fabric & Linen: Render dense, tactile textile threads, natural breathable weave depth, and soft matte fabric texture.
  * Cozy Bouclé & Velvet: Render tactile 3D looped curly bouclé texture or ultra-rich plush velvet with soft ambient light reflections.
  * Natural Solid Wood & Cane Rattan: Seamlessly integrate artisan woven French cane rattan inlays or solid slatted details into the seat and back support.

CRITICAL CREATIVE SYNTHESIS ("창조하는 작업 - 단순히 인터넷 이미지를 모방하지 않는 독창적 창작"):
- DO NOT just paste an ordinary stock internet photo.
- Seamlessly HARMONIZE the structural frame from Stage 1 and the tactile cushions from Stage 2 into a bespoke, cohesive piece of high-end designer furniture (e.g. Hanok wooden bench frame beautifully cushioned with Italian cognac leather backrest and seat pads; or Industrial steel sofa wrapped with plush bouclé cushions).
- The junction between the wooden/metal frame and the upholstered cushions must be crisp, tailored, and photorealistic.

STRICT ROOM INTEGRITY & PRESERVATION:
1. 100% ROOM ARCHITECTURE LOCK: Keep all walls, ceilings, windows, daylight angles, and floor materials completely identical.
2. NATURAL LIGHT & DROP SHADOWS: Cast authentic contact drop shadows and ambient occlusion beneath the new furniture legs onto the existing floor.
3. Ultra-photorealistic interior architectural photography, Architectural Digest bespoke feature, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1500);
        baseInstruction += `\n\nUSER SPECIFIC FURNITURE DESIGN & MATERIAL SPECIFICATIONS:\n${trimmedCustom}\nStrictly adhere to this two-stage creative process: shape the frame according to the design style first, then tailor the cushions and backrest with the specified material and color.`;
      }
    } else if (isPartyRoom) {
      // 🎉 모드: 파티룸 & 이벤트 공간 전용 스타일링 (기존 공간 및 가구 100% 보존 + 테마 데코레이션 인플레이스)
      baseInstruction = `You are a world-class celebratory event stylist and luxury interior staging master.
TASK: Lavishly decorate and transform this exact existing room into an unforgettable, photogenic celebration space themed specifically around "${style.label}" (${style.prompt}).

CRITICAL MANDATORY RULES:
1. 100% ZERO FURNITURE REMOVAL & ZERO ROOM TYPE DRIFT:
   - 100% PRESERVE all existing core furniture (beds, bedframes, headboards, nightstands, sofas, coffee tables, media credenzas, chairs, shelves) in their EXACT same physical positions, shapes, and orientations.
   - Absolutely DO NOT remove or replace existing furniture with unrelated items (e.g. if the room is a bedroom with a bed, it MUST REMAIN A BEDROOM WITH THE EXACT SAME BED; do NOT turn it into a kitchen island, bar counter, or foreign dining room).
   - Maintain the room's physical shell: walls, flooring, ceiling height, doors, windows, and daylight 100% identical to the original photo.

2. IN-PLACE FESTIVE PARTY STYLING & DECOR ACCENTS ONLY:
   - Lavishly layer festive celebration decor ON TOP OF and AROUND the existing furniture:
     * Behind the existing bed or sofa, mount an eye-catching party backdrop, balloon garland arch, or themed wall decor/neon sign matching ${style.label}.
     * On existing flat surfaces (nightstands, coffee tables, desks, or dressers), arrange party celebration props: celebration cake or dessert stands, delicate champagne flutes, glassware, festive tableware, floral arrangements, and warm glowing candles.
     * Draping or cascading warm fairy string lights along curtains, headboards, or walls to establish a cozy, magical evening atmosphere.
     * Accent party pillows, wrapped gift boxes with ribbons, and floating helium balloons near the ceiling.

3. COHESIVE ATMOSPHERIC LIGHTING:
   - Enhance the room with magical ambient party glow: twinkling fairy lights, warm candle flames, and festive ambient mood lighting while preserving natural window daylight and original wall colors.

4. High-end lifestyle celebration photography, Architectural Digest party feature, vibrant luxury festive mood, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 1500);
        baseInstruction += `\n\nUSER SPECIFIC PARTY REQUIREMENTS: "${trimmedCustom}". Seamlessly integrate these celebration details into the party room styling without moving or replacing core furniture.`;
      }
    } else {
      // 🧹 모드 1: 실내 공간 구조 100% 보존 + 방 크기 1:1 유지 + 선택한 스타일에 맞춘 가구/소품 홈스테이징
      baseInstruction = `You are a world-class interior architect and virtual home staging master.
TASK: Virtually stage, furnish, and style this exact room as a ${roomType.prompt} in the unmistakable style of "${style.label}" (${style.prompt}).

CRITICAL MANDATORY RULES:
1. ZERO STRUCTURAL DRIFT & 100% ARCHITECTURAL PRESERVATION:
   - Keep 100% of the room's physical architecture completely unchanged from the original photo.
   - PRESERVE the exact ceiling height, ceiling light fixtures, flooring material, solid wall positions, window positions, window glass frames, and outdoor view through the windows.
   - PRESERVE all doors, sliding doors, and open doorways exactly where they are. DO NOT block or cover doors or doorways with beds or walls.
2. 1:1 SPATIAL SCALE & DEPTH LOCK (DO NOT ENLARGE ROOM):
   - Keep the exact room dimensions, width, depth, ceiling height, and camera perspective 1:1 identical to the input photo.
   - ABSOLUTELY DO NOT push the back wall further away, DO NOT elongate the floor, and DO NOT make the room appear larger or deeper than it actually is.
3. ROOM-APPROPRIATE FURNISHING ONLY:
   - This room is a "${roomType.prompt}". Place ONLY furniture appropriate for this room type.
   - For a living room: place a comfortable sofa, coffee table, accent chair, rug, and lighting. NEVER place a bed or kitchen island in a living room.
   - For a bedroom: place a bed against the proper back wall, with nightstands and lamps, keeping doorways clear.
4. UNMISTAKABLE STYLE APPLICATION (${style.label.toUpperCase()}):
   - The interior furnishings MUST prominently and distinctly showcase the chosen style: ${style.prompt}.
   - Choose furniture silhouettes, fabric materials, wood finishes, color palettes, and lighting fixtures that clearly represent ${style.label} aesthetic.
5. Photorealistic interior photography, Architectural Digest editorial quality, realistic ambient daylight, natural soft shadows, 8k resolution.`;

      if (typeof customPrompt === 'string' && customPrompt.trim()) {
        const trimmedCustom = customPrompt.trim().slice(0, 500);
        baseInstruction += `\n\nUSER SPECIFIC REQUIREMENTS: "${trimmedCustom}". Seamlessly integrate these requested items, colors, materials, or features into the new design while strictly maintaining the architectural room shell and 1:1 room dimensions.`;
      }
    }

    // 다중 시안 생성을 위한 고유 뉘앙스 디렉티브 (대표 테마/스타일은 100% 유지하면서 각 시안마다 차별화된 미학 제공)
    const VARIATION_DIRECTIVES = [
      'VARIATION 1 (Classic Balance): Focus on quintessential style harmony, perfectly balanced proportion, and natural midday ambient daylight.',
      'VARIATION 2 (Atmospheric Mood): Focus on rich layered lighting, cozy evening warm luminescence, and refined statement accent textures.',
      'VARIATION 3 (Spacious Minimal Elegance): Focus on airy open spatial feel, sleek architectural silhouettes, and sophisticated textural contrasts.',
      'VARIATION 4 (Curated Botanical & Luxe): Focus on curated designer decor objects, lush botanical greenery accents, and bespoke editorial touches.',
    ];

    const EXTERIOR_VARIATION_DIRECTIVES = [
      'VARIATION 1 (Natural Warmth & Elegance): Feature warm natural wood timber accents, soft stone cladding, and balanced golden-hour afternoon ambient daylight.',
      'VARIATION 2 (Modern Contrast & Night Ambience): Feature crisp charcoal zinc panels, sleek dark aluminum frames, and warm architectural night facade downlighting and garden path lights.',
      'VARIATION 3 (Clean Minimal Monolith): Feature seamless light off-white micro-cement / limestone facade with expansive floor-to-ceiling panoramic glass and lush green lawn.',
      'VARIATION 4 (Nordic Organic Modern): Feature light ash wood vertical louvers, black steel roofline eaves, and Scandinavian evergreen garden landscaping.',
    ];

    const GARDEN_VARIATION_DIRECTIVES = [
      'VARIATION 1 (Sunlit Natural Oasis): Emphasize bright natural midday sunshine, lush emerald green turf, vibrant botanical blossoms, and open sunny relaxation areas.',
      'VARIATION 2 (Atmospheric Sunset & Ambient Lights): Emphasize warm golden-hour dusk light, cozy glowing garden pathway lights, warm string bistro lights, and relaxing firepit luminescence.',
      'VARIATION 3 (Serene Stone & Water Retreat): Emphasize elegant natural stone stepping paths, peaceful water/pool reflections, sculptural shade trees, and tranquil organic balance.',
      'VARIATION 4 (Resort Luxury & Outdoor Dining): Emphasize premium timber decking, designer outdoor lounge furniture, shaded pergola retreat, and resort-grade hospitality styling.',
    ];

    const PARTY_THEME_VARIATIONS: Record<string, string[]> = {
      party_birthday: [
        'DESIGN VARIATION 1 (Lovely Pastel Macaron & Neon Photowall): Style with sweet pastel macaron tones (blush pink, soft mint, lavender, warm gold) balloon arch garland, glowing warm "HAPPY BIRTHDAY" neon wall sign, tiered celebration cake with macarons, champagne ice bucket on the coffee table, sweet dreamy photozone.',
        'DESIGN VARIATION 2 (Luxury Glam Metallic Gold & Midnight VIP Party): Style with high-fashion metallic chrome gold, silver and midnight obsidian floating helium balloons, shimmering metallic fringe tinsel backdrop curtain, glowing marquee birthday lights, disco mirror ball light reflections across the floor, modern tiered gold-leaf birthday cake, sleek martini cocktail coupe glassware, and luxury wrapped gift boxes with oversized ribbons.'
      ],
      party_christmas: [
        'DESIGN VARIATION 1 (Classic Warm Evergreen & Red/Gold Baubles): Grand lush green Christmas tree adorned with warm golden fairy lights, red and gold ornaments, pine garland along the curtains, wrapped holiday gift boxes under the tree, warm cozy celebration.',
        'DESIGN VARIATION 2 (Frosted Winter Wonderland & Cozy Fireside): Frosted snowy flocked Christmas tree with champagne-gold baubles, festive red plaid runner on the coffee table, hot cocoa mugs with marshmallows and gingerbread cookies, deep red and forest green knit throw pillows, and cozy glowing fireplace on screen.'
      ],
      party_proposal: [
        'DESIGN VARIATION 1 (Romantic Candlelit Rose Road & MARRY ME Marquee): Breathtaking illuminated "MARRY ME" warm marquee letters, romantic rose petal pathway with hundreds of glowing glass hurricane candles, floating heart balloons and chilled champagne.',
        'DESIGN VARIATION 2 (Fairytale Floral Canopy & Fairy Light Waterfall): Lavish cascading white and blush rose floral canopy arch, floor-to-ceiling twinkling fairy light curtain behind sheer drapes, tiered crystal stands, champagne flutes, and dreamy romantic mood.'
      ],
      party_valentine: [
        'DESIGN VARIATION 1 (Sweet Heart Balloon & Rose Romance): Floating crimson and blush heart balloon clusters, celebratory dessert table with gourmet chocolates, strawberries, and pink champagne flutes.',
        'DESIGN VARIATION 2 (Deep Burgundy Velvet & Intimate Candlelight): Sophisticated deep burgundy velvet accents, long-stem red roses in crystal vases, dramatic warm candle clusters, fine wine decanter, and enchanting mood lighting.'
      ],
      party_anniversary: [
        'DESIGN VARIATION 1 (Memory Photo Gallery & Candlelit Dinner): Illuminated gallery wall of framed couple moments with warm accent spotlights, intimate fine-dining table setting with gold cutlery, and floral centerpieces.',
        'DESIGN VARIATION 2 (Luxury Champagne Lounge & Jazz Ambiance): Chic marble cocktail bar station with vintage champagne bucket, tiered crystal glassware, sophisticated velvet lounge accents, and warm amber jazz lounge mood.'
      ],
      party_halloween: [
        'DESIGN VARIATION 1 (Chic Jack-o-Lantern & Mystical Neon): Warm glowing carved Jack-o-lantern pumpkins, violet and orange accent neon lighting, stylish party treat display with festive cupcakes and candy jars.',
        'DESIGN VARIATION 2 (Gothic Glam & Black Velvet Candlelight): Sophisticated black lace and deep purple velvet textures, candelabras with dripping black wax candles, metallic skull and bat accents, smoky dry-ice cocktail cauldron.'
      ],
      party_bridal: [
        'DESIGN VARIATION 1 (Dreamy Floral Arch & Macaron Dessert Tower): Elegant white and blush silk floral arch with sheer drapery, "Bride to Be" script sign, multi-tiered pastel macaron tower, crystal champagne glasses, sunny garden daylight.',
        'DESIGN VARIATION 2 (Boho Chic Pampas & Fairy Light Picnic Lounge): Trendy dried pampas grass and eucalyptus arrangements, blush floor cushions and woven poufs around a low wooden celebration table, warm hanging fairy lights.'
      ],
      party_easter: [
        'DESIGN VARIATION 1 (Spring Tulip Garden & Pastel Egg Tree): Abundant fresh spring tulip floral arrangements, delicate pastel egg ornaments hanging from flowering branch centerpieces, cheerful spring sunshine.',
        'DESIGN VARIATION 2 (Rustic Woodland Spring Gathering): Natural moss and birchwood accents, woven baskets with gourmet chocolates, botanical greenery garlands, warm festive spring tea party setup.'
      ],
    };

    const PARTY_VARIATION_DIRECTIVES = [
      'VARIATION 1 (Grand Celebration & Festive Photowall): Emphasize a grand balloon arch garland, festive neon statement wall, decorated party banquet table, and sparkling warm fairy lights.',
      'VARIATION 2 (Romantic Candlelit & Ambient Sunset): Emphasize warm cascading curtain fairy lights, tiered glassware & wine display, floral centerpieces, and cozy evening luminescence.',
      'VARIATION 3 (Vibrant Party Lounge & Chic Bar): Emphasize plush velvet modular lounge seating, stylish cocktail bar station with shaker and stemware, and dynamic celebratory accent illumination.',
      'VARIATION 4 (Intimate Gathering & Cozy Celebration): Emphasize relaxed floor seating with boho rugs and cushions, warm hanging bistro lights, dessert buffet, and memorable celebratory atmosphere.',
    ];

    const userReqStr = (typeof customPrompt === 'string' && customPrompt.trim()) ? customPrompt.trim() : '';
    const reqLowerStr = userReqStr.toLowerCase();

    // 보존/변형 금지 지시문이 아닌 순수 위치 맞교환/이동 요청인지 확인
    const isPreservationText = reqLowerStr.includes('zero deformation') ||
      reqLowerStr.includes('strictly forbidden') ||
      reqLowerStr.includes('보존') ||
      reqLowerStr.includes('변형 금지') ||
      reqLowerStr.includes('교체 금지') ||
      reqLowerStr.includes('strict existing furniture');

    const parsedSwap = !isPreservationText ? parseFurnitureSwapItems(userReqStr) : null;
    const isUserExplicitSwap = !isPreservationText && (
      Boolean(parsedSwap) ||
      userReqStr.startsWith('Selective furniture relocation/swap:') ||
      (/(?:위치|자리)\s*(?:를|을)?\s*(?:맞?바꿔|맞?교체|교환|스왑)/i.test(reqLowerStr) && !/(?:금지|마세요|말고|않고)/.test(reqLowerStr)) ||
      (/\bswap\b/i.test(reqLowerStr) && !/\b(?:do not|don't|never|forbidden|no)\s+swap\b/i.test(reqLowerStr))
    );

    // requestedCount만큼 병렬 비동기 생성 요청
    const generationPromises = Array.from({ length: requestedCount }).map(async (_, index) => {
      let finalInstruction = '';
      if (mode === 'edit_existing') {
        finalInstruction = baseInstruction;
      } else if (effectiveMode === 'object_removal' || effectiveMode === 'cleanup') {
        finalInstruction = baseInstruction;
      } else if (effectiveMode === 'preserve_surface' || effectiveMode === 'surface_only') {
        finalInstruction = baseInstruction;
      } else if (effectiveMode === 'party_styling' || isPartyRoom) {
        finalInstruction = baseInstruction;
        // 🎉 2장 이상 선택 시 각 시안별로 완전히 차별화된 디자인 테마 부여!
        const partyKey = (typeof styleId === 'string' && styleId.startsWith('party_'))
          ? styleId
          : Object.keys(PARTY_THEME_VARIATIONS).find((k) => promptStr.toLowerCase().includes(k.replace('party_', '')) || promptStr.toLowerCase().includes(k)) || 'party_birthday';
        const variations = PARTY_THEME_VARIATIONS[partyKey] || PARTY_VARIATION_DIRECTIVES;
        if (variations && variations.length > 0) {
          finalInstruction += `\n\n${variations[index % variations.length]}`;
        }
      } else if (effectiveMode === 'rearrange_layout') {
        const isPreserveExistingFurniture = Boolean(preserveFurniture) ||
          promptStr.includes('preserve') ||
          promptStr.includes('zero deformation') ||
          promptStr.includes('가구 변형') ||
          promptStr.includes('가구 보존') ||
          promptStr.includes('기존 가구') ||
          promptStr.includes('strict existing furniture preservation');

        if (isPreserveExistingFurniture) {
          finalInstruction = `You are an elite architectural space planner, master interior layout architect, and ergonomics specialist.
TASK: Redesign and reconfigure the spatial composition of this ${roomType.prompt} by reorganizing and rearranging the given furniture into an INNOVATIVE, BRAND-NEW ERGONOMIC LAYOUT.

======================================================================
CORE PHILOSOPHY & MANDATORY RULES OF SPATIAL LAYOUT REDESIGN
======================================================================
1. REDESIGN SPATIAL COMPOSITION VIA FURNITURE RELOCATION & POSITION SWAP (가구 재배치 및 위치 상호 교체를 통한 공간 구도 재디자인):
   - CRITICAL REQUIREMENT: The positions of the primary furniture MUST VISIBLY AND DRAMATICALLY CHANGE between before and after! Absolutely DO NOT leave furniture sitting in their original spots.
   - Actively SWAP or INTERCHANGE the positions of primary furniture pieces to discover a superior spatial composition:
     * In a kitchen: swap the positions of the dining table and island, or move the dining table completely under the sunlit window.
     * In a living room: swap the sofa and TV credenza walls, or rotate seating 90 degrees into an open conversational lounge.
     * In a bedroom: relocate the bed from the side wall to the center focal wall, swapping positions with the dresser or study desk.
   - When furniture is moved, its former location must be COMPLETELY CLEARED, vacated, and restored with matching flooring/walls.

2. DECLUTTER & ELIMINATE CRAMPED FURNITURE IF SPACE IS TIGHT (공간이 빡빡하다면 불필요한 가구 과감히 빼기):
   - If the room feels congested, overcrowded, or lacks generous walking clearances, YOU ARE PERMITTED AND STRONGLY ENCOURAGED TO REMOVE redundant, non-essential, or circulation-blocking furniture (e.g. extraneous chairs, bulky corner units, excessive side tables).
   - Prioritize open pedestrian circulation, generous sightlines to windows, and comfortable breathing room.

3. ZERO FURNITURE DEFORMATION (가구 왜곡 및 변형 절대 금지):
   - Retain the exact model, silhouette, upholstery, wood tones, and style of the existing furniture pieces you keep. Do NOT warp, stretch, or morph them.

4. 100% ARCHITECTURAL & CAMERA PERSPECTIVE LOCK (공간 골조 및 창밖 풍경 100% 고정 - 공간 변형 절대 금지):
   - Retain 100% of the room's physical shell: perimeter walls, flooring material, ceiling height, doors, and window frames.
   - ABSOLUTE WINDOW & OUTDOOR VIEW PRESERVATION: The outdoor scenery visible through the windows (garden, trees, backyard, or cityscape) MUST REMAIN 100% EXACTLY IDENTICAL to the input photo.
   - Maintain the EXACT original camera position, perspective angle, and eye-level without shifting or zooming.
   - Cast realistic ambient contact drop shadows beneath the relocated furniture.
   - Ultra-photorealistic interior architecture photography, Architectural Digest editorial quality, 8k resolution.`;

          if (typeof customPrompt === 'string' && customPrompt.trim()) {
            finalInstruction += `\n\nUSER SPECIFIC REQUIREMENTS & FURNITURE PRESERVATION DIRECTIVES:\n${customPrompt.trim()}`;
          }
        } else {
          finalInstruction = activeLayoutPrompts[index % activeLayoutPrompts.length];
          if (
            typeof customPrompt === 'string' &&
            customPrompt.trim() &&
            !customPrompt.startsWith('MANDATORY BED RELOCATION') &&
            !customPrompt.startsWith('MANDATORY 3D FURNITURE') &&
            !customPrompt.startsWith('Rearrange the furniture')
          ) {
            finalInstruction += `\n\nUSER SPECIFIC REQUEST:\n${customPrompt.trim()}`;
          }
        }
      } else if (isUserExplicitSwap) {
        // 사용자가 명시적으로 가구 위치 교환/맞교체를 요청한 경우, 방 종류/기존 프리셋에 구애받지 않고 범용 1:1 위치 맞교환 지시어 실행!
        finalInstruction = `A realistic furniture layout rearrangement of this ${roomType.prompt}:
1. STRICT CAMERA LOCK (DO NOT FLIP/MIRROR): Maintain the EXACT original camera perspective, viewing angle, eye-level, windows, walls, and flooring. Do NOT mirror or flip the room.
2. PRESERVE FURNITURE INTEGRITY: Authentic architectural proportions without warping or forcing items.
3. ${buildUniversalRelocationInstruction(userReqStr, roomType.prompt)}
4. PRESERVE UNTOUCHED ELEMENTS: Keep all other furniture, lighting, walls, windows, and structural details 100% identical.
5. High quality architectural interior photography, Architectural Digest editorial quality, 8k resolution.`;
      } else {
        finalInstruction = baseInstruction;
        const skipGenericVariation = isPartyRoom && (
          promptStr.includes('CHRISTMAS') ||
          promptStr.includes('ZERO SHIFT') ||
          promptStr.includes('IN-PLACE') ||
          promptStr.includes('100% PRESERVE')
        );
        if (!skipGenericVariation) {
          const variationPool = isPartyRoom
            ? PARTY_VARIATION_DIRECTIVES
            : isGarden
            ? GARDEN_VARIATION_DIRECTIVES
            : isExterior
            ? EXTERIOR_VARIATION_DIRECTIVES
            : VARIATION_DIRECTIVES;
          if (variationPool[index % variationPool.length]) {
            finalInstruction += `\n\n${variationPool[index % variationPool.length]}`;
          }
        }
      }

      const contentParts: any[] = [
        { inlineData: { mimeType, data: base64Image } },
      ];
      if (base64MarkedImage) {
        contentParts.push({
          inlineData: { mimeType: markedMimeType, data: base64MarkedImage },
        });
      }
      contentParts.push({ text: finalInstruction });

      let res;
      console.log('>>> EXECUTING FINAL INSTRUCTION (Parts count:', contentParts.length, '):\n', finalInstruction);
      try {
        res = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: [
            {
              role: 'user',
              parts: contentParts,
            },
          ],
        });
      } catch (err31Img) {
        try {
          console.warn('gemini-3.1-flash-image call failed, trying gemini-3-pro-image:', err31Img);
          res = await ai.models.generateContent({
            model: 'gemini-3-pro-image',
            contents: [
              {
                role: 'user',
                parts: contentParts,
              },
            ],
          });
        } catch (err3ProImg) {
          console.warn('gemini-3-pro-image call failed, trying gemini-2.5-flash-image:', err3ProImg);
          res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
              {
                role: 'user',
                parts: contentParts,
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
      // 데모 모드 차감 (1회)
      consumeIpUsage(ip);
    }

    return NextResponse.json({
      image: generatedImages[0],
      images: [generatedImages[0]],
      count: 1,
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

    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('402')) {
      const isDepleted = errMsg.includes('prepayment') || errMsg.includes('depleted') || errMsg.includes('402');
      return NextResponse.json(
        {
          error: isDepleted
            ? '구글 Gemini API의 선결제 크레딧(Prepayment Credits)이 소진되었습니다. Google AI Studio(https://aistudio.google.com)에서 결제/크레딧을 충전하시거나 새 API Key로 교체해 주세요.'
            : 'API 무료 요청 할당량을 초과했습니다. 잠시 후 다시 시도해 주세요.',
        },
        { status: isDepleted ? 402 : 429 }
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
