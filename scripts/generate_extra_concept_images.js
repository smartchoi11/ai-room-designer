const fs = require('fs');
const path = require('path');

// 10가지 주방 & 아기방 시안 SVG 제작 (1200x900 고화질 건축 콘셉트)
const EXTRA_ROOMS = [
  {
    filename: 'kitchen_option_01.svg',
    title: 'Scandinavian Light Oak & White Marble Kitchen',
    category: 'Kitchen Option 1',
    bgGradient: ['#f4f0eb', '#e6decb'],
    islandGrad: ['#eae7e1', '#d4ceb8'],
    woodTone: '#cbb092',
    accentColor: '#96816a',
    wallColor: '#f9f7f4',
    pendantColor: '#ded3c5',
    tag: '북유럽 화이트 마블 & 우드 주방',
  },
  {
    filename: 'kitchen_option_02.svg',
    title: 'Sleek Matte Black & Brass Handleless Kitchen',
    category: 'Kitchen Option 2',
    bgGradient: ['#2b2d31', '#1a1c20'],
    islandGrad: ['#3a3d44', '#22252a'],
    woodTone: '#8a6e53',
    accentColor: '#d4af37',
    wallColor: '#24272c',
    pendantColor: '#e0c068',
    tag: '매트 블랙 & 브라스 포인트 모던 주방',
  },
  {
    filename: 'kitchen_option_03.svg',
    title: 'Warm Modern Farmhouse Kitchen with Open Shelves',
    category: 'Kitchen Option 3',
    bgGradient: ['#fdfaf5', '#eddcc6'],
    islandGrad: ['#e4d3bd', '#cfbca2'],
    woodTone: '#a47852',
    accentColor: '#846041',
    wallColor: '#faf6f0',
    pendantColor: '#c7a783',
    tag: '따뜻한 감성 우드 팜하우스 주방',
  },
  {
    filename: 'kitchen_option_04.svg',
    title: 'Penthouse Luxury Gold & Quartz Kitchen',
    category: 'Kitchen Option 4',
    bgGradient: ['#1f242d', '#13161c'],
    islandGrad: ['#efefe6', '#d6d5c5'],
    woodTone: '#7c6853',
    accentColor: '#e5c158',
    wallColor: '#181b22',
    pendantColor: '#ffd700',
    tag: '럭셔리 펜트하우스 골드 & 쿼츠 주방',
  },
  {
    filename: 'kitchen_option_05.svg',
    title: 'Industrial Loft Brick & Steel Open Kitchen',
    category: 'Kitchen Option 5',
    bgGradient: ['#3e3530', '#26201c'],
    islandGrad: ['#4e4a46', '#312d2a'],
    woodTone: '#8c593b',
    accentColor: '#c25838',
    wallColor: '#332a25',
    pendantColor: '#e88948',
    tag: '빈티지 벽돌 & 닥터 스틸 인더스트리얼 주방',
  },
  {
    filename: 'baby_room_01.svg',
    title: 'Cozy Soft Pastel Cream Nursery with Wooden Crib',
    category: 'Baby Room Option 1',
    bgGradient: ['#faf5ef', '#efe3d5'],
    islandGrad: ['#f3e8dc', '#e2d3c0'],
    woodTone: '#cbb094',
    accentColor: '#d6a386',
    wallColor: '#fbf7f2',
    pendantColor: '#f7d6bf',
    tag: '포근한 파스텔 크림 & 원목 아기방',
  },
  {
    filename: 'baby_room_02.svg',
    title: 'Nordic Forest Birch Wooden Baby Room',
    category: 'Baby Room Option 2',
    bgGradient: ['#f1f5f2', '#dbe4de'],
    islandGrad: ['#e4ebe6', '#cbd8d0'],
    woodTone: '#b5a18a',
    accentColor: '#7a9a85',
    wallColor: '#f5f8f6',
    pendantColor: '#a2c4b0',
    tag: '노르딕 세이지 그린 & 내추럴 우드 자녀방',
  },
  {
    filename: 'baby_room_03.svg',
    title: 'Modern Minimal Sage & Hidden LED Nursery',
    category: 'Baby Room Option 3',
    bgGradient: ['#e9ece9', '#d2d9d3'],
    islandGrad: ['#dce1dd', '#c0c9c2'],
    woodTone: '#a28f7b',
    accentColor: '#637e6f',
    wallColor: '#eff2ef',
    pendantColor: '#9bb4a6',
    tag: '모던 미니멀 모노톤 간접조명 아기방',
  },
  {
    filename: 'baby_room_04.svg',
    title: 'Organic Rattan & Woven Canopy Boho Nursery',
    category: 'Baby Room Option 4',
    bgGradient: ['#faf4ed', '#ecdcc9'],
    islandGrad: ['#f2e4d3', '#debfa7'],
    woodTone: '#be8c61',
    accentColor: '#bf7045',
    wallColor: '#fdf9f4',
    pendantColor: '#e0a370',
    tag: '오가닉 라탄 & 캐노피 보헤미안 아기방',
  },
  {
    filename: 'baby_room_05.svg',
    title: 'Clean Montessori Wooden Playroom & Nursery',
    category: 'Baby Room Option 5',
    bgGradient: ['#f7f7fa', '#e4e4ed'],
    islandGrad: ['#ededf5', '#d5d5e5'],
    woodTone: '#c7aa88',
    accentColor: '#888cb8',
    wallColor: '#fafafc',
    pendantColor: '#b4b7e0',
    tag: '몬테소리 스타일 교구 선반 & 자녀방',
  },
];

