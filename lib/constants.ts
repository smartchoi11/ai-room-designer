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
  { id: "kitchen", category: "interior", label: "주방", labelEn: "Kitchen", labelJa: "キッチン", prompt: "kitchen" },
  { id: "living_room", category: "interior", label: "거실", labelEn: "Living Room", labelJa: "リビング", prompt: "living room" },
  { id: "under_stairs", category: "interior", label: "계단 밑 공간", labelEn: "Under-Stairs", labelJa: "階段下スペース", prompt: "creative functional cozy under-stairs nook, reading corner or custom storage" },
  { id: "study", category: "interior", label: "서재 / 홈오피스", labelEn: "Home Office", labelJa: "書斎・オフィス", prompt: "home office / study room" },
  { id: "bedroom", category: "interior", label: "침실", labelEn: "Bedroom", labelJa: "ベッドルーム", prompt: "bedroom" },
  { id: "kids_room", category: "interior", label: "아이들방", labelEn: "Kids Room", labelJa: "子供部屋", prompt: "playful cozy modern children's kids room with child bed, study desk, toy storage, bookshelf, and gentle warm lighting" },
  { id: "bathroom", category: "interior", label: "욕실", labelEn: "Bathroom", labelJa: "バスルーム", prompt: "bathroom" },
  { id: "dining_room", category: "interior", label: "다이닝룸 / 식당", labelEn: "Dining Room", labelJa: "ダイニング", prompt: "spacious elegant dining room with dinner table and chairs" },
  { id: "coffee_shop", category: "interior", label: "카페 / 커피숍", labelEn: "Coffee Shop", labelJa: "カフェ・喫茶", prompt: "commercial coffee shop, aesthetic café interior with barista counter and seating" },
  { id: "study_room", category: "interior", label: "공부방 / 서재", labelEn: "Study Room", labelJa: "勉強部屋・書斎", prompt: "focused quiet study room with desk, bookshelf, and reading lamp" },
  { id: "restaurant", category: "interior", label: "레스토랑 / 식당", labelEn: "Restaurant", labelJa: "レストラン", prompt: "fine dining restaurant interior with ambient dining tables and hospitality lighting" },
  { id: "gaming_room", category: "interior", label: "게이밍 룸", labelEn: "Gaming Room", labelJa: "ゲーミングルーム", prompt: "high-end modern gaming room, battlestation desk setup, ergonomic chair, ambient RGB accent lighting" },
  { id: "office", category: "interior", label: "오피스 / 사무실", labelEn: "Office", labelJa: "オフィス・事務所", prompt: "professional commercial corporate office workstation and executive meeting space" },
  
  // 🏡 건물 외관 (Exterior)
  { id: "exterior_house", category: "exterior", label: "주택 외관", labelEn: "House Exterior", labelJa: "住宅外観", prompt: "residential house exterior façade and front architecture" },
  { id: "exterior_commercial", category: "exterior", label: "상가/카페 외관", labelEn: "Storefront & Café", labelJa: "店舗・カフェ外観", prompt: "commercial storefront café architecture and entrance" },
  
  // 🌿 정원 & 야외 (Outdoor)
  { id: "garden_patio", category: "outdoor", label: "정원 & 테라스", labelEn: "Garden & Terrace", labelJa: "庭・テラス", prompt: "outdoor garden, patio, landscaping and seating area" },
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

