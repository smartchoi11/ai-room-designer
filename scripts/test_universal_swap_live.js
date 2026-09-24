const fs = require('fs');
const path = require('path');

async function testLivingRoomSwap() {
  console.log('Testing live API for Living Room position swap...');
  const livingImagePath = path.join(__dirname, '../public/cozy_home_living.png');
  const base64Image = fs.readFileSync(livingImagePath).toString('base64');

  const res = await fetch('http://localhost:3002/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
      roomTypeId: 'living_room',
      styleId: 'modern',
      count: 1,
      mode: 'edit_existing',
      customPrompt: '소파와 TV 거실장 위치를 교환해줘'
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  if (data.images && data.images.length > 0) {
    const outPath = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_living_room_swap.png';
    fs.writeFileSync(outPath, Buffer.from(data.images[0], 'base64'));
    console.log(`Saved live_living_room_swap.png`);
  } else if (data.image) {
    const outPath = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_living_room_swap.png';
    fs.writeFileSync(outPath, Buffer.from(data.image, 'base64'));
    console.log(`Saved live_living_room_swap.png`);
  } else {
    console.error('Error or no image:', data);
  }
}

testLivingRoomSwap().catch(console.error);
