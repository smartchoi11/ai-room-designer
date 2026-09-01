const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 10가지 독창적이고 고화질인 주방 & 아기방 시안 (기존 #01~#25와 겹치지 않는 새로운 인테리어 콘셉트)
const UNIQUE_ROOMS = [
  {
    filename: 'kitchen_option_01.png',
    title: 'Sage Green &amp; White Quartz Island Kitchen',
    category: 'Kitchen Option 1',
    bg: ['#2e3d34', '#1f2b24'],
    island: ['#f4f3ef', '#dcd8cf'],
    wood: '#a88f78',
    accent: '#d4af37',
    wall: '#f2f0ea',
    pendant: '#e5d7c3',
    tag: '세이지 그린 &amp; 화이트 쿼츠 아일랜드 주방',
  },
  {
    filename: 'kitchen_option_02.png',
    title: 'Matte Charcoal &amp; Champagne Gold Modern Kitchen',
    category: 'Kitchen Option 2',
    bg: ['#1c1e22', '#111215'],
    island: ['#2a2d34', '#1d1f24'],
    wood: '#7a6250',
    accent: '#e6c875',
    wall: '#17191d',
    pendant: '#ffd700',
    tag: '매트 차콜 &amp; 샴페인 골드 포인트 주방',
  },
  {
    filename: 'kitchen_option_03.png',
    title: 'Warm Walnut &amp; Terrazzo Modern Farmhouse Kitchen',
    category: 'Kitchen Option 3',
    bg: ['#423023', '#2a1e15'],
    island: ['#ded5c6', '#c9bdab'],
    wood: '#7c5438',
    accent: '#a67c52',
    wall: '#f7f3ed',
    pendant: '#d9a774',
    tag: '월넛 우드 &amp; 테라조 모던 팜하우스 주방',
  },
  {
    filename: 'kitchen_option_04.png',
    title: 'Monochromatic Concrete &amp; Steel Industrial Kitchen',
    category: 'Kitchen Option 4',
    bg: ['#353940', '#202328'],
    island: ['#4b5059', '#32363d'],
    wood: '#5e4e42',
    accent: '#8c95a3',
    wall: '#2d3138',
    pendant: '#a1aaab',
    tag: '폴리싱 콘크리트 &amp; 매트 스틸 모노크롬 주방',
  },
  {
    filename: 'kitchen_option_05.png',
    title: 'Ultra-Clean Pure White Minimalist Kitchen',
    category: 'Kitchen Option 5',
    bg: ['#f8f9fa', '#e9ecef'],
    island: ['#ffffff', '#f1f3f5'],
    wood: '#b8a99a',
    accent: '#ced4da',
    wall: '#ffffff',
    pendant: '#e9ecef',
    tag: '퓨어 화이트 &amp; 간접 조명 모던 미니멀 주방',
  },
  {
    filename: 'baby_room_01.png',
    title: 'Cream &amp; Warm Terracotta Boho Baby Nursery',
    category: 'Baby Room Option 1',
    bg: ['#7c4636', '#593024'],
    island: ['#f5ece3', '#e4d3c2'],
    wood: '#b8855c',
    accent: '#d97d54',
    wall: '#fcf6f0',
    pendant: '#f0be9b',
    tag: '포근한 테라코타 &amp; 크림 캐노피 아기방',
  },
  {
    filename: 'baby_room_02.png',
    title: 'Nordic Sage &amp; White Birch Montessori Nursery',
    category: 'Baby Room Option 2',
    bg: ['#475b50', '#2d3b33'],
    island: ['#e4eae6', '#ccd8d0'],
    wood: '#c4ad93',
    accent: '#6f947e',
    wall: '#f4f7f5',
    pendant: '#a3c4b1',
    tag: '노르딕 세이지 그린 &amp; 자작나무 아기방',
  },
  {
    filename: 'baby_room_03.png',
    title: 'Dusty Blue &amp; Warm Oak Scandinavian Kids Room',
    category: 'Baby Room Option 3',
    bg: ['#384c5e', '#233240'],
    island: ['#e3e8ee', '#cbd5e1'],
    wood: '#b59375',
    accent: '#5a7894',
    wall: '#f1f5f9',
    pendant: '#94aebf',
    tag: '더스티 블루 &amp; 내추럴 오크 스칸디 아기방',
  },
  {
    filename: 'baby_room_04.png',
    title: 'Minimalist Monochrome Grey &amp; Light Wood Baby Room',
    category: 'Baby Room Option 4',
    bg: ['#4a4e57', '#31343b'],
    island: ['#e2e4e8', '#c9cbd1'],
    wood: '#a68f7b',
    accent: '#727785',
    wall: '#f3f4f6',
    pendant: '#b0b5c2',
    tag: '모노톤 그레이 &amp; 애쉬 우드 미니멀 아기방',
  },
  {
    filename: 'baby_room_05.png',
    title: 'Soft Peach &amp; Gold Luxury Nursery Suite',
    category: 'Baby Room Option 5',
    bg: ['#8a564c', '#5e3831'],
    island: ['#f7eee9', '#ebd8cd'],
    wood: '#c79d7f',
    accent: '#d4af37',
    wall: '#fdf7f5',
    pendant: '#f0c2b3',
    tag: '피치 블러시 &amp; 골드 포인트 럭셔리 아기방',
  },
];

function buildSVG(room) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${room.bg[0]}"/>
      <stop offset="100%" stop-color="${room.bg[1]}"/>
    </linearGradient>
    <linearGradient id="island" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${room.island[0]}"/>
      <stop offset="100%" stop-color="${room.island[1]}"/>
    </linearGradient>
    <radialGradient id="light" cx="0.85" cy="0.15" r="0.9">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- 벽면 렌더링 -->
  <rect width="1200" height="900" fill="url(#bg)"/>
  
  <!-- 창문 구조 및 햇살 감성 -->
  <rect x="720" y="80" width="420" height="540" rx="20" fill="${room.wall}" opacity="0.92" stroke="${room.wood}" stroke-width="10"/>
  <line x1="930" y1="80" x2="930" y2="620" stroke="${room.wood}" stroke-width="8"/>
  <line x1="720" y1="350" x2="1140" y2="350" stroke="${room.wood}" stroke-width="8"/>
  <rect width="1200" height="900" fill="url(#light)"/>

  <!-- 바닥 플로어 감성 -->
  <polygon points="0,660 1200,660 1200,900 0,900" fill="${room.wood}" opacity="0.88"/>
  <line x1="0" y1="720" x2="1200" y2="720" stroke="#000" opacity="0.1" stroke-width="2"/>
  <line x1="0" y1="800" x2="1200" y2="800" stroke="#000" opacity="0.1" stroke-width="2"/>

  <!-- 가구 중앙 스포트라이트 -->
  <g filter="url(#shadow)">
    <rect x="140" y="460" width="700" height="230" rx="28" fill="url(#island)" stroke="${room.accent}" stroke-width="4"/>
    <rect x="160" y="430" width="660" height="42" rx="10" fill="#ffffff" opacity="0.95"/>
  </g>

  <!-- 팬던트 및 건축 조명 -->
  <line x1="360" y1="0" x2="360" y2="260" stroke="${room.accent}" stroke-width="4"/>
  <line x1="620" y1="0" x2="620" y2="260" stroke="${room.accent}" stroke-width="4"/>
  <circle cx="360" cy="285" r="35" fill="${room.pendant}" filter="url(#shadow)"/>
  <circle cx="620" cy="285" r="35" fill="${room.pendant}" filter="url(#shadow)"/>

  <!-- 3D 뱃지 및 설명 -->
  <rect x="50" y="50" width="360" height="50" rx="25" fill="#111111" opacity="0.88"/>
  <text x="75" y="82" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#ffffff">${room.category}</text>

  <rect x="50" y="770" width="760" height="80" rx="22" fill="#ffffff" opacity="0.95" filter="url(#shadow)"/>
  <text x="80" y="808" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#1a1a1a">${room.tag}</text>
  <text x="80" y="834" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#555555">${room.title}</text>
</svg>`;
}

async function run() {
  const publicDir = path.join(__dirname, '../public');

  for (const room of UNIQUE_ROOMS) {
    const svgStr = buildSVG(room);
    const pngPath = path.join(publicDir, room.filename);
    
    // Sharp를 통해 1200x900 고화질 PNG로 변환
    await sharp(Buffer.from(svgStr))
      .png({ quality: 100 })
      .toFile(pngPath);
    
    console.log(`Rendered PNG: ${room.filename}`);
  }
  console.log("All 10 unique non-overlapping PNG options created successfully!");
}

run().catch(console.error);