// 🏛️ 건물 외관 리모델링 전용: 각 나라별 건축 특징을 살린 10대 글로벌 건축 스타일
export const EXTERIOR_STYLES: StyleOption[] = [
  {
    id: "korea_hanok",
    label: "한국 모던 한옥",
    labelEn: "K-Modern Hanok",
    labelJa: "韓国モダン韓屋",
    desc: "전통 기와 처마선과 원목 서까래, 파노라마 통창이 조화된 모던 한옥",
    descEn: "Traditional curved Giwa tile roof, natural wood rafters, and floor-to-ceiling glass",
    descJa: "伝統的な瓦屋根と木の梁、パノラマ窓が調和したモダン韓屋",
    swatch: ["#2d2d2d", "#8c6239", "#e2dedb"],
    prompt: "K-Modern Hanok architectural style: elegant traditional curved dark Giwa tile rooflines, exposed natural pine timber posts and beams, floor-to-ceiling panoramic glass windows, granite stone foundation terrace steps, and refined manicured Korean garden landscaping",
  },
  {
    id: "japan_zen",
    label: "일본 젠 모던",
    labelEn: "Japanese Zen Modern",
    labelJa: "日本禅モダン",
    desc: "야키스기 탄화목 외벽, 미니멀 처마, 대나무와 자갈 젠 정원",
    descEn: "Charred Yakisugi wood, minimalist eaves, and peaceful dry gravel Zen rock garden",
    descJa: "焼杉の外壁、ミニマルな軒、竹と白砂利の禅ガーデン",
    swatch: ["#1c1c1c", "#5c4033", "#dcd6cd"],
    prompt: "Japanese Zen Modern architectural style: charred black Yakisugi wood siding, minimalist low-profile eaves, slim black metal frames, peaceful dry gravel Zen rock garden with bonsai pine and stone lanterns",
  },
  {
    id: "nordic_scandi",
    label: "북유럽 스칸디나비안",
    labelEn: "Nordic Scandinavian House",
    labelJa: "北欧スカンジナビア",
    desc: "A자형 경사 박공지붕, 내추럴 원목 사이딩, 침엽수 조경",
    descEn: "Steep gabled roof, vertical natural timber siding, and evergreen landscaping",
    descJa: "急勾配の切妻屋根、ナチュラルウッドサイディング、針葉樹の造園",
    swatch: ["#373d3f", "#c29b6b", "#708238"],
    prompt: "Nordic Scandinavian architectural style: steep gabled charcoal zinc roofline, vertical light natural timber wood siding, expansive double-height glass facade, warm outdoor deck sconces, surrounded by wild grasses and pine trees",
  },
  {
    id: "mediterranean",
    label: "지중해 산토리니 & 스패니시",
    labelEn: "Mediterranean Coastal Villa",
    labelJa: "地中海リゾートヴィラ",
    desc: "순백색 스타코 외벽, 테라코타 기와, 아치형 창호와 발코니",
    descEn: "Whitewashed stucco walls, terracotta barrel tiles, and romantic arched doorways",
    descJa: "真っ白なスタッコ壁、テラコッタ瓦、アーチ型の窓とバルコニー",
    swatch: ["#ffffff", "#d95d39", "#20639b"],
    prompt: "Mediterranean Spanish & Greek coastal villa architectural style: brilliant whitewashed stucco walls, warm terracotta barrel roof tiles, romantic arched windows and doorways with wrought iron balconies, vibrant magenta bougainvillea flower vines, and natural limestone stone patio",
  },
  {
    id: "us_modern_brick",
    label: "미국 브릭 & 인더스트리얼",
    labelEn: "American Modern Brick & Loft",
    labelJa: "アメリカン・モダンブリック",
    desc: "붉은 파벽돌, 블랙 메탈 빔, 대형 격자 스틸 창호",
    descEn: "Red brick facade, black steel structural beams, and factory-style grid windows",
    descJa: "赤レンガのファサード、黒いスチール梁、格子状の大型スチール窓",
    swatch: ["#8a3324", "#1a1a1a", "#707070"],
    prompt: "American Modern Industrial Brick architectural style: rich textured red brick facade, matte black steel structural beams, expansive multi-pane black factory-style metal windows, sleek wooden front porch canopy, and clean architectural concrete planters",
  },
  {
    id: "french_chateau",
    label: "프랑스 클래식 샤토",
    labelEn: "French Classic Chateau",
    labelJa: "フレンチ・クラシックシャトー",
    desc: "라임스톤 석재 파사드, 만사르드 지붕, 우아한 대칭 창호",
    descEn: "Pale limestone masonry, dark Mansard roof, and classical French casement windows",
    descJa: "ライムストーンの石造り、マンサード屋根、エレガントな対称窓",
    swatch: ["#e3dac9", "#3b444b", "#6c7a89"],
    prompt: "French Classic Parisian Chateau architectural style: pale limestone ashlar masonry facade, dark zinc Mansard roof with ornate classical dormers, tall symmetrical French casement windows with delicate iron railings, and formal manicured boxwood parterre gardens",
  },
  {
    id: "british_tudor",
    label: "영국 코티지 & 튜더",
    labelEn: "British Tudor Cottage",
    labelJa: "英国チューダー・コテージ",
    desc: "허니 라임스톤 석재, 다크 하프팀버 목조, 잉글리시 가든",
    descEn: "Honey limestone walls, dark exposed timber beams, and climbing English roses",
    descJa: "ハニーライムストーン、ハーフティンバーの木組み、イングリッシュガーデン",
    swatch: ["#c8b273", "#3d2b1f", "#4f7942"],
    prompt: "British Cotswolds Tudor Cottage architectural style: warm honey limestone walls, dark exposed rustic timber beams, steep gabled slate roof with brick chimneys, leaded diamond lattice windows, and lush climbing English roses and wild cottage garden",
  },
  {
    id: "swiss_chalet",
    label: "스위스 알파인 샬레",
    labelEn: "Swiss Alpine Chalet",
    labelJa: "スイス・アルペンシャレー",
    desc: "통나무 원목 발코니, 넓은 박공 처마, 석재 기단과 꽃 장식",
    descEn: "Dark weathered timber logs, wide gabled eaves, and geranium-draped balconies",
    descJa: "重厚な丸太造り、深い切妻の軒、ゼラニウムの花で飾られた木製バルコニー",
    swatch: ["#4a2f13", "#7d5c34", "#a30000"],
    prompt: "Swiss Alpine Chalet architectural style: rich dark weathered timber log walls, wide overhanging gabled eaves with carved brackets, continuous wooden balconies filled with cascading red geranium flowers, heavy natural alpine stone foundation, and scenic mountain atmosphere",
  },
  {
    id: "bali_resort",
    label: "발리 트로피컬 풀빌라",
    labelEn: "Balinese Tropical Villa",
    labelJa: "バリ島トロピカルヴィラ",
    desc: "초가 파빌리온 지붕, 티크 목재 기둥, 야자수와 인피니티 풀",
    descEn: "Open-air teak pavilion, thatched roof, volcanic stone wall, and infinity pool",
    descJa: "チーク材の東屋、茅葺き屋根、溶岩石の滝、インフィニティプール",
    swatch: ["#5d4037", "#00838f", "#2e7d32"],
    prompt: "Balinese Tropical Luxury Villa architectural style: open-air teak wood pavilion structure, pitched thatched Alang-alang roofing, dark volcanic stone cascading water wall, expansive wooden sun deck adjacent to a private infinity pool, surrounded by lush monstera, palms, and frangipani blossoms",
  },
  {
    id: "german_bauhaus",
    label: "독일 바우하우스 모더니즘",
    labelEn: "German Bauhaus Modern",
    labelJa: "ドイツ・バウハウス",
    desc: "기하학적 큐빅 볼륨, 수평 리본 글라스, 기능주의 백색 파사드",
    descEn: "Pure geometric white cubic volumes, flat roof terrace, and horizontal ribbon windows",
    descJa: "純粋な白い幾何学キューブ、フラットルーフ、連続リボン窓",
    swatch: ["#f5f5f5", "#000000", "#d32f2f"],
    prompt: "German Bauhaus Modernist architectural style: pure minimalist white cubic volumes, flat roof terrace with black tubular steel railings, continuous horizontal ribbon strip windows, sleek cantilevered concrete entrance canopy, and minimalist landscaped lawns",
  },
];

