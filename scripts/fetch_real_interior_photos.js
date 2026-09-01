const fs = require('fs');
const path = require('path');

// Unsplash 고화질 실제 인테리어 사진 URL (주방 5종 & 아기방 5종)
const REAL_INTERIOR_PHOTOS = [
  // 주방 5종
  {
    filename: 'kitchen_option_01.png',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop',
    title: '북유럽 라이트 우드 & 화이트 마블 아일랜드 주방',
  },
  {
    filename: 'kitchen_option_02.png',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    title: '매트 블랙 & 브라스 포인트 모던 하이엔드 주방',
  },
  {
    filename: 'kitchen_option_03.png',
    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop',
    title: '월넛 우드 & 테라조 모던 팜하우스 감성 주방',
  },
  {
    filename: 'kitchen_option_04.png',
    url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?q=80&w=1200&auto=format&fit=crop',
    title: '폴리싱 콘크리트 & 매트 스틸 아크로 주방',
  },
  {
    filename: 'kitchen_option_05.png',
    url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1200&auto=format&fit=crop',
    title: '퓨어 화이트 & 라인 조명 미니멀 오픈 주방',
  },

  // 아기방 / 자녀방 5종
  {
    filename: 'baby_room_01.png',
    url: 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?q=80&w=1200&auto=format&fit=crop',
    title: '포근한 파스텔 크림 & 원목 아기 침대방',
  },
  {
    filename: 'baby_room_02.png',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop',
    title: '노르딕 세이지 그린 & 내추럴 우드 교구 자녀방',
  },
  {
    filename: 'baby_room_03.png',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
    title: '더스티 블루 & 올인원 오크 원목 스칸디 아기방',
  },
  {
    filename: 'baby_room_04.png',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop',
    title: '모노톤 그레이 & 애쉬 우드 미니멀 놀이방',
  },
  {
    filename: 'baby_room_05.png',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    title: '피치 블러시 & 골드 포인트 럭셔리 스위트 아기방',
  },
];

async function downloadPhotos() {
  const publicDir = path.join(__dirname, '../public');
  console.log("Downloading 10 real high-res interior photography images...");

  for (const item of REAL_INTERIOR_PHOTOS) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(publicDir, item.filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`Downloaded: ${item.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Failed ${item.filename}:`, err.message);
    }
  }

  console.log("All 10 real high-res photography files downloaded!");
}

downloadPhotos();
