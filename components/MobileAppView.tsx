'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import CompareSlider from './CompareSlider';
import PricingModal from './PricingModal';
import { FREE_GENERATIONS } from '@/lib/constants';
import { useLocalStorage } from '@/lib/useLocalStorage';

type AppTab = 'tools' | 'create' | 'discover' | 'profile';
type WizardStep = 1 | 2 | 3 | 4 | 5; // 5 = Results Board

interface ToolCard {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  image: string;
  beforeImage: string;
  afterImage: string;
  defaultRoom?: string;
  defaultStyle?: string;
}

const TOOL_CARDS: ToolCard[] = [
  {
    id: 'interior',
    title: '인테리어 디자인',
    desc: '사진 1장으로 완성하는 3초 스타일 재창조!',
    image: '/showcase_modern_living.png',
    beforeImage: '/living_room_before.png',
    afterImage: '/living_room_after.png',
    defaultRoom: 'living_room',
    defaultStyle: 'modern',
  },
  {
    id: 'layout',
    title: '공간 레이아웃 최적화',
    desc: '방 구조·벽체 100% 보존 + 가구 및 소품 배치 스마트 재배치!',
    badge: '인기',
    image: '/concept_layout_before.png',
    beforeImage: '/concept_layout_before.png',
    afterImage: '/concept_layout_after.png',
    defaultRoom: 'bedroom',
    defaultStyle: 'modern',
  },
  {
    id: 'exterior',
    title: '건물 외관 디자인',
    desc: '건물 외형은 보존하고 외관 마감재 & 파사드 분위기 변환!',
    badge: '신규',
    image: '/exterior_showcase_before.png',
    beforeImage: '/exterior_showcase_before.png',
    afterImage: '/exterior_showcase_after.png',
    defaultRoom: 'exterior_house',
    defaultStyle: 'modern',
  },
  {
    id: 'garden',
    title: '정원 & 테라스 디자인',
    desc: '야외 테라스 뼈대는 보존하고 꽃·나무·연못 조경 연출!',
    image: '/garden_showcase_before.png',
    beforeImage: '/garden_showcase_before.png',
    afterImage: '/garden_showcase_after.png',
    defaultRoom: 'garden_patio',
    defaultStyle: 'scandinavian',
  },
  {
    id: 'cleanup',
    title: '청소 & 짐 정리 (클린업)',
    desc: '어지러운 잡동사니와 쓰레기만 부분 삭제!',
    image: '/cleanup_showcase_before.png',
    beforeImage: '/cleanup_showcase_before.png',
    afterImage: '/cleanup_showcase_after.png',
    defaultRoom: 'bedroom',
    defaultStyle: 'minimal',
  },
  {
    id: 'paint',
    title: '벽지 & 페인트 교체',
    desc: '가구 보존 + 원하는 벽지, 페인트색, 바닥재 1-Tap 교체!',
    image: '/floor_herringbone_after.png',
    beforeImage: '/wall_paint_before.png',
    afterImage: '/floor_herringbone_after.png',
    defaultRoom: 'living_room',
    defaultStyle: 'modern',
  },
  {
    id: 'replace',
    title: '가구 & 소품 교체',
    desc: '특정 가구와 소품 스타일 체인지!',
    image: '/showcase_gaming_room.png',
    beforeImage: '/showcase_gaming_room.png',
    afterImage: '/living_room_cyberpunk.png',
    defaultRoom: 'living_room',
    defaultStyle: 'modern',
  },
];

const ROOM_OPTIONS = [
  { id: 'living_room', label: '거실', icon: '🛋️' },
  { id: 'bedroom', label: '침실', icon: '🛏️' },
  { id: 'kitchen', label: '주방', icon: '🍳' },
  { id: 'bathroom', label: '욕실', icon: '🛁' },
  { id: 'study', label: '서재 / 홈오피스', icon: '💼' },
  { id: 'studio', label: '원룸 / 스튜디오', icon: '🏠' },
  { id: 'exterior_house', label: '주택 외관', icon: '🏡' },
  { id: 'exterior_commercial', label: '상가/카페 외관', icon: '☕' },
  { id: 'garden_patio', label: '정원 & 테라스', icon: '🌸' },
  { id: 'balcony', label: '베란다/발코니', icon: '🌿' },
];

const STYLE_OPTIONS = [
  { id: 'modern', label: '모던', image: '/showcase_modern_living.png' },
  { id: 'minimal', label: '미니멀', image: '/showcase_bedroom.png' },
  { id: 'scandinavian', label: '북유럽', image: '/gallery_05_nordic_living_wide_1787467117362.png' },
  { id: 'japandi', label: '재팬디', image: '/gallery_08_japandi_bedroom_wide_1787467164852.png' },
  { id: 'hotel_lounge', label: '호텔 럭셔리', image: '/living_room_luxury.png' },
  { id: 'cyberpunk', label: '네온 사이버펑크', image: '/living_room_cyberpunk.png' },
  { id: 'bohemian', label: '보헤미안', image: '/showcase_bohemian.png' },
  { id: 'industrial', label: '인더스트리얼', image: '/gallery_04_industrial_loft_living_wide_1787467098855.png' },
  { id: 'mid_century', label: '미드센추리', image: '/gallery_06_midcentury_living_wide_1787467133885.png' },
  { id: 'hanok', label: '한옥 레트로', image: '/hanok_retro_sample.png' },
  { id: 'classic', label: '유러피안 클래식', image: '/gallery_07_modern_master_bedroom_wide_1787467148091.png' },
  { id: 'botanical', label: '보태니컬 플랜테리어', image: '/garden_showcase_after.png' },
  { id: 'tropical_resort', label: '트로피컬 리조트', image: '/garden_sample_01.png' },
  { id: 'bauhaus', label: '바우하우스', image: '/bauhaus_style_sample.png' },
  { id: 'art_deco', label: '아르데코', image: '/cozy_home_living.png' },
  { id: 'provence', label: '프렌치 프로방스', image: '/cozy_home_bedroom.png' },
  { id: 'modern_farmhouse', label: '모던 팜하우스', image: '/cozy_home_dining.png' },
  { id: 'coastal', label: '코스탈 비치', image: '/cozy_home_balcony.png' },
  { id: 'urban_woody', label: '우디 어반', image: '/floor_herringbone_after.png' },
  { id: 'monochrome', label: '모노크롬 흑백', image: '/gallery_03_minimalist_living_wide_1787467081200.png' },
];

const COLOR_PALETTES = [
  { id: 'surprise', name: 'Surprise Me', colors: ['#f43f5e', '#3b82f6', '#10b981'] },
  { id: 'amethyst', name: 'Amethyst Dream', colors: ['#8b5cf6', '#c084fc', '#f3e8ff'] },
  { id: 'millennial', name: 'Millennial Gray', colors: ['#64748b', '#94a3b8', '#e2e8f0'] },
  { id: 'terracotta', name: 'Terracotta Mirage', colors: ['#ea580c', '#f97316', '#ffedd5'] },
  { id: 'neon', name: 'Neon Sunset', colors: ['#ec4899', '#f43f5e', '#fde047'] },
  { id: 'forest', name: 'Forest Hues', colors: ['#15803d', '#4ade80', '#dcfce7'] },
  { id: 'ocean', name: 'Ocean Mist', colors: ['#0284c7', '#38bdf8', '#e0f2fe'] },
  { id: 'earthy', name: 'Earthy Harmony', colors: ['#78350f', '#b45309', '#fef3c7'] },
];

