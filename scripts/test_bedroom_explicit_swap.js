const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

async function testPrompt() {
  const envPath = path.join(__dirname, '../.env.local');
  let apiKey = process.env.GEMINI_API_KEY;
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
  }
  const ai = new GoogleGenAI({ apiKey });
  const imgPath = path.join(__dirname, '../public/concept_layout_before.png');
  const base64Image = fs.readFileSync(imgPath).toString('base64');

  const instruction = `You are an elite architectural interior photographer and photo editor.
TASK: Visually edit this exact interior bedroom photo to SWAP THE POSITIONS of the desk and the dresser.

MANDATORY SPATIAL TRANSFORMATION (DO NOT LEAVE THEM IN ORIGINAL PLACES):
1. THE WOODEN DESK:
   - Must MOVE from the left window to the back solid wall (centered where the dresser was).
   - The window wall must have NO desk.
2. THE WOODEN DRESSER WITH MIRROR:
   - Must MOVE from the back wall to the left window wall (where the desk was).
   - The back wall must have NO dresser.
3. ZERO DUPLICATION & STRICT 1:1 COUNT:
   - Exactly ONE desk and ONE dresser in the entire room.
   - Do NOT leave a duplicate desk at the window, and do NOT leave a duplicate dresser at the back wall.
4. STRICT CAMERA PERSPECTIVE:
   - Keep the exact camera perspective, bed on the right, window on the left, back wall in the center.
Photorealistic editorial quality architectural photography, 8k resolution.`;

  console.log('Generating with explicit spatial transformation instructions...');
  const res = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image } },
          { text: instruction }
        ]
      }
    ]
  });

  const cand = res.candidates?.[0];
  const part = cand?.content?.parts?.find(p => p.inlineData);
  if (part && part.inlineData && part.inlineData.data) {
    const out = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/test_explicit_desk_dresser_swap.png';
    fs.writeFileSync(out, Buffer.from(part.inlineData.data, 'base64'));
    console.log('Saved test_explicit_desk_dresser_swap.png');
  } else {
    console.log('No image returned:', cand);
  }
}

testPrompt().catch(console.error);
