const fs = require('fs');
const path = require('path');

async function testApi() {
  const samplePath = path.join(__dirname, '../public/showcase_office.png');
  const fileBuf = fs.readFileSync(samplePath);
  const base64Image = `data:image/png;base64,${fileBuf.toString('base64')}`;

  console.log('Sending request to http://localhost:3002/api/generate...');
  try {
    const res = await fetch('http://localhost:3002/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        roomTypeId: 'study',
        styleId: 'industrial',
        count: 1,
        redesignMode: 'rearrange_layout',
        customPrompt: 'Reposition study desk, chair, and bookshelf into an optimized layout while locking room architecture and brick wall.',
      }),
    });

    const data = await res.json();
    console.log('API Response Status:', res.status);
    if (!res.ok) {
      console.error('API Error Data:', JSON.stringify(data));
    } else {
      console.log('SUCCESS! Image received length:', data.image ? data.image.length : 0);
      if (data.image) {
        fs.writeFileSync(path.join(__dirname, '../public/test_api_result.png'), Buffer.from(data.image, 'base64'));
        console.log('Saved generated image to public/test_api_result.png');
      }
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testApi();