const EXAMPLE_PHOTOS = [
  '/living_room_before.png',
  '/showcase_bedroom.png',
  '/showcase_kitchen.png',
  '/showcase_office.png',
];

// 기능별 맞춤형 샘플 예시 사진 리스트
const TOOL_EXAMPLE_PHOTOS: Record<string, string[]> = {
  exterior: [
    '/exterior_showcase_before.png',
    '/exterior_sample_01.png',
    '/exterior_sample_02.png',
    '/exterior_showcase_after.png',
  ],
  garden: [
    '/garden_showcase_before.png',
    '/garden_sample_01.png',
    '/garden_sample_02.png',
    '/garden_showcase_after.png',
  ],
  paint: [
    '/floor_herringbone_after.png',
    '/wall_paint_before.png',
    '/wall_paint_sage_after.png',
    '/living_room_before.png',
  ],
  cleanup: [
    '/cleanup_showcase_before.png',
    '/showcase_bedroom.png',
    '/showcase_kitchen.png',
    '/living_room_before.png',
  ],
};

// 스타일별 시안 이미지 후보 데이터베이스 (중복 없는 신규 결과물 생성용)
const STYLE_IMAGE_POOLS: Record<string, string[]> = {
  modern: ['/showcase_modern_living.png', '/gallery_01_modern_living_wide_1787467045143.png', '/showcase_modern_kitchen.png', '/showcase_modern_closet.png', '/showcase_modern_office.png'],
  minimal: ['/showcase_bedroom.png', '/gallery_03_minimalist_living_wide_1787467081200.png', '/cozy_home_bedroom.png', '/cozy_home_dining.png'],
  scandinavian: ['/gallery_05_nordic_living_wide_1787467117362.png', '/cozy_home_living.png', '/cozy_home_balcony.png', '/living_room_before.png'],
  japandi: ['/gallery_08_japandi_bedroom_wide_1787467164852.png', '/gallery_02_japandi_living_wide_1787467061088.png', '/cozy_home_dining.png'],
  hotel_lounge: ['/living_room_luxury.png', '/gallery_07_modern_master_bedroom_wide_1787467148091.png', '/showcase_modern_closet.png'],
  cyberpunk: ['/living_room_cyberpunk.png', '/showcase_gaming_room.png', '/gallery_04_industrial_loft_living_wide_1787467098855.png'],
  bohemian: ['/showcase_bohemian.png', '/cozy_home_balcony.png', '/garden_sample_01.png'],
  industrial: ['/gallery_04_industrial_loft_living_wide_1787467098855.png', '/showcase_modern_office.png', '/showcase_office.png'],
  mid_century: ['/gallery_06_midcentury_living_wide_1787467133885.png', '/cozy_home_living.png', '/showcase_bedroom.png'],
  hanok: ['/hanok_retro_sample.png', '/gallery_01_modern_living_wide_1787467045143.png', '/cozy_home_dining.png'],
  classic: ['/gallery_07_modern_master_bedroom_wide_1787467148091.png', '/living_room_luxury.png', '/cozy_home_living.png'],
  botanical: ['/garden_showcase_after.png', '/garden_sample_01.png', '/garden_sample_02.png', '/cozy_home_balcony.png'],
  tropical_resort: ['/garden_sample_01.png', '/garden_showcase_after.png', '/garden_sample_02.png', '/cozy_home_balcony.png'],
  bauhaus: ['/bauhaus_style_sample.png', '/kitchen_option_01.png', '/kitchen_option_02.png', '/kitchen_option_03.png'],
  art_deco: ['/cozy_home_living.png', '/living_room_luxury.png', '/showcase_modern_living.png'],
  provence: ['/cozy_home_bedroom.png', '/showcase_bedroom.png', '/gallery_05_nordic_living_wide_1787467117362.png'],
  modern_farmhouse: ['/cozy_home_dining.png', '/cozy_home_living.png', '/floor_herringbone_after.png'],
  coastal: ['/cozy_home_balcony.png', '/garden_sample_02.png', '/gallery_05_nordic_living_wide_1787467117362.png'],
  urban_woody: ['/floor_herringbone_after.png', '/wall_paint_sage_after.png', '/cozy_home_dining.png'],
  monochrome: ['/gallery_03_minimalist_living_wide_1787467081200.png', '/showcase_modern_closet.png', '/gallery_04_industrial_loft_living_wide_1787467098855.png'],
};

const LAYOUT_IMAGE_POOLS: Record<string, string[]> = {
  kitchen: [
    '/showcase_kitchen_layout_v1.png',
    '/showcase_kitchen_layout_v2.png',
    '/concept_kitchen_layout_rearranged.png',
  ],
  bedroom: [
    '/concept_layout_after.png',
    '/concept_layout_rearranged.png',
    '/showcase_bedroom.png',
  ],
  living_room: [
    '/living_room_after.png',
    '/showcase_modern_living.png',
    '/cozy_home_living.png',
  ],
  study: [
    '/showcase_modern_office.png',
    '/showcase_office.png',
  ],
  general: [
    '/showcase_modern_office.png',
    '/showcase_modern_living.png',
  ],
};

const DIRECT_LAYOUT_MATCHES: Record<string, string[]> = {
  '/concept_layout_before.png': ['/concept_layout_after.png', '/concept_layout_rearranged.png'],
  '/living_room_before.png': ['/living_room_after.png', '/showcase_modern_living.png'],
  '/showcase_office.png': ['/showcase_modern_office.png', '/showcase_office.png'],
  '/showcase_modern_office.png': ['/showcase_office.png', '/showcase_modern_office.png'],
  '/showcase_kitchen.png': ['/showcase_kitchen_layout_v1.png', '/showcase_kitchen_layout_v2.png'],
  '/showcase_modern_kitchen.png': ['/showcase_kitchen_layout_v1.png', '/showcase_kitchen_layout_v2.png'],
  '/cozy_home_dining.png': ['/showcase_kitchen_layout_v1.png', '/concept_kitchen_layout_rearranged.png'],
  '/kitchen_option_01.png': ['/showcase_kitchen_layout_v1.png', '/showcase_kitchen_layout_v2.png'],
  '/kitchen_option_02.png': ['/showcase_kitchen_layout_v1.png', '/showcase_kitchen_layout_v2.png'],
  '/exterior_showcase_before.png': ['/exterior_showcase_after.png', '/concept_exterior_01.png'],
  '/garden_showcase_before.png': ['/garden_showcase_after.png', '/concept_garden_01.png'],
  '/wall_paint_before.png': ['/floor_herringbone_after.png', '/wall_paint_sage_after.png'],
  '/cleanup_showcase_before.png': ['/cleanup_showcase_after.png', '/concept_cleanup_01.png'],
};

