const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'lib/i18n.ts',
  'components/MobileAppView.tsx',
  'components/PricingModal.tsx',
  'app/terms/page.tsx',
  'app/page.tsx',
  'app/pricing/page.tsx',
  'components/Footer.tsx',
  'components/Header.tsx',
  'components/ShowcaseCarousel.tsx'
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace brand names
  content = content.replace(/ReRoom AI/g, 'RoomFit AI');
  content = content.replace(/ReRoomAI/g, 'RoomFit AI');
  content = content.replace(/reroom ai/g, 'RoomFit AI');
  content = content.replace(/ReRoom App User/g, 'RoomFit App User');
  content = content.replace(/ReRoom\./g, 'RoomFit.');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated: ${relPath}`);
}
