// 공간 유형 · 인테리어 스타일 정의 (클라이언트 UI와 서버 프롬프트가 공유)

export type RoomCategory = 'interior' | 'exterior' | 'outdoor';

export type RoomType = {
  id: string;
  category: RoomCategory;
  label: string;
  labelEn: string;
  labelJa: string;
  /** Gemini 프롬프트에 들어갈 영문 명칭 */
  prompt: string;
};

export type StyleOption = {
  id: string;
  label: string;
  labelEn: string;
  labelJa: string;
  desc: string;
  descEn: string;
  descJa: string;
  /** 스타일 카드에 표시되는 대표 색상 스와치 */
  swatch: [string, string, string];
  /** Gemini 프롬프트에 들어갈 스타일 지시문 */
  prompt: string;
};

export const ROOM_TYPES: RoomType[] = [
  // 🏠 실내 (Interior)
  { id: "living_room", category: "interior", label: "거실", labelEn: "Living Room", labelJa: "リビング", prompt: "living room" },
  { id: "bedroom", category: "interior", label: "침실", labelEn: "Bedroom", labelJa: "ベッドルーム", prompt: "bedroom" },
  { id: "kitchen", category: "interior", label: "주방", labelEn: "Kitchen", labelJa: "キッチン", prompt: "kitchen" },
  { id: "bathroom", category: "interior", label: "욕실", labelEn: "Bathroom", labelJa: "バスルーム", prompt: "bathroom" },
  { id: "study", category: "interior", label: "서재", labelEn: "Home Office", labelJa: "書斎・オフィス", prompt: "home office / study room" },
  { id: "studio", category: "interior", label: "원룸", labelEn: "Studio Apartment", labelJa: "ワンルーム", prompt: "studio apartment" },
  
  // 🏡 건물 외관 (Exterior)
  { id: "exterior_house", category: "exterior", label: "주택 외관", labelEn: "House Exterior", labelJa: "住宅外観", prompt: "residential house exterior façade and front architecture" },
  { id: "exterior_commercial", category: "exterior", label: "상가/카페 외관", labelEn: "Storefront & Café", labelJa: "店舗・カフェ外観", prompt: "commercial storefront café architecture and entrance" },
  
  // 🌿 정원 & 야외 (Outdoor)
  { id: "garden_patio", category: "outdoor", label: "정원 & 테라스", labelEn: "Garden & Terrace", labelJa: "庭・テラス", prompt: "outdoor garden, patio, landscaping and seating area" },
  { id: "balcony", category: "outdoor", label: "베란다/발코니", labelEn: "Balcony", labelJa: "バルコニー", prompt: "balcony and cozy sunroom space" },
];

