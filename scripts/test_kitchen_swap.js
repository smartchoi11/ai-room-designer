const fs = require('fs');
const path = require('path');

async function testLiveApi() {
  console.log('Testing live API http://localhost:3002/api/generate for smart edit position swap...');
  const concept1Path = 'C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_kitchen_concept_1.png';
  const base64Image = fs.readFileSync(concept1Path).toString('base64');

  const res = await fetch('http://localhost:3002/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
      roomTypeId: 'kitchen',
      styleId: 'modern',
      count: 1,
      mode: 'edit_existing',
      customPrompt: 'Selective furniture relocation/swap: 아일랜드 식탁과 원형 식탁 위치를 바꿔줘. CRITICAL ZERO DUPLICATION: The moved furniture must vacate its original position and move to the new position. Absolutely DO NOT duplicate or create an extra set of furniture. There must remain only one set in the entire room.'
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  if (data.images && data.images.length > 0) {
    const outPath = `C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_smart_edit_swap.png`;
    fs.writeFileSync(outPath, Buffer.from(data.images[0], 'base64'));
    console.log(`Saved live_smart_edit_swap.png`);
  } else if (data.image) {
    const outPath = `C:/Users/user/.gemini/antigravity/brain/af8746d7-d684-4f83-b90a-6e923a7d102e/scratch/live_smart_edit_swap.png`;
    fs.writeFileSync(outPath, Buffer.from(data.image, 'base64'));
    console.log(`Saved live_smart_edit_swap.png`);
  } else {
    console.error('Error:', data);
  }
}

testLiveApi().catch(console.error);
