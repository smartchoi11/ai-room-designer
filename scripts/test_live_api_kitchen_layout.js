const fs = require('fs');
const path = require('path');

async function testLiveKitchenLayout() {
  console.log('Simulating User: "공간 레이아웃 최적화" with 2 concepts on showcase_kitchen.png...');
  const imgPath = path.join(__dirname, '../public/showcase_kitchen.png');
  const base64Image = fs.readFileSync(imgPath).toString('base64');

  const res = await fetch('http://localhost:3002/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
      roomTypeId: 'kitchen',
      styleId: 'modern',
      count: 2,
      redesignMode: 'rearrange_layout'
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  if (data.images && data.images.length >= 2) {
    fs.writeFileSync('C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_layout_v1.png', Buffer.from(data.images[0], 'base64'));
    fs.writeFileSync('C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_layout_v2.png', Buffer.from(data.images[1], 'base64'));
    console.log('SUCCESS: Saved live_layout_v1.png and live_layout_v2.png!');
  } else {
    console.error('Error or unexpected response:', data);
  }
}

testLiveKitchenLayout().catch(console.error);
