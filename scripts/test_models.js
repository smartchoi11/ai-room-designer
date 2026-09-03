const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim().replace(/^"|"$/g, '');
});
const { GoogleGenAI } = require('@google/genai');

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key exists?", !!apiKey);

  const samplePath = path.join(__dirname, '../public/showcase_office.png');
  const fileBuf = fs.readFileSync(samplePath);
  const base64Image = fileBuf.toString('base64');
  const mimeType = 'image/png';

  const models = [
    'gemini-2.5-flash',
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001',
    'gemini-2.0-flash-exp'
  ];

  const ai = new GoogleGenAI({ apiKey });

  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const res = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: 'Rearrange furniture in this study photo while keeping walls and windows intact.' }
            ],
          },
        ],
      });

      console.log(`Response for ${modelName}:`, JSON.stringify(res).slice(0, 300));
      const candidate = res.candidates?.[0];
      const part = candidate?.content?.parts?.find((p) => p.inlineData);
      if (part?.inlineData?.data) {
        console.log(`SUCCESS with ${modelName}! Output base64 length: ${part.inlineData.data.length}`);
        fs.writeFileSync(path.join(__dirname, `../public/test_${modelName}.png`), Buffer.from(part.inlineData.data, 'base64'));
        return;
      }
    } catch (err) {
      console.error(`Error testing ${modelName}:`, err.message);
    }
  }
}

testModels();
