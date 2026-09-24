const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

async function testKitchenOptimization() {
  const envPath = path.join(__dirname, '../.env.local');
  let apiKey = process.env.GEMINI_API_KEY;
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
  }
  const ai = new GoogleGenAI({ apiKey });
  const imgPath = path.join(__dirname, '../public/showcase_kitchen.png');
  const base64Image = fs.readFileSync(imgPath).toString('base64');

  // 시안 1: 창가 다이닝 & 거실 통행 동선 관통 개방
  const prompt1 = `You are a master interior architect specializing in human ergonomic circulation and spatial layout optimization.
TASK: Redesign the spatial layout of this kitchen and dining area to optimize human walking circulation and task workflow.

CORE PRINCIPLE OF LAYOUT OPTIMIZATION:
Space layout optimization is NOT merely changing decor. It REQUIRES physically relocating the primary main furniture pieces (dining table and island) to eliminate circulation bottlenecks, widen pathways, and optimize workflow.

MANDATORY SPATIAL RELOCATION (CONCEPT 1: OPEN LIVING CORRIDOR & GARDEN WINDOW DINING):
1. RELOCATE DINING TABLE TO WINDOW (MANDATORY VISIBLE MOVE):
   - The wooden dining table and chairs MUST MOVE from their current right-hand position to the LEFT-HAND SIDE adjacent to the large floor-to-ceiling garden window.
   - The table is arranged nicely as a bright garden-view dining zone bathed in natural daylight.
2. WIDE OPEN PASSAGEWAY TO LIVING ROOM:
   - The right-hand area where the dining table previously stood is now COMPLETELY CLEARED of the dining table.
   - This creates a wide, unobstructed walking corridor connecting the kitchen seamlessly to the living room.
3. PRESERVE ISLAND INTEGRITY (NO FORCED SEATING):
   - Keep the central wooden island with its clean marble countertop intact.
   - Absolutely DO NOT squeeze or cram bar stools or chairs against the solid drawer faces.
4. ZERO DUPLICATION & 1:1 COUNT LOCK:
   - There must be strictly ONE dining table set and ONE island in the entire room. Absolutely NO duplicate tables.
5. STRICT CAMERA PERSPECTIVE:
   - Keep the original camera viewpoint: window on left, kitchen cabinets in back, living room entrance on right.
Photorealistic architectural editorial photography, 8k resolution.`;

  // 시안 2: 조리 작업 동선 최적화 (아일랜드 ↔ 식탁 1:1 맞교환 L자형 워크플로우)
  const prompt2 = `You are a master interior architect specializing in human ergonomic circulation and spatial layout optimization.
TASK: Redesign the spatial layout of this kitchen and dining area to optimize cooking task workflow and functional zoning.

CORE PRINCIPLE OF LAYOUT OPTIMIZATION:
Space layout optimization REQUIRES physically relocating the primary main furniture pieces to optimize the culinary work triangle and divide functional zones.

MANDATORY SPATIAL RELOCATION (CONCEPT 2: WORK TRIANGLE & 1:1 POSITION SWAP):
1. 1:1 DIRECT POSITION SWAP BETWEEN ISLAND AND DINING TABLE (MANDATORY VISIBLE MOVE):
   - The wooden dining table and chairs set moves to the FOREGROUND / LEFT side (vacating the right side).
   - The kitchen island counter moves to the RIGHT / MIDGROUND side adjacent to the main kitchen cooking appliances, forming an efficient L-shaped culinary work triangle (sink-cooktop-prep island).
2. CLEAR FORMER POSITIONS:
   - Both original positions are completely vacated of their former furniture.
3. ZERO DUPLICATION & STRICT COUNT:
   - Strictly ONE dining table set and strictly ONE kitchen island in the room. NEVER duplicate either piece.
4. NO CRAMMING & NATURAL CLEARANCE:
   - Ample walking clearance between all cooking surfaces and dining seating. DO NOT cram stools against solid drawer fronts.
5. STRICT CAMERA PERSPECTIVE:
   - Keep the original camera perspective: window on left, kitchen cabinets in back, living room transition on right.
Photorealistic architectural editorial photography, 8k resolution.`;

  console.log('Generating Concept 1 (Open Circulation & Garden Dining)...');
  const res1 = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: [
      { role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: base64Image } }, { text: prompt1 }] }
    ]
  });
  const cand1 = res1.candidates?.[0];
  const part1 = cand1?.content?.parts?.find(p => p.inlineData);
  if (part1 && part1.inlineData && part1.inlineData.data) {
    fs.writeFileSync('C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/opt_kitchen_concept1.png', Buffer.from(part1.inlineData.data, 'base64'));
    console.log('Saved opt_kitchen_concept1.png');
  }

  console.log('Generating Concept 2 (Work Triangle & Position Swap)...');
  const res2 = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: [
      { role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: base64Image } }, { text: prompt2 }] }
    ]
  });
  const cand2 = res2.candidates?.[0];
  const part2 = cand2?.content?.parts?.find(p => p.inlineData);
  if (part2 && part2.inlineData && part2.inlineData.data) {
    fs.writeFileSync('C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/opt_kitchen_concept2.png', Buffer.from(part2.inlineData.data, 'base64'));
    console.log('Saved opt_kitchen_concept2.png');
  }
}

testKitchenOptimization().catch(console.error);
