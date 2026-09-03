const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim().replace(/^"|"$/g, '');
});

const { GoogleGenAI } = require('@google/genai');

async function testImageModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const samplePath = path.join(__dirname, '../public/showcase_office.png');
  const fileBuf = fs.readFileSync(samplePath);
  const base64Image = fileBuf.toString('base64');
  const mimeType = 'image/png';

  const imageModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image'
  ];

  const ai = new GoogleGenAI({ apiKey });

  for (const modelName of imageModels) {
    try {
      console.log(`Testing image model: ${modelName}...`);
      const res = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: 'Perform a 3D spatial layout rearrangement of the wooden desk, office chair, and bookshelf into an open functional study layout while preserving the brick wall and grid window.' }
            ],
          },
        ],
      });

      const candidate = res.candidates?.[0];
      const part = candidate?.content?.parts?.find((p) => p.inlineData);
      if (part?.inlineData?.data) {
        console.log(`🎉 SUCCESS with ${modelName}! Image base64 length: ${part.inlineData.data.length}`);
        fs.writeFileSync(path.join(__dirname, `../public/real_ai_generated_${modelName}.png`), Buffer.from(part.inlineData.data, 'base64'));
        return;
      } else {
        console.log(`Model ${modelName} returned parts:`, candidate?.content?.parts);
      }
    } catch (err) {
      console.error(`Error with ${modelName}:`, err.message);
    }
  }
}

testImageModels();
