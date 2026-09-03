const fs = require('fs');
const path = require('path');

async function testKitchenSwap() {
  console.log('Testing Kitchen Layout Rearrangement on showcase_kitchen.png...');
  const kitchenPath = path.join(__dirname, '../public/showcase_kitchen.png');
  const base64Image = fs.readFileSync(kitchenPath).toString('base64');

  const payload = {
    image: `data:image/png;base64,${base64Image}`,
    roomTypeId: 'kitchen',
    styleId: 'modern',
    redesignMode: 'rearrange_layout',
    count: 2,
    customPrompt: 'SWAP POSITIONS ENTIRELY: Move the dining table & chairs set from the right side over to the left side in front of the large window, and move the kitchen island counter & bar stools over to the right side where the dining table set used to be. The dining table MUST now be on the left by the window, and the island counter MUST now be on the right. Keep all structural walls and existing windows intact.',
  };

  const response = await fetch('http://localhost:3002/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('API Status:', response.status);
  const data = await response.json();
  console.log('API Response keys:', Object.keys(data));

  if (data.images && Array.isArray(data.images)) {
    console.log('images length:', data.images.length);
    data.images.forEach((img, idx) => {
      const base64Data = typeof img === 'string' ? img.replace(/^data:image\/\w+;base64,/, '') : img;
      const buffer = Buffer.from(base64Data, 'base64');
      const outPath = path.join(__dirname, `../public/kitchen_swap_result_${idx + 1}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`SAVED FILE: ${outPath} (${buffer.length} bytes)`);
    });
  } else {
    console.log('FULL DATA:', JSON.stringify(data).slice(0, 300));
  }
}

testKitchenSwap().catch(console.error);