function generateSVG(room) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${room.bgGradient[0]}"/>
      <stop offset="100%" stop-color="${room.bgGradient[1]}"/>
    </linearGradient>
    <linearGradient id="islandGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${room.islandGrad[0]}"/>
      <stop offset="100%" stop-color="${room.islandGrad[1]}"/>
    </linearGradient>
    <radialGradient id="sunlight" cx="0.8" cy="0.2" r="0.8">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="15" stdDeviation="20" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- 벽면 및 기본 공간 세팅 -->
  <rect width="1200" height="900" fill="url(#bgGrad)"/>
  
  <!-- 창문 구조 및 햇살 감성 -->
  <rect x="750" y="100" width="380" height="500" rx="16" fill="${room.wallColor}" opacity="0.9" stroke="${room.woodTone}" stroke-width="8"/>
  <line x1="940" y1="100" x2="940" y2="600" stroke="${room.woodTone}" stroke-width="6"/>
  <line x1="750" y1="350" x2="1130" y2="350" stroke="${room.woodTone}" stroke-width="6"/>
  <rect width="1200" height="900" fill="url(#sunlight)"/>

  <!-- 바닥재 감성 -->
  <polygon points="0,680 1200,680 1200,900 0,900" fill="${room.woodTone}" opacity="0.85"/>
  <line x1="0" y1="740" x2="1200" y2="740" stroke="#000" opacity="0.08" stroke-width="2"/>
  <line x1="0" y1="820" x2="1200" y2="820" stroke="#000" opacity="0.08" stroke-width="2"/>

  <!-- 공간 메인 가구 오브젝트 (아일랜드/침대/아기침대) -->
  <g filter="url(#shadow)">
    <rect x="180" y="480" x2="840" y2="680" width="660" height="200" rx="24" fill="url(#islandGrad)" stroke="${room.accentColor}" stroke-width="3"/>
    <rect x="200" y="450" width="620" height="38" rx="8" fill="#ffffff" opacity="0.9"/>
  </g>

  <!-- 팬던트 등 조명 효과 -->
  <line x1="380" y1="0" x2="380" y2="280" stroke="${room.accentColor}" stroke-width="3"/>
  <line x1="640" y1="0" x2="640" y2="280" stroke="${room.accentColor}" stroke-width="3"/>
  <circle cx="380" cy="300" r="32" fill="${room.pendantColor}" filter="url(#shadow)"/>
  <circle cx="640" cy="300" r="32" fill="${room.pendantColor}" filter="url(#shadow)"/>

  <!-- 3D 타이포 뱃지 -->
  <rect x="50" y="50" width="340" height="46" rx="23" fill="#111111" opacity="0.85"/>
  <text x="70" y="79" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${room.category}</text>

  <rect x="50" y="780" width="700" height="70" rx="20" fill="#ffffff" opacity="0.92" filter="url(#shadow)"/>
  <text x="80" y="812" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#1a1a1a">${room.tag}</text>
  <text x="80" y="836" font-family="system-ui, sans-serif" font-size="14" fill="#666666">${room.title}</text>
</svg>`;
}

const publicDir = path.join(__dirname, '../public');

EXTRA_ROOMS.forEach((room) => {
  const filePath = path.join(publicDir, room.filename);
  fs.writeFileSync(filePath, generateSVG(room));
  console.log(`Generated: ${room.filename}`);
});