export const STYLES: StyleOption[] = [
  {
    id: "modern",
    label: "모던",
    labelEn: "Modern",
    labelJa: "モダン",
    desc: "깔끔하고 정돈된 도시적 분위기",
    descEn: "Sleek & refined urban aesthetic",
    descJa: "洗練された都会적인デザイン",
    swatch: ["#2b2b2e", "#c9c9cd", "#8a6f52"],
    prompt:
      "sleek modern style: clean lines, neutral palette with charcoal and greige, low-profile furniture, matte finishes, statement lighting",
  },
  {
    id: "minimal",
    label: "미니멀",
    labelEn: "Minimalist",
    labelJa: "ミニマル",
    desc: "단순함과 여백의 미학",
    descEn: "Simplicity & spacious negative space",
    descJa: "シンプルさと余白の美学",
    swatch: ["#f4f2ee", "#d8d4cc", "#9a958a"],
    prompt:
      "minimalist style: pared-down furnishings, warm white walls, hidden storage, soft diffuse light, generous negative space",
  },
  {
    id: "scandinavian",
    label: "북유럽",
    labelEn: "Scandinavian",
    labelJa: "北欧スタイル",
    desc: "따뜻하고 내추럴한 휘게 감성",
    descEn: "Warm & cozy hygge vibe",
    descJa: "温かみのあるヒュッゲな空間",
    swatch: ["#e9e2d5", "#b9a284", "#5f6f5e"],
    prompt:
      "Scandinavian style: light oak wood, cozy wool and linen textiles, white and sage accents, hygge atmosphere, potted greenery",
  },
  {
    id: "industrial",
    label: "인더스트리얼",
    labelEn: "Industrial",
    labelJa: "インダストリアル",
    desc: "노출 콘크리트와 빈티지 철제",
    descEn: "Exposed concrete & black steel loft",
    descJa: "コンクリートと黒鉄のヴィンテージ感",
    swatch: ["#4a4a4a", "#7d6a58", "#2f3540"],
    prompt:
      "industrial loft style: exposed concrete texture, black steel frames, leather and reclaimed wood furniture, Edison bulb lighting",
  },
  {
    id: "japandi",
    label: "재팬디",
    labelEn: "Japandi",
    labelJa: "ジャパンディ",
    desc: "동양적 절제미와 북유럽 실용성",
    descEn: "Zen simplicity meets Nordic function",
    descJa: "和の静けさと北欧の機能美の融合",
    swatch: ["#ded5c4", "#8c7b60", "#3d3a33"],
    prompt:
      "Japandi style: low wooden furniture, wabi-sabi ceramics, rice-paper lighting, muted earth tones, calm uncluttered balance",
  },
  {
    id: "mid_century",
    label: "미드센추리",
    labelEn: "Mid-Century",
    labelJa: "ミッドセンチュリー",
    desc: "레트로한 원색과 감각적인 우드",
    descEn: "Retro colors & walnut wood textures",
    descJa: "レトロなカラーとウッド感",
    swatch: ["#b0562f", "#e0b04e", "#3f5748"],
    prompt:
      "mid-century modern style: walnut furniture with tapered legs, mustard and teal accent colors, geometric patterns, retro lighting",
  },
  {
    id: "hanok",
    label: "한옥 레트로",
    labelEn: "Korean Hanok",
    labelJa: "韓屋レトロ",
    desc: "전통 서까래와 한지 조명의 정취",
    descEn: "Traditional wooden beams & paper lamps",
    descJa: "伝統的な木製梁と和紙照明の情緒",
    swatch: ["#c7b299", "#6e4f33", "#eae3d2"],
    prompt:
      "modern Korean hanok style: warm wooden ceiling beams, hanji paper lamp screens, low traditional furniture, natural linen, serene earthy palette",
  },
  {
    id: "hotel_lounge",
    label: "호텔 럭셔리",
    labelEn: "Hotel Luxury",
    labelJa: "ホテルラグジュアリー",
    desc: "고급 대리석과 은은한 벨벳 라이트",
    descEn: "Marble accents & ambient plush velvet",
    descJa: "高級大理石と洗練された間接照明",
    swatch: ["#1f2430", "#9c8455", "#5c5148"],
    prompt:
      "luxury hotel lounge style: plush velvet seating, brass and marble details, layered ambient lighting, dark sophisticated palette",
  },
  {
    id: "bohemian",
    label: "보헤미안",
    labelEn: "Bohemian",
    labelJa: "ボヘミアン",
    desc: "라탄과 직물, 자유로운 오가닉 무드",
    descEn: "Natural rattan & organic woven textures",
    descJa: "ラタンとファブリックのオーガニック感",
    swatch: ["#c08552", "#d9b48f", "#798c50"],
    prompt:
      "Bohemian style: natural rattan furniture, layered patterned woven rugs, lush indoor tropical plants, macrame wall hangings, warm terracotta and sandy hues",
  },
  {
    id: "classic",
    label: "유러피안 클래식",
    labelEn: "European Classic",
    labelJa: "ヨーロピアンクラシック",
    desc: "우아한 몰딩과 고풍스러운 앤티크",
    descEn: "Ornate wall moldings & antique elegance",
    descJa: "優雅なモールディングとアンティーク調",
    swatch: ["#3c2f2f", "#bfa15f", "#f3efe6"],
    prompt:
      "European classic style: ornate crown wall moldings, vintage carved mahogany furniture, crystal chandelier, damask silk drapery, timeless aristocratic elegance",
  },
  {
    id: "botanical",
    label: "보태니컬 플랜테리어",
    labelEn: "Botanical Biophilic",
    labelJa: "ボタニカルグリーン",
    desc: "싱그러운 초록 식물과 자연광",
    descEn: "Lush indoor houseplants & natural light",
    descJa: "みずみずしい観葉植物と自然光",
    swatch: ["#2d5a27", "#8fa87a", "#e8e1d7"],
    prompt:
      "Botanical biophilic style: overflowing leafy houseplants, monstera and hanging ferns, clay terracotta pots, bright natural sunlight, light timber accents",
  },
  {
    id: "tropical_resort",
    label: "트로피컬 리조트",
    labelEn: "Tropical Resort",
    labelJa: "トロピカルリゾート",
    desc: "휴양지 래플스 리조트의 아늑함",
    descEn: "Exotic resort lounge & breezy cane decor",
    descJa: "リゾートホテルのような優雅な寛ぎ",
    swatch: ["#005b5c", "#e3b04b", "#f7f4ea"],
    prompt:
      "Tropical resort style: woven bamboo and cane furniture, large palm foliage motifs, airy sheer white linen, exotic resort luxury ambience",
  },
  {
    id: "bauhaus",
    label: "바우하우스",
    labelEn: "Bauhaus",
    labelJa: "バウハウス",
    desc: "기하학적 삼원색과 강렬한 구조미",
    descEn: "Primary color accents & steel forms",
    descJa: "幾何学的な三原色とスチール構造美",
    swatch: ["#d9381e", "#1b4d89", "#e8c842"],
    prompt:
      "Bauhaus style: primary color accents (red, blue, yellow), tubular steel furniture frames, bold geometric forms, functional art design, bright clean room",
  },
  {
    id: "art_deco",
    label: "아르데코",
    labelEn: "Art Deco",
    labelJa: "アールデコ",
    desc: "화려한 골드 패턴과 지오메트릭",
    descEn: "Glamorous gold patterns & geometric trim",
    descJa: "華やかなゴールドパターンと幾何学",
    swatch: ["#172a3a", "#c5a059", "#4a1525"],
    prompt:
      "Art Deco style: glamorous gold metallic trim, bold chevron and sunburst patterns, jewel-toned velvet upholstery, sleek polished surfaces",
  },
  {
    id: "provence",
    label: "프렌치 프로방스",
    labelEn: "French Provence",
    labelJa: "フレンチプロヴァンス",
    desc: "로맨틱한 빈티지 파스텔 감성",
    descEn: "Romantic pastel vintage country charm",
    descJa: "ロマンチックなヴィンテージパステル調",
    swatch: ["#d0c3b0", "#899da4", "#d6989a"],
    prompt:
      "French Provence country style: whitewashed distressed wooden furniture, lavender and delicate floral patterns, wrought iron details, soft pastel hues",
  },
  {
    id: "modern_farmhouse",
    label: "모던 파름하우스",
    labelEn: "Modern Farmhouse",
    labelJa: "モダンファームハウス",
    desc: "따뜻한 시골집 목조와 쉼터",
    descEn: "White shiplap walls & rustic wood fireplace",
    descJa: "温かみのある木造ログハウスと暖炉",
    swatch: ["#2c2c2c", "#e6e2dd", "#735c49"],
    prompt:
      "Modern Farmhouse style: white wooden shiplap walls, dark metal hardware, cozy plush sectional sofa, rustic reclaimed timber beams, stone fireplace",
  },
  {
    id: "cyberpunk",
    label: "네온 사이버펑크",
    labelEn: "Neon Cyberpunk",
    labelJa: "ネオンサイバーパンク",
    desc: "감각적인 네온 조명과 네이비 톤",
    descEn: "Futuristic dark vibe & cyan neon glow",
    descJa: "近未来的なネオンライトとダーク感",
    swatch: ["#0f051d", "#ff007f", "#00f0ff"],
    prompt:
      "Futuristic Cyberpunk style: dark atmosphere with vibrant pink and cyan LED strip accent lighting, dark reflective metals, high-tech ambient neon glow",
  },
  {
    id: "coastal",
    label: "코스탈 비치",
    labelEn: "Coastal Beach",
    labelJa: "コースタルビーチ",
    desc: "청량한 바다 색감과 시원한 모래",
    descEn: "Ocean blue & sandy beach palette",
    descJa: "爽やかな海のブルーと砂浜のパレット",
    swatch: ["#1d4e89", "#d4e6f1", "#f5ebe0"],
    prompt:
      "Coastal beach house style: ocean blue and sandy beige palette, weathered driftwood furniture, woven seagrass decor, light breezy curtains",
  },
  {
    id: "urban_woody",
    label: "우디 어반",
    labelEn: "Urban Woody",
    labelJa: "ウッディアーバン",
    desc: "도심 속 짙은 월넛 원목과 무드등",
    descEn: "Dark walnut panels & warm cove light",
    descJa: "濃いウォールナット無垢材と間接照明",
    swatch: ["#3a2e2b", "#8c6747", "#d1c7bd"],
    prompt:
      "Urban Woody style: deep dark walnut wood panelling, warm indirect cove lighting, slate stone accents, refined modern wooden furniture",
  },
  {
    id: "monochrome",
    label: "모노크롬 흑백",
    labelEn: "Monochrome",
    labelJa: "モノクローム",
    desc: "강렬한 흑백 대비와 미니멀 아트",
    descEn: "High-contrast black & white minimalist art",
    descJa: "コントラストの効いたモノクロデザイン",
    swatch: ["#111111", "#777777", "#ffffff"],
    prompt:
      "Monochrome style: striking high-contrast black and white interior, white marble tiles, bold black accent furniture, dramatic shadow and light contrast",
  },
];

export const FREE_GENERATIONS = 2;
export const DAILY_IP_LIMIT = 10;
