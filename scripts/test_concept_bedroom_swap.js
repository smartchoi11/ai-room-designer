const fs = require('fs');
const path = require('path');

async function testBedroomSwap() {
  console.log('Testing live API for concept_layout_before.png (책상과 서랍장 위치 교환)...');
  const imgPath = path.join(__dirname, '../public/concept_layout_before.png');
  const base64Image = fs.readFileSync(imgPath).toString('base64');

  const res = await fetch('http://localhost:3002/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
      roomTypeId: 'bedroom',
      styleId: 'japandi',
      count: 1,
      mode: 'edit_existing',
      customPrompt: '책상과 서랍장 위치를 교환해줘'
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  if (data.images && data.images.length > 0) {
    const outPath = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_bedroom_desk_dresser_swap.png';
    fs.writeFileSync(outPath, Buffer.from(data.images[0], 'base64'));
    console.log(`Saved live_bedroom_desk_dresser_swap.png`);
  } else if (data.image) {
    const outPath = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_bedroom_desk_dresser_swap.png';
    fs.writeFileSync(outPath, Buffer.from(data.image, 'base64'));
    console.log(`Saved live_bedroom_desk_dresser_swap.png`);
  } else {
    console.error('Error or no image:', data);
  }
}

testBedroomSwap().catch(console.error);