// 🌿 정원 & 테라스 리모델링 전용: 8대 정원 & 랜드스케이프 조경 스타일
export const GARDEN_STYLES: StyleOption[] = [
  {
    id: "garden_korean",
    label: "한국 전통 & 모던 정원",
    labelEn: "Korean Modern Traditional Garden",
    labelJa: "韓国伝統・モダン庭園",
    desc: "소나무와 자연석 디딤길, 고풍스러운 기와 담장과 석등",
    descEn: "Sculptural Korean red pine trees, granite stepping stones, and Giwa tile stone wall",
    descJa: "優雅な赤松、自然石の飛び石、伝統的な瓦塀と石灯籠",
    swatch: ["#2d4a22", "#8c6239", "#dcd6cd"],
    prompt: "Korean Modern Traditional Garden landscape: elegant sculptural Korean red pine trees, natural granite stepping stones meandering through mossy green lawn, traditional curved Giwa tile low stone walls, stone lanterns, and bamboo water features",
  },
  {
    id: "garden_japanese_zen",
    label: "일본 젠 & 스톤 정원",
    labelEn: "Japanese Zen Rock Garden",
    labelJa: "日本枯山水・禅ガーデン",
    desc: "백자갈 물결, 젠 바위, 붉은 단풍나무와 츠쿠바이 물받이",
    descEn: "Raked white gravel ripples, mossy rock arrangements, and red Japanese maple",
    descJa: "白砂の砂紋、苔むした巨石、イロハモミジと竹の蹲（つくばい）",
    swatch: ["#e8e8e8", "#5c4033", "#b22222"],
    prompt: "Japanese Zen Rock Garden style: pristine raked white gravel ripples, mossy sculptural rock arrangements, Japanese red maple tree, bamboo tsukubai water fountain, and cedar wood decking",
  },
  {
    id: "garden_english_cottage",
    label: "영국식 코티지 플라워 가든",
    labelEn: "English Cottage Flower Garden",
    labelJa: "英国コテージフラワーガーデン",
    desc: "만개한 덩굴장미, 보랏빛 라벤더, 조약돌 산책로와 우드 벤치",
    descEn: "Climbing roses, purple lavender, blue delphiniums, and cobblestone path",
    descJa: "満開のつるバラ、紫のラベンダー、丸石の小道と木製ベンチ",
    swatch: ["#e07a5f", "#81b29a", "#7a5980"],
    prompt: "English Cottage Flower Garden style: romantic overflowing perennial flower borders with climbing roses, purple lavender, blue delphiniums, and white hydrangeas along a winding cobblestone pathway",
  },
  {
    id: "garden_balinese_tropical",
    label: "발리 트로피컬 리조트 정원",
    labelEn: "Balinese Tropical Resort Oasis",
    labelJa: "バリ島リゾートオアシス",
    desc: "울창한 야자수, 몬스테라, 화산석 분수 벽과 이국적 풀빌라",
    descEn: "Towering palm trees, giant monstera, volcanic stone cascade, and teak deck",
    descJa: "ヤシの木、モンステラ、溶岩石の滝、チーク材のサンデッキ",
    swatch: ["#1b4332", "#40916c", "#0077b6"],
    prompt: "Balinese Tropical Resort Garden style: towering royal palm trees, lush monstera and frangipani blossoms, volcanic stone cascading waterfall, rich teak sun deck with loungers, and exotic oasis atmosphere",
  },
  {
    id: "garden_mediterranean_tuscan",
    label: "지중해 토스카나 파티오",
    labelEn: "Mediterranean Tuscan Patio",
    labelJa: "地中海トスカーナパティオ",
    desc: "테라코타 대형 화분, 올리브 나무, 천연 석재 파티오와 부겐빌레아",
    descEn: "Terracotta planters, gnarled olive trees, stone patio, and bougainvillea",
    descJa: "テラコッタの鉢植え、オリーブの木、石畳のパティオ、ブーゲンビリア",
    swatch: ["#d95d39", "#6b705c", "#f4a261"],
    prompt: "Mediterranean Tuscan Patio Garden style: warm terracotta planters, ancient gnarled olive trees, limestone stone slab patio, climbing magenta bougainvillea vines, and aromatic rosemary herbs",
  },
  {
    id: "garden_nordic_scandi",
    label: "북유럽 스칸디나비안 가든",
    labelEn: "Nordic Scandinavian Forest Garden",
    labelJa: "北欧スカンジナビアンガーデン",
    desc: "자작나무와 침엽수림, 내추럴 원목 데크 테라스와 야외 조명",
    descEn: "Timber deck patio, silver birch trees, evergreen pines, and ambient lights",
    descJa: "木製デッキテラス、白樺と針葉樹林、自然石とモダンなガーデン照明",
    swatch: ["#4a5759", "#b0c4b1", "#edafb8"],
    prompt: "Nordic Scandinavian Landscape Garden style: vertical timber deck patio, silver birch trees, wild evergreen pines and ornamental fescue grasses, minimalist black outdoor lighting, and rugged natural rocks",
  },
  {
    id: "garden_modern_minimal",
    label: "모던 미니멀 럭셔리 라운지",
    labelEn: "Modern Luxury Minimalist Patio",
    labelJa: "モダンミニマルラグジュアリーパティオ",
    desc: "기하학적 수평 잔디, 노출 콘크리트 플랜터, 세련된 아웃도어 가구",
    descEn: "Geometric lawn lines, smooth cast-concrete planters, and recessed deck lighting",
    descJa: "幾何学的な芝生ライン、コンクリートプランター、埋め込みデッキライト",
    swatch: ["#2b2d42", "#8d99ae", "#edf2f4"],
    prompt: "Modern Minimalist Luxury Patio Garden style: clean architectural geometric lawn lines, smooth cast-concrete planters with architectural grasses, built-in recessed deck lighting, and sleek modular outdoor furniture",
  },
  {
    id: "garden_american_resort",
    label: "아메리칸 리조트 & 코스탈 정원",
    labelEn: "American Resort & Coastal Garden",
    labelJa: "アメリカンリゾート・コースタル",
    desc: "시원한 잔디 마당, 코스탈 야외 다이닝 파티오와 바베큐 라운지",
    descEn: "Spacious manicured lawn, summer outdoor dining patio, and bistro lights",
    descJa: "開放的な芝生の庭、屋外ダイニングパティオ、ストリングライト",
    swatch: ["#1d3557", "#457b9d", "#a8dadc"],
    prompt: "American Coastal Resort Garden style: spacious manicured green lawn, outdoor summer kitchen and dining patio under strings of warm bistro lights, coastal shrubs, and welcoming resort ambiance",
  },
];

