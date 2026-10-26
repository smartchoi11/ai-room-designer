import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 30;

// 인메모리 캐시 (동일 이미지에 대한 중복 Gemini 호출 방지)
const visionCache = new Map<string, { roomType: string; items: any[]; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { image, roomHint, styleHint, materialHint } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // 캐시 키 (이미지 앞뒤 100자 또는 URL 기반)
    const cacheKey = typeof image === 'string'
      ? (image.length > 300 ? `${image.slice(0, 80)}_${image.slice(-80)}_${image.length}` : image)
      : 'unknown_img';

    const cached = visionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60) {
      return NextResponse.json({ success: true, fromCache: true, data: cached });
    }

    // Base64 데이터 추출
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    } else if (image.startsWith('/')) {
      // 로컬 public 파일인 경우 파일 읽기
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', image.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          base64Data = fileBuffer.toString('base64');
          if (image.endsWith('.png')) mimeType = 'image/png';
          else if (image.endsWith('.webp')) mimeType = 'image/webp';
        }
      } catch (e) {
        console.warn('Failed to read local image:', e);
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a high-end AI Interior Designer and Furniture Sourcing Expert for "RoomFit AI".
Analyze the real 3D physical interior room shown in this photo.
CRITICAL INSTRUCTION: Ignore all UI elements, status bars, buttons, green pills, and overlaid text. Look ONLY at the actual physical room environment.

Identify:
1. "roomType": One of "bedroom" | "living_room" | "kitchen" | "study".
   - If there is a bed or kids sleep area, it is "bedroom".
   - If there is a dining table / kitchen counter, it is "kitchen".
   - If there is an office desk / computer chair, it is "study".
   - If there is a sofa / coffee table / TV wall / lounge, it is "living_room".

2. "items": Array of 3 to 5 key furniture pieces actually visible in this room.
   For each item, provide:
   - "id": unique string id like "bed_1", "table_1", "lamp_1", "rug_1"
   - "category": Short Korean category (e.g. '침대', '소파', '소반/좌탁', '식탁', '책상', '의자', '조명', '러그', '수납장')
   - "icon": single emoji matching the item (e.g. '🛏️', '🛋️', '🪵', '🪑', '💡', '🧶', '📚')
   - "name": Authentic, appealing Korean product shopping name accurately describing the visual appearance, material, shape, and tone in the photo (e.g. "내추럴 원목 평상형 저상 침대", "한지 구름 펜던트 조명", "전통 오리엔탈 원목 소반 찻상 세트", "미드센추리 모던 3인용 패브릭 소파")
   - "price": Realistic Korean market price string (e.g. "₩189,000원~", "₩45,000원~", "₩320,000원~")
   - "coupangKw": Clean search keyword for Coupang (e.g. "원목 저상형 침대 프레임", "한지 펜던트 조명", "원목 좌식 소반 찻상")
   - "amazonKw": Clean search keyword for Amazon
   - "posX": Horizontal position percentage (15 to 85) where the center of this item is located in the image
   - "posY": Vertical position percentage (18 to 84) where the center of this item is located in the image

Return strictly valid JSON with this exact structure:
{
  "roomType": "bedroom",
  "items": [ ... ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // X, Y 유효성 및 경계 보정
    if (parsed.items && Array.isArray(parsed.items)) {
      parsed.items = parsed.items.map((it: any, idx: number) => ({
        id: it.id || `item_${idx}_${Date.now()}`,
        category: it.category || '가구',
        icon: it.icon || '🛋️',
        name: it.name || '인테리어 맞춤 가구',
        price: it.price || '₩99,000원~',
        coupangKw: it.coupangKw || it.name || '인테리어 가구',
        amazonKw: it.amazonKw || 'modern furniture',
        posX: Math.min(85, Math.max(15, typeof it.posX === 'number' ? it.posX : 50)),
        posY: Math.min(84, Math.max(18, typeof it.posY === 'number' ? it.posY : 50)),
      }));
    }

    const resultData = {
      roomType: parsed.roomType || roomHint || 'living_room',
      items: parsed.items || [],
      timestamp: Date.now(),
    };

    // 캐시에 저장 (최대 100개 유지)
    if (visionCache.size > 100) {
      const firstKey = visionCache.keys().next().value;
      if (firstKey) visionCache.delete(firstKey);
    }
    visionCache.set(cacheKey, resultData);

    return NextResponse.json({ success: true, data: resultData });
  } catch (err: any) {
    console.error('Furniture Detection Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to detect furniture' },
      { status: 500 }
    );
  }
}