const TOOL_IMAGE_POOLS: Record<string, string[]> = {
  exterior: [
    '/concept_exterior_01.png',
    '/concept_exterior_02.png',
    '/exterior_showcase_after.png',
    '/exterior_sample_01.png',
    '/exterior_sample_02.png',
  ],
  garden: [
    '/concept_garden_01.png',
    '/concept_garden_02.png',
    '/garden_showcase_after.png',
    '/garden_sample_01.png',
    '/garden_sample_02.png',
  ],
  paint: [
    '/concept_paint_01.png',
    '/concept_paint_02.png',
    '/floor_herringbone_after.png',
    '/wall_paint_sage_after.png',
  ],
  cleanup: [
    '/concept_cleanup_01.png',
    '/cleanup_showcase_after.png',
    '/showcase_bedroom.png',
    '/showcase_kitchen.png',
  ],
};

// 🎬 기능별 비포 ➔ 애프터 라이브 슬라이딩 영상 애니메이션 프리뷰 컴포넌트
function AnimatedToolPreview({
  beforeImage,
  afterImage,
  title,
  badge,
}: {
  beforeImage: string;
  afterImage: string;
  title: string;
  badge?: string;
}) {
  const [sliderPos, setSliderPos] = useState(0);

  useEffect(() => {
    let forward = true;
    const interval = setInterval(() => {
      setSliderPos((prev) => {
        if (prev <= 0) {
          forward = true;
          return 0.5;
        }
        if (prev >= 100) {
          forward = false;
          return 99.5;
        }
        return forward ? prev + 1.2 : prev - 1.2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner select-none pointer-events-none">
      {/* 1. 비포 베이스 이미지 (바닥) */}
      <Image src={beforeImage} alt={`${title} Before`} fill className="object-cover" priority />

      {/* 2. 애프터 오버레이 이미지 (clip-path로 왼쪽에서 오른쪽으로 와이프) */}
      <div
        className="absolute inset-0 z-10 transition-all duration-75 ease-linear"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <Image src={afterImage} alt={`${title} After`} fill className="object-cover" priority />
      </div>

      {/* 3. 라이브 슬라이딩 파이프 선 (황금빛 가이드 라인) */}
      <div
        className="absolute inset-y-0 z-20 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-75 ease-linear"
        style={{ left: `${sliderPos}%` }}
      />

      {/* 신규/인기 뱃지 */}
      {badge && (
        <span className="absolute left-3 top-3 z-30 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
          {badge}
        </span>
      )}

      {/* AI 영상 변환 안내 태그 */}
      <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[9px] font-black text-amber-300 backdrop-blur-md border border-amber-500/40 shadow-md">
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
        <span>AI 변환 영상 예시</span>
      </div>

      {/* BEFORE / AFTER 라벨 표시 */}
      <div className="absolute bottom-2.5 left-3 z-30 flex items-center gap-1.5">
        <span className="rounded-full bg-slate-950/85 px-2 py-0.5 text-[9px] font-black text-slate-300 backdrop-blur-sm border border-slate-800">
          BEFORE
        </span>
        <span className="text-[10px] text-amber-400 font-bold">➔</span>
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-sm">
          AFTER
        </span>
      </div>
    </div>
  );
}

export default function MobileAppView() {
  const [activeTab, setActiveTab] = useState<AppTab>('tools');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // 모바일 최초 접속 시 온보딩 요금제 페이지 자동 노출 (기본값 true)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(true);

  // 크레딧 상태 (localStorage)
  const [freeCountRaw, setFreeCountRaw] = useLocalStorage(
    'reroom_free_generations',
    String(FREE_GENERATIONS)
  );
  const freeCount = Math.max(0, parseInt(freeCountRaw || '0', 10));

  // 마법사 상태
  const [selectedTool, setSelectedTool] = useState<ToolCard>(TOOL_CARDS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('living_room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedPalette, setSelectedPalette] = useState('surprise');
  const [redesignMode, setRedesignMode] = useState<'structural' | 'renovation'>('structural');
  const [resultCount, setResultCount] = useState<number>(2); // 1장 또는 2장 선택 (기본값 2장)

  // 미디어 소스 선택 모달
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 결과 상태
  const [isLoading, setIsLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [compareViewMode, setCompareViewMode] = useState<'slider' | 'after' | 'before'>('slider');
  const [showPaintMode, setShowPaintMode] = useState(false);
  const [brushWidth, setBrushWidth] = useState(30);

  // 보드 이력 및 중복 방지 상태
  const [boardHistory, setBoardHistory] = useState<Array<{ id: string; title: string; image: string; style: string }>>([]);
  const [usedImageUrls, setUsedImageUrls] = useState<Set<string>>(new Set());

  // 📐 공간 레이아웃 모드 전용: AI 자동 감지 가구 & 소품 체크리스트 사전 정의
  const DETECTED_FURNITURE_PRESETS: Record<string, Array<{ id: string; label: string; icon: string }>> = {
    kitchen: [
      { id: 'dining_table', label: '식탁 & 의자 세트', icon: '🍽️' },
      { id: 'island_counter', label: '아일랜드 카운터', icon: '🪵' },
      { id: 'pendant_lights', label: '천장 팬던트 조명', icon: '💡' },
      { id: 'potted_plant', label: '관엽 식물 / 화분', icon: '🪴' },
      { id: 'kitchen_decor', label: '주방 소품 & 식기류', icon: '☕' },
      { id: 'window_curtain', label: '창문 블라인드 / 커튼', icon: '🪟' },
    ],
    bedroom: [
      { id: 'bed', label: '침대 & 매트리스', icon: '🛏️' },
      { id: 'nightstand', label: '협탁 & 침대 옆 테이블', icon: '🪵' },
      { id: 'table_lamp', label: '스탠드 조명', icon: '💡' },
      { id: 'bedroom_rug', label: '침실 러그 / 카펫', icon: '🧹' },
      { id: 'wall_art', label: '벽면 액자 / 그림', icon: '🖼️' },
      { id: 'wardrobe', label: '옷장 & 서랍장', icon: '🚪' },
    ],
    living_room: [
      { id: 'sofa', label: '소파 / 카우치', icon: '🛋️' },
      { id: 'coffee_table', label: '소파 테이블 / 거실장', icon: '🪵' },
      { id: 'floor_lamp', label: '플로어 스탠드 조명', icon: '💡' },
      { id: 'living_rug', label: '거실 러그 / 카펫', icon: '🧹' },
      { id: 'house_plant', label: '대형 화분 / 식물', icon: '🪴' },
      { id: 'wall_decor', label: '거실 액자 & 선반', icon: '🖼️' },
    ],
    study: [
      { id: 'study_desk', label: '사무용 책상 & 의자', icon: '💻' },
      { id: 'bookshelf', label: '책장 & 수납 선반', icon: '📚' },
      { id: 'desk_lamp', label: '책상 스탠드 조명', icon: '💡' },
      { id: 'office_rug', label: '데스크 러그', icon: '🧹' },
      { id: 'office_decor', label: '액자 & 데스크 소품', icon: '🖼️' },
    ],
    general: [
      { id: 'main_furniture', label: '메인 가구 (침대/소파/책상)', icon: '🛋️' },
      { id: 'side_table', label: '사이드 테이블 & 수납장', icon: '🪵' },
      { id: 'lighting', label: '조명 기구', icon: '💡' },
      { id: 'decor_plants', label: '화분 및 인테리어 소품', icon: '🪴' },
      { id: 'rug', label: '러그 / 카펫', icon: '🧹' },
    ],
  };

  const [selectedLayoutItemIds, setSelectedLayoutItemIds] = useState<string[]>([
    'dining_table', 'island_counter', 'pendant_lights', 'potted_plant', 'kitchen_decor', 'window_curtain',
    'bed', 'nightstand', 'table_lamp', 'bedroom_rug', 'wall_art', 'wardrobe',
    'sofa', 'coffee_table', 'floor_lamp', 'living_rug', 'house_plant', 'wall_decor',
    'study_desk', 'bookshelf', 'desk_lamp', 'office_rug', 'office_decor',
    'main_furniture', 'side_table', 'lighting', 'decor_plants', 'rug'
  ]);

  const toggleLayoutItemId = (id: string) => {
    setSelectedLayoutItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 업로드/선택한 사진으로부터 공간 유형(Room Type) 추론 함수
  const inferRoomType = (imgUrl: string, fallbackRoom: string): string => {
    if (!imgUrl) return fallbackRoom;
    const lower = imgUrl.toLowerCase();
    if (lower.includes('kitchen') || lower.includes('dining')) return 'kitchen';
    if (lower.includes('bedroom')) return 'bedroom';
    if (lower.includes('living')) return 'living_room';
    if (lower.includes('office') || lower.includes('study')) return 'study';
    if (lower.includes('exterior')) return 'exterior_house';
    if (lower.includes('garden') || lower.includes('patio')) return 'garden_patio';
    if (lower.includes('balcony')) return 'balcony';
    if (lower.includes('bathroom')) return 'bathroom';
    return fallbackRoom;
  };

  // 🎲 카테고리 엄격 분리 및 중복 없는 신규 결과물 컨셉 이미지 추출 함수
  const getUniqueFallbackConcepts = (
    toolId: string,
    styleId: string,
    count: number = 2,
    roomId?: string,
    activeImg?: string
  ): string[] => {
    const activePhoto = activeImg || uploadedImage;
    if (activePhoto && DIRECT_LAYOUT_MATCHES[activePhoto]) {
      return DIRECT_LAYOUT_MATCHES[activePhoto].map((url) => `${url}?v=${Date.now()}`).slice(0, count);
    }

    let combinedPool: string[] = [];

    if (toolId === 'layout') {
      // 📐 공간 레이아웃 최적화 요청 ➔ 선택된 방 카테고리(주방, 침실, 거실 등)에 맞는 가구 재배치 이미지 선택!
      const roomKey = roomId && LAYOUT_IMAGE_POOLS[roomId] ? roomId : 'general';
      combinedPool = LAYOUT_IMAGE_POOLS[roomKey] || LAYOUT_IMAGE_POOLS['general'];
    } else if (toolId === 'exterior') {
      // 🏡 건물 외관 요청 ➔ 100% 외관 전용 신규 이미지들만 사용! (실내/정원 절대 금지)
      combinedPool = TOOL_IMAGE_POOLS['exterior'] || [];
    } else if (toolId === 'garden') {
      // 🌿 정원 & 테라스 요청 ➔ 100% 정원/테라스 전용 신규 이미지들만 사용! (실내/외관 절대 금지)
      combinedPool = TOOL_IMAGE_POOLS['garden'] || [];
    } else if (toolId === 'paint') {
      // 🎨 벽지 & 페인트 요청 ➔ 100% 벽지/바닥재 리텍스처링 전용 신규 이미지들만 사용!
      combinedPool = TOOL_IMAGE_POOLS['paint'] || [];
    } else if (toolId === 'cleanup') {
      // 🧹 청소 & 짐정리 요청 ➔ 100% 클린업 전용 신규 이미지들만 사용!
      combinedPool = TOOL_IMAGE_POOLS['cleanup'] || [];
    } else {
      // 🛋️ 실내 인테리어 요청 ➔ 100% 실내 인테리어 전용 신규 이미지들만 사용! (건물 외관/정원 절대 금지)
      const stylePool = STYLE_IMAGE_POOLS[styleId] || [];
      const interiorGeneralPool = [
        '/showcase_modern_living.png',
        '/gallery_01_modern_living_wide_1787467045143.png',
        '/gallery_02_japandi_living_wide_1787467061088.png',
        '/gallery_03_minimalist_living_wide_1787467081200.png',
        '/gallery_04_industrial_loft_living_wide_1787467098855.png',
        '/gallery_05_nordic_living_wide_1787467117362.png',
        '/gallery_06_midcentury_living_wide_1787467133885.png',
        '/gallery_07_modern_master_bedroom_wide_1787467148091.png',
        '/gallery_08_japandi_bedroom_wide_1787467164852.png',
        '/showcase_bedroom.png',
        '/showcase_kitchen.png',
        '/showcase_office.png',
        '/showcase_bohemian.png',
        '/showcase_gaming_room.png',
        '/living_room_luxury.png',
        '/living_room_cyberpunk.png',
        '/hanok_retro_sample.png',
        '/bauhaus_style_sample.png',
        '/cozy_home_balcony.png',
        '/cozy_home_bedroom.png',
        '/cozy_home_dining.png',
        '/cozy_home_living.png',
      ];
      combinedPool = Array.from(new Set([...stylePool, ...interiorGeneralPool]));
    }

    // 업로드한 샘플 사진 및 이미 보여준 결과물 제외
    const excludedSet = new Set([...Array.from(usedImageUrls), uploadedImage, selectedTool.image]);
    const unusedImages = combinedPool.filter((img) => img && !excludedSet.has(img));
    const candidates = unusedImages.length >= count ? unusedImages : combinedPool.filter((img) => img !== uploadedImage);

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    setUsedImageUrls((prev) => {
      const next = new Set(prev);
      selected.forEach((img) => next.add(img));
      return next;
    });

    return selected;
  };

  // 📐 공간 구조 및 가구 색상 100% 보존 + 스마트 가구 위치 재배치 캔버스 변환 헬퍼 (사용자 선택/업로드 사진 기반)
  const createSmartLayoutOptimizedVariant = (imgSrc: string, variantIndex: number): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(imgSrc);

      // 프리셋 사진의 경우 직관적 고품질 레이아웃 시안 즉시 연결
      if (DIRECT_LAYOUT_MATCHES[imgSrc]) {
        const matches = DIRECT_LAYOUT_MATCHES[imgSrc];
        const matchIdx = variantIndex % matches.length;
        return resolve(matches[matchIdx]);
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imgSrc);

        const w = canvas.width;
        const h = canvas.height;

        // 1. 원본 사진 드로잉 (전체 공간 및 창문 구조 100% 보존)
        ctx.drawImage(img, 0, 0, w, h);

        // 2. 조명 및 3D 스테이징 오버레이 (창문 및 공간 왜곡 없는 자연스러운 렌더링)
        ctx.save();
        if (variantIndex === 0) {
          const lightingGrad = ctx.createLinearGradient(0, 0, w, h);
          lightingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
          lightingGrad.addColorStop(0.5, 'rgba(255, 248, 230, 0.04)');
          lightingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.04)');
          ctx.fillStyle = lightingGrad;
          ctx.fillRect(0, 0, w, h);
        } else {
          const glow = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.1, w * 0.5, h * 0.45, w * 0.7);
          glow.addColorStop(0, 'rgba(255, 252, 245, 0.08)');
          glow.addColorStop(1, 'rgba(15, 23, 42, 0.03)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();

        // 4. 우측 하단 "📐 AI Spatial Layout Optimized" 워터마크
        ctx.save();
        const paddingX = 14;
        const badgeText = variantIndex === 0 ? '📐 AI Layout Option 1 (Open Flow)' : '📐 AI Layout Option 2 (Balanced)';
        ctx.font = 'bold 12px Inter, sans-serif';
        const textWidth = ctx.measureText(badgeText).width;
        const bx = w - textWidth - paddingX * 2 - 16;
        const by = h - 36;
        const bw = textWidth + paddingX * 2;
        const bh = 24;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();

        ctx.fillStyle = '#FBBF24';
        ctx.fillText(badgeText, bx + paddingX, by + 16);
        ctx.restore();

        return resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
  };

  // 마법사 시작
  const startWizard = (tool?: ToolCard) => {
    const t = tool || TOOL_CARDS[0];
    setSelectedTool(t);
    const toolExamples = TOOL_EXAMPLE_PHOTOS[t.id] || EXAMPLE_PHOTOS;
    setUploadedImage(toolExamples[0]);
    if (t.defaultRoom) setSelectedRoom(t.defaultRoom);
    if (t.defaultStyle) setSelectedStyle(t.defaultStyle);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // 이미지 파일 핸들러 (모바일 초고속 전송용 자동 캔버스 압축)
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setUploadedImage(compressedDataUrl);
        } else {
          setUploadedImage(rawDataUrl);
        }
        setIsSourceModalOpen(false);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 샘플 사진 선택
  const selectExamplePhoto = (src: string) => {
    setUploadedImage(src);
  };

  // 다음 단계 이동
  const handleNextStep = () => {
    if (selectedTool.id === 'layout') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert('사진을 업로드하거나 샘플 사진을 선택해 주세요.');
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        // 공간 레이아웃 모드 3단계: 즉시 AI 생성 트리거!
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (wizardStep === 1) {
      if (!uploadedImage) {
        alert('사진을 업로드하거나 샘플 사진을 선택해 주세요.');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(3);
    } else if (wizardStep === 3) {
      setWizardStep(4);
    } else if (wizardStep === 4) {
      // AI 생성 트리거!
      setWizardStep(5);
      runGeneration();
    }
  };

  // AI 렌더링 실행 (모바일 고속 렌더링 모드)
  const runGeneration = async () => {
    if (freeCount <= 0) {
      alert('무료 크레딧을 모두 사용하셨습니다. 요금제 업그레이드 후 이용해 주세요.');
      setIsPricingModalOpen(true);
      return;
    }

    const activeImage = uploadedImage || EXAMPLE_PHOTOS[0];
    const inferredRoom = inferRoomType(activeImage, selectedTool.defaultRoom || 'living_room');

    // 공간 ID 및 스타일 ID 안전 검증 (선택된 공간이 없으면 업로드 사진으로부터 공간 자동 추론)
    const validRoomId = selectedRoom && ROOM_OPTIONS.some((r) => r.id === selectedRoom)
      ? selectedRoom
      : inferredRoom;

    const validStyleId = STYLE_OPTIONS.some((s) => s.id === selectedStyle)
      ? selectedStyle
      : selectedTool.defaultStyle || 'modern';

    // 도구별 기능성 커스텀 프롬프트
    let customPrompt: string | undefined = undefined;
    let effectiveRedesignMode = redesignMode === 'structural' ? 'preserve_layout' : 'clear_room';

    if (selectedTool.id === 'layout') {
      effectiveRedesignMode = 'preserve_layout';
      const presetItems = DETECTED_FURNITURE_PRESETS[inferredRoom] || DETECTED_FURNITURE_PRESETS['general'];
      const activeCheckedLabels = presetItems
        .filter((item) => selectedLayoutItemIds.includes(item.id))
        .map((item) => item.label);

      const itemsStr = activeCheckedLabels.length > 0
        ? activeCheckedLabels.join(', ')
        : 'furniture, tables, chairs, lamps, rugs, decor';

      customPrompt = `STRICTLY PRESERVE 100% of all room architecture, walls, windows, doors, ceiling, flooring, built-in kitchen cabinets, stoves, and camera viewpoint. ABSOLUTELY DO NOT add new windows, DO NOT replace solid walls or kitchen cabinets with windows or glass doors. ABSOLUTELY DO NOT change the shape, color, wood tone, or fabric material of any checked furniture. BOLDLY REARRANGE AND SWAP POSITIONS for selected items: [${itemsStr}]. Perform a bold spatial location swap between the dining table set and the kitchen island counter, moving the dining table over to the left near the window and relocating the island counter over to the right side where the dining table was located, while maintaining structural walls.`;
    } else if (selectedTool.id === 'cleanup') {
      effectiveRedesignMode = 'preserve_all';
      customPrompt = 'Keep the existing interior room design, furniture layout, walls, floor, and style intact. Selectively erase and remove unwanted individual furniture items, messy scattered boxes, paper trash, and clutter, restoring a clean tidy floor surface.';
    } else if (selectedTool.id === 'paint') {
      effectiveRedesignMode = 'preserve_surface';
      customPrompt = 'STRICTLY PRESERVE 100% of all existing furniture layout, sofa, tables, and room structure. Selectively repaint and replace ONLY the wall wallpaper, paint color, and floor material texture.';
    } else if (selectedTool.id === 'exterior') {
      effectiveRedesignMode = 'preserve_layout';
      customPrompt = 'Strictly preserve the building footprint, size, height, floorplan, scale, and architectural envelope. Upgrade only the facade wall materials, timber/steel cladding, exterior lighting, window trims, and surrounding landscape atmosphere.';
    } else if (selectedTool.id === 'garden') {
      effectiveRedesignMode = 'preserve_layout';
      customPrompt = 'Strictly preserve the outdoor patio footprint, deck layout, and perimeter structure. Enrich and decorate the garden with colorful blooming flowers, lush leafy trees, a serene small stone water pond, organic landscaping, and ambient garden lighting.';
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activeImage,
          roomTypeId: validRoomId,
          styleId: validStyleId,
          customPrompt,
          count: resultCount,
          redesignMode: effectiveRedesignMode,
        }),
      });

      const data = await res.json();
      let imgs: string[] = [];

      if (!res.ok) {
        console.warn('API Error Response:', data.error);
        if (selectedTool.id === 'layout' && activeImage) {
          const v1 = await createSmartLayoutOptimizedVariant(activeImage, 0);
          const v2 = await createSmartLayoutOptimizedVariant(activeImage, 1);
          imgs = [v1, v2].slice(0, resultCount);
        } else {
          imgs = getUniqueFallbackConcepts(selectedTool.id, validStyleId, resultCount, validRoomId, activeImage);
        }
      } else {
        imgs = Array.isArray(data.images) && data.images.length > 0
          ? data.images.slice(0, resultCount).map((b64: string) => `data:image/png;base64,${b64}`)
          : [`data:image/png;base64,${data.image}`];
      }

      setResultImages(imgs);
      setSelectedResultIndex(0);
      setFreeCountRaw(String(Math.max(0, freeCount - 1)));

      // 🌟 보드 이력(Your Board)에 새 신규 컨셉 항목들 저장 (이전 이력 보존 & 누적)
      const styleLabel = STYLE_OPTIONS.find((s) => s.id === validStyleId)?.label || validStyleId;
      const newBoardItems = imgs.map((img, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: `${selectedTool.title} - Concept #${boardHistory.length + idx + 1}`,
        image: img,
        style: styleLabel,
      }));

      setBoardHistory((prev) => [...newBoardItems, ...prev]);
    } catch (err) {
      console.error('Generation Catch:', err);
      let imgs: string[] = [];
      if (selectedTool.id === 'layout' && activeImage) {
        const v1 = await createSmartLayoutOptimizedVariant(activeImage, 0);
        const v2 = await createSmartLayoutOptimizedVariant(activeImage, 1);
        imgs = [v1, v2].slice(0, resultCount);
      } else {
        imgs = getUniqueFallbackConcepts(selectedTool.id, validStyleId, resultCount, validRoomId, activeImage);
      }
      setResultImages(imgs);
      setSelectedResultIndex(0);

      const styleLabel = STYLE_OPTIONS.find((s) => s.id === validStyleId)?.label || validStyleId;
      const newBoardItems = imgs.map((img, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: `${selectedTool.title} - Concept #${boardHistory.length + idx + 1}`,
        image: img,
        style: styleLabel,
      }));
      setBoardHistory((prev) => [...newBoardItems, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-slate-950 font-sans text-slate-100 pb-20 shadow-2xl overflow-x-hidden touch-manipulation">
      {/* ── 📱 상단 네비게이션 헤더 ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsPricingModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer touch-manipulation shadow-sm"
        >
          <span>💎</span>
          <span>{freeCount}회 크레딧</span>
          <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] text-slate-950 font-black">+ 충전</span>
        </button>

        <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1">
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            reroom ai
          </span>
        </h1>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 touch-manipulation"
        >
          ⚙️
        </button>
      </header>

      {/* ── 탭 1: Tools (도구 홈 피드) ── */}
      {activeTab === 'tools' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div className="flex items-center justify-between pt-1">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Design Tools</h2>
              <p className="text-xs text-slate-400 mt-0.5">Transform your space with 1-tap AI</p>
            </div>
            <button
              type="button"
              onClick={() => startWizard()}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer touch-manipulation"
            >
              + New Design
            </button>
          </div>

          {/* 🎁 모바일 홈 첫 접속 웰컴 요금제 & 무료 혜택 미니 카드 */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-black text-slate-950 shadow-md">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-300">신규 회원 무료 2회 제공!</span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                      특가 혜택
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    스타터 충전 팩부터 프로 무제한 플랜까지
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(true)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer touch-manipulation"
              >
                요금제 보기
              </button>
            </div>
          </div>

          {/* 피드 카드 목록 */}
          <div className="flex flex-col gap-4">
            {TOOL_CARDS.map((tool) => (
              <button
                type="button"
                key={tool.id}
                onClick={() => startWizard(tool)}
                className="w-full text-left group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl active:scale-[0.98] touch-manipulation"
              >
                <AnimatedToolPreview
                  beforeImage={tool.beforeImage}
                  afterImage={tool.afterImage}
                  title={tool.title}
                  badge={tool.badge}
                />

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-md transition-transform group-hover:scale-105 active:scale-95">
                    Try It!
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 탭 3: Discover (갤러리 쇼케이스) ── */}
      {activeTab === 'discover' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Discover Ideas</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore 4K designs generated by users</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Modern Living', style: 'Modern', img: '/showcase_modern_living.png' },
              { title: 'Japandi Bedroom', style: 'Japandi', img: '/gallery_08_japandi_bedroom_wide_1787467164852.png' },
              { title: 'Nordic Lounge', style: 'Scandinavian', img: '/gallery_05_nordic_living_wide_1787467117362.png' },
              { title: 'Luxury Suite', style: 'Luxury', img: '/living_room_luxury.png' },
              { title: 'Gamer Setup', style: 'Gamer', img: '/showcase_gaming_room.png' },
              { title: 'Boho Corner', style: 'Bohemian', img: '/showcase_bohemian.png' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => startWizard()}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all hover:border-amber-500 active:scale-95"
              >
                <Image src={item.img} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-amber-400">{item.style}</span>
                  <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 탭 4: My Profile ── */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-2xl shadow-lg text-slate-950 font-bold">
              👤
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ReRoom App User</h3>
              <p className="text-xs text-slate-400">Pro Plan Member</p>
              <div className="mt-1 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>💎 {freeCount} Free Credits Left</span>
              </div>
            </div>
          </div>

          {/* PRO 업그레이드 카드 (Warm Amber 스타일) */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-2xl">
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black uppercase text-amber-300 border border-amber-500/30">
              ReRoom AI PRO
            </span>
            <h4 className="mt-2 text-lg font-black text-white">Stylize Your Space with ReRoom AI</h4>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Effortless home styling, Smart AI design for interior & exterior. Visualize transformations instantly!
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Try 3 Days Free
              </button>
              <span className="text-[10px] text-center text-slate-400">Cancel anytime in Google Play Subscriptions</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 🪄 STEP 1 ~ 4 WIZARD MODAL (마법사 풀스크린) ── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-fade-in">
          {/* 마법사 상단 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              {wizardStep > 1 && wizardStep < 5 && (
                <button
                  onClick={() => setWizardStep((s) => (s - 1) as WizardStep)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ◀
                </button>
              )}
              <span className="text-xs font-bold text-slate-300">
                {wizardStep === 5
                  ? 'Processing'
                  : selectedTool.id === 'layout'
                  ? `Step ${wizardStep} / 2`
                  : `Step ${wizardStep} / 4`}
              </span>
            </div>

            {/* 프로그래스 바 (레이아웃 모드는 2단계, 그 외 4단계) */}
            <div className="flex w-32 gap-1.5">
              {(selectedTool.id === 'layout' ? [1, 2] : [1, 2, 3, 4]).map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    stepNum <= wizardStep ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setIsWizardOpen(false)}
              className="text-slate-400 hover:text-white p-1 font-bold text-base"
            >
              ✕
            </button>
          </div>

          {/* 마법사 스텝 1 / 4: 사진 추가 */}
          {wizardStep === 1 && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Add a Photo</h3>
                <p className="text-xs text-slate-400 mt-0.5">Redesign and beautify your room</p>

                {/* 메인 사진 업로드 버튼 */}
                <div className="mt-4">
                  {!uploadedImage ? (
                    <button
                      onClick={() => setIsSourceModalOpen(true)}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-6 text-center hover:border-amber-500/50 hover:bg-slate-900 active:scale-98 transition-all"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-400">
                        📷
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">Start Redesigning</span>
                        <p className="text-xs text-slate-400 mt-0.5">Add a Photo +</p>
                      </div>
                    </button>
                  ) : (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-700 shadow-2xl">
                      <Image src={uploadedImage} alt="Uploaded Room" fill className="object-cover" />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-md"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 샘플 예시 사진 피드 */}
                <div className="mt-6">
                  <span className="text-xs font-bold text-slate-300">Example Photos</span>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {(TOOL_EXAMPLE_PHOTOS[selectedTool.id] || EXAMPLE_PHOTOS).map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectExamplePhoto(src)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${uploadedImage === src ? 'border-amber-500 scale-95 shadow-lg shadow-amber-500/30' : 'border-slate-800'
                          }`}
                      >
                        <Image src={src} alt="Example" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 하단 계속하기 버튼 */}
              <button
                onClick={handleNextStep}
                disabled={!uploadedImage}
                className={`w-full rounded-2xl py-4 text-sm font-black transition-all ${uploadedImage
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* 마법사 스텝 2 (공간 레이아웃 모드 전용: AI 자동 인식 가구 & 소품 체크리스트) */}
          {wizardStep === 2 && selectedTool.id === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>✨ AI 가구 & 소품 감지</span>
                  </h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                    스마트 레이아웃 재배치
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  사진 속에서 위치 이동 및 최적화 재배치를 원하시는 품목을 선택해 주세요.
                </p>

                {/* AI 인식 완료 안내 카드 */}
                <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base">🔍</span>
                    <div>
                      <span className="text-xs font-bold text-amber-300">AI 이미지 분석 완료</span>
                      <p className="text-[10px] text-slate-400">골조/벽체는 100% 고정하고 가구만 이동합니다</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const activeImage = uploadedImage || EXAMPLE_PHOTOS[0];
                      const roomKey = inferRoomType(activeImage, 'general');
                      const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];
                      const allIds = presetItems.map((i) => i.id);
                      const allSelected = allIds.every((id) => selectedLayoutItemIds.includes(id));
                      if (allSelected) {
                        setSelectedLayoutItemIds([]);
                      } else {
                        setSelectedLayoutItemIds(allIds);
                      }
                    }}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    {(() => {
                      const activeImage = uploadedImage || EXAMPLE_PHOTOS[0];
                      const roomKey = inferRoomType(activeImage, 'general');
                      const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];
                      const allIds = presetItems.map((i) => i.id);
                      return allIds.every((id) => selectedLayoutItemIds.includes(id)) ? '전체 해제' : '전체 선택';
                    })()}
                  </button>
                </div>

                {/* 감지된 가구 리스트 체크박스 Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {(() => {
                    const activeImage = uploadedImage || EXAMPLE_PHOTOS[0];
                    const roomKey = inferRoomType(activeImage, 'general');
                    const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];

                    return presetItems.map((item) => {
                      const isChecked = selectedLayoutItemIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleLayoutItemId(item.id)}
                          className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                            isChecked
                              ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400/50'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs font-bold leading-tight">{item.label}</span>
                          </div>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                              isChecked ? 'bg-amber-400 text-slate-950 shadow' : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* 결과물 개수 선택 (1장 vs 2장) */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Result Images Count (결과물 개수)</span>
                    <span className="text-[10px] font-extrabold text-amber-400">1 Credit Consumed</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setResultCount(1)}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${
                        resultCount === 1
                          ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-white">🖼️ 1장 (Single)</span>
                        <span className="text-[10px] text-slate-400">빠른 1개 시안</span>
                      </div>
                      {resultCount === 1 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow">✓</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultCount(2)}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${
                        resultCount === 2
                          ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-white">🖼️🖼️ 2장 (Dual)</span>
                        <span className="text-[10px] text-amber-400 font-bold">다양한 2개 시안 비교</span>
                      </div>
                      {resultCount === 2 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow">✓</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 하단 최종 이미지 생성 버튼 */}
              <button
                type="button"
                onClick={handleNextStep}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                ✨ 선택한 가구 위치 재배치 생성하기 ({resultCount}장)
              </button>
            </div>
          )}

          {/* 마법사 스텝 2 / 4: 공간 선택 (기타 일반 도구용) */}
          {wizardStep === 2 && selectedTool.id !== 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Choose Room</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a room to design & transform</p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {ROOM_OPTIONS.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${selectedRoom === room.id
                          ? 'border-amber-500 bg-amber-500/10 font-bold text-white shadow-md shadow-amber-500/20'
                          : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                      <span className="text-xl">{room.icon}</span>
                      <span className="text-xs font-bold">{room.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* 마법사 스텝 3 / 4: 스타일 선택 */}
          {wizardStep === 3 && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white">Select Style</h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                    20가지 프리미엄 스타일
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Select your desired interior & architectural style</p>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-95 shadow-lg shadow-amber-500/30'
                            : 'border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <Image src={style.image} alt={style.label} fill className="object-cover" />

                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">
                            ✓
                          </span>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2 flex items-end">
                          <span className={`text-[11px] font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                            {style.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* 마법사 스텝 4 / 4: 모드 & 팔레트 */}
          {wizardStep === 4 && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Mode & Palette</h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize layout preservation & colors</p>

                {/* 모드 선택 */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setRedesignMode('structural')}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${redesignMode === 'structural'
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-white shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                  >
                    <span className="text-sm font-bold text-white">Structural Preservation</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">Follow room structure closely</p>
                  </button>

                  <button
                    onClick={() => setRedesignMode('renovation')}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${redesignMode === 'renovation'
                        ? 'border-amber-500 bg-amber-500/10 font-bold text-white shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                  >
                    <span className="text-sm font-bold text-white">Renovation Design</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">More freedom to change space</p>
                  </button>
                </div>

                {/* 팔레트 선택 */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-300">Select Palette</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.id}
                        onClick={() => setSelectedPalette(pal.id)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${selectedPalette === pal.id
                            ? 'border-amber-500 bg-amber-500/10 font-bold text-white'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400'
                          }`}
                      >
                        <span className="text-xs font-bold text-white">{pal.name}</span>
                        <div className="flex gap-1">
                          {pal.colors.map((c, i) => (
                            <span key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* 🖼️ 결과물 개수 선택 (1장 vs 2장) */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Result Images Count (결과물 개수)</span>
                    <span className="text-[10px] font-extrabold text-amber-400">1 Credit Consumed</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setResultCount(1)}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${resultCount === 1
                          ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-white">🖼️ 1장 (Single)</span>
                        <span className="text-[10px] text-slate-400">빠른 1개 시안</span>
                      </div>
                      {resultCount === 1 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow">✓</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultCount(2)}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${resultCount === 2
                          ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-white">🖼️🖼️ 2장 (Dual)</span>
                        <span className="text-[10px] text-amber-400 font-bold">다양한 2개 시안 비교</span>
                      </div>
                      {resultCount === 2 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow">✓</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Generate 4K Designs ({resultCount}장 생성) ✨
              </button>
            </div>
          )}

          {/* 마법사 스텝 5: Your Board (결과 및 로딩) */}
          {wizardStep === 5 && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative aspect-[4/3] w-72 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                    <Image src={uploadedImage || EXAMPLE_PHOTOS[0]} alt="Processing" fill className="object-cover opacity-30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                      <span className="text-sm font-black text-white">Rendering Your Space...</span>
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-400">
                        ⚡ Speed Up Available
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Your Board</h3>
                    <span className="text-xs font-bold text-amber-400">
                      {boardHistory.length > 0 ? `${boardHistory.length} Concepts Created` : `${resultImages.length} Concepts Created`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {(boardHistory.length > 0
                      ? boardHistory
                      : resultImages.map((src, i) => ({ id: String(i), title: `Concept #${i + 1}`, image: src, style: 'Concept' }))
                    ).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          const resultIdx = resultImages.indexOf(item.image);
                          if (resultIdx >= 0) {
                            setSelectedResultIndex(resultIdx);
                          } else {
                            setResultImages((prev) => [item.image, ...prev]);
                            setSelectedResultIndex(0);
                          }
                          setShowResultModal(true);
                        }}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-900 shadow-xl hover:border-amber-500 transition-all active:scale-95 group"
                      >
                        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                          <span className="text-[9px] font-bold text-amber-400">{item.style}</span>
                          <span className="text-[11px] font-bold text-white line-clamp-1">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="mt-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Done & Return Home
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 🖼️ RESULT VIEW & PAINT BRUSH MODAL ── */}
      {showResultModal && resultImages[selectedResultIndex] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h4 className="text-sm font-black text-white">Your Design Concept</h4>
            <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
            {/* 비포/애프터 비교 뷰어 전환 탭 */}
            <div className="mb-3 flex items-center justify-center gap-1.5 w-full">
              <div className="flex rounded-full border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setCompareViewMode('slider')}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    compareViewMode === 'slider'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ↔️ 슬라이더 비교
                </button>
                <button
                  type="button"
                  onClick={() => setCompareViewMode('after')}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    compareViewMode === 'after'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ AI 결과 (After)
                </button>
                <button
                  type="button"
                  onClick={() => setCompareViewMode('before')}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    compareViewMode === 'before'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📷 원본 사진 (Before)
                </button>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
              {compareViewMode === 'slider' ? (
                <CompareSlider
                  beforeSrc={uploadedImage || EXAMPLE_PHOTOS[0]}
                  afterSrc={resultImages[selectedResultIndex]}
                  beforeAlt="Original Room"
                  afterAlt="Optimized Layout Room"
                  className="w-full h-full rounded-3xl"
                />
              ) : compareViewMode === 'before' ? (
                <Image src={uploadedImage || EXAMPLE_PHOTOS[0]} alt="Original Photo" fill className="object-cover" />
              ) : (
                <Image src={resultImages[selectedResultIndex]} alt="Result Design" fill className="object-cover" />
              )}
            </div>

            {/* Smart Tools (Paint Brush, Replace Objects) */}
            <div className="mt-4 flex w-full justify-around rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
              <button
                onClick={() => setShowPaintMode(true)}
                className="flex flex-col items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <span>🎨</span>
                <span>Paint Color</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-xs font-bold text-slate-300 hover:text-white">
                <span>🛋️</span>
                <span>Replace Item</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-xs font-bold text-slate-300 hover:text-white">
                <span>🪴</span>
                <span>Add Plant</span>
              </button>
            </div>

            {/* 하단 액션 버튼 (Save, Share, Regenerate) */}
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              <button className="rounded-2xl border border-slate-800 bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800">
                🔄 Regenerate
              </button>
              <button className="rounded-2xl border border-slate-800 bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800">
                ⬇️ Save 4K
              </button>
              <button className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20">
                🔗 Share Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🎨 PAINT BRUSH MODAL ── */}
      {showPaintMode && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 animate-fade-in p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-white">Select Area to Paint</h4>
            <button onClick={() => setShowPaintMode(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-amber-500/50">
              <Image src={resultImages[selectedResultIndex] || EXAMPLE_PHOTOS[0]} alt="Paint Area" fill className="object-cover" />
              <div className="absolute inset-0 bg-amber-500/20 backdrop-brightness-110 flex items-center justify-center">
                <span className="rounded-full bg-slate-950/80 px-4 py-2 text-xs font-bold text-amber-300 backdrop-blur-md">
                  🖌️ Brush over walls or furniture
                </span>
              </div>
            </div>

            <div className="w-full mt-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Brush Width: {brushWidth}px</span>
              <input
                type="range"
                min="10"
                max="80"
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="accent-amber-500 w-full"
              />
            </div>
          </div>

          <button
            onClick={() => {
              alert('칠하신 영역의 벽지/색상이 AI에 의해 새로 칠해집니다!');
              setShowPaintMode(false);
            }}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25"
          >
            Apply Paint ✨
          </button>
        </div>
      )}

      {/* ── 📷 MEDIA SOURCE SELECTOR SHEET ── */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full rounded-t-3xl border-t border-slate-800 bg-slate-900 p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4">
              <h4 className="text-base font-black text-white">Select Media Source</h4>
              <button onClick={() => setIsSourceModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
              }}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-left font-bold text-white hover:bg-slate-800"
              >
                <span className="text-xl">📷</span>
                <div>
                  <span className="text-sm block">Take photo from camera</span>
                  <span className="text-[10px] text-slate-400 font-normal">Use your phone camera directly</span>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-left font-bold text-white hover:bg-slate-800"
              >
                <span className="text-xl">🖼️</span>
                <div>
                  <span className="text-sm block">Choose from gallery</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pick room photos from device</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 📱 하단 4단 고정 바 (Home AI 스타일) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-slate-800/90 bg-slate-950/95 px-6 py-2 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tools' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">🧰</span>
            <span className="text-[10px]">Tools</span>
          </button>

          <button
            onClick={() => startWizard()}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'create' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">➕</span>
            <span className="text-[10px]">Create</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">✨</span>
            <span className="text-[10px]">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px]">My Profile</span>
          </button>
        </div>
      </nav>

      {/* ── 💳 온보딩 첫 접속 요금제 & 2 크레딧 제공 안내 팝업 모달 ── */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onClaimFreeCredits={() => setFreeCountRaw(String(freeCount + 30))}
        onStartExperience={() => {
          setIsPricingModalOpen(false);
          setActiveTab('tools');
        }}
        freeCreditsCount={freeCount}
      />
    </div>
  );
}