export interface PartyEventType {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
  labelJa: string;
  badge: string;
  desc: string;
  prompt: string;
}

export const PARTY_EVENT_TYPES: PartyEventType[] = [
  {
    id: "party_birthday",
    icon: "🎂",
    label: "생일 파티",
    labelEn: "Birthday Party",
    labelJa: "バースデーパーティー",
    badge: "가장 인기",
    desc: "풍선 아치 가랜드, 'Happy Birthday' 네온 레터링, 케이크 파티 테이블",
    prompt: "festive Birthday Party celebration styling: colorful balloon arch garland, glowing warm LED 'Happy Birthday' neon sign on the feature wall, tiered celebration cake on a decorated dessert table, champagne bucket, warm fairy lights, stylish celebration photobooth area",
  },
  {
    id: "party_valentine",
    icon: "💝",
    label: "발렌타인데이 & 화이트데이",
    labelEn: "Valentine's Romantic",
    labelJa: "バレンタインデー",
    badge: "로맨틱",
    desc: "핑크 & 레드 하트 풍선, 로맨틱 캔들로드, 초콜릿 & 와인 세팅",
    prompt: "romantic Valentine's Day and White Day celebration room: heart-shaped red and blush pink balloons, romantic glowing candlelit walkway, exquisite chocolate and wine dessert table, red velvet accents, soft dim ambient fairy lights",
  },
  {
    id: "party_easter",
    icon: "🥚",
    label: "부활절 & 봄맞이 파티",
    labelEn: "Easter & Spring Gathering",
    labelJa: "イースター＆春の集い",
    badge: "화사한 봄",
    desc: "파스텔 에그 오너먼트, 화사한 봄꽃 플라워 화병, 피크닉 감성",
    prompt: "vibrant Easter and Spring festive party room: pastel colored egg decorations, lush fresh spring flower centerpieces with tulips and daffodils, light linen tablecloth with pastel tableware, sunny cheerful festive atmosphere",
  },
  {
    id: "party_proposal",
    icon: "💍",
    label: "프로포즈 이벤트",
    labelEn: "Romantic Proposal",
    labelJa: "プロポーズイベント",
    badge: "평생의 순간",
    desc: "'Marry Me' 대형 발광 레터링, 붉은 장미 꽃잎 로드, 샴페인 & 다이아몬드 무드",
    prompt: "breathtaking romantic Marriage Proposal event styling: illuminated giant glowing LED 'MARRY ME' marquee letters, lush red rose petal walkway surrounded by hundreds of safe warm LED candles, celebratory champagne stand, fairy curtain lights, unforgettable luxury proposal atmosphere",
  },
  {
    id: "party_anniversary",
    icon: "🥂",
    label: "결혼기념일 & 애니버서리",
    labelEn: "Wedding Anniversary",
    labelJa: "結婚記念日・アニバーサリー",
    badge: "럭셔리 무드",
    desc: "은은한 캔들라이트 롱 테이블, 추억의 액자 갤러리월, 프리미엄 와인 바",
    prompt: "elegant Wedding Anniversary celebration room: intimate candlelit dining table set with fine crystal glasses and gold cutlery, stylish photo gallery wall with warm mini spotlights, champagne chiller on a sleek bar cart, soft acoustic jazz lounge ambiance",
  },
  {
    id: "party_christmas",
    icon: "🎄",
    label: "크리스마스 & 연말 파티",
    labelEn: "Christmas & Year-End",
    labelJa: "クリスマス＆忘年会",
    badge: "시즌 BEST",
    desc: "반짝이는 대형 트리, 벽난로 페어리 전구, 홀리데이 만찬 테이블",
    prompt: "enchanting Christmas and Year-End holiday party room: grand tall evergreen Christmas tree adorned with gold baubles and sparkling warm fairy lights, pine garland mantelpiece, festive banquet dining table with red runner and pinecone centerpieces, warm inviting holiday celebration",
  },
  {
    id: "party_halloween",
    icon: "🎃",
    label: "할로윈 파티",
    labelEn: "Halloween Bash",
    labelJa: "ハロウィンパーティー",
    badge: "이색 파티",
    desc: "잭오랜턴 호박 조명, 미스터리 퍼플/오렌지 무드등, 위트있는 파티 데코",
    prompt: "stylish and fun Halloween Bash party room: warm glowing carved Jack-o'-lantern pumpkins, mysterious ambient violet and orange neon accent lighting, chic velvet black and orange party table setting, subtle decorative cobwebs and festive bat silhouettes",
  },
  {
    id: "party_bridal",
    icon: "👰",
    label: "브라이덜 & 베이비샤워",
    labelEn: "Bridal & Baby Shower",
    labelJa: "ブライダル＆ベビーシャワー",
    badge: "인스타 핫플",
    desc: "화이트 실크 플라워 아치, 파스텔 레이스 테이블, 감성 포토존",
    prompt: "dreamy Bridal Shower and Baby Shower party room: elegant white and blush silk flower arch backdrop, long dining table with delicate lace runner, tiered dessert stands with macaroons and pastries, crystal glassware, fairy curtain lighting, picture-perfect celebration aesthetic",
  },
];

