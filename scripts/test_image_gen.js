const fs = require('fs');

async function testREST() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Testing REST Imagen 3 generation...");
  
  const models = [
    'imagen-3.0-fast-generate-001',
    'imagen-3.0-generate-002',
    'imagen-3.0-generate-001'
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: 'High resolution photorealistic modern sage green kitchen island' }],
          parameters: { sampleCount: 1, aspectRatio: '4:3' }
        })
      });
      const data = await res.json();
      if (data.predictions && data.predictions[0]) {
        console.log(`SUCCESS with model ${model}!`);
        fs.writeFileSync('d:/ReRoomAI/ReRoomAI/public/test_real_kitchen.png', Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
        return;
      } else {
        console.log(`Model ${model} response:`, JSON.stringify(data).slice(0, 150));
      }
    } catch (e) {
      console.log(`Model ${model} error:`, e.message);
    }
  }
}

testREST();
