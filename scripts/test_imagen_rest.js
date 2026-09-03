const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim().replace(/^"|"$/g, '');
});

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing Imagen 3 API with key:", apiKey?.slice(0, 10) + '...');

async function testImagenREST() {
  const models = [
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001',
    'imagen-3.0-generate-001'
  ];

  for (const model of models) {
    try {
      console.log(`Trying REST call to model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: 'Photorealistic architectural 3D layout of an industrial study room with a wooden desk, leather chair, brick wall, and grid window, Architectural Digest style 8k' }],
          parameters: { sampleCount: 1, aspectRatio: '4:3' }
        })
      });
      const data = await res.json();
      if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        console.log(`SUCCESS! Model ${model} generated an image! Output length: ${data.predictions[0].bytesBase64Encoded.length}`);
        fs.writeFileSync(path.join(__dirname, `../public/test_generated_${model}.png`), Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
        return;
      } else {
        console.log(`Model ${model} response:`, JSON.stringify(data).slice(0, 300));
      }
    } catch (e) {
      console.log(`Model ${model} error:`, e.message);
    }
  }
}

testImagenREST();
