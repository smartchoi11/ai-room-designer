function parseFurnitureSwapItems(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/^Selective furniture relocation\/swap:\s*/i, '')
    .replace(/^USER (?:CUSTOM )?(?:SPECIFIC )?(?:REQUEST|INSTRUCTION):\s*/i, '')
    .replace(/CRITICAL ZERO DUPLICATION:.*$/i, '')
    .trim();

  const koRegex = /(?:.*?)([가-힣A-Za-z0-9\s]+?)(?:와|과|하고|랑|이랑)\s+([가-힣A-Za-z0-9\s]+?)(?:의)?\s*(?:위치|자리)(?:를|을)?\s*(?:교환|바꿔|맞교체|맞바꿔|변경|이동|스왑)/i;
  const matchKo = cleaned.match(koRegex);
  if (matchKo) {
    const itemA = matchKo[1].trim();
    const itemB = matchKo[2].trim();
    if (itemA && itemB && itemA !== itemB) {
      return { itemA, itemB };
    }
  }

  const enRegex = /swap\s+(?:the\s+)?([a-zA-Z0-9\s]+?)\s+(?:and|with)\s+(?:the\s+)?([a-zA-Z0-9\s]+)/i;
  const matchEn = cleaned.match(enRegex);
  if (matchEn) {
    const itemA = matchEn[1].trim();
    const itemB = matchEn[2].trim();
    if (itemA && itemB && itemA !== itemB) {
      return { itemA, itemB };
    }
  }
  return null;
}

function buildUniversalRelocationInstruction(userReq, roomPrompt = 'interior room') {
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
      return `EXACT 1:1 POSITION SWAP FOR "${itemA}" AND "${itemB}":
- User specific request: "${userReq}"
- The furniture piece "${itemA}" moves to the exact spatial location previously occupied by "${itemB}".
- The furniture piece "${itemB}" moves to the exact spatial location previously occupied by "${itemA}".
- Both previous spots must be completely cleared and vacated of their former furniture.
- ZERO DUPLICATION (CRITICAL): There must remain strictly ONE "${itemA}" and strictly ONE "${itemB}" in the entire ${roomPrompt}. Absolutely DO NOT duplicate or leave ghost copies behind.
- Keep authentic proportions, textures, and silhouettes without warping or cramming.`;
    } else {
      return `EXACT 1:1 POSITION SWAP:
- User specific request: "${userReq}"
- You MUST SWAP the locations of the two pieces of furniture mentioned in the request.
- Piece 1 moves to the exact spatial location previously occupied by Piece 2.
- Piece 2 moves to the exact spatial location previously occupied by Piece 1.
- Both previous spots must be completely cleared and vacated of their former furniture.
- ZERO DUPLICATION (CRITICAL): Strictly maintain exactly ONE set of each piece in the entire ${roomPrompt}. Absolutely DO NOT duplicate or create extra copies of any furniture.
- Keep authentic proportions, textures, and silhouettes without warping or cramming.`;
    }
  }

  return `TARGETED FURNITURE RELOCATION:
- User specific request: "${userReq}"
- Move the specified furniture piece(s) to the designated new location in the room as requested.
- The original spot previously occupied by the moved furniture must be completely cleared and vacated.
- ZERO DUPLICATION (CRITICAL): Absolutely DO NOT create duplicate copies of any moved furniture. There must remain strictly ONE of each piece in the entire ${roomPrompt}.
- Maintain realistic proportions, clearances, and natural circulation paths.`;
}

const testRooms = [
  { req: '침대와 책상 위치를 교환해줘', room: 'bedroom' },
  { req: '소파와 TV 거실장 위치 교환해줘', room: 'living room' },
  { req: '아일랜드 식탁과 식탁세트 위치를 교환해줘', room: 'kitchen' },
  { req: '책상과 책장 자리 맞바꿔줘', room: 'study / home office' },
  { req: '가구 위치를 서로 바꿔줘', room: 'bedroom' },
  { req: '침대를 창가 쪽으로 옮겨줘', room: 'bedroom' },
  { req: 'Selective furniture relocation/swap: 침대와 화장대 위치를 교환해줘. CRITICAL ZERO DUPLICATION...', room: 'bedroom' }
];

testRooms.forEach(t => {
  console.log('=== TEST:', t.req, '===');
  console.log(buildUniversalRelocationInstruction(t.req, t.room));
  console.log();
});

