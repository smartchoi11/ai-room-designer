const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

async function testKitchenPrompt1() {
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

  const prompt1 = `You are a master interior architect specializing in human ergonomic circulation and spatial layout optimization.
TASK: Redesign the spatial layout of this kitchen and dining area to optimize human walking circulation and task workflow.

CORE PRINCIPLE OF LAYOUT OPTIMIZATION:
Space layout optimization is NOT merely changing decor. It REQUIRES physically relocating and reorganizing the primary furniture to eliminate bottlenecks and open wide, fluid walkways between the kitchen and adjacent living room.

MANDATORY SPATIAL RELOCATION (CONCEPT 1: OPEN LIVING CORRIDOR & ROUND DINING FLOW):
1. REARRANGE & PULL FORWARD DINING TABLE:
   - The bulky rectangular dining table on the right is removed and relocated/replaced into an elegant, airy circular wooden dining table with four sculptural wishbone chairs.
   - Position the circular table slightly forward with generous 360-degree walking space around every chair.
2. WIDE OPEN PASSAGEWAY TO LIVING ROOM:
   - The right perimeter walkway leading into the living room is COMPLETELY CLEARED of clutter and bulky table edges, providing a wide, unobstructed straight walking corridor connecting kitchen and living room.
3. PRESERVE ISLAND INTEGRITY (NO FORCED SEATING):
   - Keep the wooden island in its authentic shape with clean marble countertop.
   - Absolutely DO NOT squeeze or cram bar stools or chairs against the solid drawer front.
4. ZERO DUPLICATION & STRICT COUNT:
   - Exactly ONE dining table set and strictly ONE kitchen island in the entire room. Absolutely NO duplicate tables.
5. STRICT CAMERA PERSPECTIVE:
   - Maintain the exact camera angle: window on left, kitchen cabinets in back, living room entrance on right.
Photorealistic architectural editorial photography, 8k resolution.`;

  console.log('Generating Concept 1 refined...');
  const res1 = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: [
      { role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: base64Image } }, { text: prompt1 }] }
    ]
  });
  const cand1 = res1.candidates?.[0];
  const part1 = cand1?.content?.parts?.find(p => p.inlineData);
  if (part1 && part1.inlineData && part1.inlineData.data) {
    fs.writeFileSync('C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/opt_kitchen_concept1_refined.png', Buffer.from(part1.inlineData.data, 'base64'));
    console.log('Saved opt_kitchen_concept1_refined.png');
  }
}

testKitchenPrompt1().catch(console.error);