export const PARTY_STYLES: StyleOption[] = [
  {
    id: "party_birthday",
    label: "생일 & 축하 파티",
    labelEn: "Birthday Celebration",
    labelJa: "バースデーパーティー",
    desc: "풍선 아치 가랜드, 'Happy Birthday' 네온사인, 샴페인/케이크 파티 테이블",
    descEn: "Balloon arches, neon lettering, festive cake & champagne table",
    descJa: "バルーンガーランド、ネオンサイン、ケーキ＆シャンパンテーブル",
    swatch: ["#ff758c", "#ff7eb3", "#ffd700"],
    prompt: "festive Birthday Party celebration styling: pastel and metallic balloon arch garland, glowing warm LED 'Happy Birthday' neon sign on the feature wall, tiered celebration cake on a decorated dessert table, champagne bucket, warm fairy lights, stylish celebration photobooth area",
  },
  {
    id: "party_bridal",
    label: "브라이덜 샤워",
    labelEn: "Bridal Shower",
    labelJa: "ブライダルシャワー",
    desc: "파스텔 핑크 & 화이트 플라워 아치, 레이스 롱 테이블, 감성 캔들",
    descEn: "Pastel flower arches, elegant lace runner, candles & tiered tea stands",
    descJa: "パステルフラワーアーチ、レーステーブルランナー、キャンドルスタンド",
    swatch: ["#fce4ec", "#f8bbd0", "#ffffff"],
    prompt: "romantic Bridal Shower party styling: dreamy white and blush pink silk flower arch backdrop, elegant long wooden table with delicate lace runner, tall tapered candle holders, crystal glassware, tiered afternoon tea stands with pastries, fairy curtain lights, soft romantic floral atmosphere",
  },
  {
    id: "party_wine",
    label: "와인바 & 라운지",
    labelEn: "Wine Lounge",
    labelJa: "ワインラウンジ",
    desc: "은은한 펜던트 조명, 와인 글라스 랙, 벨벳 카우치, 재즈 바 감성",
    descEn: "Amber pendant lighting, stemware racks, plush velvet lounge, speakeasy mood",
    descJa: "ペンダントライト、ワイングラスラック、ベルベットソファ、ジャズバー空間",
    swatch: ["#2d0c1b", "#8b0000", "#d4af37"],
    prompt: "sophisticated private Wine Bar & Lounge party atmosphere: warm amber pendant lighting, illuminated backlit wine bottle rack and hanging crystal stemware, rich burgundy velvet lounge seating, dark wood accent tables, vintage vinyl turntable corner, moody speakeasy jazz vibe",
  },
  {
    id: "party_neon",
    label: "네온 글램 & 미러볼",
    labelEn: "Neon Glam & Mirror Ball",
    labelJa: "ネオングラム＆ミラーボール",
    desc: "화려한 RGB 조명, 미러볼, 칵테일 바 카운터, 힙한 클럽 라운지",
    descEn: "Disco mirror ball, vibrant RGB strip lights, cocktail bar, trendy club lounge",
    descJa: "ミラーボール、RGBネオンライト、カクテルバー、ナイトクラブラウンジ",
    swatch: ["#0a0017", "#ff007f", "#7928ca"],
    prompt: "trendy Neon Glam & Disco party room: rotating ceiling disco mirror ball casting sparkling light flecks, vibrant magenta and electric purple LED neon wall signs, sleek cocktail bar with shaker and glassware, modular leather poufs and lounge seating, exciting music video photowall backdrop",
  },
  {
    id: "party_glamping",
    label: "실내 감성 글램핑",
    labelEn: "Indoor Glamping",
    labelJa: "インドアグランピング",
    desc: "인디언 티피 텐트, 앵두전구 페어리 라이트, 우드 롤테이블, 코지 러그",
    descEn: "Tipi tent, warm cotton-ball string lights, wooden camp tables, fluffy rug",
    descJa: "インディアンティピーテント、ガーランドライト、ウッドキャンプテーブル",
    swatch: ["#5d4037", "#f5f5dc", "#8d6e63"],
    prompt: "cozy Indoor Glamping picnic party aesthetic: charming canvas teepee tent with cozy floor cushions and chunky knit blankets, warm glowing cotton ball fairy string lights strung across the room, low natural wood roll-top camping table with picnic basket, textured boho rug, relaxed indoor campsite celebration vibe",
  },
  {
    id: "party_holiday",
    label: "홀리데이 & 연말 파티",
    labelEn: "Holiday & Christmas",
    labelJa: "ホリデー＆クリスマス",
    desc: "대형 트리 장식, 웜 화이트 페어리 라이트, 앤틱 벽난로 무드, 파티 디너",
    descEn: "Decorated pine tree, warm glowing fairy lights, festive holiday banquet table",
    descJa: "クリスマスツリー、温かみのあるイルミネーション、ホリデーディナーテーブル",
    swatch: ["#0f3b1e", "#8b0000", "#d4af37"],
    prompt: "enchanting Holiday & Christmas Year-End party styling: magnificent tall evergreen Christmas tree adorned with gold baubles and sparkling warm fairy lights, cozy mantelpiece with pine garland, festive banquet dining table with red runner and pinecone centerpieces, warm inviting celebration atmosphere",
  },
];

export const ALL_STYLES = [...STYLES, ...EXTERIOR_STYLES, ...GARDEN_STYLES, ...PARTY_STYLES];

export const FREE_GENERATIONS = 0;
export const DAILY_IP_LIMIT = 9999;

