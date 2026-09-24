'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CompareSlider from './CompareSlider';
import PricingModal from './PricingModal';
import { FREE_GENERATIONS } from '@/lib/constants';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Language, SUPPORTED_LANGUAGES, translations } from '@/lib/i18n';

type AppTab = 'tools' | 'create' | 'discover' | 'profile';
type WizardStep = 1 | 2 | 3 | 4 | 5; // 5 = Results Board

interface ToolStep {
  step: number;
  title: string;
  badge: string;
  image: string;
  desc?: string;
}

interface ToolCard {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  image: string;
  beforeImage: string;
  afterImage: string;
  steps?: ToolStep[];
  defaultRoom?: string;
  defaultStyle?: string;
}

const TOOL_CARDS: ToolCard[] = [
  {
    id: 'interior',
    title: '실내인테리어 디자인',
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
    defaultStyle: 'korea_hanok',
  },
  {
    id: 'garden',
    title: '정원 & 테라스 디자인',
    desc: '야외 테라스 뼈대는 보존하고 꽃·나무·연못 조경 연출!',
    image: '/garden_showcase_before.png',
    beforeImage: '/garden_showcase_before.png',
    afterImage: '/garden_showcase_after.png',
    defaultRoom: 'garden_patio',
    defaultStyle: 'garden_korean',
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
    desc: '소파 종류 ➔ 색상 ➔ 소재 ➔ 신규 디자인 4단계 AI 정밀 커스텀!',
    badge: '4단계 변화',
    image: '/new_sofa_step4_distinct_shape.png',
    beforeImage: '/new_sofa_step0_original.png',
    afterImage: '/new_sofa_step4_distinct_shape.png',
    steps: [
      {
        step: 0,
        title: '거실 기본 소파',
        badge: '원본',
        image: '/new_sofa_step0_original.png',
        desc: '모던 거실 콤팩트 화이트 3인용 소파 & 수묵 산수화 액자',
      },
      {
        step: 1,
        title: '소파 형태 교체',
        badge: '1단계: 형태 변경',
        image: '/new_sofa_step1_type.png',
        desc: '부드러운 곡선의 라운드 유선형 모듈러 소파',
      },
      {
        step: 2,
        title: '소파 색상 변경',
        badge: '2단계: 색상 변경',
        image: '/new_sofa_step2_color.png',
        desc: '포근하고 감각적인 웜 코냑 테라코타 오렌지 컬러',
      },
      {
        step: 3,
        title: '소파 소재 변경',
        badge: '3단계: 소재 변경',
        image: '/new_sofa_step3_material.png',
        desc: '최고급 이태리 천연 새들 레더 가죽 질감',
      },
      {
        step: 4,
        title: '신규 디자인 소파',
        badge: '4단계: 다른 디자인',
        image: '/new_sofa_step4_distinct_shape.png',
        desc: '독창적인 볼륨감의 아치형 유선형 부클레 디자이너 소파',
      },
    ],
    defaultRoom: 'living_room',
    defaultStyle: 'modern',
  },
  {
    id: 'party_room',
    title: '파티룸 & 이벤트 공간 꾸미기',
    desc: '생일파티, 프로포즈, 크리스마스 등 8가지 테마로 특별한 공간 즉시 연출!',
    badge: '신규',
    image: '/party_christmas_main.png',
    beforeImage: '/cozy_home_living.png',
    afterImage: '/party_christmas_main.png',
    defaultRoom: 'party_room',
    defaultStyle: 'party_christmas',
  },
];

const DETECTED_FURNITURE_PRESETS: Record<string, { id: string; label: string; enName: string; icon?: string }[]> = {
  living_room: [
    { id: 'sofa', label: '소파/카우치', enName: 'Sofa / Couch', icon: '🛋️' },
    { id: 'table', label: '커피 테이블', enName: 'Coffee Table', icon: '☕' },
    { id: 'tv_unit', label: 'TV 거실장', enName: 'TV Console Unit', icon: '📺' },
    { id: 'rug', label: '러그/카펫', enName: 'Area Rug / Carpet', icon: '🎨' },
    { id: 'lighting', label: '플로어 스탠드 조명', enName: 'Floor Standing Lamp', icon: '💡' },
  ],
  bedroom: [
    { id: 'bed', label: '침대 (벽체 분리 이동)', enName: 'Bed & Bedframe (Movable - Must relocate to another wall)', icon: '🛏️' },
    { id: 'nightstand', label: '협탁', enName: 'Nightstand / Side Table', icon: '🪵' },
    { id: 'dresser', label: '서랍장/화장대 & 거울', enName: 'Dresser Vanity & Mirror', icon: '🪞' },
    { id: 'chair', label: '1인 라운지 체어', enName: 'Accent Lounge Chair', icon: '🪑' },
    { id: 'wardrobe', label: '옷장/드레스룸', enName: 'Wardrobe / Closet', icon: '🚪' },
    { id: 'desk', label: '서재 책상', enName: 'Desk & Chair', icon: '💻' },
    { id: 'lighting', label: '침실 조명/스탠드', enName: 'Bedside Lighting', icon: '💡' },
  ],
  kids_room: [
    { id: 'child_bed', label: '어린이 침대/이층침대', enName: 'Child Bed / Bunk Bed', icon: '🛏️' },
    { id: 'study_desk', label: '공부 책상 & 의자', enName: 'Study Desk & Chair', icon: '✏️' },
    { id: 'bookshelf', label: '책장/수납장', enName: 'Bookshelf / Bookcase', icon: '📚' },
    { id: 'toy_storage', label: '장난감 정리함/수납함', enName: 'Toy Storage Chest / Bins', icon: '🧸' },
    { id: 'kids_rug', label: '놀이 매트/키즈 러그', enName: 'Play Mat / Kids Rug', icon: '🎨' },
    { id: 'kids_lighting', label: '아이방 조명/스탠드', enName: 'Nightlight / Desk Lamp', icon: '💡' },
  ],
  kitchen: [
    { id: 'dining_table', label: '식탁 세트', enName: 'Dining Table & Chairs', icon: '🍽️' },
    { id: 'island', label: '아일랜드 식탁', enName: 'Kitchen Island Counter', icon: '🏛️' },
    { id: 'chairs', label: '바 체어', enName: 'Bar Stools / High Chairs', icon: '🪑' },
    { id: 'lighting', label: '팬던트 식탁 조명', enName: 'Pendant Hanging Light', icon: '💡' },
  ],
  general: [
    { id: 'furniture', label: '가구 전반', enName: 'Main Furniture (Bed/Sofa)', icon: '🛋️' },
    { id: 'sub_furniture', label: '보조 테이블/의자', enName: 'Secondary Table / Accent Chairs', icon: '🪑' },
    { id: 'decor', label: '인테리어 소품', enName: 'Interior Decor & Plants', icon: '🪴' },
    { id: 'lighting', label: '조명 연출', enName: 'Lighting Fixtures', icon: '💡' },
  ],
};

const inferRoomType = (imageUri: string, fallback: string = 'living_room'): string => {
  if (!imageUri) return fallback;
  const lower = imageUri.toLowerCase();
  if (lower.includes('bedroom') || lower.includes('bed')) return 'bedroom';
  if (lower.includes('kitchen') || lower.includes('dining')) return 'kitchen';
  if (lower.includes('bathroom')) return 'bathroom';
  if (lower.includes('exterior')) return 'exterior_house';
  if (lower.includes('garden')) return 'garden_patio';
  if (lower.includes('office') || lower.includes('study')) return 'study';
  if (lower.includes('living') || lower.includes('sofa')) return 'living_room';
  return fallback;
};

export const EXTERIOR_ELEMENT_OPTIONS = [
  {
    id: 'windows',
    label: '창문 & 프레임',
    enName: 'Windows & Slim Aluminum Frames',
    desc: '대형 통창, 슬림 차콜 프레임, 파노라마 창호',
    icon: '🪟',
  },
  {
    id: 'roof',
    label: '지붕 & 처마선',
    enName: 'Modern Zinc Roof & Clean Eaves',
    desc: '모던 징크 지붕, 평지붕 방수 패널, 세련된 처마선',
    icon: '🏠',
  },
  {
    id: 'paint',
    label: '외벽 페인트색',
    enName: 'Exterior Paint & Modern Color Palette',
    desc: '화이트, 웜베이지, 모던 차콜 그레이 투톤',
    icon: '🎨',
  },
  {
    id: 'cladding',
    label: '외벽 마감재',
    enName: 'Facade Cladding (Louver Wood & Natural Stone)',
    desc: '루버 우드 사이딩, 고급 석재 타일, 노출 콘크리트',
    icon: '🧱',
  },
  {
    id: 'lighting',
    label: '야간 외관 조명',
    enName: 'Architectural Night Facade Lighting',
    desc: '외벽 상하향 간접등, 처마 다운라이트, 웜톤 조명',
    icon: '💡',
  },
  {
    id: 'garden',
    label: '야외 정원 & 조경',
    enName: 'Garden, Lawn & Stone Pathway',
    desc: '푸른 잔디 정원, 고급 관목 조경수, 화단, 디딤석',
    icon: '🌲',
  },
  {
    id: 'entrance',
    label: '현관문 & 포치',
    enName: 'Modern Front Door & Entrance Porch Canopy',
    desc: '고급 원목/메탈 출입문, 모던 캐노피, 진입로 포치',
    icon: '🚪',
  },
  {
    id: 'terrace',
    label: '테라스 & 데크',
    enName: 'Balcony Glass Railing & Wood Terrace Deck',
    desc: '천연 목재 데크, 글라스 난간, 야외 라운지 테라스',
    icon: '🪵',
  },
];

export const GARDEN_STRUCTURE_OPTIONS = [
  {
    id: 'pool',
    label: '수영장 & 자쿠지',
    enName: 'Private Swimming Pool & Heated Jacuzzi Spa',
    desc: '프라이빗 인피니티 풀, 온수 스파 자쿠지',
    icon: '🏊‍♂️',
  },
  {
    id: 'trees',
    label: '웅장한 정원수 & 거목',
    enName: 'Specimen Shade Trees & Sculptural Pines',
    desc: '단풍나무, 소나무, 대형 그늘목과 사계절 수목 식재',
    icon: '🌳',
  },
  {
    id: 'doghouse',
    label: '반려견 하우스 & 펫존',
    enName: 'Luxury Dog House & Safe Pet Play Lawn',
    desc: '원목 도그하우스, 펫 전용 잔디 놀이터 및 안전 펜스',
    icon: '🐕',
  },
  {
    id: 'dining',
    label: '야외 다이닝 테이블',
    enName: 'Outdoor Dining Table & Chairs Set with Parasol',
    desc: '원목/티크 아웃도어 식탁, 파라솔, 다이닝 체어 세트',
    icon: '🪑',
  },
  {
    id: 'bbq',
    label: '바베큐 & 아웃도어 키친',
    enName: 'Built-in BBQ Grill Station & Outdoor Kitchen Counter',
    desc: '프리미엄 바베큐 그릴, 야외 싱크대 및 조리 카운터',
    icon: '🍖',
  },
  {
    id: 'firepit',
    label: '파이어핏 & 라운지',
    enName: 'Stone Fire Pit & Weatherproof Outdoor Lounge Seating',
    desc: '원형 석재 파이어핏(불멍), 방수 패브릭 코지 소파',
    icon: '🔥',
  },
  {
    id: 'pergola',
    label: '루버 퍼골라 & 그늘막',
    enName: 'Modern Louvered Pergola & Fabric Shade Canopy',
    desc: '모던 알루미늄/원목 루버 퍼골라, 휴식 그늘막',
    icon: '🌿',
  },
  {
    id: 'lighting_path',
    label: '조명 & 디딤석 산책로',
    enName: 'Granite Stepping Stone Pathway & Ambient Garden Lighting',
    desc: '천연 화강석 디딤길, 잔디등, 은은한 야간 투광 조명',
    icon: '💡',
  },
];

export const CLEANUP_TARGET_CATEGORIES = [
  { id: 'floor_trash', label: '바닥 쓰레기·잡동사니', icon: '🗑️', en: 'scattered floor trash, paper debris, and random small clutter' },
  { id: 'boxes', label: '적재 박스·짐', icon: '📦', en: 'stacked cardboard moving boxes and storage clutter' },
  { id: 'furniture', label: '불필요한 가구·의자', icon: '🪑', en: 'unwanted redundant furniture pieces, old chairs, or extra tables' },
  { id: 'cables', label: '지저분한 전선·멀티탭', icon: '🔌', en: 'messy tangled electrical wires, cords, and power strips' },
  { id: 'clothes', label: '옷가지·침구 주름', icon: '👕', en: 'strewn clothes, messy laundry piles, and rumpled unmade fabrics' },
  { id: 'table_clutter', label: '식탁/테이블 위 소품', icon: '🍽️', en: 'scattered cups, dishes, and small tabletop clutter' },
];

// 📐 방 실측 규격 프리셋 및 가구 표준 치수 옵션
export const ROOM_DIMENSION_PRESETS = [
  { id: 'small', label: '2.2평 원룸', labelEn: '2.2 Pyeong Studio', width: 2.7, length: 2.7, icon: '🏠' },
  { id: 'standard', label: '3.0평 침실/아이방', labelEn: '3.0 Pyeong Bed/Kids', width: 3.0, length: 3.3, icon: '🛏️' },
  { id: 'master', label: '4.0평 안방', labelEn: '4.0 Pyeong Master', width: 3.6, length: 3.6, icon: '👑' },
  { id: 'living', label: '6.8평 거실', labelEn: '6.8 Pyeong Living', width: 4.5, length: 5.0, icon: '🛋️' },
];

export const BED_SIZE_OPTIONS = [
  { id: 'none', label: '침대 없음', shortLabel: '없음', width: 0, length: 0, area: 0 },
  { id: 'single', label: '싱글 (1.0×2.0m)', shortLabel: '싱글', width: 1.0, length: 2.0, area: 2.0 },
  { id: 'twin_two', label: '트윈 2개 (1.0×2.0m ×2)', shortLabel: '트윈(2개)', width: 2.6, length: 2.0, area: 4.0 },
  { id: 'super_single', label: '슈퍼싱글 (1.1×2.0m)', shortLabel: '슈퍼싱글', width: 1.1, length: 2.0, area: 2.2 },
  { id: 'queen', label: '퀸 (1.5×2.0m)', shortLabel: '퀸', width: 1.5, length: 2.0, area: 3.0 },
  { id: 'king', label: '킹 (1.8×2.0m)', shortLabel: '킹', width: 1.8, length: 2.0, area: 3.6 },
];

export const SOFA_SIZE_OPTIONS = [
  { id: 'none', label: '소파 없음', shortLabel: '없음', width: 0, length: 0, area: 0 },
  { id: 'one_seater', label: '1인 암체어 (0.9×0.9m)', shortLabel: '1인 체어', width: 0.9, length: 0.9, area: 0.81 },
  { id: 'two_seater', label: '2인용 소파 (1.6×0.9m)', shortLabel: '2인용', width: 1.6, length: 0.9, area: 1.44 },
  { id: 'three_seater', label: '3인용 표준 (2.2×0.95m)', shortLabel: '3인 표준', width: 2.2, length: 0.95, area: 2.09 },
  { id: 'four_seater', label: '4인 / 카우치 (2.8×1.6m)', shortLabel: '4인/카우치', width: 2.8, length: 1.6, area: 3.5 },
];

export const DINING_TABLE_OPTIONS = [
  { id: 'none', label: '식탁 없음', shortLabel: '없음', width: 0, length: 0, area: 0 },
  { id: 'two_person', label: '2인용 식탁 (0.8×0.8m)', shortLabel: '2인용', width: 0.8, length: 0.8, area: 0.64 },
  { id: 'four_person', label: '4인용 식탁 (1.4×0.8m)', shortLabel: '4인용', width: 1.4, length: 0.8, area: 1.12 },
  { id: 'six_person', label: '6인용 대형 (1.8×0.9m)', shortLabel: '6인 대형', width: 1.8, length: 0.9, area: 1.62 },
  { id: 'island_bar', label: '아일랜드/홈바 (1.6×0.8m)', shortLabel: '아일랜드', width: 1.6, length: 0.8, area: 1.28 },
];

export const DESK_SIZE_OPTIONS = [
  { id: 'none', label: '책상 없음', shortLabel: '없음', width: 0, length: 0, area: 0 },
  { id: 'compact', label: '컴팩트 (1.0×0.6m)', shortLabel: '컴팩트', width: 1.0, length: 0.6, area: 0.6 },
  { id: 'standard', label: '표준 (1.2×0.6m)', shortLabel: '표준', width: 1.2, length: 0.6, area: 0.72 },
  { id: 'wide', label: '와이드 (1.5×0.7m)', shortLabel: '와이드', width: 1.5, length: 0.7, area: 1.05 },
];

// 🌐 Multi-language dictionaries for surfaces, materials, colors and styles
export const SURFACE_I18N: Record<string, Record<Language, { label: string; desc: string }>> = {
  wall: {
    ko: { label: '벽면 (도배 / 페인트)', desc: '거실/방 전체 벽면의 벽지 질감 교체 및 감성 페인트 컬러 도색' },
    ja: { label: '壁面（クロス・塗装）', desc: '部屋全体の壁紙クロスの張り替えやペイント塗装' },
    en: { label: 'Walls & Wallpaper', desc: 'Full room wallpaper replacement and color repainting' },
    es: { label: 'Paredes y Papel Tapiz', desc: 'Cambio de papel tapiz y pintura en paredes completas' },
  },
  floor: {
    ko: { label: '바닥재 (플로어링)', desc: '대형 대리석 타일, 포세린, 헤링본 원목마루, 모던 마이크로시멘트 바닥재' },
    ja: { label: '床材（フローリング）', desc: '大理石タイル、ヘリンボーン無垢材、モルタル調フローリング' },
    en: { label: 'Flooring Surface', desc: 'Marble tile, porcelain, herringbone timber, micro-cement' },
    es: { label: 'Suelos y Parqué', desc: 'Baldosas de mármol, porcelánico, parqué y microcemento' },
  },
  ceiling: {
    ko: { label: '천장 마감', desc: '천장 무광 도색, 미니멀 실크 도배 및 우물천장·간접등 톤 정돈' },
    ja: { label: '天井仕上げ', desc: '天井マット塗装、シルククロス、間接照明トーン調整' },
    en: { label: 'Ceiling Finish & Tone', desc: 'Matte ceiling paint, minimal wallpaper, recessed light tone' },
    es: { label: 'Techo y Acabados', desc: 'Pintura mate de techo, papel minimalista y luz indirecta' },
  },
  accent_wall: {
    ko: { label: '포인트 아트월', desc: 'TV월, 침대 헤드월, 주방 벽면에 입체적 벽돌/템바보드/대리석 포인트' },
    ja: { label: 'アクセントウォール', desc: 'TV面・ベッド背面にレンガ・ウッドリブ・大理石アクセント' },
    en: { label: 'Feature Accent Wall', desc: 'Accent wall with exposed brick, wood slats, or marble' },
    es: { label: 'Pared de Acento', desc: 'Pared destacada con ladrillo visto, listones o mármol' },
  },
  molding_doors: {
    ko: { label: '몰딩 & 걸레받이·도어', desc: '방문 도어 프레임, 천장 몰딩 및 바닥 걸레받이 깔끔한 컬러 정돈' },
    ja: { label: 'ドア＆巾木・見切り', desc: 'ドア枠、天井見切り、巾木のすっきりしたカラー統一' },
    en: { label: 'Baseboards & Doors', desc: 'Door frames, ceiling crown moldings, and clean trim finish' },
    es: { label: 'Puertas y Rodapiés', desc: 'Marcos de puertas, molduras de techo y rodapiés modernos' },
  },
};

export const MATERIAL_I18N: Record<string, Record<Language, { label: string; desc: string }>> = {
  silk_wallpaper: {
    ko: { label: '실크 벽지', desc: '고급스러운 은은한 광택과 입체감, 뛰어난 내구성과 오염 방지 코팅' },
    ja: { label: 'シルク壁紙クロス', desc: '上品な光沢と立体感、防汚コーティングの高級クロス' },
    en: { label: 'Premium Silk Wallpaper', desc: 'Subtle sheen, dimensional texture, durable anti-stain finish' },
    es: { label: 'Papel Tapiz de Seda', desc: 'Brillo sutil, textura tridimensional y acabado antimanchas' },
  },
  standard_wallpaper: {
    ko: { label: '일반 합지 벽지', desc: '친환경 천연 펄프 통기성과 실속 있는 가성비의 무광 종이 합지' },
    ja: { label: 'スタンダード紙壁紙', desc: '通気性に優れた天然パルプマット仕上げクロス' },
    en: { label: 'Standard Paper Wallpaper', desc: 'Eco-friendly breathable pulp paper with smooth matte finish' },
    es: { label: 'Papel Estándar', desc: 'Papel ecológico y transpirable con acabado mate suave' },
  },
  matte_paint: {
    ko: { label: '프리미엄 무광 페인트', desc: '붓자국 없는 실크처럼 매끄러운 고급 수성 무광 도색 마감' },
    ja: { label: 'プレミアムマットペイント', desc: '刷毛ムラのない滑らかな水性ウルトラマット塗装' },
    en: { label: 'Ultra-Matte Interior Paint', desc: 'Silky seamless brush-free ultra-matte emulsion coating' },
    es: { label: 'Pintura Ultra Mate', desc: 'Pintura ecológica ultra mate sin marcas de brocha' },
  },
  textured_wallpaper: {
    ko: { label: '고급 직조 패브릭 벽지', desc: '섬세한 패브릭 텍스처와 은은한 입체감이 살아있는 프리미엄 벽지' },
    ja: { label: '織物調ファブリッククロス', desc: '繊細な布目と心地よい立体感が特徴の上質クロス' },
    en: { label: 'Textured Fabric Wallpaper', desc: 'Fine fabric weave texture with subtle 3D warmth' },
    es: { label: 'Papel Tejido Texturizado', desc: 'Textura fina de tela tejida con calidez táctil' },
  },
  brick: {
    ko: { label: '벽돌 / 브릭 타일', desc: '클래식한 감성의 빈티지 파벽돌 및 모던 화이트 브릭 타일 마감' },
    ja: { label: 'レンガ・ブリックタイル', desc: 'ヴィンテージ赤レンガやモダンホワイトブリック仕上げ' },
    en: { label: 'Vintage / White Brick', desc: 'Rustic vintage brick and modern clean white brick tile' },
    es: { label: 'Ladrillo / Baldosa Brick', desc: 'Ladrillo rústico vintage y azulejo blanco moderno' },
  },
  marble_tile: {
    ko: { label: '대리석 & 포세린 타일', desc: '비앙코 카라라 대리석 마블링 및 대형 무광 포세린 타일 마감' },
    ja: { label: '大理石＆ポーセリンタイル', desc: 'ビアンコカララ大理石や大型マット磁器タイル' },
    en: { label: 'Luxury Marble & Porcelain', desc: 'Bianco Carrara veined marble and large-format porcelain tile' },
    es: { label: 'Mármol y Porcelánico', desc: 'Mármol veteado Carrara y baldosas de porcelánico' },
  },
  wood_timber: {
    ko: { label: '원목 / 템바보드 목재', desc: '헤링본 원목 마루, 우드 패널링 및 감성적인 입체 템바보드 루버' },
    ja: { label: '無垢フローリング・リブ木材', desc: 'ヘリンボーン無垢材、ウッドパネル、立体リブスラット' },
    en: { label: 'Natural Wood & Timber Slats', desc: 'Herringbone oak flooring, wood paneling, acoustic timber slats' },
    es: { label: 'Madera Natural y Listones', desc: 'Suelos de espiga de roble, paneles de madera y listones acústicos' },
  },
  micro_cement: {
    ko: { label: '마이크로시멘트 / 콘크리트', desc: '이음매 없이 미니멀하고 시크한 유럽풍 모놀리식 시멘트 미장 마감' },
    ja: { label: 'モールテックス・モルタル調', desc: '継ぎ目のないミニマルなヨーロッパ調モルタル仕上げ' },
    en: { label: 'Seamless Micro-Cement', desc: 'Monolithic seamless European micro-cement and polished concrete' },
    es: { label: 'Microcemento Continuo', desc: 'Acabado monolítico continuo sin juntas y hormigón pulido' },
  },
  semi_gloss_paint: {
    ko: { label: '새틴 반광 페인트', desc: '손때와 오염에 강하고 닦기 쉬운 도어 전용 반광 페인트' },
    ja: { label: 'サテン半光沢ペイント', desc: '汚れに強く手入れのしやすい建具・ドア専用半光沢塗装' },
    en: { label: 'Satin Semi-Gloss Paint', desc: 'Wipe-clean stain-resistant satin enamel for doors and trims' },
    es: { label: 'Pintura Satinada', desc: 'Esmalte satinado lavable resistente a manchas para puertas' },
  },
};

export const PAINT_COLOR_I18N: Record<string, Record<Language, string>> = {
  pure_white: { ko: '퓨어 화이트', ja: 'ピュアホワイト', en: 'Pure White', es: 'Blanco Puro' },
  warm_beige: { ko: '웜 베이지', ja: 'ウォームベージュ', en: 'Warm Beige', es: 'Beige Cálido' },
  sage_green: { ko: '세이지 그린', ja: 'セージグリーン', en: 'Sage Green', es: 'Verde Salvia' },
  cream_ivory: { ko: '크림 아이보리', ja: 'クリームアイボリー', en: 'Cream Ivory', es: 'Marfil Crema' },
  charcoal_grey: { ko: '차콜 그레이', ja: 'チャコールグレー', en: 'Charcoal Gray', es: 'Gris Carbón' },
  dusty_rose: { ko: '더스티 로즈', ja: 'ダスティローズ', en: 'Dusty Rose', es: 'Rosa Empolvado' },
  navy_blue: { ko: '네이비 블루', ja: 'ネイビーブルー', en: 'Navy Blue', es: 'Azul Marino' },
  terracotta: { ko: '테라코타', ja: 'テラコッタ', en: 'Terracotta', es: 'Terracota' },
};

export const COUNTRY_I18N: Record<string, Record<Language, string>> = {
  '한국': { ko: '한국', ja: '韓国', en: 'Korea', es: 'Corea' },
  '일본': { ko: '일본', ja: '日本', en: 'Japan', es: 'Japón' },
  '북유럽': { ko: '북유럽', ja: '北欧', en: 'Nordic', es: 'Nórdico' },
  '지중해': { ko: '지중해', ja: '地中海', en: 'Mediterranean', es: 'Mediterráneo' },
  '미국': { ko: '미국', ja: 'アメリカ', en: 'USA', es: 'EE.UU.' },
  '프랑스': { ko: '프랑스', ja: 'フランス', en: 'France', es: 'Francia' },
  '영국': { ko: '영국', ja: 'イギリス', en: 'UK', es: 'Reino Unido' },
  '스위스': { ko: '스위스', ja: 'スイス', en: 'Switzerland', es: 'Suiza' },
  '발리': { ko: '발리', ja: 'バリ', en: 'Bali', es: 'Bali' },
  '독일': { ko: '독일', ja: 'ドイツ', en: 'Germany', es: 'Alemania' },
};

export const EXTERIOR_STYLE_I18N: Record<string, Record<Language, { label: string; desc: string }>> = {
  korea_hanok: {
    ko: { label: '한국 모던 한옥', desc: '전통 기와 처마선, 원목 서까래와 대청마루, 파노라마 통창이 조화된 모던 한옥' },
    ja: { label: '韓国モダン韓屋', desc: '伝統瓦の軒ライン、無垢の垂木、パノラマ窓が調和した現代的な韓屋建築' },
    en: { label: 'K-Modern Hanok', desc: 'Traditional curved tile roof, natural pine rafters, and panoramic glass windows' },
    es: { label: 'Hanok Moderno Coreano', desc: 'Tejados tradicionales curvados, vigas de madera natural y grandes ventanales' },
  },
  japan_zen: {
    ko: { label: '일본 젠 모던', desc: '야키스기 탄화목 외벽, 미니멀 처마, 대나무와 자갈 젠 정원' },
    ja: { label: '日本 禅モダン', desc: '焼杉の黒炭化外壁、ミニマルな軒、竹と白砂利の静寂な枯山水庭園' },
    en: { label: 'Japanese Zen Modern', desc: 'Charred Yakisugi timber siding, minimalist eaves, and peaceful rock Zen garden' },
    es: { label: 'Zen Moderno Japonés', desc: 'Revestimiento de madera quemada Yakisugi, aleros minimalistas y jardín zen' },
  },
  nordic_scandi: {
    ko: { label: '북유럽 스칸디나비안', desc: 'A자형 경사 박공지붕, 내추럴 원목 사이딩, 침엽수 조경' },
    ja: { label: '北欧スカンジナビアン', desc: 'Aライン切妻屋根、縦張り天然木サイディング、針葉樹の自然景観' },
    en: { label: 'Nordic Scandinavian House', desc: 'A-frame pitched roof, vertical natural timber siding, pine landscape' },
    es: { label: 'Casa Escandinava Nórdica', desc: 'Tejado a dos aguas en A, paneles de madera vertical y entorno de pinos' },
  },
  mediterranean: {
    ko: { label: '지중해 산토리니 & 스패니시', desc: '순백색 스타코 외벽, 테라코타 기와, 아치형 창호와 발코니' },
    ja: { label: '地中海サントリーニ＆ヴィラ', desc: '純白の漆喰スタッコ壁、テラコッタ瓦、アーチ窓とブーゲンビリア' },
    en: { label: 'Mediterranean Coastal Villa', desc: 'Brilliant whitewashed stucco, terracotta roof tiles, and arched windows' },
    es: { label: 'Villa Costera Mediterránea', desc: 'Estuco blanco brillante, tejas de terracota y románticos ventanales en arco' },
  },
  us_modern_brick: {
    ko: { label: '미국 브릭 & 인더스트리얼', desc: '붉은 파벽돌, 블랙 메탈 빔, 대형 격자 스틸 창호' },
    ja: { label: '米国ブルックリン・ブリック', desc: 'ヴィンテージ赤レンガ、黒鉄骨ビーム、大開口の格子スチール窓' },
    en: { label: 'American Modern Brick & Loft', desc: 'Rich red textured brick, black steel beams, multi-pane factory windows' },
    es: { label: 'Loft Industrial Americano', desc: 'Fachada de ladrillo rojo, vigas de acero negro y ventanas tipo fábrica' },
  },
  french_chateau: {
    ko: { label: '프랑스 클래식 샤토', desc: '라임스톤 석재 파사드, 만사르드 지붕, 우아한 대칭 창호' },
    ja: { label: 'フランス・クラシックシャトー', desc: 'ライムストーン石積みファサード、マンサード屋根、対称の装飾窓' },
    en: { label: 'French Classic Chateau', desc: 'Pale limestone facade, dark zinc Mansard roof, elegant casement windows' },
    es: { label: 'Château Clásico Francés', desc: 'Fachada de piedra caliza, tejado Mansard de zinc y ventanas simétricas' },
  },
  british_tudor: {
    ko: { label: '영국 코티지 & 튜더', desc: '허니 라임스톤 석재, 다크 하프팀버 목조, 잉글리시 가든' },
    ja: { label: '英国チューダーコテージ', desc: '蜂蜜色のコッツウォルズ石、ハーフティンバー木骨、バラのイングリッシュガーデン' },
    en: { label: 'British Tudor Cottage', desc: 'Honey limestone walls, dark exposed rustic timbers, diamond lattice windows' },
    es: { label: 'Cabaña Tudor Británica', desc: 'Muros de piedra caliza color miel, vigas de madera oscura y jardín de rosas' },
  },
  swiss_chalet: {
    ko: { label: '스위스 알파인 샬레', desc: '통나무 원목 발코니, 넓은 박공 처마, 석재 기단과 꽃 장식' },
    ja: { label: 'スイス・アルペンシャレー', desc: '重厚な丸太バルコニー、深い切妻軒、ゼラニウムが咲くアルプス山荘' },
    en: { label: 'Swiss Alpine Chalet', desc: 'Dark weathered timber logs, wide gabled eaves, cascading balcony flowers' },
    es: { label: 'Chalet Alpino Suizo', desc: 'Troncos de madera rústica, amplios aleros y balcones floridos de geranios' },
  },
  bali_resort: {
    ko: { label: '발리 트로피컬 풀빌라', desc: '초가 파빌리온 지붕, 티크 목재 기둥, 야자수와 인피니티 풀' },
    ja: { label: 'バリ島トロピカルリゾート', desc: 'アランアラン茅葺き屋根、チーク材の柱、ヤシの木とプライベートプール' },
    en: { label: 'Balinese Tropical Villa', desc: 'Open-air teak pavilion, pitched thatched roofing, private infinity pool' },
    es: { label: 'Villa Tropical de Bali', desc: 'Pabellón de teca al aire libre, techo de paja y piscina infinita con palmeras' },
  },
  german_bauhaus: {
    ko: { label: '독일 바우하우스 모더니즘', desc: '기하학적 큐빅 볼륨, 수평 리본 글라스, 기능주의 백색 파사드' },
    ja: { label: 'ドイツ・バウハウスモダン', desc: '幾何学的キュービック造形、水平連窓ガラス、機能主義の白のファサード' },
    en: { label: 'German Bauhaus Modern', desc: 'Pure white cubic forms, horizontal ribbon windows, minimalist functionalism' },
    es: { label: 'Bauhaus Moderno Alemán', desc: 'Volúmenes cúbicos blancos, ventanales horizontales continuos y funcionalidad' },
  },
};

export const GARDEN_STYLE_I18N: Record<string, Record<Language, { label: string; desc: string }>> = {
  garden_korean: {
    ko: { label: '한국 전통 & 모던 정원', desc: '소나무와 자연석 디딤길, 고풍스러운 기와 담장과 석등' },
    ja: { label: '韓国伝統＆モダン庭園', desc: '赤松と自然石の飛び石道、瓦葺きの石垣と優雅な石灯籠' },
    en: { label: 'Korean Modern Garden', desc: 'Sculptural pine trees, granite stepping stones, low tile walls' },
    es: { label: 'Jardín Tradicional Coreano', desc: 'Pinos esculturales, piedras de paso de granito y muros bajos' },
  },
  garden_japanese_zen: {
    ko: { label: '일본 젠 & 스톤 정원', desc: '백자갈 물결, 젠 바위, 붉은 단풍나무와 츠쿠바이 물받이' },
    ja: { label: '日本 枯山水・禅ガーデン', desc: '白砂利の波紋、苔むした岩、紅葉と蹲（つくばい）の静寂な空間' },
    en: { label: 'Japanese Zen Rock Garden', desc: 'Raked white gravel ripples, mossy stones, red maple, bamboo fountain' },
    es: { label: 'Jardín Zen Japonés', desc: 'Gravilla blanca rastrillada, piedras con musgo y fuente de bambú' },
  },
  garden_english_cottage: {
    ko: { label: '영국 코티지 로즈 가든', desc: '넝쿨 장미 아치, 라벤더와 허브 꽃길, 빈티지 벤치' },
    ja: { label: '英国イングリッシュローズガーデン', desc: 'つるバラのアーチ、ラベンダーとハーブの小道、アイアンベンチ' },
    en: { label: 'English Cottage Rose Garden', desc: 'Climbing rose arches, fragrant lavender borders, wrought iron bench' },
    es: { label: 'Jardín de Rosas Inglés', desc: 'Arcos de rosas trepadoras, senderos de lavanda y banco de forja' },
  },
  garden_french_parterre: {
    ko: { label: '프랑스 클래식 베르사유', desc: '기하학 회양목 울타리, 대칭 잔디 화단과 중앙 석조 분수' },
    ja: { label: 'フランス幾何学パルテール', desc: '端正なツゲのトピアリー、左右対称の芝生花壇とクラシック大理石噴水' },
    en: { label: 'French Parterre Garden', desc: 'Symmetrical manicured boxwood hedges, grand classical stone fountain' },
    es: { label: 'Jardín Clásico Francés', desc: 'Setos geométricos simétricos de boj y gran fuente central de piedra' },
  },
  garden_mediterranean_patio: {
    ko: { label: '지중해 테라코타 파티오', desc: '테라코타 화분, 올리브 나무, 감성 파골라와 야외 다이닝' },
    ja: { label: '地中海テラコッタパティオ', desc: '素焼きテラコッタ鉢、オリーブの木、日除けパーゴラとアウトドアダイニング' },
    en: { label: 'Mediterranean Patio', desc: 'Terracotta planters, olive trees, pergola canopy with outdoor dining' },
    es: { label: 'Patio Mediterráneo', desc: 'Macetas de terracota, olivos, pérgola acogedora y comedor al aire libre' },
  },
  garden_bali_tropical: {
    ko: { label: '발리 트로피컬 리조트', desc: '극락조화와 야자수, 석재 폭포 벽, 우드 데크와 라운지 침대' },
    ja: { label: 'バリ風トロピカル造園', desc: 'ヤシの木とモンステラ、石積みウォーターフォール、ウッドデッキサンベッド' },
    en: { label: 'Balinese Tropical Garden', desc: 'Lush palms, stone waterfall wall, teak sun loungers by the pool' },
    es: { label: 'Jardín Tropical Balinés', desc: 'Palmeras exuberantes, cascada de piedra y tumbonas junto a la piscina' },
  },
  garden_modern_minimal: {
    ko: { label: '모던 미니멀 워터 테라스', desc: '직사각형 얕은 수공간, 콘크리트 디딤판, 은은한 매립 조명' },
    ja: { label: 'モダンミニマル・水盤テラス', desc: '静かな浅水プール、浮遊感のあるコンクリートステップ、間接照明' },
    en: { label: 'Modern Minimal Water Terrace', desc: 'Reflective water mirror basin, floating concrete pavers, linear LEDs' },
    es: { label: 'Terraza Minimalista con Agua', desc: 'Espejo de agua reflectante, pasarela de hormigón y luces lineales LED' },
  },
  garden_rooftop_lounge: {
    ko: { label: '어반 루프탑 스카이 가든', desc: '도심 스카이라인 뷰, 플랜터 박스, 파이어핏과 야외 소파' },
    ja: { label: 'アーバンルーフトップ・スカイガーデン', desc: '夜景パノラマビュー、大型プランター、ファイヤーピットと快適ソファ' },
    en: { label: 'Urban Rooftop Sky Garden', desc: 'City skyline vista, architectural planters, cozy fire pit, lounge sofa' },
    es: { label: 'Jardín en Azotea Urbana', desc: 'Vistas panorámicas a la ciudad, jardineras, chimenea exterior y sofás' },
  },
};

export const REPLACE_STYLE_I18N: Record<string, Record<Language, { label: string; desc: string; badge: string }>> = {
  modern: {
    ko: { label: '모던 & 미니멀', desc: '간결하고 정제된 직선 라인과 세련된 감성의 현대적 디자인', badge: '인기' },
    ja: { label: 'モダン＆ミニマル', desc: '無駄を削ぎ落とした洗練された直線ラインの現代的デザイン', badge: '人気' },
    en: { label: 'Modern Minimalist', desc: 'Clean geometric lines, slim proportions, and functional elegance', badge: 'Popular' },
    es: { label: 'Moderno Minimalista', desc: 'Líneas limpias, proporciones estilizadas y elegancia funcional', badge: 'Popular' },
  },
  hanok: {
    ko: { label: '전통 한옥 & 오리엔탈', desc: '고즈넉한 한국 전통 목가구, 창살 살림과 단아한 좌식/입식 조화', badge: '전통미' },
    ja: { label: '伝統韓屋＆オリエンタル', desc: '落ち着いた木製家具、格子細工と端正な東洋の静寂美', badge: '伝統美' },
    en: { label: 'Traditional Hanok & Oriental', desc: 'Natural wood craftsmanship, subtle joinery, warm oriental tranquility', badge: 'Heritage' },
    es: { label: 'Hanok Oriental Tradicional', desc: 'Ebanistería de madera natural y serenidad oriental cálida', badge: 'Herencia' },
  },
  classic: {
    ko: { label: '프렌치 & 클래식 유럽풍', desc: '앤틱 몰딩과 우아한 곡선미, 풍성한 볼륨감의 유러피안 귀족 감성', badge: '우아함' },
    ja: { label: 'フレンチ＆クラシック欧風', desc: 'アンティークモールディングと優美な曲線、王室の気品漂うデザイン', badge: '優雅' },
    en: { label: 'French Classic European', desc: 'Neoclassical carvings, cabriole legs, and royal European volume', badge: 'Elegant' },
    es: { label: 'Clásico Francés Europeo', desc: 'Tallas neoclásicas, patas cabriolé y porte señorial europeo', badge: 'Elegante' },
  },
  scandinavian: {
    ko: { label: '북유럽 스칸디나비안', desc: '밝고 따뜻한 원목과 자연 친화적 패브릭, 아늑한 휘게 라이프스타일', badge: '스테디' },
    ja: { label: '北欧スカンジナビアン', desc: '明るく温かい木目と心地よいファブリック、居心地の良いヒュッゲ生活', badge: '定番' },
    en: { label: 'Nordic Scandinavian', desc: 'Warm light oak accents, organic silhouettes, and cozy hygge feel', badge: 'Steady' },
    es: { label: 'Nórdico Escandinavo', desc: 'Roble claro cálido, siluetas orgánicas y ambiente acogedor hygge', badge: 'Clásico' },
  },
  luxury: {
    ko: { label: '호텔 라운지 & 럭셔리', desc: '5성급 호텔 스위트룸 감성의 웅장하고 품격 높은 하이엔드 조형미', badge: '하이엔드' },
    ja: { label: 'ホテルラウンジ＆ラグジュアリー', desc: '5つ星ホテルのスイートルームのような重厚で気品あるハイエンド造形', badge: '高級' },
    en: { label: 'Luxury Hotel Lounge', desc: '5-star boutique suite feel, opulent proportions, brass accents', badge: 'Luxury' },
    es: { label: 'Lounge de Hotel de Lujo', desc: 'Ambiente de suite de 5 estrellas, proporciones opulentas y latón', badge: 'Lujo' },
  },
  mid_century: {
    ko: { label: '미드센추리 모던', desc: '1950~60년대 디자인 황금기 감성의 레트로 유기적 곡선과 조형미', badge: '트렌드' },
    ja: { label: 'ミッドセンチュリーモダン', desc: '1950〜60年代の名作ヴィンテージ、美しい有機的フォルム', badge: '注目' },
    en: { label: 'Mid-Century Modern', desc: '1950s golden era iconic tapered legs, sculptural curves, retro charm', badge: 'Trending' },
    es: { label: 'Mid-Century Moderno', desc: 'Líneas icónicas de los años 50, patas cónicas y curvas retro', badge: 'Tendencia' },
  },
  japandi: {
    ko: { label: '내추럴 재팬디 & 우디', desc: '일본의 와비사비와 북유럽 미니멀리즘이 조화된 차분한 힐링 가구', badge: '힐링' },
    ja: { label: 'ナチュラルジャパンディ＆和モダン', desc: '侘び寂びと北欧ミニマリズムが融合した、心安らぐ癒やしの家具', badge: '癒やし' },
    en: { label: 'Natural Japandi & Zen', desc: 'Wabi-sabi fusion, earthy serenity, low-profile posture, raw warmth', badge: 'Zen' },
    es: { label: 'Japandi Zen Natural', desc: 'Fusión de wabi-sabi y minimalismo nórdico con serenidad terrenal', badge: 'Sereno' },
  },
  industrial: {
    ko: { label: '인더스트리얼 & 빈티지', desc: '블랙 메탈 프레임과 에이징 가죽/우드가 어우러진 뉴욕 로프트 무드', badge: '개성' },
    ja: { label: 'インダストリアル＆ヴィンテージ', desc: '黒スチール枠とエイジングレザー・古材が融合したNYロフト調', badge: '個性' },
    en: { label: 'Industrial & Vintage Loft', desc: 'Blackened steel framing, distressed aged leather, bold rugged character', badge: 'Rugged' },
    es: { label: 'Loft Industrial Vintage', desc: 'Estructura de acero negro, cuero envejecido y madera rústica', badge: 'Carácter' },
  },
};

export const REPLACE_COLOR_I18N: Record<string, Record<Language, string>> = {
  off_white: { ko: '오프화이트 / 크림', ja: 'オフホワイト／クリーム', en: 'Off-White & Cream', es: 'Blanco Roto / Crema' },
  warm_cognac: { ko: '웜 코냑 / 테라코타', ja: 'ウォームコニャック', en: 'Warm Cognac', es: 'Coñac Cálido' },
  charcoal_grey: { ko: '모던 차콜 / 다크그레이', ja: 'チャコール／ダークグレー', en: 'Modern Charcoal', es: 'Gris Carbón' },
  sage_green: { ko: '올리브 / 세이지그린', ja: 'オリーブ／セージグリーン', en: 'Olive & Sage Green', es: 'Verde Salvia' },
  mustard_yellow: { ko: '머스타드 옐로우', ja: 'マスタードイエロー', en: 'Mustard Yellow', es: 'Amarillo Mostaza' },
  deep_navy: { ko: '딥 네이비 블루', ja: 'ディープネイビー', en: 'Deep Navy Blue', es: 'Azul Marino Oscuro' },
  dusty_rose: { ko: '더스티 로즈 핑크', ja: 'ダスティローズピンク', en: 'Dusty Rose Pink', es: 'Rosa Empolvado' },
  natural_oak: { ko: '내추럴 오크 / 베이지', ja: 'ナチュラルオーク／ベージュ', en: 'Natural Oak Beige', es: 'Roble Claro Natural' },
};

export const REPLACE_MATERIAL_I18N: Record<string, Record<Language, { label: string; desc: string; badge: string }>> = {
  boucle: {
    ko: { label: '부클레 & 셔닐 패브릭', desc: '몽글몽글 입체적인 루프 조직으로 포근하고 아늑한 최고급 촉감', badge: '최고인기' },
    ja: { label: 'ブークレ＆シェニール織', desc: 'もこもことした立体的なループ組織で温かみのある極上の肌触り', badge: '一番人気' },
    en: { label: 'Bouclé & Chenille Fabric', desc: 'Looped 3D cozy tactile weave with luxurious comforting warmth', badge: 'Most Popular' },
    es: { label: 'Tejido Bouclé y Chenilla', desc: 'Textura en bucle suave y envolvente con tacto cálido prémium', badge: 'Más Popular' },
  },
  aniline_leather: {
    ko: { label: '에이징 천연 애닐린 가죽', desc: '세월이 흐를수록 깊이를 더하는 최고급 이탈리안 빈티지 레더', badge: '프리미엄' },
    ja: { label: 'ヴィンテージ本革アニリンレザー', desc: '使い込むほどに風合いを増す最高級イタリアンフルレザー', badge: 'プレミアム' },
    en: { label: 'Vintage Aniline Leather', desc: 'Rich buttery full-grain Italian leather that patinas beautifully', badge: 'Premium' },
    es: { label: 'Piel Anilina Envejecida', desc: 'Cuero genuino italiano que mejora con una pátina exquisita', badge: 'Prémium' },
  },
  velvet: {
    ko: { label: '로열 매트 벨벳', desc: '은은하고 매혹적인 광택감과 부드러운 극세사 감촉의 호텔 라운지 무드', badge: '럭셔리' },
    ja: { label: 'ロイヤルマットベルベット', desc: 'ほのかな光沢と滑らかな肌触り、ホテルラウンジの優雅な気品', badge: 'ラグジュアリー' },
    en: { label: 'Royal Matte Velvet', desc: 'Deep subtle luster, ultra-soft micro-pile, boutique hotel lounge mood', badge: 'Luxury' },
    es: { label: 'Terciopelo Mate Real', desc: 'Brillo sutil profundo y suavidad sedosa de salón de hotel de lujo', badge: 'Lujoso' },
  },
  linen_blend: {
    ko: { label: '헤비 내추럴 린넨 블렌드', desc: '통기성이 뛰어나고 자연스러운 구김과 내추럴 감성이 돋보이는 원단', badge: '오가닉' },
    ja: { label: 'ナチュラルリネン混紡', desc: '通気性に優れ、自然なシワと心地よいリラックス感の上質リネン', badge: 'オーガニック' },
    en: { label: 'Heavy Natural Linen Blend', desc: 'Breathable, natural slub texture with effortless organic sophistication', badge: 'Organic' },
    es: { label: 'Mezcla de Lino Natural', desc: 'Lino fresco y transpirable con textura rústica y sofisticada', badge: 'Orgánico' },
  },
};

export const PAINT_PRESET_I18N: Record<string, Record<Language, string>> = {
  hotel_luxury: { ko: '5성급 호텔 라운지', ja: '5つ星ホテルラウンジ', en: '5-Star Luxury Lounge', es: 'Lounge de Hotel 5 Estrellas' },
  japandi_wood: { ko: '내추럴 재팬디 우드', ja: 'ナチュラルジャパンディ', en: 'Natural Japandi Wood', es: 'Madera Japandi Natural' },
  modern_minimal: { ko: '모던 미니멀 화이트', ja: 'モダンミニマルホワイト', en: 'Modern Minimal White', es: 'Blanco Minimalista Moderno' },
  warm_terracotta: { ko: '웜 코지 테라코타', ja: 'ウォームテラコッタ', en: 'Warm Cozy Terracotta', es: 'Terracota Cálido Acogedor' },
};

export const PAINT_SURFACE_OPTIONS = [
  {
    id: 'wall',
    label: '벽면 (도배 / 페인트)',
    enName: 'Main Walls & Wallpaper',
    desc: '거실/방 전체 벽면의 벽지 질감 교체 및 감성 페인트 컬러 도색',
    icon: '🧱',
    defaultMaterial: 'silk_wallpaper',
    defaultColor: 'warm_beige',
  },
  {
    id: 'floor',
    label: '바닥재 (플로어링)',
    enName: 'Flooring Surface',
    desc: '대형 대리석 타일, 포세린, 헤링본 원목마루, 모던 마이크로시멘트 바닥재',
    icon: '🪵',
    defaultMaterial: 'marble_tile',
    defaultColor: 'pure_white',
  },
  {
    id: 'ceiling',
    label: '천장 마감',
    enName: 'Ceiling Finish & Tone',
    desc: '천장 무광 도색, 미니멀 실크 도배 및 우물천장·간접등 톤 정돈',
    icon: '💡',
    defaultMaterial: 'matte_paint',
    defaultColor: 'pure_white',
  },
  {
    id: 'accent_wall',
    label: '포인트 아트월',
    enName: 'Feature Accent Wall',
    desc: 'TV월, 침대 헤드월, 주방 벽면에 입체적 벽돌/템바보드/대리석 포인트',
    icon: '🖼️',
    defaultMaterial: 'brick',
    defaultColor: 'pure_white',
  },
  {
    id: 'molding_doors',
    label: '몰딩 & 걸레받이·도어',
    enName: 'Baseboards, Moldings & Doors',
    desc: '방문 도어 프레임, 천장 몰딩 및 바닥 걸레받이 깔끔한 컬러 정돈',
    icon: '🚪',
    defaultMaterial: 'matte_paint',
    defaultColor: 'pure_white',
  },
];

export const PAINT_MATERIAL_OPTIONS = [
  {
    id: 'silk_wallpaper',
    label: '실크 벽지',
    enName: 'Premium Silk Wallpaper',
    desc: '고급스러운 은은한 광택과 입체감, 뛰어난 내구성과 오염 방지 코팅',
    icon: '✨',
  },
  {
    id: 'standard_wallpaper',
    label: '일반 합지 벽지',
    enName: 'Standard Paper Wallpaper',
    desc: '친환경 천연 펄프 통기성과 실속 있는 가성비의 무광 종이 합지',
    icon: '📜',
  },
  {
    id: 'matte_paint',
    label: '프리미엄 무광 페인트',
    enName: 'Ultra-Matte Interior Paint',
    desc: '붓자국 없는 실크처럼 매끄러운 고급 수성 무광 도색 마감',
    icon: '🎨',
  },
  {
    id: 'textured_wallpaper',
    label: '고급 직조 패브릭 벽지',
    enName: 'Textured Fabric Wallpaper',
    desc: '섬세한 패브릭 텍스처와 은은한 입체감이 살아있는 프리미엄 벽지',
    icon: '📜',
  },
  {
    id: 'brick',
    label: '벽돌 / 브릭 타일',
    enName: 'Vintage / White Exposed Brick',
    desc: '클래식한 감성의 빈티지 파벽돌 및 모던 화이트 브릭 타일 마감',
    icon: '🧱',
  },
  {
    id: 'marble_tile',
    label: '대리석 & 포세린 타일',
    enName: 'Luxury Italian Marble & Porcelain Tile',
    desc: '비앙코 카라라 대리석 마블링 및 대형 무광 포세린 타일 마감',
    icon: '🏛️',
  },
  {
    id: 'wood_timber',
    label: '원목 / 템바보드 목재',
    enName: 'Natural Wood Flooring & Timber Slats',
    desc: '헤링본 원목 마루, 우드 패널링 및 감성적인 입체 템바보드 루버',
    icon: '🪵',
  },
  {
    id: 'micro_cement',
    label: '마이크로시멘트 / 노출 콘크리트',
    enName: 'Seamless Micro-Cement / Concrete',
    desc: '이음매 없이 미니멀하고 시크한 유럽풍 모놀리식 시멘트 미장 마감',
    icon: '🏢',
  },
  {
    id: 'semi_gloss_paint',
    label: '새틴 반광 페인트',
    enName: 'Satin Semi-Gloss Paint',
    desc: '손때와 오염에 강하고 닦기 쉬운 도어 전용 반광 페인트',
    icon: '🚪',
  },
];

export const SURFACE_MATERIAL_MAP: Record<string, { id: string; label: string; enName: string; desc: string; icon: string; badge?: string }[]> = {
  wall: [
    {
      id: 'silk_wallpaper',
      label: '실크 벽지',
      enName: 'Silk Wallpaper',
      desc: '고급스러운 은은한 광택과 입체감, 뛰어난 내구성과 오염 방지 코팅',
      icon: '✨',
      badge: '인기',
    },
    {
      id: 'standard_wallpaper',
      label: '일반 합지 벽지',
      enName: 'Standard Wallpaper',
      desc: '친환경 천연 펄프 통기성과 실속 있는 가성비의 내추럴 종이 합지',
      icon: '📜',
      badge: '실속',
    },
    {
      id: 'matte_paint',
      label: '프리미엄 무광 페인트',
      enName: 'Premium Matte Paint',
      desc: '붓자국 없는 매끄럽고 모던한 유럽풍 최고급 친환경 수성 무광 도색',
      icon: '🎨',
      badge: '추천',
    },
  ],
  floor: [
    {
      id: 'wood_timber',
      label: '내추럴 원목 마루',
      enName: 'Natural Wood Flooring',
      desc: '원목의 따뜻하고 포근한 질감과 세련된 헤링본/플랭크 원목 바닥재',
      icon: '🪵',
      badge: '추천',
    },
    {
      id: 'marble_tile',
      label: '대리석 & 포세린 타일',
      enName: 'Porcelain & Marble Tile',
      desc: '비앙코 카라라 대리석 마블링 및 고급스러운 대형 무광 포세린 타일',
      icon: '🏛️',
      badge: '럭셔리',
    },
    {
      id: 'micro_cement',
      label: '마이크로시멘트',
      enName: 'Seamless Micro-Cement',
      desc: '이음매 없이 미니멀하고 시크한 유럽풍 모놀리식 시멘트 미장 바닥',
      icon: '🏢',
      badge: '모던',
    },
  ],
  ceiling: [
    {
      id: 'matte_paint',
      label: '천장 무광 페인트',
      enName: 'Ultra-Matte Ceiling Paint',
      desc: '빛 반사 없이 공간을 더 높고 쾌적하게 보이는 평탄한 무광 도색',
      icon: '🎨',
      badge: '추천',
    },
    {
      id: 'silk_wallpaper',
      label: '천장 실크 도배',
      enName: 'Ceiling Silk Wallpaper',
      desc: '미세한 텍스처로 고급스럽고 정돈된 최고급 천장 실크 도배 마감',
      icon: '✨',
      badge: '인기',
    },
    {
      id: 'standard_wallpaper',
      label: '천장 일반 합지',
      enName: 'Standard Ceiling Wallpaper',
      desc: '통기성이 우수하고 경제적인 천장 전용 화이트 종이 합지',
      icon: '📜',
      badge: '실속',
    },
  ],
  accent_wall: [
    {
      id: 'brick',
      label: '벽돌 / 브릭 타일',
      enName: 'Vintage / White Brick Tile',
      desc: '클래식한 감성의 빈티지 파벽돌 및 모던 화이트 브릭 포인트 아트월',
      icon: '🧱',
      badge: '포인트',
    },
    {
      id: 'marble_tile',
      label: '대형 대리석 패널',
      enName: 'Large Marble Slab Accent',
      desc: '호텔 라운지 감성의 웅장하고 럭셔리한 대형 대리석/포세린 아트월',
      icon: '🏛️',
      badge: '럭셔리',
    },
    {
      id: 'wood_timber',
      label: '입체 템바보드 / 원목 루버',
      enName: 'Tambour Wood Slat Board',
      desc: '감각적인 세로 라인 템바보드와 은은한 간접조명이 어우러진 포인트월',
      icon: '🪵',
      badge: '트렌드',
    },
  ],
  molding_doors: [
    {
      id: 'matte_paint',
      label: '모던 무광 도색',
      enName: 'Matte Molding Paint',
      desc: '벽면과 깔끔하게 일체화되는 미니멀 무광 몰딩 & 도어 도색 마감',
      icon: '🎨',
      badge: '추천',
    },
    {
      id: 'wood_timber',
      label: '내추럴 우드 래핑',
      enName: 'Natural Wood Timber Finish',
      desc: '자연스러운 나뭇결이 살아있는 포근한 원목 인테리어 필름 래핑',
      icon: '🪵',
      badge: '내추럴',
    },
    {
      id: 'semi_gloss_paint',
      label: '새틴 반광 페인트',
      enName: 'Satin Semi-Gloss Paint',
      desc: '손때와 생활 오염에 강하고 닦기 쉬운 도어 전용 반광 페인트',
      icon: '🚪',
      badge: '실용',
    },
  ],
};

export const PAINT_COLOR_OPTIONS = [
  {
    id: 'pure_white',
    label: '퓨어 크림 화이트',
    enName: 'Pure Cream White',
    hex: '#F8F8F6',
    border: '#E2E8F0',
    desc: '화사하고 정갈하며 공간을 가장 넓어 보이게 하는 베이직 화이트',
  },
  {
    id: 'warm_beige',
    label: '웜 베이지 & 오트밀',
    enName: 'Warm Beige & Oatmeal',
    hex: '#EADBC8',
    border: '#D4C3AC',
    desc: '따뜻한 햇살을 머금은 포근하고 아늑한 감성의 뉴트럴 베이지',
  },
  {
    id: 'light_grey',
    label: '모던 라이트 그레이',
    enName: 'Modern Light Grey',
    hex: '#D1D5DB',
    border: '#9CA3AF',
    desc: '세련되고 군더더기 없는 도회적인 모던 쿨그레이',
  },
  {
    id: 'dark_charcoal',
    label: '차콜 & 다크 슬레이트',
    enName: 'Charcoal & Slate Black',
    hex: '#2D3748',
    border: '#1A202C',
    desc: '묵직하고 감각적인 깊이감을 주는 최고급 다크 모던 톤',
  },
  {
    id: 'sage_green',
    label: '세이지 & 올리브 그린',
    enName: 'Sage & Olive Green',
    hex: '#A3B18A',
    border: '#588157',
    desc: '마음을 편안하게 해주는 차분하고 싱그러운 자연의 보태니컬 톤',
  },
  {
    id: 'classic_navy',
    label: '클래식 네이비 & 딥블루',
    enName: 'Classic Navy & Deep Ocean',
    hex: '#1E3A8A',
    border: '#172554',
    desc: '기품 있고 신뢰감을 주는 럭셔리 포인트 딥 네이비',
  },
  {
    id: 'natural_oak',
    label: '내추럴 웜 오크',
    enName: 'Natural Warm Oak Wood',
    hex: '#C89D72',
    border: '#A57C52',
    desc: '자연스러운 나뭇결이 살아있는 포근한 골든 오크 원목 톤',
  },
  {
    id: 'deep_walnut',
    label: '딥 월넛 & 에스프레소',
    enName: 'Deep Walnut & Espresso',
    hex: '#5C4033',
    border: '#3E2723',
    desc: '중후하고 클래식한 품격을 선사하는 짙은 다크 월넛 브라운',
  },
];

export const PAINT_QUICK_PRESETS = [
  {
    id: 'white_herringbone',
    label: '화이트 실크 & 헤링본 우드',
    icon: '✨',
    desc: '크림 화이트 실크 벽지 + 헤링본 원목 마루의 베스트셀러 조합',
    configs: {
      wall: { material: 'silk_wallpaper', color: 'pure_white' },
      floor: { material: 'wood_timber', color: 'natural_oak' },
      ceiling: { material: 'matte_paint', color: 'pure_white' },
      accent_wall: { material: 'wood_timber', color: 'natural_oak' },
      molding_doors: { material: 'matte_paint', color: 'pure_white' },
    },
  },
  {
    id: 'beige_porcelain',
    label: '웜베이지 실크 & 대리석 타일',
    icon: '🏛️',
    desc: '따뜻한 오트밀 실크 벽지 + 럭셔리 비앙코 대리석/포세린 바닥',
    configs: {
      wall: { material: 'silk_wallpaper', color: 'warm_beige' },
      floor: { material: 'marble_tile', color: 'pure_white' },
      ceiling: { material: 'matte_paint', color: 'warm_beige' },
      accent_wall: { material: 'marble_tile', color: 'pure_white' },
      molding_doors: { material: 'matte_paint', color: 'warm_beige' },
    },
  },
  {
    id: 'white_brick_cafe',
    label: '화이트 브릭 & 일반 합지',
    icon: '🧱',
    desc: '감성 카페 스타일 화이트 파벽돌 아트월 + 일반 합지 벽지 + 원목 바닥',
    configs: {
      wall: { material: 'standard_wallpaper', color: 'pure_white' },
      floor: { material: 'wood_timber', color: 'natural_oak' },
      ceiling: { material: 'matte_paint', color: 'pure_white' },
      accent_wall: { material: 'brick', color: 'pure_white' },
      molding_doors: { material: 'matte_paint', color: 'natural_oak' },
    },
  },
  {
    id: 'modern_charcoal',
    label: '모던 차콜 & 그레이 타일',
    icon: '🖤',
    desc: '도시적이고 시크한 다크 차콜 무광 페인트 + 라이트 그레이 바닥재',
    configs: {
      wall: { material: 'matte_paint', color: 'dark_charcoal' },
      floor: { material: 'micro_cement', color: 'light_grey' },
      ceiling: { material: 'matte_paint', color: 'pure_white' },
      accent_wall: { material: 'standard_wallpaper', color: 'light_grey' },
      molding_doors: { material: 'matte_paint', color: 'dark_charcoal' },
    },
  },
];

// 🛋️ 가구 & 소품 교체 도구 전용 8대 디자인 양식
export const REPLACE_FURNITURE_STYLES = [
  {
    id: 'modern',
    label: '모던 & 미니멀',
    enName: 'Modern Minimalist',
    icon: '🛋️',
    badge: '인기',
    desc: '간결하고 정제된 직선 라인과 세련된 감성의 현대적 디자인',
    promptKeyword: 'sleek minimalist contemporary aesthetic with clean geometric lines, slim proportions, and functional elegance',
  },
  {
    id: 'hanok',
    label: '전통 한옥 & 오리엔탈',
    enName: 'Traditional Hanok & Oriental',
    icon: '🏯',
    badge: '전통미',
    desc: '고즈넉한 한국 전통 목가구, 창살 살림과 단아한 좌식/입식 조화',
    promptKeyword: 'traditional Korean Hanok aesthetic, exquisite natural wood craft, subtle joinery details, warm oriental tranquility',
  },
  {
    id: 'classic',
    label: '프렌치 & 클래식 유럽풍',
    enName: 'French Classic & European Royal',
    icon: '👑',
    badge: '우아함',
    desc: '앤틱 몰딩과 우아한 곡선미, 풍성한 볼륨감의 유러피안 귀족 감성',
    promptKeyword: 'grand European neoclassical and French provincial furniture, subtle ornamental carvings, gracefully curved cabriole legs',
  },
  {
    id: 'scandinavian',
    label: '북유럽 스칸디나비안',
    enName: 'Nordic Scandinavian',
    icon: '🌲',
    badge: '스테디',
    desc: '밝고 따뜻한 원목과 자연 친화적 패브릭, 아늑한 휘게 라이프스타일',
    promptKeyword: 'Scandinavian Nordic hygge furniture, light warm oak accents, organic functional silhouettes, cozy inviting feel',
  },
  {
    id: 'luxury',
    label: '호텔 라운지 & 럭셔리',
    enName: 'Luxury Hotel Lounge',
    icon: '✨',
    badge: '하이엔드',
    desc: '5성급 호텔 스위트룸 감성의 웅장하고 품격 높은 하이엔드 조형미',
    promptKeyword: 'high-end 5-star boutique hotel lounge furniture, tailored bespoke craftsmanship, opulent proportions, brass metal accents',
  },
  {
    id: 'mid_century',
    label: '미드센추리 모던',
    enName: 'Mid-Century Modern',
    icon: '📻',
    badge: '트렌드',
    desc: '1950~60년대 디자인 황금기 감성의 레트로 유기적 곡선과 조형미',
    promptKeyword: 'authentic 1950s Mid-Century Modern iconic furniture, tapered angled peg legs, sculptural organic curves, retro charm',
  },
  {
    id: 'japandi',
    label: '내추럴 재팬디 & 우디',
    enName: 'Natural Japandi & Zen',
    icon: '🎋',
    badge: '힐링',
    desc: '일본의 와비사비와 북유럽 미니멀리즘이 조화된 차분한 힐링 가구',
    promptKeyword: 'Japandi wabi-sabi fusion, earthy serene simplicity, low-profile relaxed posture, clean craftsmanship with raw warmth',
  },
  {
    id: 'industrial',
    label: '인더스트리얼 & 빈티지',
    enName: 'Industrial & Vintage Loft',
    icon: '⚙️',
    badge: '개성',
    desc: '블랙 메탈 프레임과 에이징 가죽/우드가 어우러진 뉴욕 로프트 무드',
    promptKeyword: 'industrial urban loft furniture, distressed aged texture, blackened steel structural framing, bold rugged character',
  },
];

// 🎨 가구 & 소품 교체 도구 전용 8대 컬러 팔레트
export const REPLACE_FURNITURE_COLORS = [
  {
    id: 'off_white',
    label: '오프화이트 / 크림',
    enName: 'Off-White & Cream',
    hex: '#F8F8F6',
    border: '#CBD5E1',
    textColor: '#1E293B',
    desc: '어떤 공간에도 밝고 화사하게 녹아드는 깨끗한 크림 화이트',
  },
  {
    id: 'warm_cognac',
    label: '웜 코냑 / 테라코타',
    enName: 'Warm Cognac & Terracotta',
    hex: '#C86D43',
    textColor: '#FFFFFF',
    desc: '고급스럽고 깊이 있는 브라운 오렌지 빛 테라코타 & 코냑 톤',
  },
  {
    id: 'charcoal_grey',
    label: '모던 차콜 / 다크그레이',
    enName: 'Modern Charcoal & Slate',
    hex: '#334155',
    textColor: '#FFFFFF',
    desc: '도시적이고 시크한 무게감으로 공간의 중심을 잡아주는 딥 차콜',
  },
  {
    id: 'sage_green',
    label: '세이지 그린 / 올리브',
    enName: 'Sage Green & Soft Olive',
    hex: '#657E6B',
    textColor: '#FFFFFF',
    desc: '자연의 싱그러움과 편안한 휴식을 선사하는 감성적인 뮤트 그린',
  },
  {
    id: 'warm_beige',
    label: '소프트 웜베이지 / 오트밀',
    enName: 'Soft Warm Beige & Oatmeal',
    hex: '#E5D9C5',
    border: '#D1C4B0',
    textColor: '#1E293B',
    desc: '따스하고 온화한 분위기를 연출하는 클래식 뉴트럴 오트밀',
  },
  {
    id: 'espresso_brown',
    label: '딥 에스프레소 / 월넛',
    enName: 'Deep Espresso & Walnut',
    hex: '#4A2E1B',
    textColor: '#FFFFFF',
    desc: '중후하고 기품 있는 프리미엄 다크 초콜릿 월넛 브라운',
  },
  {
    id: 'midnight_navy',
    label: '미드나잇 네이비',
    enName: 'Midnight Navy & Indigo',
    hex: '#1E293B',
    textColor: '#FFFFFF',
    desc: '고급 호텔 라운지의 세련되고 세련된 모던 인디고 네이비',
  },
  {
    id: 'butter_yellow',
    label: '버터 옐로우 / 샌드',
    enName: 'Butter Yellow & Warm Sand',
    hex: '#FDE68A',
    border: '#FBBF24',
    textColor: '#1E293B',
    desc: '공간을 화사하고 경쾌하게 비추는 부드러운 소프트 버터 옐로우',
  },
];

// 🧵 가구 & 소품 교체 도구 전용 4대 프리미엄 소재 & 질감
export const REPLACE_FURNITURE_MATERIALS = [
  {
    id: 'fabric_linen',
    label: '프리미엄 패브릭 & 린넨',
    enName: 'Premium Woven Fabric & Linen',
    icon: '🧵',
    badge: '인기',
    desc: '통기성이 우수하고 촘촘한 직조감으로 자연스럽고 포근한 촉감',
    promptKeyword: 'high-density premium woven textile and natural breathable linen upholstery, rich tactile weave texture, soft matte finish',
  },
  {
    id: 'italian_leather',
    label: '최고급 이태리 천연 가죽',
    enName: 'Luxury Top-Grain Italian Leather',
    icon: '🛋️',
    badge: '추천',
    desc: '은은한 새틴 광택과 매끄러운 천연 가죽의 깊이 있고 중후한 품격',
    promptKeyword: 'authentic supple Italian top-grain leather upholstery, subtle natural grain pores, elegant tailored stitching, soft luxurious sheen',
  },
  {
    id: 'boucle_velvet',
    label: '포근한 부클레 & 벨벳',
    enName: 'Cozy Bouclé & Velvet',
    icon: '☁️',
    badge: '트렌드',
    desc: '입체적이고 몽글몽글한 볼륨감의 트렌디 부클레와 실키한 벨벳',
    promptKeyword: 'high-end textured looped bouclé fabric combined with soft silky velvet, cozy plush tactile depth, high-fashion designer look',
  },
  {
    id: 'wood_rattan',
    label: '내추럴 원목 & 라탄/우드',
    enName: 'Natural Solid Wood & Cane Rattan',
    icon: '🪵',
    badge: '내추럴',
    desc: '살아있는 나뭇결의 솔리드 오크/월넛 원목과 수공예 케인 라탄',
    promptKeyword: 'handcrafted solid oak or walnut timber framing with artisan woven French cane rattan inserts, organic natural grain texture',
  },
];

const ROOM_OPTIONS = [
  { id: 'kitchen', label: '주방', labelJa: 'キッチン', labelEn: 'Kitchen', labelEs: 'Cocina', icon: '🍳' },
  { id: 'living_room', label: '거실', labelJa: 'リビング', labelEn: 'Living Room', labelEs: 'Salón', icon: '🛋️' },
  { id: 'under_stairs', label: '계단 밑 공간', labelJa: '階段下スペース', labelEn: 'Under-Stairs', labelEs: 'Bajo Escalera', icon: '🪜' },
  { id: 'home_office', label: '홈오피스', labelJa: 'ホームオフィス', labelEn: 'Home Office', labelEs: 'Oficina en Casa', icon: '☎️' },
  { id: 'bedroom', label: '침실', labelJa: 'ベッドルーム', labelEn: 'Bedroom', labelEs: 'Dormitorio', icon: '🛏️' },
  { id: 'kids_room', label: '아이들방', labelJa: '子供部屋', labelEn: 'Kids Room', labelEs: 'Habitación Infantil', icon: '🧸' },
  { id: 'bathroom', label: '욕실', labelJa: 'バスルーム', labelEn: 'Bathroom', labelEs: 'Baño', icon: '🛁' },
  { id: 'dining_room', label: '다이닝룸 / 식당', labelJa: 'ダイニング', labelEn: 'Dining Room', labelEs: 'Comedor', icon: '🍴' },
  { id: 'coffee_shop', label: '카페 / 커피숍', labelJa: 'カフェ・喫茶', labelEn: 'Coffee Shop', labelEs: 'Cafetería', icon: '☕' },
  { id: 'study_room', label: '서재 / 공부방', labelJa: '書斎・勉強部屋', labelEn: 'Study Room', labelEs: 'Sala de Estudio', icon: '✏️' },
  { id: 'restaurant', label: '레스토랑', labelJa: 'レストラン', labelEn: 'Restaurant', labelEs: 'Restaurante', icon: '🧑‍🍳' },
  { id: 'gaming_room', label: '게이밍 룸', labelJa: 'ゲーミングルーム', labelEn: 'Gaming Room', labelEs: 'Sala de Juegos', icon: '🎮' },
  { id: 'office', label: '오피스 / 사무실', labelJa: 'オフィス・事務所', labelEn: 'Office', labelEs: 'Oficina', icon: '💺' },
];

const STYLE_OPTIONS = [
  { id: 'modern', label: '모던', labelJa: 'モダン', labelEn: 'Modern', labelEs: 'Moderno', image: '/showcase_modern_living.png' },
  { id: 'minimal', label: '미니멀', labelJa: 'ミニマル', labelEn: 'Minimalist', labelEs: 'Minimalista', image: '/showcase_bedroom.png' },
  { id: 'scandinavian', label: '북유럽', labelJa: '北欧スタイル', labelEn: 'Scandinavian', labelEs: 'Escandinavo', image: '/gallery_05_nordic_living_wide_1787467117362.png' },
  { id: 'japandi', label: '재팬디', labelJa: 'ジャパンディ', labelEn: 'Japandi', labelEs: 'Japandi', image: '/gallery_08_japandi_bedroom_wide_1787467164852.png' },
  { id: 'hotel_lounge', label: '호텔 럭셔리', labelJa: 'ホテルライク', labelEn: 'Hotel Lounge Luxury', labelEs: 'Hotel de Lujo', image: '/living_room_luxury.png' },
  { id: 'cyberpunk', label: '네온 사이버펑크', labelJa: 'サイバーパンク', labelEn: 'Cyberpunk Neon', labelEs: 'Ciberpunk Neón', image: '/living_room_cyberpunk.png' },
  { id: 'bohemian', label: '보헤미안', labelJa: 'ボヘミアン', labelEn: 'Bohemian', labelEs: 'Bohemio', image: '/showcase_bohemian.png' },
  { id: 'industrial', label: '인더스트리얼', labelJa: 'インダストリアル', labelEn: 'Industrial', labelEs: 'Industrial', image: '/gallery_04_industrial_loft_living_wide_1787467098855.png' },
  { id: 'mid_century', label: '미드센추리', labelJa: 'ミッドセンチュリー', labelEn: 'Mid-Century Modern', labelEs: 'Mid-Century', image: '/gallery_06_midcentury_living_wide_1787467133885.png' },
  { id: 'hanok', label: '한옥 레트로', labelJa: '韓屋レトロ', labelEn: 'Korean Hanok Retro', labelEs: 'Hanok Retro', image: '/hanok_retro_sample.png' },
  { id: 'classic', label: '유러피안 클래식', labelJa: 'クラシック', labelEn: 'European Classic', labelEs: 'Clásico Europeo', image: '/gallery_07_modern_master_bedroom_wide_1787467148091.png' },
  { id: 'botanical', label: '보태니컬 플랜테리어', labelJa: 'ボタニカル', labelEn: 'Botanical Planterior', labelEs: 'Botánico', image: '/garden_showcase_after.png' },
  { id: 'tropical_resort', label: '트로피컬 리조트', labelJa: 'トロピカルリゾート', labelEn: 'Tropical Resort', labelEs: 'Resort Tropical', image: '/garden_sample_01.png' },
  { id: 'bauhaus', label: '바우하우스', labelJa: 'バウハウス', labelEn: 'Bauhaus', labelEs: 'Bauhaus', image: '/bauhaus_style_sample.png' },
  { id: 'art_deco', label: '아르데코', labelJa: 'アールデコ', labelEn: 'Art Deco', labelEs: 'Art Déco', image: '/cozy_home_living.png' },
  { id: 'provence', label: '프렌치 프로방스', labelJa: 'プロヴァンス', labelEn: 'French Provence', labelEs: 'Provenzal', image: '/cozy_home_bedroom.png' },
  { id: 'modern_farmhouse', label: '모던 팜하우스', labelJa: 'モダンファームハウス', labelEn: 'Modern Farmhouse', labelEs: 'Granja Moderna', image: '/cozy_home_dining.png' },
  { id: 'coastal', label: '코스탈 비치', labelJa: 'コースタルビーチ', labelEn: 'Coastal Beach', labelEs: 'Costero', image: '/cozy_home_balcony.png' },
  { id: 'urban_woody', label: '우디 어반', labelJa: 'ウッディアーバン', labelEn: 'Urban Woody', labelEs: 'Madera Urbana', image: '/floor_herringbone_after.png' },
  { id: 'monochrome', label: '모노크롬 흑백', labelJa: 'モノクローム', labelEn: 'Monochrome', labelEs: 'Monocromático', image: '/gallery_03_minimalist_living_wide_1787467081200.png' },
];

export const EXTERIOR_STYLE_OPTIONS = [
  {
    id: 'korea_hanok',
    country: '한국',
    flag: '🇰🇷',
    label: '한국 모던 한옥',
    enName: 'K-Modern Hanok',
    desc: '전통 기와 처마선, 원목 서까래와 대청마루, 파노라마 통창이 조화된 모던 한옥',
    image: '/exterior_style_korea_hanok.jpg',
    prompt: 'K-Modern Hanok architectural style: elegant traditional curved dark Giwa tile rooflines, exposed natural pine timber posts and beams, floor-to-ceiling panoramic glass windows, granite stone foundation terrace steps, and refined manicured Korean garden landscaping',
  },
  {
    id: 'japan_zen',
    country: '일본',
    flag: '🇯🇵',
    label: '일본 젠 모던',
    enName: 'Japanese Zen Modern',
    desc: '야키스기 탄화목 외벽, 미니멀 처마, 대나무와 자갈 젠 정원',
    image: '/exterior_style_japan_zen.jpg',
    prompt: 'Japanese Zen Modern architectural style: charred black Yakisugi wood siding, minimalist low-profile eaves, slim black metal frames, peaceful dry gravel Zen rock garden with bonsai pine and stone lanterns',
  },
  {
    id: 'nordic_scandi',
    country: '북유럽',
    flag: '🇳🇴',
    label: '북유럽 스칸디나비안',
    enName: 'Nordic Scandinavian House',
    desc: 'A자형 경사 박공지붕, 내추럴 원목 사이딩, 침엽수 조경',
    image: '/exterior_style_nordic_scandi.jpg',
    prompt: 'Nordic Scandinavian architectural style: steep gabled charcoal zinc roofline, vertical light natural timber wood siding, expansive double-height glass facade, warm outdoor deck sconces, surrounded by wild grasses and pine trees',
  },
  {
    id: 'mediterranean',
    country: '지중해',
    flag: '🇬🇷',
    label: '지중해 산토리니 & 스패니시',
    enName: 'Mediterranean Coastal Villa',
    desc: '순백색 스타코 외벽, 테라코타 기와, 아치형 창호와 발코니',
    image: '/exterior_style_mediterranean.jpg',
    prompt: 'Mediterranean Spanish & Greek coastal villa architectural style: brilliant whitewashed stucco walls, warm terracotta barrel roof tiles, romantic arched windows and doorways with wrought iron balconies, vibrant magenta bougainvillea flower vines, and natural limestone stone patio',
  },
  {
    id: 'us_modern_brick',
    country: '미국',
    flag: '🇺🇸',
    label: '미국 브릭 & 인더스트리얼',
    enName: 'American Modern Brick & Loft',
    desc: '붉은 파벽돌, 블랙 메탈 빔, 대형 격자 스틸 창호',
    image: '/exterior_style_us_modern_brick.jpg',
    prompt: 'American Modern Industrial Brick architectural style: rich textured red brick facade, matte black steel structural beams, expansive multi-pane black factory-style metal windows, sleek wooden front porch canopy, and clean architectural concrete planters',
  },
  {
    id: 'french_chateau',
    country: '프랑스',
    flag: '🇫🇷',
    label: '프랑스 클래식 샤토',
    enName: 'French Classic Chateau',
    desc: '라임스톤 석재 파사드, 만사르드 지붕, 우아한 대칭 창호',
    image: '/exterior_style_french_chateau.jpg',
    prompt: 'French Classic Parisian Chateau architectural style: pale limestone ashlar masonry facade, dark zinc Mansard roof with ornate classical dormers, tall symmetrical French casement windows with delicate iron railings, and formal manicured boxwood parterre gardens',
  },
  {
    id: 'british_tudor',
    country: '영국',
    flag: '🇬🇧',
    label: '영국 코티지 & 튜더',
    enName: 'British Tudor Cottage',
    desc: '허니 라임스톤 석재, 다크 하프팀버 목조, 잉글리시 가든',
    image: '/exterior_style_british_tudor.jpg',
    prompt: 'British Cotswolds Tudor Cottage architectural style: warm honey limestone walls, dark exposed rustic timber beams, steep gabled slate roof with brick chimneys, leaded diamond lattice windows, and lush climbing English roses and wild cottage garden',
  },
  {
    id: 'swiss_chalet',
    country: '스위스',
    flag: '🇨🇭',
    label: '스위스 알파인 샬레',
    enName: 'Swiss Alpine Chalet',
    desc: '통나무 원목 발코니, 넓은 박공 처마, 석재 기단과 꽃 장식',
    image: '/exterior_style_swiss_chalet.jpg',
    prompt: 'Swiss Alpine Chalet architectural style: rich dark weathered timber log walls, wide overhanging gabled eaves with carved brackets, continuous wooden balconies filled with cascading red geranium flowers, heavy natural alpine stone foundation, and scenic mountain atmosphere',
  },
  {
    id: 'bali_resort',
    country: '발리',
    flag: '🇮🇩',
    label: '발리 트로피컬 풀빌라',
    enName: 'Balinese Tropical Villa',
    desc: '초가 파빌리온 지붕, 티크 목재 기둥, 야자수와 인피니티 풀',
    image: '/exterior_style_bali_resort.jpg',
    prompt: 'Balinese Tropical Luxury Villa architectural style: open-air teak wood pavilion structure, pitched thatched Alang-alang roofing, dark volcanic stone cascading water wall, expansive wooden sun deck adjacent to a private infinity pool, surrounded by lush monstera, palms, and frangipani blossoms',
  },
  {
    id: 'german_bauhaus',
    country: '독일',
    flag: '🇩🇪',
    label: '독일 바우하우스 모더니즘',
    enName: 'German Bauhaus Modern',
    desc: '기하학적 큐빅 볼륨, 수평 리본 글라스, 기능주의 백색 파사드',
    image: '/exterior_style_german_bauhaus.jpg',
    prompt: 'German Bauhaus Modernist architectural style: pure minimalist white cubic volumes, flat roof terrace with black tubular steel railings, continuous horizontal ribbon strip windows, sleek cantilevered concrete entrance canopy, and minimalist landscaped lawns',
  },
];

export const GARDEN_STYLE_OPTIONS = [
  {
    id: 'garden_korean',
    country: '한국',
    flag: '🇰🇷',
    label: '한국 전통 & 모던 정원',
    enName: 'Korean Modern Traditional Garden',
    desc: '소나무와 자연석 디딤길, 고풍스러운 기와 담장과 석등',
    image: '/garden_style_korean.jpg',
    prompt: 'Korean Modern Traditional Garden landscape: elegant sculptural Korean red pine trees, natural granite stepping stones meandering through mossy green lawn, traditional curved Giwa tile low stone walls, stone lanterns, and bamboo water features',
  },
  {
    id: 'garden_japanese_zen',
    country: '일본',
    flag: '🇯🇵',
    label: '일본 젠 & 스톤 정원',
    enName: 'Japanese Zen Rock Garden (Karesansui)',
    desc: '백자갈 물결, 젠 바위, 붉은 단풍나무와 츠쿠바이 물받이',
    image: '/garden_style_japanese_zen.jpg',
    prompt: 'Japanese Zen Rock Garden style: pristine raked white gravel ripples, mossy sculptural rock arrangements, Japanese red maple tree, bamboo tsukubai water fountain, and cedar wood decking',
  },
  {
    id: 'garden_english_cottage',
    country: '영국',
    flag: '🇬🇧',
    label: '영국식 코티지 플라워 정원',
    enName: 'English Cottage Flower Garden',
    desc: '만개한 덩굴장미, 보랏빛 라벤더, 조약돌 산책로와 우드 벤치',
    image: '/garden_style_english_cottage.jpg',
    prompt: 'English Cottage Flower Garden style: romantic overflowing perennial flower borders with climbing roses, purple lavender, blue delphiniums, and white hydrangeas along a winding cobblestone pathway',
  },
  {
    id: 'garden_balinese_tropical',
    country: '발리',
    flag: '🇮🇩',
    label: '발리 트로피컬 리조트 정원',
    enName: 'Balinese Tropical Resort Oasis',
    desc: '울창한 야자수, 몬스테라, 화산석 분수 벽과 이국적 풀빌라',
    image: '/garden_style_balinese_tropical.jpg',
    prompt: 'Balinese Tropical Resort Garden style: towering royal palm trees, lush monstera and frangipani blossoms, volcanic stone cascading waterfall, rich teak sun deck with loungers, and exotic oasis atmosphere',
  },
  {
    id: 'garden_mediterranean_tuscan',
    country: '지중해',
    flag: '🇬🇷',
    label: '지중해 토스카나 파티오',
    enName: 'Mediterranean Tuscan Stone Patio',
    desc: '테라코타 대형 화분, 올리브 나무, 천연 석재 파티오와 부겐빌레아',
    image: '/garden_style_mediterranean_tuscan.jpg',
    prompt: 'Mediterranean Tuscan Patio Garden style: warm terracotta planters, ancient gnarled olive trees, limestone stone slab patio, climbing magenta bougainvillea vines, and aromatic rosemary herbs',
  },
  {
    id: 'garden_nordic_scandi',
    country: '북유럽',
    flag: '🇳🇴',
    label: '북유럽 스칸디나비안 가든',
    enName: 'Nordic Scandinavian Forest & Deck',
    desc: '자작나무와 침엽수림, 내추럴 원목 데크 테라스와 야외 조명',
    image: '/garden_style_nordic_scandi.jpg',
    prompt: 'Nordic Scandinavian Landscape Garden style: vertical timber deck patio, silver birch trees, wild evergreen pines and ornamental fescue grasses, minimalist black outdoor lighting, and rugged natural rocks',
  },
  {
    id: 'garden_modern_minimal',
    country: '모던',
    flag: '🏙️',
    label: '모던 미니멀 럭셔리 라운지',
    enName: 'Modern Luxury Minimalist Patio',
    desc: '기하학적 수평 잔디, 노출 콘크리트 플랜터, 세련된 아웃도어 가구',
    image: '/garden_style_modern_minimal.png',
    prompt: 'Modern Minimalist Luxury Patio Garden style: clean architectural geometric lawn lines, smooth cast-concrete planters with architectural grasses, built-in recessed deck lighting, and sleek modular outdoor furniture',
  },
  {
    id: 'garden_american_resort',
    country: '미국',
    flag: '🇺🇸',
    label: '아메리칸 리조트 & 코스탈 정원',
    enName: 'American Resort & Coastal Garden',
    desc: '시원한 잔디 마당, 코스탈 야외 다이닝 파티오와 바베큐 라운지',
    image: '/garden_style_american_resort.png',
    prompt: 'American Coastal Resort Garden style: spacious manicured green lawn, outdoor summer kitchen and dining patio under strings of warm bistro lights, coastal shrubs, and welcoming resort ambiance',
  },
];

export const PARTY_STYLE_OPTIONS = [
  {
    id: 'party_birthday',
    icon: '🎂',
    label: '생일 파티',
    labelJa: 'バースデーパーティー',
    labelEn: 'Birthday Party',
    labelEs: 'Fiesta de Cumpleaños',
    enName: 'Birthday Party',
    desc: "풍선 아치 가랜드, 'Happy Birthday' 네온 레터링, 케이크 파티 테이블",
    descJa: 'バルーンアーチ、HAPPY BIRTHDAYネオン、ケーキ＆シャンパン演出',
    descEn: "Balloon arch garland, 'Happy Birthday' neon sign, celebratory cake & champagne",
    descEs: "Guirnalda de globos, neón 'Happy Birthday', tarta y champán",
    image: '/party_birthday_after.png',
    badge: '인기 1위',
    badgeJa: '人気1位',
    badgeEn: 'Top #1',
    badgeEs: 'Nº 1 Popular',
  },
  {
    id: 'party_valentine',
    icon: '💝',
    label: '발렌타인데이 & 화이트데이',
    labelJa: 'バレンタイン＆ホワイトデー',
    labelEn: "Valentine's & White Day",
    labelEs: 'San Valentín y Aniversario',
    enName: "Valentine's & White Day",
    desc: '핑크 & 레드 하트 풍선, 로맨틱 캔들로드, 초콜릿 & 프리미엄 와인 세팅',
    descJa: 'ハートバルーン、キャンドルロード、高級ワイン＆チョコレート',
    descEn: 'Pink & red heart balloons, candlelit walkway, wine & chocolate',
    descEs: 'Globos de corazón, camino de velas, vino de lujo y chocolate',
    image: '/party_valentine_after.png',
    badge: '로맨틱',
    badgeJa: 'ロマンチック',
    badgeEn: 'Romantic',
    badgeEs: 'Romántico',
  },
  {
    id: 'party_easter',
    icon: '🥚',
    label: '부활절 & 봄맞이 파티',
    labelJa: 'イースター＆春のパーティー',
    labelEn: 'Easter & Spring Gathering',
    labelEs: 'Pascua y Fiesta de Primavera',
    enName: 'Easter & Spring Gathering',
    desc: '파스텔 에그 오너먼트, 화사한 봄꽃 튤립 플라워 화병, 싱그러운 피크닉 감성',
    descJa: 'パステルエッグ飾り、春のチューリップ花瓶、ピクニック気分',
    descEn: 'Pastel egg ornaments, fresh spring tulips in vases, cheerful picnic vibe',
    descEs: 'Huevos de pascua pastel, tulipanes frescos y ambiente de picnic',
    image: '/party_easter_after.png',
    badge: '화사한 봄',
    badgeJa: '華やかな春',
    badgeEn: 'Bright Spring',
    badgeEs: 'Primavera',
  },
  {
    id: 'party_proposal',
    icon: '💍',
    label: '프로포즈 이벤트',
    labelJa: 'プロポーズイベント',
    labelEn: 'Romantic Proposal',
    labelEs: 'Propuesta de Matrimonio',
    enName: 'Romantic Proposal',
    desc: "'MARRY ME' 대형 발광 레터링, 붉은 장미 꽃잎 로드, 샴페인 & 다이아몬드 무드",
    descJa: 'MARRY ME大型ネオン、赤バラの花びらロード、ロマンチックキャンドル',
    descEn: "'MARRY ME' marquee sign, red rose petal aisle, romantic candles",
    descEs: "Letrero 'MARRY ME', camino de pétalos de rosa y velas románticas",
    image: '/party_proposal_after.png',
    badge: '평생의 순간',
    badgeJa: '一生の記念',
    badgeEn: 'Lifetime Moment',
    badgeEs: 'Momento Especial',
  },
  {
    id: 'party_anniversary',
    icon: '🥂',
    label: '결혼기념일 & 애니버서리',
    labelJa: '結婚記念日・アニバーサリー',
    labelEn: 'Wedding Anniversary',
    labelEs: 'Aniversario de Bodas',
    enName: 'Wedding Anniversary',
    desc: '은은한 캔들라이트 롱 테이블, 추억의 액자 갤러리월, 프리미엄 와인 바',
    descJa: 'キャンドルライトのロングテーブル、想い出のフォトウォール、ワインバー',
    descEn: 'Candlelit dining table, photo memory gallery wall, luxury wine bar',
    descEs: 'Mesa con velas, galería de fotos de recuerdo y bar de vinos',
    image: '/party_anniversary_after.png',
    badge: '럭셔리 무드',
    badgeJa: 'ラグジュアリー',
    badgeEn: 'Luxury Mood',
    badgeEs: 'Lujo',
  },
  {
    id: 'party_christmas',
    icon: '🎄',
    label: '크리스마스 & 연말 파티',
    labelJa: 'クリスマス＆忘年会',
    labelEn: 'Christmas & Year-End',
    labelEs: 'Navidad y Fin de Año',
    enName: 'Christmas & Year-End',
    desc: '반짝이는 대형 트리, 페어리 전구 조명, 홀리데이 선물박스',
    descJa: '輝く大型クリスマスツリー、フェアリーライト、ホリデープレゼント箱',
    descEn: 'Glowing grand Christmas tree, fairy lights, holiday gift boxes',
    descEs: 'Gran árbol de Navidad iluminado, luces de hadas y cajas de regalo',
    image: '/party_christmas_main.png',
    badge: '시즌 BEST',
    badgeJa: 'シーズンBEST',
    badgeEn: 'Season BEST',
    badgeEs: 'Mejor Temporada',
  },
  {
    id: 'party_halloween',
    icon: '🎃',
    label: '할로윈 파티',
    labelJa: 'ハロウィンパーティー',
    labelEn: 'Halloween Bash',
    labelEs: 'Fiesta de Halloween',
    enName: 'Halloween Bash',
    desc: '잭오랜턴 호박 조명, 미스터리 퍼플/오렌지 무드등, 위트있는 파티 데코',
    descJa: 'ジャック・オー・ランタン、紫＆オレンジのムード照明、ハロウィンデコ',
    descEn: "Carved pumpkins, mystery purple & amber mood lights, fun Halloween decor",
    descEs: 'Calabazas talladas, luces moradas y ámbar, decoración temática',
    image: '/party_halloween_after.png',
    badge: '이색 파티',
    badgeJa: 'ユニーク',
    badgeEn: 'Unique Bash',
    badgeEs: 'Fiesta Única',
  },
  {
    id: 'party_bridal',
    icon: '👰',
    label: '브라이덜 & 베이비샤워',
    labelJa: 'ブライダル＆ベビーシャワー',
    labelEn: 'Bridal & Baby Shower',
    labelEs: 'Despedida de Soltera y Baby Shower',
    enName: 'Bridal & Baby Shower',
    desc: '화이트 실크 플라워 아치, 파스텔 레이스 테이블, 감성 포토존',
    descJa: 'ホワイトシルクフラワーアーチ、パステルレーステーブル、映えフォトブース',
    descEn: 'White silk floral arch, pastel lace table runner, photobooth backdrop',
    descEs: 'Arco floral blanco, mesa de encaje pastel y rincón de fotos',
    image: '/party_bridal_after.png',
    badge: '인스타 핫플',
    badgeJa: '映えスポット',
    badgeEn: 'Instagram Trend',
    badgeEs: 'Tendencia',
  },
];

const COLOR_PALETTES = [
  { id: 'surprise', name: 'Surprise Me', nameKo: '서프라이즈 랜덤', nameJa: 'おまかせランダム', nameEs: 'Sorpréndeme', colors: ['#f43f5e', '#3b82f6', '#10b981'] },
  { id: 'amethyst', name: 'Amethyst Dream', nameKo: '아메시스트 바이올렛', nameJa: 'アメジストパープル', nameEs: 'Amatista Místico', colors: ['#8b5cf6', '#c084fc', '#f3e8ff'] },
  { id: 'millennial', name: 'Millennial Gray', nameKo: '밀레니얼 모던 그레이', nameJa: 'ミレニアルモダングレー', nameEs: 'Gris Milenial', colors: ['#64748b', '#94a3b8', '#e2e8f0'] },
  { id: 'terracotta', name: 'Terracotta Mirage', nameKo: '테라코타 웜 오렌지', nameJa: 'テラコッタウォームオレンジ', nameEs: 'Terracota Cálido', colors: ['#ea580c', '#f97316', '#ffedd5'] },
  { id: 'neon', name: 'Neon Sunset', nameKo: '네온 선셋 핑크', nameJa: 'ネオンサンセットピンク', nameEs: 'Atardecer Neón', colors: ['#ec4899', '#f43f5e', '#fde047'] },
  { id: 'classic_blue', name: 'Classic Blue', nameKo: '클래식 로열 블루', nameJa: 'クラシックロイヤルブルー', nameEs: 'Azul Clásico', colors: ['#1e3a8a', '#3b82f6', '#93c5fd'] },
  { id: 'forest_green', name: 'Forest Retreat', nameKo: '포레스트 에메랄드', nameJa: 'フォレストエメラルド', nameEs: 'Verde Bosque', colors: ['#064e3b', '#059669', '#a7f3d0'] },
  { id: 'golden_sand', name: 'Golden Sands', nameKo: '골든 샌드 럭셔리', nameJa: 'ゴールデンサンド高級ゴールド', nameEs: 'Arenas Doradas', colors: ['#78350f', '#d97706', '#fde68a'] },
];


const EXAMPLE_PHOTOS = [
  '/living_room_before.png',
  '/wall_paint_before.png',
  '/cleanup_showcase_before.png',
  '/concept_layout_before.png',
  '/exterior_showcase_before.png',
  '/garden_showcase_before.png',
  '/cozy_home_bedroom.png',
  '/cozy_home_dining.png',
];

// 기능별 맞춤형 샘플 예시 사진 리스트
const TOOL_EXAMPLE_PHOTOS: Record<string, string[]> = {
  interior: [
    '/living_room_before.png',
    '/cozy_home_bedroom.png',
    '/cozy_home_dining.png',
    '/showcase_modern_kitchen.png',
    '/showcase_modern_closet.png',
  ],
  layout: [
    '/concept_layout_living_before.png',
    '/concept_layout_before.png',
    '/showcase_kitchen.png',
    '/showcase_modern_office.png',
    '/cozy_home_living.png',
  ],
  exterior: [
    '/exterior_showcase_before.png',
    '/exterior_sample_01.png',
    '/exterior_sample_02.png',
  ],
  garden: [
    '/garden_showcase_before.png',
    '/garden_sample_01.png',
    '/garden_sample_02.png',
  ],
  cleanup: [
    '/cleanup_showcase_before.png',
    '/showcase_bedroom.png',
    '/showcase_kitchen.png',
    '/cozy_home_bedroom.png',
  ],
  paint: [
    '/wall_paint_before.png',
    '/cozy_home_dining.png',
    '/showcase_bedroom.png',
    '/showcase_modern_living.png',
  ],
  replace: [
    '/new_sofa_step0_original.png',
    '/living_room_before.png',
    '/replace_sample_bed.png',
    '/replace_sample_dining.png',
  ],
  party_room: [
    '/cozy_home_living.png',
    '/living_room_before.png',
    '/cozy_home_bedroom.png',
    '/cozy_home_dining.png',
  ],
};

// 스타일별 시안 이미지 후보 데이터베이스 (중복 없는 신규 결과물 생성용)
const STYLE_IMAGE_POOLS: Record<string, string[]> = {
  party_birthday: ['/party_birthday_after.png', '/party_birthday_after_2.png'],
  party_valentine: ['/party_valentine_after.png', '/cozy_home_bedroom.png'],
  party_easter: ['/party_easter_after.png', '/cozy_home_dining.png'],
  party_proposal: ['/party_proposal_after.png', '/living_room_after.png'],
  party_anniversary: ['/party_anniversary_after.png', '/showcase_modern_living.png'],
  party_christmas: ['/party_christmas_result.png', '/party_christmas_main.png'],
  party_halloween: ['/party_halloween_after.png', '/living_room_cyberpunk.png'],
  party_bridal: ['/party_bridal_after.png', '/gallery_07_modern_master_bedroom_wide_1787467148091.png'],
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
    '/kitchen_swap_result_1.png',
    '/showcase_kitchen_layout_v2.png',
    '/kitchen_swap_result_2.png',
    '/concept_kitchen_layout_rearranged.png',
  ],
  bedroom: [
    '/concept_layout_after.png',
    '/concept_layout_rearranged.png',
  ],
  living_room: [
    '/concept_layout_living_after1.png',
    '/concept_layout_living_after2.png',
  ],
  study: [
    '/showcase_office.png',
    '/showcase_modern_office.png',
  ],
  general: [
    '/concept_layout_after.png',
    '/concept_layout_living_after1.png',
  ],
};

const DIRECT_LAYOUT_MATCHES: Record<string, string[]> = {
  '/concept_layout_living_before.png': ['/concept_layout_living_after1.png', '/concept_layout_living_after2.png'],
  '/showcase_modern_living.png': ['/concept_layout_living_after1.png', '/concept_layout_living_after2.png'],
  '/living_room_before.png': ['/concept_layout_living_after1.png', '/concept_layout_living_after2.png'],
  '/concept_layout_before.png': ['/concept_layout_after.png', '/concept_layout_rearranged.png'],
  '/showcase_bedroom.png': ['/concept_layout_after.png', '/concept_layout_rearranged.png'],
  '/cozy_home_bedroom.png': ['/concept_layout_after.png', '/concept_layout_rearranged.png'],
  '/showcase_office.png': ['/showcase_modern_office.png', '/showcase_office.png'],
  '/showcase_modern_office.png': ['/showcase_office.png', '/showcase_modern_office.png'],
  '/showcase_kitchen.png': ['/kitchen_swap_result_1.png', '/showcase_kitchen_layout_v2.png', '/kitchen_swap_result_2.png'],
  '/showcase_modern_kitchen.png': ['/kitchen_swap_result_1.png', '/showcase_kitchen_layout_v2.png', '/kitchen_swap_result_2.png'],
  '/cozy_home_dining.png': ['/kitchen_swap_result_1.png', '/kitchen_swap_result_2.png'],
  '/kitchen_option_01.png': ['/kitchen_swap_result_1.png', '/showcase_kitchen_layout_v2.png', '/kitchen_swap_result_2.png'],
  '/kitchen_option_02.png': ['/kitchen_swap_result_1.png', '/showcase_kitchen_layout_v2.png', '/kitchen_swap_result_2.png'],
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
  replace: [
    '/sofa_hanok_exact_room_16x9.png',
    '/hanok_leather_hybrid_sofa.png',
    '/midcentury_leather_hybrid_sofa.png',
    '/classic_linen_hybrid_sofa.png',
    '/industrial_boucle_hybrid_sofa.png',
    '/new_sofa_step4_distinct_shape.png',
    '/new_sofa_step3_material.png',
    '/new_sofa_step2_color.png',
    '/new_sofa_step1_type.png',
    '/replace_sample_bed.png',
    '/replace_sample_dining.png',
  ],
  party_room: [
    '/party_christmas_result.png',
    '/party_christmas_main.png',
    '/party_birthday_after.png',
    '/party_proposal_after.png',
    '/party_valentine_after.png',
    '/party_bridal_after.png',
    '/party_anniversary_after.png',
    '/party_halloween_after.png',
    '/party_easter_after.png',
  ],
};

const getUniqueFallbackConcepts = (
  toolId: string,
  styleId: string,
  count: number,
  roomId: string,
  userImage?: string | null
): string[] => {
  let pool: string[] = [];
  if (toolId === 'interior') {
    const stylePool = STYLE_IMAGE_POOLS[styleId] || [];
    const roomPool = LAYOUT_IMAGE_POOLS[roomId] || [];
    pool = stylePool.length > 0 ? stylePool : (roomPool.length > 0 ? roomPool : ['/showcase_modern_living.png']);
  } else if (toolId === 'layout') {
    if (userImage && DIRECT_LAYOUT_MATCHES[userImage] && DIRECT_LAYOUT_MATCHES[userImage].length > 0) {
      pool = DIRECT_LAYOUT_MATCHES[userImage];
    } else {
      const roomPool = LAYOUT_IMAGE_POOLS[roomId] || LAYOUT_IMAGE_POOLS['general'] || [];
      pool = roomPool.length > 0 ? roomPool : ['/concept_layout_after.png'];
    }
  } else if (toolId === 'party_room') {
    const stylePool = STYLE_IMAGE_POOLS[styleId] || [];
    pool = stylePool.length > 0 ? stylePool : ['/party_christmas_result.png', '/party_christmas_main.png'];
  } else {
    const toolPool = TOOL_IMAGE_POOLS[toolId] || TOOL_EXAMPLE_PHOTOS[toolId] || [];
    const stylePool = STYLE_IMAGE_POOLS[styleId] || [];
    pool = [...toolPool, ...stylePool];
  }
  if (pool.length === 0) pool = ['/showcase_modern_living.png'];

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(pool[i % pool.length]);
  }
  return results;
};

// 🎬 기능별 비포 ➔ 애프터 라이브 슬라이딩 영상 애니메이션 프리뷰 컴포넌트
// 🎬 기능별 비포 ➔ 애프터 라이브 슬라이딩 및 다단계(소파 종류/색상/소재 3단계) 변환 애니메이션 컴포넌트
interface MultiStepScanState {
  activeStep: number;
  nextStep: number;
  direction: 'right' | 'left';
  pos: number;
  pauseTicks: number;
}

function AnimatedToolPreview({
  beforeImage,
  afterImage,
  title,
  badge,
  steps,
}: {
  beforeImage: string;
  afterImage: string;
  title: string;
  badge?: string;
  steps?: ToolStep[];
}) {
  // 1. 다단계(소파 3단계) 완벽 동기화 좌우 왕복 스캔 상태
  const [multiScan, setMultiScan] = useState<MultiStepScanState>({
    activeStep: 0,
    nextStep: 1,
    direction: 'right',
    pos: 0,
    pauseTicks: 0,
  });

  // 2. 일반 2단계 비포/애프터 도구용 슬라이더 위치
  const [sliderPos, setSliderPos] = useState(0);

  // 1-1. 다단계 소파 3단계 좌우 왕복 스캔 타이머
  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const SPEED = 0.9; // 부드럽고 우아한 스캔 속도 (~2.8초당 1회 스캔)
    const PAUSE_TICKS = 24; // 끝 지점 0.6초간 자연스러운 정지

    const interval = setInterval(() => {
      setMultiScan((prev) => {
        // 끝 지점 정지 카운트다운
        if (prev.pauseTicks > 0) {
          return { ...prev, pauseTicks: prev.pauseTicks - 1 };
        }

        if (prev.direction === 'right') {
          const nextPos = prev.pos + SPEED;
          if (nextPos >= 100) {
            // 오른쪽 도달: 변환 완료된 nextStep을 새로운 activeStep으로 고정하고,
            // 반대 방향(left)으로 스캔하며 그 다음 단계를 나타낼 준비 (0% 와이프로 점프 없음)
            return {
              activeStep: prev.nextStep,
              nextStep: (prev.nextStep + 1) % steps.length,
              direction: 'left',
              pos: 100,
              pauseTicks: PAUSE_TICKS,
            };
          }
          return { ...prev, pos: nextPos };
        } else {
          // direction === 'left'
          const nextPos = prev.pos - SPEED;
          if (nextPos <= 0) {
            // 왼쪽 도달: 변환 완료된 nextStep을 새로운 activeStep으로 고정하고,
            // 반대 방향(right)으로 스캔하며 그 다음 단계를 나타낼 준비 (0% 와이프로 점프 없음)
            return {
              activeStep: prev.nextStep,
              nextStep: (prev.nextStep + 1) % steps.length,
              direction: 'right',
              pos: 0,
              pauseTicks: PAUSE_TICKS,
            };
          }
          return { ...prev, pos: nextPos };
        }
      });
    }, 25);

    return () => clearInterval(interval);
  }, [steps]);

  // 2-1. 일반 2단계 비포/애프터 도구용 좌우 왕복 슬라이더 타이머
  useEffect(() => {
    if (steps && steps.length > 0) return;
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
  }, [steps]);

  // 🌟 다단계(소파 3단계 변화: 종류 ➔ 색상 ➔ 소재) 스캔 바 뒤로만 정확히 변화하는 영상 모드
  if (steps && steps.length > 0) {
    const baseImg = steps[multiScan.activeStep]?.image || steps[0].image;
    const nextImg = steps[multiScan.nextStep]?.image || steps[0].image;

    // direction === 'right': 스캔 바가 0%에서 100%로 전진. 스캔 바 왼쪽(뒤)으로 새 이미지가 열림.
    // direction === 'left': 스캔 바가 100%에서 0%로 후진. 스캔 바 오른쪽(뒤)으로 새 이미지가 열림.
    // 스캔 바가 지나가기 전(앞쪽 영역)은 절대로 바뀌지 않고 기존 소파 이미지가 100% 유지됨.
    const clipStyle = multiScan.direction === 'right'
      ? `inset(0 ${Math.max(0, 100 - multiScan.pos)}% 0 0)`
      : `inset(0 0 0 ${Math.min(100, multiScan.pos)}%)`;

    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner select-none pointer-events-none">
        {/* 1. 기본 바탕 이미지 (현재까지 완성된 소파 이미지) */}
        <Image
          src={baseImg}
          alt={title}
          fill
          className="object-cover"
          priority
        />

        {/* 2. 스캔 바가 지나간 자리 뒤로만 나타나는 다음 단계 소파 이미지 (글리치 0%) */}
        <div
          className="absolute inset-0 z-10"
          style={{ clipPath: clipStyle }}
        >
          <Image
            src={nextImg}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 3. 황금빛 라이브 스캐닝 레이저 라인 (스캔 라인과 이미지 절단선 완벽 일치) */}
        <div
          className="absolute inset-y-0 z-20 w-0.5 bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,1)]"
          style={{ left: `${multiScan.pos}%` }}
        >
          <div className="absolute top-2 -left-1 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,1)]" />
          <div className="absolute bottom-4 -left-1 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,1)]" />
        </div>
      </div>
    );
  }

  // 기본 2단계 슬라이더 모드
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner select-none pointer-events-none">
      {/* 1. 비포 베이스 이미지 (바닥) */}
      <Image src={beforeImage} alt={`${title} Before`} fill className="object-cover" priority />

      {/* 2. 애프터 오버레이 이미지 (clip-path로 왼쪽에서 오른쪽으로 와이프) */}
      <div
        className="absolute inset-0 z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <Image src={afterImage} alt={`${title} After`} fill className="object-cover" priority />
      </div>

      {/* 3. 라이브 슬라이딩 파이프 선 (황금빛 가이드 라인) */}
      <div
        className="absolute inset-y-0 z-20 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
        style={{ left: `${sliderPos}%` }}
      />

      {/* 신규/인기 뱃지 */}
      {badge && (
        <span className="absolute left-3 top-3 z-30 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
          {badge}
        </span>
      )}

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
  // 🌟 사용자가 처음부터 전체 플로우를 확인할 수 있도록 '가구 & 소품 교체' 마법사 1단계(업로드 버전) 기본 오픈
  const initialTool = TOOL_CARDS.find((t) => t.id === 'replace') || TOOL_CARDS[0];
  const [selectedTool, setSelectedTool] = useState<ToolCard>(initialTool);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // 🌟 구글 플레이 온보딩 결제/구독(Paywall) 시작 화면 기본 오픈
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(true);

  // 🌐 글로벌 4개국어 i18n 상태 (기본값: 한국어 'ko' - 초기 영어 깜빡임 방지)
  const [lang, setLang] = useState<Language>('ko');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('reroom_lang') as Language;
      if (saved && (saved === 'en' || saved === 'ko' || saved === 'ja' || saved === 'es')) {
        setLang(saved);
      } else {
        // 첫 방문 시 기기/브라우저 시스템 언어 자동 감지
        const navLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
        if (navLang.startsWith('ja')) {
          setLang('ja');
        } else if (navLang.startsWith('es')) {
          setLang('es');
        } else if (navLang.startsWith('en')) {
          setLang('en');
        } else {
          setLang('ko');
        }
      }
    } catch (e) {}
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('reroom_lang', newLang);
    } catch (e) {}
    setIsLangModalOpen(false);
  };

  // 크레딧 상태 (localStorage) - 기본 0회 (테스트 누적 수치 자동 클린업)
  const [freeCountRaw, setFreeCountRaw] = useLocalStorage(
    'reroom_free_generations',
    String(FREE_GENERATIONS)
  );
  const parsedCount = parseInt(freeCountRaw || '0', 10);
  const freeCount = isNaN(parsedCount) ? 0 : Math.max(0, parsedCount);

  useEffect(() => {
    const rawVal = parseInt(freeCountRaw || '0', 10);
    if (isNaN(rawVal) || rawVal > 1000) {
      setFreeCountRaw('0');
    }
  }, [freeCountRaw, setFreeCountRaw]);

  // 👑 사용자 유료 플랜 구독 상태 ('free' | 'starter' | 'pro')
  const [userPlan, setUserPlan] = useLocalStorage('reroom_user_plan', 'free');
  const isPaidUser = userPlan === 'starter' || userPlan === 'pro' || userPlan === 'amateur';

  // 마법사 상태
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('living_room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedPalette, setSelectedPalette] = useState('surprise');
  const [redesignMode, setRedesignMode] = useState<'structural' | 'renovation'>('structural');
  const [resultCount, setResultCount] = useState<number>(1); // 항상 1개 고품질 시안 생성
  const [selectedLayoutItemIds, setSelectedLayoutItemIds] = useState<string[]>([]);
  const [preserveLayoutFurniture, setPreserveLayoutFurniture] = useState<boolean>(true);

  // 📐 방 실측 규격(가로 x 세로) 및 가구 비례 맞춤 상태
  const [isDimensionCustomEnabled, setIsDimensionCustomEnabled] = useState<boolean>(true);
  const [roomWidth, setRoomWidth] = useState<number>(3.0);
  const [roomLength, setRoomLength] = useState<number>(3.3);
  const [selectedBedType, setSelectedBedType] = useState<'none' | 'single' | 'twin_two' | 'super_single' | 'queen' | 'king'>('super_single');
  const [selectedSofaType, setSelectedSofaType] = useState<'none' | 'one_seater' | 'two_seater' | 'three_seater' | 'four_seater'>('none');
  const [selectedDiningType, setSelectedDiningType] = useState<'none' | 'two_person' | 'four_person' | 'six_person' | 'island_bar'>('none');
  const [selectedDeskType, setSelectedDeskType] = useState<'none' | 'compact' | 'standard' | 'wide'>('standard');

  // 📐 실시간 방 면적, 가구 점유율 및 동선 가이드 계산
  const roomAreaSqM = Math.round(roomWidth * roomLength * 10) / 10;
  const roomPyeong = (roomAreaSqM / 3.3058).toFixed(1);
  const activeBedOption = BED_SIZE_OPTIONS.find((b) => b.id === selectedBedType) || BED_SIZE_OPTIONS[0];
  const activeSofaOption = SOFA_SIZE_OPTIONS.find((s) => s.id === selectedSofaType) || SOFA_SIZE_OPTIONS[0];
  const activeDiningOption = DINING_TABLE_OPTIONS.find((d) => d.id === selectedDiningType) || DINING_TABLE_OPTIONS[0];
  const activeDeskOption = DESK_SIZE_OPTIONS.find((d) => d.id === selectedDeskType) || DESK_SIZE_OPTIONS[0];
  const totalFurnitureArea = Math.round((activeBedOption.area + activeSofaOption.area + activeDiningOption.area + activeDeskOption.area) * 10) / 10;
  const furnitureOccupancyPercent = roomAreaSqM > 0 ? Math.min(100, Math.round((totalFurnitureArea / roomAreaSqM) * 100)) : 30;

  const circulationStatus = (() => {
    if (furnitureOccupancyPercent <= 35) {
      return {
        level: 'good',
        textKo: '🟢 쾌적한 보행 동선 (여유 통로 80cm+ 확보)',
        textEn: '🟢 Spacious & clear flow (80cm+ clearance)',
        descKo: '방문 개폐 및 보행 이동 동선이 매우 여유롭습니다.',
        descEn: 'Plenty of space for door swings and walking.',
      };
    } else if (furnitureOccupancyPercent <= 50) {
      return {
        level: 'normal',
        textKo: '🟡 표준적인 공간 배치 (통로 60~70cm 확보)',
        textEn: '🟡 Balanced room layout (60-70cm clearance)',
        descKo: '가구들이 조화롭게 배치되는 균형 잡힌 구성입니다.',
        descEn: 'Standard balanced arrangement with good clearance.',
      };
    } else {
      return {
        level: 'tight',
        textKo: '🟠 다소 빡빡함 (슬림 가구 또는 동선 최적화 권장)',
        textEn: '🟠 Cozy / tight layout (slim furniture advised)',
        descKo: '가구 점유율이 높아 통로 확보를 위해 배치가 중요합니다.',
        descEn: 'Tight fit. Strategic placement needed for clearances.',
      };
    }
  })();

  const toggleLayoutItemId = (id: string) => {
    setSelectedLayoutItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 건물 외관 리모델링 8가지 변경 요소 선택 상태 (기본 전체 선택)
  const [selectedExteriorElementIds, setSelectedExteriorElementIds] = useState<string[]>([
    'windows',
    'roof',
    'paint',
    'cladding',
    'lighting',
    'garden',
    'entrance',
    'terrace',
  ]);

  const toggleExteriorElementId = (id: string) => {
    setSelectedExteriorElementIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllExteriorElements = () => {
    if (selectedExteriorElementIds.length === EXTERIOR_ELEMENT_OPTIONS.length) {
      setSelectedExteriorElementIds([]);
    } else {
      setSelectedExteriorElementIds(EXTERIOR_ELEMENT_OPTIONS.map((e) => e.id));
    }
  };

  // 정원 & 테라스 리모델링 8가지 구조물/옵션 선택 상태 (기본 전체 선택)
  const [selectedGardenStructureIds, setSelectedGardenStructureIds] = useState<string[]>([
    'pool',
    'trees',
    'doghouse',
    'dining',
    'bbq',
    'firepit',
    'pergola',
    'lighting_path',
  ]);

  const toggleGardenStructureId = (id: string) => {
    setSelectedGardenStructureIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllGardenStructures = () => {
    if (selectedGardenStructureIds.length === GARDEN_STRUCTURE_OPTIONS.length) {
      setSelectedGardenStructureIds([]);
    } else {
      setSelectedGardenStructureIds(GARDEN_STRUCTURE_OPTIONS.map((e) => e.id));
    }
  };

  // 🧹 청소 & 짐 정리 (클린업) 도구 전용 상태 및 캔버스
  const [cleanupToolMode, setCleanupToolMode] = useState<'brush' | 'pin' | 'eraser'>('brush');
  const [cleanupBrushSize, setCleanupBrushSize] = useState<number>(25);
  const [cleanupMarksCount, setCleanupMarksCount] = useState<number>(0);
  const [selectedCleanupCategories, setSelectedCleanupCategories] = useState<string[]>([
    'floor_trash',
    'boxes',
  ]);
  const [cleanupImgAspectRatio, setCleanupImgAspectRatio] = useState<number>(1);
  const cleanupCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupContainerRef = useRef<HTMLDivElement | null>(null);
  const cleanupImageRef = useRef<HTMLImageElement | null>(null);
  const cleanupHistoryRef = useRef<ImageData[]>([]);
  const isCleanupDrawingRef = useRef<boolean>(false);
  const cleanupLastCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const lastCleanupMarkedImageRef = useRef<string | null>(null);

  const getCleanupMarkedImage = async (baseImageUrl: string): Promise<string | null> => {
    try {
      const canvas = cleanupCanvasRef.current;
      const imgEl = cleanupImageRef.current;

      // 이미 마크된 이미지가 저장되어 있고 캔버스가 없거나 비어있는 경우 캐시 재사용
      if ((!canvas || cleanupMarksCount === 0) && lastCleanupMarkedImageRef.current) {
        return lastCleanupMarkedImageRef.current;
      }
      if (!canvas) return lastCleanupMarkedImageRef.current || null;

      // 1. 이미 DOM에 로드된 img 엘리먼트가 있으면 즉시 동기식 합성
      if (imgEl && imgEl.complete && (imgEl.naturalWidth || imgEl.width)) {
        const targetW = imgEl.naturalWidth || imgEl.width;
        const targetH = imgEl.naturalHeight || imgEl.height;
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = targetW;
        compositeCanvas.height = targetH;
        const ctx = compositeCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgEl, 0, 0, targetW, targetH);
          ctx.drawImage(canvas, 0, 0, targetW, targetH);
          const markedDataUrl = compositeCanvas.toDataURL('image/jpeg', 0.9);
          lastCleanupMarkedImageRef.current = markedDataUrl;
          console.log('>>> [Sync] Generated cleanup markedImage successfully! Length:', markedDataUrl.length);
          return markedDataUrl;
        }
      }

      // 2. 비동기식 폴백 (새 Image 객체 로드 후 합성)
      return new Promise<string | null>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const compositeCanvas = document.createElement('canvas');
            const targetW = img.naturalWidth || img.width || 1024;
            const targetH = img.naturalHeight || img.height || 1024;
            compositeCanvas.width = targetW;
            compositeCanvas.height = targetH;
            const ctx = compositeCanvas.getContext('2d');
            if (!ctx) {
              resolve(lastCleanupMarkedImageRef.current || null);
              return;
            }
            ctx.drawImage(img, 0, 0, targetW, targetH);
            ctx.drawImage(canvas, 0, 0, targetW, targetH);
            const markedDataUrl = compositeCanvas.toDataURL('image/jpeg', 0.9);
            lastCleanupMarkedImageRef.current = markedDataUrl;
            console.log('>>> [Async] Generated cleanup markedImage successfully! Length:', markedDataUrl.length);
            resolve(markedDataUrl);
          } catch (err) {
            console.error('Failed to create cleanup marked composite:', err);
            resolve(lastCleanupMarkedImageRef.current || null);
          }
        };
        img.onerror = () => {
          resolve(lastCleanupMarkedImageRef.current || null);
        };
        img.src = baseImageUrl;
      });
    } catch (err) {
      console.error('getCleanupMarkedImage exception:', err);
      return lastCleanupMarkedImageRef.current || null;
    }
  };

  const toggleCleanupCategory = (id: string) => {
    setSelectedCleanupCategories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const initCleanupCanvas = useCallback(() => {
    const canvas = cleanupCanvasRef.current;
    const container = cleanupContainerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let tempCanvas: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx?.drawImage(canvas, 0, 0);
    }

    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);

    const ctx = canvas.getContext('2d');
    if (ctx && tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (wizardStep === 2 && selectedTool.id === 'cleanup') {
      const timer = setTimeout(() => {
        initCleanupCanvas();
      }, 100);
      window.addEventListener('resize', initCleanupCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', initCleanupCanvas);
      };
    }
  }, [wizardStep, selectedTool.id, initCleanupCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = cleanupCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0]?.clientY : (e as React.MouseEvent).clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const saveCleanupSnapshot = () => {
    const canvas = cleanupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (cleanupHistoryRef.current.length >= 20) {
      cleanupHistoryRef.current.shift();
    }
    cleanupHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleCleanupPointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    saveCleanupSnapshot();

    const canvas = cleanupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cleanupToolMode === 'pin') {
      const r = Math.max(14, cleanupBrushSize * 0.6);
      ctx.save();
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(coords.x, coords.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.beginPath();
      const d = r * 0.45;
      ctx.moveTo(coords.x - d, coords.y - d);
      ctx.lineTo(coords.x + d, coords.y + d);
      ctx.moveTo(coords.x + d, coords.y - d);
      ctx.lineTo(coords.x - d, coords.y + d);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      setCleanupMarksCount((prev) => prev + 1);
      return;
    }

    isCleanupDrawingRef.current = true;
    cleanupLastCoordsRef.current = { x: coords.x, y: coords.y };
    ctx.save();
    if (cleanupToolMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, cleanupBrushSize * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      // 지우려는 물체가 선명하게 보이도록 연하고 은은한 반투명 로즈 틴트 (30% 불투명도)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.30)';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.30)';
      ctx.lineWidth = cleanupBrushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, cleanupBrushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleCleanupPointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCleanupDrawingRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const canvas = cleanupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cleanupToolMode === 'eraser') {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, cleanupBrushSize * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
      cleanupLastCoordsRef.current = { x: coords.x, y: coords.y };
    } else if (cleanupToolMode === 'brush') {
      // 이전 좌표부터 현재 좌표까지만 단일 선분으로 렌더링하여 불투명도 중첩 누적 방지
      if (cleanupLastCoordsRef.current) {
        ctx.beginPath();
        ctx.moveTo(cleanupLastCoordsRef.current.x, cleanupLastCoordsRef.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
      cleanupLastCoordsRef.current = { x: coords.x, y: coords.y };
    }
  };

  const handleCleanupPointerUp = () => {
    if (isCleanupDrawingRef.current) {
      isCleanupDrawingRef.current = false;
      cleanupLastCoordsRef.current = null;
      const canvas = cleanupCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.restore();
        }
      }
      setCleanupMarksCount((prev) => prev + 1);
    }
  };

  const handleCleanupUndo = () => {
    const canvas = cleanupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (cleanupHistoryRef.current.length > 0) {
      const prev = cleanupHistoryRef.current.pop();
      if (prev) {
        ctx.putImageData(prev, 0, 0);
        setCleanupMarksCount((p) => Math.max(0, p - 1));
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCleanupMarksCount(0);
    }
  };

  const handleCleanupClear = () => {
    const canvas = cleanupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveCleanupSnapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCleanupMarksCount(0);
  };

  // 🎨 벽지 & 페인트 교체 도구 전용 상태
  const [selectedPaintSurfaceIds, setSelectedPaintSurfaceIds] = useState<string[]>(['wall', 'floor']);
  const [paintSurfaceConfigs, setPaintSurfaceConfigs] = useState<Record<string, { material: string; color: string }>>({
    wall: { material: 'silk_wallpaper', color: 'warm_beige' },
    floor: { material: 'marble_tile', color: 'pure_white' },
    ceiling: { material: 'matte_paint', color: 'pure_white' },
    accent_wall: { material: 'brick', color: 'pure_white' },
    molding_doors: { material: 'matte_paint', color: 'pure_white' },
  });
  const [activePaintConfigTab, setActivePaintConfigTab] = useState<string>('wall');

  const togglePaintSurfaceId = (id: string) => {
    setSelectedPaintSurfaceIds((prev) => {
      const isCurrentlySelected = prev.includes(id);
      const next = isCurrentlySelected ? prev.filter((i) => i !== id) : [...prev, id];
      if (!isCurrentlySelected) {
        setActivePaintConfigTab(id);
      } else if (next.length > 0 && activePaintConfigTab === id) {
        setActivePaintConfigTab(next[0]);
      }
      return next;
    });
  };

  const handleSelectAllPaintSurfaces = () => {
    if (selectedPaintSurfaceIds.length === PAINT_SURFACE_OPTIONS.length) {
      setSelectedPaintSurfaceIds(['wall']);
      setActivePaintConfigTab('wall');
    } else {
      setSelectedPaintSurfaceIds(PAINT_SURFACE_OPTIONS.map((s) => s.id));
    }
  };

  const updatePaintSurfaceConfig = (surfaceId: string, material?: string, color?: string) => {
    setPaintSurfaceConfigs((prev) => {
      const current = prev[surfaceId] || { material: 'matte_paint', color: 'warm_beige' };
      const newMaterial = material ?? current.material;
      let newColor = color ?? current.color;

      // 바닥재 재질 선택 시 어울리는 대표 컬러 자동 보정
      if (surfaceId === 'floor' && material && !color) {
        if (material === 'marble_tile' && (current.color === 'natural_oak' || current.color === 'deep_walnut')) {
          newColor = 'pure_white'; // 대리석은 퓨어 크림 화이트
        } else if (material === 'micro_cement' && (current.color === 'natural_oak' || current.color === 'pure_white')) {
          newColor = 'light_grey'; // 마이크로시멘트는 모던 라이트 그레이
        } else if (material === 'wood_timber' && current.color === 'pure_white') {
          newColor = 'deep_walnut'; // 원목 마루는 고급 딥 월넛
        }
      }

      return {
        ...prev,
        [surfaceId]: {
          material: newMaterial,
          color: newColor,
        },
      };
    });
  };

  const applyPaintPreset = (presetId: string) => {
    const preset = PAINT_QUICK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setPaintSurfaceConfigs((prev) => ({
      ...prev,
      ...preset.configs,
    }));
  };

  // 🛋️ 가구 & 소품 교체 도구 전용 상태 (8개 디자인 양식, 8색상 팔레트, 4소재 질감)
  const [selectedFurnitureStyle, setSelectedFurnitureStyle] = useState<string>('modern');
  const [selectedFurnitureColor, setSelectedFurnitureColor] = useState<string>('off_white');
  const [selectedFurnitureMaterial, setSelectedFurnitureMaterial] = useState<string>('fabric_linen');

  const [userCustomPrompt, setUserCustomPrompt] = useState<string>('');
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; promptAction?: boolean }>>([
    {
      sender: 'agent',
      text: (translations.agentModal as any).initialMessage?.[lang] || '안녕하세요! RoomFit AI 수석 디자이너 에이전트입니다. 원하시는 분위기, 배치할 소품(강아지, 화분, 조명 등)이나 특이사항을 말씀해 주세요!',
    },
  ]);

  useEffect(() => {
    setAgentMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'agent') {
        return [{
          sender: 'agent',
          text: (translations.agentModal as any).initialMessage?.[lang] || '안녕하세요! RoomFit AI 수석 디자이너 에이전트입니다. 원하시는 분위기, 배치할 소품(강아지, 화분, 조명 등)이나 특이사항을 말씀해 주세요!',
        }];
      }
      return prev;
    });
  }, [lang]);

  const handleSendAgentMessage = (customText?: string) => {
    const text = (customText || agentInput).trim();
    if (!text) return;
    setUserCustomPrompt(text);
    const feedbackTemplate = (translations.agentModal as any).feedbackMessage?.[lang] || '"{text}" 요청을 인테리어 AI 프롬프트 엔진에 반영했습니다!✨';
    setAgentMessages((prev) => [
      ...prev,
      { sender: 'user', text },
      {
        sender: 'agent',
        text: feedbackTemplate.replace('{text}', text),
        promptAction: true,
      },
    ]);
    setAgentInput('');
  };

  // 미디어 소스 선택 모달
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 결과 상태
  const [isLoading, setIsLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [compareViewMode, setCompareViewMode] = useState<'slider' | 'after' | 'before'>('slider');
  // 스마트 편집 툴 상태 (색상/벽지 변경, 가구 교체, 식물/소품 추가)
  const [activeSmartEditTool, setActiveSmartEditTool] = useState<'paint' | 'replace' | 'plant' | null>(null);
  const [smartEditInput, setSmartEditInput] = useState('');
  const [isSmartEditing, setIsSmartEditing] = useState(false);

  // 보드 이력 및 중복 방지 상태
  const [boardHistory, setBoardHistory] = useState<Array<{ id: string; title: string; image: string; style: string }>>([]);
  const [usedImageUrls, setUsedImageUrls] = useState<Set<string>>(new Set());
  const [selectedBoardItemIds, setSelectedBoardItemIds] = useState<string[]>([]);

  // 🪄 스마트 편집 적용 함수 (색상/벽지 변경, 가구 교체, 식물/소품 추가)
  const handleApplySmartEdit = async (customInstruction?: string) => {
    const instruction = (customInstruction || smartEditInput).trim();
    if (!instruction) {
      alert(
        lang === 'ko'
          ? '변경 또는 추가하고 싶은 내용을 선택하거나 입력해 주세요.'
          : lang === 'ja'
          ? '変更または追加したい内容を選択または入力してください。'
          : lang === 'es'
          ? 'Seleccione o ingrese los cambios o adiciones deseadas.'
          : 'Please select or enter the details you want to change or add.'
      );
      return;
    }
    const currentImg = resultImages[selectedResultIndex];
    if (!currentImg) return;

    setIsSmartEditing(true);
    try {
      let reqBody: any = {
        image: currentImg,
        count: 1,
      };

      if (activeSmartEditTool === 'paint') {
        reqBody = {
          ...reqBody,
          redesignMode: 'preserve_surface',
          roomTypeId: selectedRoom,
          styleId: selectedStyle,
          customPrompt: `STRICTLY PRESERVE 100% of all existing furniture layout, sofa, tables, and room structure. Selectively repaint and replace ONLY the wall wallpaper, wall color, and floor surface according to: ${instruction}.`,
        };
      } else if (activeSmartEditTool === 'replace') {
        reqBody = {
          ...reqBody,
          mode: 'edit_existing',
          roomTypeId: selectedRoom,
          styleId: selectedStyle,
          customPrompt: instruction,
        };
      } else if (activeSmartEditTool === 'plant') {
        reqBody = {
          ...reqBody,
          mode: 'edit_existing',
          roomTypeId: selectedRoom,
          styleId: selectedStyle,
          customPrompt: instruction.includes('추가') ? instruction : `${instruction} 추가`,
        };
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Smart edit parsing warning (non-JSON):', parseErr);
        data = {
          error:
            lang === 'ko'
              ? '서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.'
              : lang === 'ja'
              ? 'サーバー接続が不安定です。しばらくしてからもう一度お試しください。'
              : lang === 'es'
              ? 'Conexión inestable. Por favor intente más tarde.'
              : 'Server connection unstable. Please try again later.',
        };
      }

      if (res.ok && data && ((Array.isArray(data.images) && data.images[0]) || data.image)) {
        const newImg = data.images?.[0]
          ? `data:image/png;base64,${data.images[0]}`
          : `data:image/png;base64,${data.image}`;

        setResultImages((prev) => [newImg, ...prev]);
        setSelectedResultIndex(0);

        const toolName =
          activeSmartEditTool === 'paint'
            ? (lang === 'ko' ? '색상/벽지 변경' : lang === 'ja' ? 'カラー・壁紙変更' : lang === 'es' ? 'Cambio de color/pared' : 'Color/Wallpaper Change')
            : activeSmartEditTool === 'replace'
            ? (lang === 'ko' ? '가구 교체' : lang === 'ja' ? '家具交換' : lang === 'es' ? 'Cambio de muebles' : 'Furniture Replace')
            : (lang === 'ko' ? '식물/소품 추가' : lang === 'ja' ? '植物・小物追加' : lang === 'es' ? 'Añadir plantas/accesorios' : 'Add Plants & Decor');

        const newBoardItem = {
          id: `${Date.now()}-edit`,
          title: `${toolName} - ${instruction.slice(0, 16)}`,
          image: newImg,
          style: toolName,
        };
        setBoardHistory((prev) => [newBoardItem, ...prev]);
        setActiveSmartEditTool(null);
        setSmartEditInput('');
      } else {
        alert(
          data?.error ||
            (lang === 'ko'
              ? 'AI 편집 생성 중 오류가 발생했습니다.'
              : lang === 'ja'
              ? 'AI編集の生成中にエラーが発生しました。'
              : lang === 'es'
              ? 'Error al generar la edición de IA.'
              : 'An error occurred during AI editing.')
        );
      }
    } catch (err) {
      console.warn('Smart edit error:', err);
      alert(
        lang === 'ko'
          ? '서버 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : lang === 'ja'
          ? 'サーバーリクエスト中にエラーが発生しました。しばらくしてからもう一度お試しください。'
          : lang === 'es'
          ? 'Error al realizar la solicitud. Intente de nuevo.'
          : 'An error occurred during the request. Please try again.'
      );
    } finally {
      setIsSmartEditing(false);
    }
  };

  // 결과물 단일/다중 삭제 함수
  const handleDeleteBoardItems = (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;
    setBoardHistory((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
    setResultImages((prev) => {
      const remaining = prev.filter((img) => {
        const item = boardHistory.find((b) => b.image === img);
        return !item || !idsToDelete.includes(item.id);
      });
      return remaining;
    });
    setSelectedBoardItemIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
  };

  // 이미지 브라우저 다운로드 함수
  const handleDownloadImage = (imgSrc: string, filename = 'reroom_design.png') => {
    if (!imgSrc) return;
    try {
      const link = document.createElement('a');
      link.href = imgSrc;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // 선택된 결과물 일괄 다운로드
  const handleDownloadSelectedBoardItems = () => {
    const itemsToDownload = boardHistory.filter((item) => selectedBoardItemIds.includes(item.id));
    if (itemsToDownload.length === 0) return;
    itemsToDownload.forEach((item, idx) => {
      setTimeout(() => {
        handleDownloadImage(item.image, `reroom_${item.style}_${idx + 1}.png`);
      }, idx * 250);
    });
  };

  // 🌟 브라우저 닫힘/새로고침 시에도 이전 작업 결과물(Your Board) 자동 복구 및 영구 보존
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('reroom_board_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBoardHistory(parsed);
          setResultImages(parsed.map((item: any) => item.image));
        }
      }
      const savedUploaded = localStorage.getItem('reroom_last_uploaded_image');
      if (savedUploaded) {
        setUploadedImage(savedUploaded);
      }
    } catch (e) {
      console.warn('LocalStorage restore notice:', e);
    }
  }, []);

  useEffect(() => {
    try {
      if (boardHistory.length > 0) {
        const toSave = boardHistory.slice(0, 6);
        localStorage.setItem('reroom_board_history', JSON.stringify(toSave));
      } else {
        localStorage.removeItem('reroom_board_history');
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [boardHistory]);

  useEffect(() => {
    try {
      if (uploadedImage && uploadedImage.length < 2 * 1024 * 1024) {
        localStorage.setItem('reroom_last_uploaded_image', uploadedImage);
      }
    } catch (e) {}
  }, [uploadedImage]);

  // 📐 100% 겹침/유령 현상 없는 선명한 포토리얼리스틱 가구/소품/반려동물 실시간 동적 합성 엔진
const createSmartLayoutOptimizedVariant = (imgSrc: string, variantIndex: number, roomType = 'living_room', customText?: string): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(imgSrc);

    // 0. DIRECT_LAYOUT_MATCHES에 1:1 완벽 매칭되는 가구 재배치 시안이 있으면 해당 이미지 100% 우선 반환!
    if (imgSrc && DIRECT_LAYOUT_MATCHES[imgSrc] && DIRECT_LAYOUT_MATCHES[imgSrc].length > 0) {
      const matches = DIRECT_LAYOUT_MATCHES[imgSrc];
      return resolve(matches[variantIndex % matches.length]);
    }

    const textLower = (customText || '').toLowerCase();

    // 1. 방 종류 및 시안별 고해상도 완성형 스테이징 배경 소스 (공간 골조 및 창밖 뷰 100% 보존 소스)
    const HIGH_RES_STAGING_POOLS: Record<string, string[]> = {
      bedroom: [
        '/concept_layout_after.png',
        '/concept_layout_rearranged.png',
      ],
      kitchen: [
        '/kitchen_swap_result_1.png',
        '/showcase_kitchen_layout_v2.png',
        '/kitchen_swap_result_2.png',
      ],
      living_room: [
        '/concept_layout_living_after1.png',
        '/concept_layout_living_after2.png',
      ],
      study: [
        '/showcase_office.png',
        '/showcase_modern_office.png',
      ],
      general: [
        '/concept_layout_after.png',
        '/concept_layout_living_after1.png',
      ],
    };

    const pool = HIGH_RES_STAGING_POOLS[roomType] || HIGH_RES_STAGING_POOLS['living_room'];
    const stagingSourceSrc = pool[variantIndex % pool.length];

    const userImg = new window.Image();
    userImg.crossOrigin = 'anonymous';

    const stagingImg = new window.Image();
    stagingImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const renderComposite = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      const canvas = document.createElement('canvas');
      canvas.width = userImg.width || 1200;
      canvas.height = userImg.height || 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imgSrc);

      const w = canvas.width;
      const h = canvas.height;

      // [핵심 해결] 투명도 겹치기(globalAlpha 0.85/0.45) 100% 제거! 100% 선명한 불투명 Opaque 선명 렌더링
      ctx.globalAlpha = 1.0;

      // 1. 고해상도 완성형 리디자인 인테리어 룸 100% 불투명 렌더링
      ctx.drawImage(stagingImg, 0, 0, w, h);

      // 2. 사용자의 요청사항(원하는 사항 수정 커스텀 프롬프트) 기반 소품 및 객체 실시간 동적 렌더링
      const appliedFeatures: string[] = [];

      // A. 골든 리트리버 / 강아지 요청 시
      if (textLower.includes('리트리버') || textLower.includes('강아지') || textLower.includes('골든') || textLower.includes('dog')) {
        appliedFeatures.push(lang === 'ko' ? '🐶 귀여운 골든 리트리버' : lang === 'ja' ? '🐶 ゴールデンレトリバー' : lang === 'es' ? '🐶 Golden Retriever' : '🐶 Golden Retriever');
        ctx.save();
        // 리트리버 drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.78, 65, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 바닥 러그 위 엎드린 리트리버 실사 합성 (따뜻한 골든 톤)
        const dogGrad = ctx.createRadialGradient(w * 0.52, h * 0.75, 5, w * 0.52, h * 0.75, 55);
        dogGrad.addColorStop(0, '#E5A93B');
        dogGrad.addColorStop(0.7, '#C88824');
        dogGrad.addColorStop(1, '#8B5812');
        ctx.fillStyle = dogGrad;
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.75, 55, 25, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // 리트리버 머리 & 귀
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.73, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6E420B';
        ctx.beginPath();
        ctx.ellipse(w * 0.43, h * 0.76, 8, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // B. 고양이 요청 시
      if (textLower.includes('고양이') || textLower.includes('cat')) {
        appliedFeatures.push(lang === 'ko' ? '🐱 창가 햇살 고양이' : lang === 'ja' ? '🐱 窓辺のひだまり猫' : lang === 'es' ? '🐱 Gato en la ventana' : '🐱 Sunny Window Cat');
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, h * 0.72, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, h * 0.70, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // C. 원형 러그 & 커피 테이블
      if (textLower.includes('러그') || textLower.includes('rug') || textLower.includes('테이블')) {
        appliedFeatures.push(lang === 'ko' ? '🛋️ 모던 원형 러그 & 대리석 테이블' : lang === 'ja' ? '🛋️ モダン円形ラグ＆大理石テーブル' : lang === 'es' ? '🛋️ Alfombra y mesa de mármol' : '🛋️ Modern Rug & Marble Table');
      }

      // D. 화사한 자연 햇살 & 조명
      if (textLower.includes('햇살') || textLower.includes('조명') || textLower.includes('sunlight') || textLower.includes('light')) {
        appliedFeatures.push(lang === 'ko' ? '☀️ 화사한 자연 햇살 & 3200K 앰비언트' : lang === 'ja' ? '☀️ 自然な日差し＆3200Kアンビエント' : lang === 'es' ? '☀️ Luz solar natural' : '☀️ Natural Daylight & 3200K Ambient');
        ctx.save();
        const sunGrad = ctx.createLinearGradient(0, 0, w * 0.6, h * 0.6);
        sunGrad.addColorStop(0, 'rgba(255, 251, 235, 0.15)');
        sunGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.08)');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // E. 몬스테라 / 화분 / 플랜테리어
      if (textLower.includes('몬스테라') || textLower.includes('화분') || textLower.includes('식물') || textLower.includes('plant')) {
        appliedFeatures.push(lang === 'ko' ? '🪴 대형 몬스테라 관엽식물' : lang === 'ja' ? '🪴 モンステラ観葉植物' : lang === 'es' ? '🪴 Planta Monstera' : '🪴 Monstera Plant');
      }

      // 4. 무드 앰비언트 라이팅 밸런스 (시안 1 vs 시안 2)
      ctx.save();
      const lightGrad = ctx.createLinearGradient(0, 0, w, h);
      if (variantIndex === 0) {
        lightGrad.addColorStop(0, 'rgba(255, 245, 225, 0.05)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
      } else {
        lightGrad.addColorStop(0, 'rgba(240, 249, 255, 0.06)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      return resolve(canvas.toDataURL('image/png'));
    };

    userImg.onload = renderComposite;
    userImg.onerror = () => resolve(imgSrc);

    stagingImg.onload = renderComposite;
    stagingImg.onerror = renderComposite;

    userImg.src = imgSrc;
    stagingImg.src = stagingSourceSrc;
  });
};

  // 마법사 시작
  const startWizard = (tool?: ToolCard) => {
    const t = tool || TOOL_CARDS[0];
    setSelectedTool(t);
    // 📷 사용자가 내 방 사진을 직접 선택할 수 있도록 빈 공간으로 초기화
    setUploadedImage(null);
    if (t.defaultRoom) setSelectedRoom(t.defaultRoom);
    if (t.defaultStyle) setSelectedStyle(t.defaultStyle);
    if (t.id === 'layout') {
      const roomKey = t.defaultRoom || 'bedroom';
      setSelectedRoom(roomKey);
      const presets = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];
      setSelectedLayoutItemIds(presets.map((p) => p.id));
    } else if (t.id === 'exterior') {
      setSelectedRoom('exterior_house');
      setSelectedStyle('korea_hanok');
      setSelectedExteriorElementIds(EXTERIOR_ELEMENT_OPTIONS.map((e) => e.id));
    } else if (t.id === 'garden') {
      setSelectedRoom('garden_patio');
      setSelectedStyle('garden_korean');
      setSelectedGardenStructureIds(GARDEN_STRUCTURE_OPTIONS.map((e) => e.id));
    } else if (t.id === 'cleanup') {
      setResultCount(1);
      setCleanupMarksCount(0);
      cleanupHistoryRef.current = [];
      lastCleanupMarkedImageRef.current = null;
    } else if (t.id === 'paint') {
      setResultCount(1);
      setSelectedPaintSurfaceIds(['wall', 'floor']);
      setActivePaintConfigTab('wall');
    } else if (t.id === 'replace') {
      setResultCount(1);
      setSelectedFurnitureStyle('modern');
      setSelectedFurnitureColor('off_white');
      setSelectedFurnitureMaterial('fabric_linen');
    } else if (t.id === 'party_room') {
      setSelectedRoom('party_room');
      setSelectedStyle('party_christmas');
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // 이미지 파일 핸들러 (모바일 초고속 전송용 자동 캔버스 압축)
  const handleImageFile = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|bmp)$/i.test(file.name);
    if (!isImage) {
      alert(
        lang === 'ko'
          ? '이미지 파일(JPG, PNG, WebP 등)을 선택해 주세요.'
          : lang === 'ja'
          ? '画像ファイル（JPG、PNG、WebPなど）を選択してください。'
          : lang === 'es'
          ? 'Seleccione un archivo de imagen (JPG, PNG, WebP, etc.).'
          : 'Please select an image file (JPG, PNG, WebP, etc.).'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;
      const img = new window.Image();
      img.onload = () => {
        try {
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
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setUploadedImage(compressedDataUrl);
            if (selectedTool.id === 'layout' || selectedTool.id === 'cleanup' || selectedTool.id === 'paint') {
              const roomKey = inferRoomType(compressedDataUrl, 'bedroom');
              setSelectedRoom(roomKey);
              if (selectedTool.id === 'layout') {
                const presets = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];
                setSelectedLayoutItemIds(presets.map((p) => p.id));
              }
            }
          } else {
            setUploadedImage(rawDataUrl);
          }
        } catch (err) {
          console.warn('Canvas resize fallback:', err);
          setUploadedImage(rawDataUrl);
        }
        setIsSourceModalOpen(false);
      };
      img.onerror = () => {
        setUploadedImage(rawDataUrl);
        setIsSourceModalOpen(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      alert(
        lang === 'ko'
          ? '사진을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.'
          : lang === 'ja'
          ? '写真の読み込み中にエラーが発生しました。もう一度お試しください。'
          : lang === 'es'
          ? 'Error al cargar la imagen. Intente de nuevo.'
          : 'Error loading photo. Please try again.'
      );
    };
    reader.readAsDataURL(file);
  };

  // 샘플 사진 선택
  const selectExamplePhoto = (src: string) => {
    setUploadedImage(src);
    if (selectedTool.id === 'layout' || selectedTool.id === 'cleanup' || selectedTool.id === 'paint') {
      const roomKey = inferRoomType(src, 'bedroom');
      setSelectedRoom(roomKey);
      if (selectedTool.id === 'layout') {
        const presets = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['general'];
        setSelectedLayoutItemIds(presets.map((p) => p.id));
      }
    }
  };

  // 이전 단계 이동
  const handlePrevStep = () => {
    if (selectedTool.id === 'party_room') {
      if (wizardStep === 2) setWizardStep(1);
      else if (wizardStep === 4) setWizardStep(2);
      else if (wizardStep === 5) setWizardStep(4);
      return;
    }
    if (selectedTool.id === 'layout') {
      if (wizardStep === 2) setWizardStep(1);
      else if (wizardStep === 3) setWizardStep(2);
      else if (wizardStep === 4) setWizardStep(3);
      else if (wizardStep === 5) setWizardStep(4);
      return;
    }
    if (selectedTool.id === 'paint' || selectedTool.id === 'replace') {
      if (wizardStep === 2) setWizardStep(1);
      else if (wizardStep === 3) setWizardStep(2);
      else if (wizardStep === 5) setWizardStep(3);
      return;
    }
    if (wizardStep === 2) {
      setWizardStep(1);
    } else if (wizardStep === 3) {
      setWizardStep(2);
    } else if (wizardStep === 4) {
      setWizardStep(3);
    } else if (wizardStep === 5) {
      if (selectedTool.id === 'cleanup') {
        setWizardStep(2);
      } else {
        setWizardStep(4);
      }
    }
  };

  const getAlertNoImage = () =>
    lang === 'ko'
      ? '사진을 업로드하거나 샘플 사진을 선택해 주세요.'
      : lang === 'ja'
      ? '写真をアップロードするかサンプル写真を選択してください。'
      : lang === 'es'
      ? 'Por favor suba una foto o seleccione una de muestra.'
      : 'Please upload a photo or select a sample.';

  // 다음 단계 이동
  const handleNextStep = () => {
    if (selectedTool.id === 'party_room') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert(getAlertNoImage());
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        setWizardStep(4);
      } else if (wizardStep === 4) {
        // AI 파티룸 생성 트리거!
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (selectedTool.id === 'replace') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert(getAlertNoImage());
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        setWizardStep(3);
      } else if (wizardStep === 3) {
        // 가구 3단계(색상 & 질감) 완료: 즉시 AI 생성 트리거!
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (selectedTool.id === 'paint') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert(getAlertNoImage());
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        if (selectedPaintSurfaceIds.length === 0) {
          alert(
            lang === 'ko'
              ? '수정하고자 하는 공간 영역을 최소 1개 이상 선택해 주세요.'
              : lang === 'ja'
              ? '変更したい施工エリアを1つ以上選択してください。'
              : lang === 'es'
              ? 'Seleccione al menos un área a modificar.'
              : 'Please select at least one area to renovate.'
          );
          return;
        }
        setWizardStep(3);
      } else if (wizardStep === 3) {
        // 벽지/페인트 3단계 완료: 즉시 AI 생성 트리거!
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (selectedTool.id === 'layout') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert(getAlertNoImage());
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        // Step 2 공간 유형 선택 완료 -> Step 3 (방크기 & 가구 실측 비례맞춤) 전용 화면으로 이동
        setWizardStep(3);
      } else if (wizardStep === 3) {
        // Step 3 실측 비례 설정 완료 -> Step 4 (가구 보존 & 감지 품목 체크리스트)로 이동
        const roomKey = selectedRoom || 'living_room';
        const presets = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['bedroom'];
        setSelectedLayoutItemIds(presets.map((p) => p.id));
        setWizardStep(4);
      } else if (wizardStep === 4) {
        // Step 4 가구 보존 & 가구 선택 완료 -> AI 생성 시작
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (selectedTool.id === 'cleanup') {
      if (wizardStep === 1) {
        if (!uploadedImage) {
          alert(getAlertNoImage());
          return;
        }
        setWizardStep(2);
      } else if (wizardStep === 2) {
        // 청소 짐정리 모드 2단계 완료: 즉시 마킹 캡처 후 AI 생성 트리거!
        getCleanupMarkedImage(uploadedImage || EXAMPLE_PHOTOS[0]);
        setWizardStep(5);
        runGeneration();
      }
      return;
    }

    if (wizardStep === 1) {
      if (!uploadedImage) {
        alert(getAlertNoImage());
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
      alert(
        lang === 'ko'
          ? '무료 크레딧을 모두 사용하셨습니다. 요금제 업그레이드 후 이용해 주세요.'
          : lang === 'ja'
          ? '無料クレジットをすべて使用しました。プランをアップグレードしてご利用ください。'
          : lang === 'es'
          ? 'Has agotado tus créditos gratuitos. Por favor actualiza tu plan.'
          : 'You have used all your credits. Please upgrade your plan to continue.'
      );
      setIsPricingModalOpen(true);
      return;
    }

    const activeImage = uploadedImage || EXAMPLE_PHOTOS[0];
    const inferredRoom = inferRoomType(activeImage, selectedTool.defaultRoom || 'living_room');

    const effectiveResultCount = 1; // 모든 프로젝트 결과물은 1개 단일 생성

    // 공간 ID 및 스타일 ID 안전 검증 (파티룸 도구일 때는 party_room, 건물 외관 도구일 때는 exterior_house, 정원 도구일 때는 garden_patio 고정, 클린업·페인트·가구교체일 때는 이미지 자동 추론)
    const validRoomId = selectedTool.id === 'party_room'
      ? (selectedRoom && selectedRoom !== 'party_room' ? selectedRoom : inferredRoom)
      : selectedTool.id === 'exterior'
      ? 'exterior_house'
      : selectedTool.id === 'garden'
      ? 'garden_patio'
      : (selectedTool.id === 'cleanup' || selectedTool.id === 'paint' || selectedTool.id === 'replace')
      ? inferredRoom
      : (selectedRoom && ROOM_OPTIONS.some((r) => r.id === selectedRoom)
        ? selectedRoom
        : inferredRoom);

    const validStyleId = selectedTool.id === 'party_room'
      ? (PARTY_STYLE_OPTIONS.some((s) => s.id === selectedStyle) ? selectedStyle : 'party_birthday')
      : selectedTool.id === 'exterior'
      ? (EXTERIOR_STYLE_OPTIONS.some((s) => s.id === selectedStyle) ? selectedStyle : 'korea_hanok')
      : selectedTool.id === 'garden'
      ? (GARDEN_STYLE_OPTIONS.some((s) => s.id === selectedStyle) ? selectedStyle : 'garden_korean')
      : (STYLE_OPTIONS.some((s) => s.id === selectedStyle)
        ? selectedStyle
        : selectedTool.defaultStyle || 'modern');

    // 도구별 기능성 커스텀 프롬프트
    let customPrompt: string | undefined = undefined;
    let effectiveRedesignMode = 'interior_staging';

    if (selectedTool.id === 'interior') {
      effectiveRedesignMode = 'interior_staging';
    } else if (selectedTool.id === 'layout') {
      effectiveRedesignMode = 'rearrange_layout';
      const roomKey = selectedRoom || 'living_room';
      const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['bedroom'];
      const targetItemsKo = selectedLayoutItemIds.length > 0
        ? selectedLayoutItemIds.map((id) => {
            const found = presetItems.find((p) => p.id === id);
            return found ? `${found.label}(${found.enName})` : id;
          }).join(', ')
        : '모든 주요 가구(All primary furniture)';

      if (preserveLayoutFurniture) {
        customPrompt = `[SPATIAL LAYOUT REDESIGN & ERGONOMIC COMPOSITION CREATION]
CORE TASK: Redesign the spatial composition by reorganizing and rearranging the given furniture (${targetItemsKo}) within this exact room.
ROOM DIMENSIONS: Exactly ${roomWidth.toFixed(1)}m (width) x ${roomLength.toFixed(1)}m (length).

1. REDESIGN SPATIAL COMPOSITION VIA REALISTIC ERGONOMIC RELOCATION:
- The positions of the primary furniture (${targetItemsKo}) MUST visibly change between before and after! Do not leave furniture in their original spots.
- MATHEMATICAL WALL LENGTH RULE (CRITICAL): The combined length of furniture along any single wall CANNOT exceed that wall's physical dimension (${roomWidth.toFixed(1)}m or ${roomLength.toFixed(1)}m).
  * If two beds (e.g. kids room or twin beds) are in this room: DO NOT place them in a straight line end-to-end along a wall shorter than 4.1m (such as the ${roomLength.toFixed(1)}m wall). Placing two 2.0m beds end-to-end along a ${roomLength.toFixed(1)}m wall is mathematically and physically impossible and unnaturally distorts furniture.
  * INSTEAD, strictly arrange dual beds in PARALLEL (11-shape with 50-60cm walkway between them) or in an L-SHAPED CORNER configuration, keeping window access and curtains completely clear and unobstructed.
- Window clearance: Keep at least 40-50cm of breathing room in front of windows. Never shove bed headboards or frames flush against windows.
- Actively SWAP or INTERCHANGE furniture positions to establish a refreshed, optimal spatial composition.
- Former spots occupied by moved furniture must be completely cleared, vacated, and restored with matching flooring/walls.

2. DECLUTTER & REMOVE CRAMPED FURNITURE IF SPACE IS TIGHT (공간이 빡빡하면 불필요한 가구 과감히 빼기):
- If the space feels crowded, tight, or circulation is restricted, YOU ARE PERMITTED AND ENCOURAGED TO REMOVE redundant, non-essential, or bulky furniture pieces to create open, breathable, comfortable pedestrian flow.

3. ZERO FURNITURE DEFORMATION (가구 왜곡 및 변형 절대 금지):
- Retain the exact original materials, fabric/leather colors, wood grain tones, and silhouette for the retained furniture pieces without warping, stretching, or morphing.

4. 100% ARCHITECTURAL & OUTDOOR SCENERY LOCK:
- 100% preserve room boundaries, perimeter walls, ceiling height, doors, window frames, and the outdoor scenery through windows.
- Cast realistic ambient contact drop shadows beneath the relocated furniture pieces.
- High-end architectural interior photography, Architectural Digest editorial quality, 8k resolution.`;
      } else {
        customPrompt = `[SPATIAL LAYOUT OPTIMIZATION & CIRCULATION REDESIGN]
- Reorganize spatial composition in this ${roomWidth.toFixed(1)}m x ${roomLength.toFixed(1)}m room.
- If two beds exist, arrange them parallel (11-shape) or in an L-shape rather than a straight line on a short wall. Keep windows completely clear.
- High-end architectural interior photography, Architectural Digest editorial quality, 8k resolution.`;
      }
    } else if (selectedTool.id === 'cleanup') {
      effectiveRedesignMode = 'object_removal';
      const categoriesText = selectedCleanupCategories.length > 0
        ? selectedCleanupCategories.map((id) => CLEANUP_TARGET_CATEGORIES.find((c) => c.id === id)?.en).filter(Boolean).join(', ')
        : 'unwanted clutter, trash, storage boxes, and redundant furniture';
      const categoriesKo = selectedCleanupCategories.length > 0
        ? selectedCleanupCategories.map((id) => CLEANUP_TARGET_CATEGORIES.find((c) => c.id === id)?.label).filter(Boolean).join(', ')
        : '선택된 가구, 잡동사니, 쓰레기';

      customPrompt = `[PRECISION OBJECT REMOVAL & DECLUTTERING CLEANUP]
TARGET OBJECTS TO REMOVE & ERASE:
- User marked items and targets: ${categoriesKo} (${categoriesText}).
- Completely erase and remove all marked unwanted furniture pieces (such as tables, counters, islands, chairs, cabinets, or items painted/pinned in red in the reference image), messy cardboard boxes, scattered trash/debris, and loose items.
- Fill and repair all vacated spots seamlessly with matching pristine clean floor surfaces (wood grain/tiles/carpet) and wall textures matching the surroundings.

STRICT PRESERVATION RULES:
- 100% PRESERVE all unmarked primary furniture, walls, doors, windows, natural lighting, and original architectural room structure.
- DO NOT alter the camera angle, viewing perspective, room color scheme, or untargeted decor.
- The resulting room must look completely spotless, professionally organized, and ultra-clean.
- Ultra-photorealistic interior photography, Architectural Digest editorial quality, 8k resolution.`;
    } else if (selectedTool.id === 'paint') {
      effectiveRedesignMode = 'preserve_surface';

      const surfaceDetails = selectedPaintSurfaceIds.map((id) => {
        const surface = PAINT_SURFACE_OPTIONS.find((s) => s.id === id);
        const cfg = paintSurfaceConfigs[id] || { material: 'matte_paint', color: 'warm_beige' };
        const mat = PAINT_MATERIAL_OPTIONS.find((m) => m.id === cfg.material);
        const col = PAINT_COLOR_OPTIONS.find((c) => c.id === cfg.color);
        return `- ${surface?.enName || id}: Apply ${mat?.enName || cfg.material} in ${col?.enName || cfg.color} (${surface?.label}: ${mat?.label}, ${col?.label})`;
      }).join('\n');

      const surfaceKoSummary = selectedPaintSurfaceIds.map((id) => {
        const surface = PAINT_SURFACE_OPTIONS.find((s) => s.id === id);
        const cfg = paintSurfaceConfigs[id] || { material: 'matte_paint', color: 'warm_beige' };
        const mat = PAINT_MATERIAL_OPTIONS.find((m) => m.id === cfg.material);
        const col = PAINT_COLOR_OPTIONS.find((c) => c.id === cfg.color);
        return `${surface?.label}(${mat?.label}, ${col?.label})`;
      }).join(' / ');

      const hasFloor = selectedPaintSurfaceIds.includes('floor');
      const floorCfg = paintSurfaceConfigs['floor'] || { material: 'marble_tile', color: 'pure_white' };
      const floorMat = PAINT_MATERIAL_OPTIONS.find((m) => m.id === floorCfg.material);
      const floorCol = PAINT_COLOR_OPTIONS.find((c) => c.id === floorCfg.color);

      const hasCeiling = selectedPaintSurfaceIds.includes('ceiling');
      const ceilingCfg = paintSurfaceConfigs['ceiling'] || { material: 'matte_paint', color: 'pure_white' };
      const ceilingMat = PAINT_MATERIAL_OPTIONS.find((m) => m.id === ceilingCfg.material);
      const ceilingCol = PAINT_COLOR_OPTIONS.find((c) => c.id === ceilingCfg.color);

      customPrompt = `[PRECISION ARCHITECTURAL SURFACE RETEXTURING & PAINT/FLOORING REFINEMENT]
TARGET SURFACES & SPECIFIED MATERIALS/COLORS (${selectedPaintSurfaceIds.length} surfaces chosen):
${surfaceDetails}

USER SELECTION SUMMARY:
${surfaceKoSummary}
${hasFloor ? `
MANDATORY COMPLETE FLOOR REPLACEMENT (CRITICAL PRIORITY):
- The user has explicitly chosen to remodel and change the FLOOR: "${floorMat?.enName || 'Flooring'}" in "${floorCol?.enName || 'Selected Color'}".
- You MUST completely remove, replace, and re-texture the entire floor surface across the whole room.
- Absolutely DO NOT retain the original photo's floorboards. The new floor must be boldly visible and prominent:
  * If Marble or Porcelain Tile is selected: replace the original floor completely with large, glossy, polished marble or porcelain tiles with clean thin grout lines, soft marble veining, and realistic window daylight reflections.
  * If Micro-Cement is selected: replace the original floor completely with a smooth, seamless monolithic architectural concrete/micro-cement floor in the specified tone.
  * If Wood Timber is selected: replace with brand-new, clean, rich wood planks or herringbone pattern in the specified finish.
- Ensure the new floor is clearly distinct, pristine, and visibly transformed from wall to wall underneath all furniture.` : ''}
${hasCeiling ? `
MANDATORY CEILING REFINEMENT (HIGH PRIORITY):
- The user has explicitly chosen to refinish the CEILING: "${ceilingMat?.enName || 'Ceiling Finish'}" in "${ceilingCol?.enName || 'Selected Color'}".
- You MUST refinish, paint, or re-wallpaper the entire upper ceiling plane across the whole room.
- Apply a clean, uniform, and flawless ceiling finish with natural ambient light diffusion.
- Eliminate old ceiling discolorations or stains while keeping existing ceiling lights, pendant lamps, recessed downlights, and molding details cleanly intact.` : ''}

STRICT ARCHITECTURAL & FURNITURE PRESERVATION CONSTRAINTS:
1. 100% FURNITURE LOCK: Keep all furniture (sofa, chairs, tables, beds, cabinets, lamps, electronics) in their EXACT current positions, orientations, shapes, and materials. DO NOT move, remove, replace, or re-stage any furniture.
2. PRECISE SURFACE TRANSFORMATION ONLY:
   - Modify ONLY the designated architectural surfaces: ${selectedPaintSurfaceIds.join(', ')}.
   - Apply the authentic material textures, relief patterns, and color tones requested above.
   - For walls: render clean wallpaper, exposed brick, or smooth matte paint with natural ambient light interaction.
   - For floors: render realistic continuous floorboards/tiles with authentic specular reflections and grout lines.
   - For ceilings: render pristine ceiling finish matching the specified tone.
3. ZERO STRUCTURAL DRIFT: Retain 100% of windows, views outside, doors, beams, columns, and camera perspective 1:1.
4. Ultra-photorealistic interior photography, Architectural Digest editorial quality, balanced ambient light, 8k resolution.`;
    } else if (selectedTool.id === 'exterior') {
      effectiveRedesignMode = 'preserve_layout';
      const chosenElements = EXTERIOR_ELEMENT_OPTIONS.filter((opt) =>
        selectedExteriorElementIds.includes(opt.id)
      );
      const elementsSummaryEn = chosenElements.length > 0
        ? chosenElements.map((e) => `- ${e.enName}: ${e.desc}`).join('\n')
        : '- Overall modern facade upgrade with premium materials';
      const elementsSummaryKo = chosenElements.length > 0
        ? chosenElements.map((e) => e.label).join(', ')
        : '전반적인 외관 리모델링';

      const chosenExteriorStyle = EXTERIOR_STYLE_OPTIONS.find((s) => s.id === validStyleId) || EXTERIOR_STYLE_OPTIONS[0];

      customPrompt = `[ARCHITECTURAL EXTERIOR RENOVATION & GLOBAL FAÇADE DESIGN]
TARGET ARCHITECTURAL REGION & STYLE:
- Style: ${chosenExteriorStyle.country} ${chosenExteriorStyle.label} (${chosenExteriorStyle.enName})
- Authentic Regional Signature: ${chosenExteriorStyle.prompt}

STRICT STRUCTURAL PRESERVATION:
- Retain 100% of the building footprint, outer walls, massing, silhouette, perspective, floor count, and height.
- Do NOT add phantom floors, do NOT change the camera viewing angle, and do NOT alter the building boundary.

SELECTED EXTERIOR RENOVATION TARGETS (${chosenElements.length} elements chosen):
${elementsSummaryEn}

RENOVATION INSTRUCTIONS:
- Specifically upgrade and modernize the chosen elements: ${elementsSummaryKo}.
- Seamlessly integrate the distinct architectural character of ${chosenExteriorStyle.label} (${chosenExteriorStyle.country}) into the exterior facade, materials, roof, and landscape.
- Any elements not chosen must remain visually grounded in the original photo.
- Deliver an ultra-photorealistic, magazine-worthy architectural photograph with realistic daylight and crisp 8k textures.`;
    } else if (selectedTool.id === 'garden') {
      effectiveRedesignMode = 'preserve_layout';
      const chosenStructures = GARDEN_STRUCTURE_OPTIONS.filter((opt) =>
        selectedGardenStructureIds.includes(opt.id)
      );
      const structuresSummaryEn = chosenStructures.length > 0
        ? chosenStructures.map((s) => `- ${s.enName}: ${s.desc}`).join('\n')
        : '- Beautiful landscape garden redesign with lush flora';
      const structuresSummaryKo = chosenStructures.length > 0
        ? chosenStructures.map((s) => s.label).join(', ')
        : '정원 및 테라스 리모델링';

      const chosenGardenStyle = GARDEN_STYLE_OPTIONS.find((s) => s.id === validStyleId) || GARDEN_STYLE_OPTIONS[0];

      customPrompt = `[LANDSCAPE & GARDEN TERRACE ARCHITECTURAL DESIGN]
TARGET LANDSCAPE REGION & STYLE:
- Style: ${chosenGardenStyle.country} ${chosenGardenStyle.label} (${chosenGardenStyle.enName})
- Authentic Landscape Signature: ${chosenGardenStyle.prompt}

STRICT PROPERTY & ARCHITECTURAL PRESERVATION:
- Retain the existing property footprint, house facade, boundaries, and main patio structure.
- Do NOT distort the house facade, perspective, or camera viewpoint.

SELECTED OUTDOOR STRUCTURES & AMENITIES (${chosenStructures.length} items chosen):
${structuresSummaryEn}

LANDSCAPE DESIGN INSTRUCTIONS:
- Harmoniously incorporate and place the selected outdoor features: ${structuresSummaryKo}.
- Transform the garden environment with the signature regional aesthetic of ${chosenGardenStyle.label} (${chosenGardenStyle.country}).
- Ensure realistic outdoor lighting, natural lawn/stone textures, lush plant foliage, and inviting outdoor living ambiance.
- Deliver an ultra-photorealistic architectural landscape photograph in crisp 8k quality.`;
    } else if (selectedTool.id === 'replace') {
      effectiveRedesignMode = 'replace_furniture';
      const styleMeta = REPLACE_FURNITURE_STYLES.find((s) => s.id === selectedFurnitureStyle) || REPLACE_FURNITURE_STYLES[0];
      const colorMeta = REPLACE_FURNITURE_COLORS.find((c) => c.id === selectedFurnitureColor) || REPLACE_FURNITURE_COLORS[0];
      const matMeta = REPLACE_FURNITURE_MATERIALS.find((m) => m.id === selectedFurnitureMaterial) || REPLACE_FURNITURE_MATERIALS[0];

      customPrompt = `[HIERARCHICAL BESPOKE FURNITURE CREATION - "창조와 융합의 예술"]
TASK: Design an original bespoke designer furniture piece by first fabricating the architectural frame in the chosen Design Style, and then precisely tailoring the seating cushions and backrest with the chosen Material Texture and Color.

======================================================================
1ST PRIORITY - SKELETAL FRAME & DESIGN STYLE (가구 디자인스타일 뼈대 및 조형미):
======================================================================
- Primary Furniture Target: Central seating/furniture in the room (main sofa/couch, bed frame, or dining set).
- Chosen Design Style: ${styleMeta.label} (${styleMeta.enName}) - ${styleMeta.promptKeyword}.
- Structural Framework Rule:
  * The outer structural skeleton, framing, legs, and silhouette must 100% authentically express ${styleMeta.label}.
  * If Traditional Hanok / Oriental: Authentic Korean timber craftsmanship, mortise and tenon joinery (사개맞춤/장부맞춤), tranquil natural wood lines, wooden armrests, and graceful curves.
  * If French Classic / European: Neoclassical wood carvings, cabriole legs, and elegant historical contours.
  * If Mid-Century Modern: Sculptural organic bentwood walnut shells and iconic angled tapered wooden legs.
  * If Industrial / Vintage: Sturdy blackened steel frame with raw architectural character.
  * If Modern Minimalist: Sleek low-slung geometric architectural framework.

======================================================================
2ND PRIORITY - UPHOLSTERY & TEXTURE MAPPING (좌방석 및 등받이에 재질/질감 & 색상 맞춤 결합):
======================================================================
- Specified Material & Texture: ${matMeta.label} (${matMeta.enName}) - ${matMeta.promptKeyword}.
- Specified Color Palette: ${colorMeta.label} (${colorMeta.enName}, hex: ${colorMeta.hex}) - ${colorMeta.desc}.
- Precise Cushion Mapping:
  * Apply ${matMeta.label} in ${colorMeta.label} tone specifically to the SEATING CUSHIONS (좌방석), BACKREST (등받이), and accent pillows.
  * For example, if Traditional Hanok Woodwork + Italian Leather are selected, the main sofa structure MUST remain authentic Korean natural woodwork, while the seat cushions and backrest pads are tailored in luxurious ${colorMeta.label} Italian leather showing realistic grain, supple creases, and tailored seams.
  * Render tangible, photorealistic material physics: authentic leather pores, bouclé loops, or woven linen threads.

======================================================================
3RD - BESPOKE CREATIVE SYNTHESIS & ARCHITECTURAL PRESERVATION:
======================================================================
- Synthesize an original, cohesive high-end designer creation that does not merely copy internet stock photos.
- 100% PRESERVE surrounding walls, windows, floor, ceiling, and daylight perspective.
- Cast natural ambient contact drop shadows on the floor underneath the newly placed bespoke furniture.
- Ultra-photorealistic interior architecture photography, Architectural Digest bespoke feature, 8k resolution.`;
    } else if (selectedTool.id === 'party_room') {
      effectiveRedesignMode = 'party_styling';
      const chosenPartyEvent = PARTY_STYLE_OPTIONS.find((p) => p.id === validStyleId) || PARTY_STYLE_OPTIONS[0];
      customPrompt = `[PROFESSIONAL IN-PLACE EVENT & PARTY ROOM DECORATION]
PARTY EVENT THEME: ${chosenPartyEvent.label} (${chosenPartyEvent.enName})
THEME DETAILS: ${chosenPartyEvent.desc}

STRICT IN-PLACE STYLING CONSTRAINTS (CRITICAL):
1. 100% ZERO FURNITURE REMOVAL & ZERO LAYOUT SHIFT:
   - 100% PRESERVE all existing core furniture (bed, headboard, nightstands, sofa, coffee table, media unit, chairs, cabinets, shelves) in their EXACT current physical positions, orientations, and models.
   - Absolutely DO NOT remove the existing furniture. DO NOT replace the bed or sofa with an unrelated cocktail bar, kitchen island, or foreign furniture.
   - Keep the original room type and purpose intact (if it is a bedroom, it MUST remain a bedroom with the exact same bed; if a living room, it remains a living room).
2. IN-PLACE FESTIVE CELEBRATION DECOR ONLY:
   - Lavishly decorate ON TOP OF and AROUND the existing furniture:
     * Behind the existing bed or sofa, mount an eye-catching balloon garland arch, celebration backdrop, or glowing party banner/neon sign matching ${chosenPartyEvent.label}.
     * On existing flat surfaces (nightstand, coffee table, desk, side table), arrange celebration party props: tiered cake or dessert stands, delicate champagne flutes, glassware, festive tableware, floral vases, and warm glowing candles.
     * Cascading warm fairy string lights along curtains, headboards, or solid walls.
     * Floating helium balloons near the ceiling, party throw pillows, wrapped gift boxes with ribbons, and celebratory accents.
3. 100% ARCHITECTURAL & PERSPECTIVE LOCK:
   - Keep walls, windows, floor, door frames, and camera viewpoint completely unchanged.
   - Ultra-photorealistic lifestyle interior photography, Architectural Digest party edition, vibrant celebration atmosphere, 8k resolution.`;
    }

    // 🤖 RoomFit AI 에이전트를 통해 사용자가 직접 입력한 인테리어 방향 반영!
    if (userCustomPrompt.trim()) {
      customPrompt = customPrompt
        ? `${customPrompt}. USER CUSTOM INSTRUCTION: ${userCustomPrompt}`
        : `USER CUSTOM INSTRUCTION: ${userCustomPrompt}`;
    }

    let markedImageData: string | null = null;
    if (selectedTool.id === 'cleanup') {
      markedImageData = await getCleanupMarkedImage(activeImage);
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activeImage,
          markedImage: markedImageData,
          roomTypeId: validRoomId,
          styleId: validStyleId,
          customPrompt,
          count: effectiveResultCount,
          redesignMode: effectiveRedesignMode,
          preserveFurniture: selectedTool.id === 'layout' ? preserveLayoutFurniture : (redesignMode === 'structural'),
          roomDimensions: (selectedTool.id === 'layout' || isDimensionCustomEnabled) ? {
            width: roomWidth,
            length: roomLength,
            bedType: selectedBedType,
            sofaType: selectedSofaType,
            diningTableType: selectedDiningType,
            deskType: selectedDeskType,
          } : undefined,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Generation Response parsing warning (non-JSON):', parseErr);
        data = { error: '서버 응답 형식이 올바르지 않습니다.' };
      }

      let imgs: string[] = [];

      if (!res.ok || !data || (!data.image && !data.images)) {
        const errorMsg = data?.error || (
          lang === 'ko'
            ? 'AI 이미지 생성에 실패했습니다. API 키 및 서버 설정을 확인해 주세요.'
            : 'AI image generation failed. Please check your API key and server settings.'
        );
        console.warn('API Response Notice:', errorMsg);
        alert(`⚠️ [AI 생성 안내]\n${errorMsg}`);
        setIsLoading(false);
        return;
      } else {
        const rawFirst = Array.isArray(data.images) && data.images.length > 0
          ? data.images[0]
          : data.image;
        imgs = rawFirst ? [`data:image/png;base64,${rawFirst}`] : [];
      }

      setResultImages(imgs);
      setSelectedResultIndex(0);
      setFreeCountRaw(String(Math.max(0, freeCount - 1)));
      setShowResultModal(true);

      // 🌟 보드 이력(Your Board)에 새 신규 컨셉 항목들 저장 (이전 이력 보존 & 누적)
      const getBoardStyleLabel = (toolId: string, styleId: string): string => {
        if (toolId === 'party_room') {
          const p = PARTY_STYLE_OPTIONS.find((s) => s.id === styleId);
          return (p as any)?.[`label${lang === 'ko' ? 'Ko' : lang === 'ja' ? 'Ja' : lang === 'es' ? 'Es' : 'En'}`] || p?.label || styleId;
        }
        if (toolId === 'exterior') {
          return EXTERIOR_STYLE_I18N[styleId]?.[lang]?.label || styleId;
        }
        if (toolId === 'garden') {
          return GARDEN_STYLE_I18N[styleId]?.[lang]?.label || styleId;
        }
        if (toolId === 'cleanup') {
          return lang === 'ko' ? '스마트 클린업 & 정리정돈' : lang === 'ja' ? 'スマートクリーンアップ＆片付け' : lang === 'es' ? 'Limpieza Inteligente' : 'Smart Cleanup & Declutter';
        }
        if (toolId === 'paint') {
          return lang === 'ko' ? '벽지 & 바닥재 정밀 시공' : lang === 'ja' ? 'クロス・床材リフォーム' : lang === 'es' ? 'Papel tapiz y suelos' : 'Wallpaper & Flooring';
        }
        if (toolId === 'replace') {
          const sLabel = REPLACE_STYLE_I18N[selectedFurnitureStyle]?.[lang]?.label || 'Modern';
          const cLabel = REPLACE_COLOR_I18N[selectedFurnitureColor]?.[lang] || 'Color';
          const mLabel = REPLACE_MATERIAL_I18N[selectedFurnitureMaterial]?.[lang]?.label || 'Material';
          return lang === 'ko'
            ? `${sLabel} 가구 교체 (${cLabel}, ${mLabel})`
            : lang === 'ja'
            ? `${sLabel}家具交換 (${cLabel}, ${mLabel})`
            : lang === 'es'
            ? `Cambio ${sLabel} (${cLabel}, ${mLabel})`
            : `${sLabel} Furniture Swap (${cLabel}, ${mLabel})`;
        }
        const found = STYLE_OPTIONS.find((s) => s.id === styleId);
        return (found as any)?.[`label${lang === 'ko' ? 'Ko' : lang === 'ja' ? 'Ja' : lang === 'es' ? 'Es' : 'En'}`] || found?.label || styleId;
      };

      const styleLabel = getBoardStyleLabel(selectedTool.id, validStyleId);
      const toolTitle = (translations.home.tools as any)[selectedTool.id]?.title?.[lang] || selectedTool.title;

      const newBoardItems = imgs.map((img, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: selectedTool.id === 'replace'
          ? `${REPLACE_STYLE_I18N[selectedFurnitureStyle]?.[lang]?.label || 'Furniture'} #${boardHistory.length + idx + 1}`
          : `${toolTitle} #${boardHistory.length + idx + 1}`,
        image: img,
        style: styleLabel,
      }));

    } catch (err: any) {
      console.error('Generation Catch:', err);
      alert(
        lang === 'ko'
          ? `⚠️ [통신 오류]\n서버와 연결할 수 없거나 요청 처리 중 오류가 발생했습니다.\n(${err?.message || '네트워크 상태를 확인해 주세요'})`
          : `⚠️ [Network Error]\nUnable to connect to server: ${err?.message || 'Please check network'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="app-screen-scale relative mx-auto min-h-screen w-full max-w-md bg-slate-950 font-sans text-slate-100 pb-24 shadow-2xl overflow-x-hidden touch-manipulation">
      {/* ── 📱 상단 네비게이션 헤더 (로고 좌측, 크레딧/설정 우측 깔끔 분리) ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-3.5 py-2.5 backdrop-blur-md">
        <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 shrink-0 whitespace-nowrap">
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            RoomFit AI
          </span>
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 🌐 언어 변경 스위처 (원터치 빠른 드롭다운 메뉴) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangModalOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/90 px-2 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400 active:scale-95 transition-all shadow cursor-pointer shrink-0 whitespace-nowrap"
              title="Change Language"
            >
              <span className="text-xs">{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.flag || '🌐'}</span>
              <span className="font-bold uppercase text-[10px]">{lang}</span>
              <span className="text-[8px] text-slate-400">▾</span>
            </button>

            {isLangModalOpen && (
              <>
                {/* 바깥 영역 터치시 닫히는 투명 백드롭 */}
                <div
                  className="fixed inset-0 z-50 cursor-default"
                  onClick={() => setIsLangModalOpen(false)}
                />

                {/* 빠른 4개국어 선택 드롭다운 팝업 */}
                <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl border border-amber-500/40 bg-slate-950 p-1.5 shadow-2xl animate-fade-in backdrop-blur-xl">
                  <div className="px-2.5 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{translations.header.langSelectTitle[lang]}</span>
                    <button
                      type="button"
                      onClick={() => setIsLangModalOpen(false)}
                      className="text-slate-400 hover:text-white font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageChange(l.code)}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all cursor-pointer ${
                          lang === l.code
                            ? 'border border-amber-400/50 bg-amber-500/20 text-amber-300 font-black shadow-sm'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <div>
                            <span className="block font-bold leading-tight text-white">{l.nativeName}</span>
                            <span className="text-[9px] text-slate-400">{l.label}</span>
                          </div>
                        </div>
                        {lang === l.code && <span className="text-amber-400 font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPricingModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-black text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer touch-manipulation shadow-sm shrink-0 whitespace-nowrap"
          >
            <span>💎</span>
            <span>
              {freeCount >= 999
                ? (lang === 'ko' ? '무제한' : lang === 'ja' ? '無制限' : lang === 'es' ? 'Ilimitado' : 'Unlimited')
                : `${freeCount} ${translations.header.credits[lang]}`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 touch-manipulation text-xs"
            aria-label="Profile"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ── 탭 1: Tools (도구 홈 피드) ── */}
      {activeTab === 'tools' && (
        <div className="flex flex-col gap-4 p-4 animate-fade-in">
          {/* 💳 모바일 홈 요금제 & 멤버십 안내 카드 */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-slate-950 shadow-md">
                  💎
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-amber-300 whitespace-nowrap">
                      {translations.home.bannerTitle[lang]}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      {lang === 'ko' ? '특가 혜택' : lang === 'ja' ? '特別オファー' : lang === 'es' ? 'Oferta' : 'Special Offer'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                    {lang === 'ko' ? '스타터 팩부터 프로 3개월 올패스까지' : lang === 'ja' ? 'スターターからプロ3ヶ月パスまで' : lang === 'es' ? 'De Starter a pase Pro 3 meses' : 'Starter pack to Pro 3-mo pass'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(true)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer touch-manipulation whitespace-nowrap"
              >
                {translations.home.bannerBtn[lang]}
              </button>
            </div>
          </div>

          {/* 피드 카드 목록 (7대 도구 바로 노출) */}
          <div className="flex flex-col gap-4">
            {TOOL_CARDS.map((tool) => {
              const toolInfo = (translations.home.tools as any)[tool.id];
              const displayTitle = toolInfo?.title[lang] || toolInfo?.title['en'] || tool.title;
              const displayDesc = toolInfo?.desc[lang] || toolInfo?.desc['en'] || tool.desc;

              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={tool.id}
                  onClick={() => startWizard(tool)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      startWizard(tool);
                    }
                  }}
                  className="w-full text-left group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl active:scale-[0.98] touch-manipulation"
                >
                  <AnimatedToolPreview
                    beforeImage={tool.beforeImage}
                    afterImage={tool.afterImage}
                    title={displayTitle}
                    badge={tool.badge}
                    steps={tool.steps}
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{displayDesc}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-md transition-transform group-hover:scale-105 active:scale-95">
                      {lang === 'ko' ? '시작하기 ➔' : lang === 'ja' ? '試す ➔' : lang === 'es' ? 'Probar ➔' : 'Try It!'}
                    </span>
                  </div>
                </div>
              );
            })}
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
              <h3 className="text-base font-bold text-white">RoomFit App User</h3>
              <p className="text-xs text-slate-400">
                {isPaidUser ? 'Pro Plan Member' : (lang === 'ko' ? '무료 플랜 이용 중' : 'Free Member')}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>💎 {freeCount} {lang === 'ko' ? '크레딧 보유' : 'Credits Left'}</span>
              </div>
            </div>
          </div>

          {/* 🎨 내 작업 보관함 (이전 작업 결과 보관) */}
          {boardHistory.length > 0 && (
            <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-amber-500/40 shadow-md">
                    <Image src={boardHistory[0].image} alt="Recent Concept" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-300">
                        {lang === 'ko' ? '내 작업 보관함' : lang === 'ja' ? '保存したデザイン' : lang === 'es' ? 'Mis Diseños' : 'Saved Concepts'}
                      </span>
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                        {lang === 'ko' ? `${boardHistory.length}개 보관` : lang === 'ja' ? `${boardHistory.length}件保存` : `${boardHistory.length} saved`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'ko' ? '이전에 생성한 AI 디자인을 언제든 다시 엽니다' : lang === 'ja' ? '以前に生成したAIデザインをいつでも開けます' : 'Reopen previously generated AI concepts anytime'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWizardStep(5);
                    setIsWizardOpen(true);
                  }}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  {lang === 'ko' ? '보드 열기 ➔' : lang === 'ja' ? 'ボードを開く ➔' : lang === 'es' ? 'Ver Tablero ➔' : 'Open Board ➔'}
                </button>
              </div>
            </div>
          )}

          {/* PRO 업그레이드 카드 (Warm Amber 스타일) */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-2xl">
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black uppercase text-amber-300 border border-amber-500/30">
              RoomFit AI PRO
            </span>
            <h4 className="mt-2 text-lg font-black text-white">
              {lang === 'ko' ? 'RoomFit AI로 공간을 새롭게 스타일링하세요' : lang === 'ja' ? 'RoomFit AIで空間を新しくスタイリング' : lang === 'es' ? 'Transforma tu espacio con RoomFit AI' : 'Stylize Your Space with RoomFit AI'}
            </h4>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {lang === 'ko'
                ? '원하는 모든 실내외 공간을 3초 만에 4K 초고화질로 리모델링합니다.'
                : lang === 'ja'
                ? 'あらゆる室内・室外空間を3秒で4K超高画質リノベーション。'
                : lang === 'es'
                ? 'Remodela cualquier espacio interior o exterior en 4K en solo 3 segundos.'
                : 'Effortless home styling, Smart AI design for interior & exterior. Visualize transformations instantly!'}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {lang === 'ko' ? '멤버십 요금제 보기' : lang === 'ja' ? 'メンバーシッププランを見る' : lang === 'es' ? 'Ver Planes de Membresía' : 'View Membership Plans'}
              </button>
              <span className="text-[10px] text-center text-slate-400">
                {lang === 'ko' ? '언제든 간편하게 해지 및 관리 가능' : lang === 'ja' ? 'いつでも解約・管理が可能' : lang === 'es' ? 'Cancela en cualquier momento' : 'Cancel anytime in subscriptions'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 🪄 STEP 1 ~ 4 WIZARD MODAL (마법사 풀스크린) ── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-fade-in">
          {/* 마법사 상단 헤더 (참조 이미지 스타일: 좌측 뒤로가기, 중앙 Step 번호, 우측 닫기, 하단 4분할 세그먼트 바) */}
          <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="w-8 flex items-center justify-start">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-800 active:scale-90 text-lg font-bold transition-all cursor-pointer"
                    title={lang === 'ko' ? '이전 단계' : lang === 'ja' ? '前のステップ' : 'Previous step'}
                  >
                    ❮
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-white tracking-wide">
                  {wizardStep === 5
                    ? (isLoading
                        ? (lang === 'ko' ? 'AI 렌더링 중...' : lang === 'ja' ? 'AIレンダリング中...' : lang === 'es' ? 'Renderizando AI...' : 'AI Rendering...')
                        : (lang === 'ko' ? '나의 디자인 보드' : lang === 'ja' ? 'デザインボード' : lang === 'es' ? 'Tu Tablero' : 'Your Board'))
                    : (selectedTool.id === 'paint' || selectedTool.id === 'replace')
                    ? `Step ${wizardStep} / 3`
                    : selectedTool.id === 'cleanup'
                    ? `Step ${wizardStep} / 2`
                    : selectedTool.id === 'party_room'
                    ? `Step ${wizardStep === 4 ? 3 : wizardStep} / 3`
                    : `Step ${wizardStep} / 4`}
                </span>
              </div>

              <div className="w-8 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 text-base font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 프로그래스 바 (참조 이미지 스타일: 4분할 균등 세그먼트 라인) */}
            <div className="flex w-full gap-2 px-4 pb-2.5">
              {((selectedTool.id === 'cleanup')
                ? [1, 2]
                : (selectedTool.id === 'paint' || selectedTool.id === 'replace' || selectedTool.id === 'party_room')
                ? [1, 2, 3]
                : [1, 2, 3, 4]
              ).map((stepNum) => {
                const activeProgress = selectedTool.id === 'party_room' && wizardStep === 4 ? 3 : wizardStep;
                const isCompletedOrActive = stepNum <= activeProgress;
                return (
                  <div
                    key={stepNum}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isCompletedOrActive ? 'bg-white' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 마법사 스텝 1 / 4: 사진 추가 */}
          {wizardStep === 1 && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>📷</span>
                  <span>{translations.wizard.step1Title[lang]}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{translations.wizard.step1Sub[lang]}</p>

                {/* 메인 사진 업로드 영역 (휴대폰 사진첩/갤러리 및 카메라 지원, 드래그&드롭 지원) */}
                <div className="mt-4">
                  {!uploadedImage ? (
                    <div className="flex flex-col gap-2.5">
                      <div
                        onClick={() => galleryInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                        }}
                        className="flex min-h-[210px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-amber-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 text-center hover:border-amber-400 hover:bg-slate-900 active:scale-98 transition-all cursor-pointer shadow-xl"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl text-amber-400 border border-amber-500/30 shadow-lg">
                          🖼️
                        </div>
                        <div>
                          <span className="text-base font-black text-white block">{translations.wizard.uploadMain[lang]}</span>
                          <span className="text-xs text-amber-400 font-bold mt-1 block">{translations.wizard.uploadSub[lang]}</span>
                          <p className="text-[11px] text-slate-500 mt-1.5">{translations.wizard.uploadFormats[lang]}</p>
                        </div>
                      </div>

                      {/* 2단 빠른 모바일 선택 버튼 (사진첩 / 카메라 촬영) */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 py-3 px-2 text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 active:scale-95 transition-all shadow cursor-pointer"
                        >
                          <span className="text-base">🖼️</span>
                          <span>{translations.wizard.pickGallery[lang]}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 py-3 px-2 text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 active:scale-95 transition-all shadow cursor-pointer"
                        >
                          <span className="text-base">📷</span>
                          <span>{translations.wizard.takeCamera[lang]}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-amber-500/60 shadow-2xl">
                        <Image src={uploadedImage} alt="Uploaded Room" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-md hover:bg-red-500 transition-all font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer py-1 px-2"
                        >
                          {translations.wizard.changePhoto[lang]}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 샘플 예시 사진 피드 (정확히 3장 제공) */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{translations.wizard.sampleTitle[lang]}</span>
                    <span className="text-[10px] text-slate-500">{translations.wizard.sampleSub[lang]}</span>
                  </div>
                  <div className={`mt-2 grid ${selectedTool.id === 'layout' ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3'}`}>
                    {(TOOL_EXAMPLE_PHOTOS[selectedTool.id] || EXAMPLE_PHOTOS).slice(0, selectedTool.id === 'layout' ? 4 : 3).map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectExamplePhoto(src)}
                        className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${uploadedImage === src ? 'border-amber-500 scale-95 shadow-lg shadow-amber-500/30' : 'border-slate-800 hover:border-slate-600'
                          }`}
                      >
                        <Image src={src} alt="Example" fill className="object-cover" />
                        {selectedTool.id === 'replace' && (
                          <span className="absolute bottom-1.5 left-1.5 z-10 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-200 backdrop-blur-sm border border-slate-700/60 shadow">
                            {idx === 0 ? (lang === 'ko' ? '🛋️ 소파' : '🛋️ Sofa') : idx === 1 ? (lang === 'ko' ? '🛏️ 침대' : '🛏️ Bed') : (lang === 'ko' ? '🍽️ 식탁' : '🍽️ Dining')}
                          </span>
                        )}
                        {selectedTool.id === 'layout' && (
                          <span className="absolute bottom-1 left-1 z-10 rounded-md bg-slate-950/85 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-200 backdrop-blur-sm border border-slate-700/60 shadow">
                            {idx === 0 ? (lang === 'ko' ? '🛋️ 거실' : '🛋️ Living') : idx === 1 ? (lang === 'ko' ? '🛏️ 침실' : '🛏️ Bed') : idx === 2 ? (lang === 'ko' ? '🍳 주방' : '🍳 Kitchen') : (lang === 'ko' ? '💼 서재' : '💼 Study')}
                          </span>
                        )}
                        {uploadedImage === src && (
                          <div className="absolute inset-0 bg-amber-500/20 backdrop-brightness-110 flex items-center justify-center z-20">
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-md">
                              {translations.wizard.sampleSelected[lang]}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🤖 RoomFit AI 에이전트 맞춤 요구사항 입력 카드 (글자크기 0.7 비율 조정) */}
                <div className="mt-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/35 px-3.5 py-2.5 shadow-md">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-sm border border-amber-500/40">
                        🤖
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-black text-white truncate">{translations.wizard.agentTitle[lang]}</span>
                          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                            {lang === 'ko' ? '맞춤 요구사항' : lang === 'ja' ? 'カスタム指示' : lang === 'es' ? 'Personalizado' : 'Custom'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-300 mt-0.5 truncate max-w-[220px] leading-tight">
                          {userCustomPrompt ? `"${userCustomPrompt}"` : translations.wizard.agentDesc[lang]}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAgentOpen(true)}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-black text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {userCustomPrompt ? translations.wizard.agentEditButton[lang] : translations.wizard.agentButton[lang]}
                    </button>
                  </div>
                </div>
              </div>

              {/* 하단 탐색 버튼 (이전단계 + 다음단계) */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {translations.wizard.close[lang]}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!uploadedImage}
                  className={`w-2/3 rounded-2xl py-4 text-sm font-black transition-all text-center cursor-pointer ${uploadedImage
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {translations.wizard.next[lang]}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 3: 공간 레이아웃 모드 전용 - 공간 유형 선택 (실내인테리어와 동일한 2열 알약 캡슐 그리드 형식) */}
          {wizardStep === 2 && selectedTool.id === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="pb-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {lang === 'ko' ? '공간 선택' : lang === 'ja' ? '部屋タイプの選択' : lang === 'es' ? 'Elegir Espacio' : 'Choose Room'}
                    </h3>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                      {lang === 'ko' ? '스마트 레이아웃' : lang === 'ja' ? 'スマートレイアウト' : lang === 'es' ? 'Distribución' : 'Smart Layout'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'ko'
                      ? '재배치할 공간 유형을 선택하세요. 최적화된 동선과 맞춤형 가구 구도로 재설계됩니다.'
                      : lang === 'ja'
                      ? '再配置する部屋タイプを選択してください。最適な動線と家具レイアウトで再設計されます。'
                      : lang === 'es'
                      ? 'Selecciona el tipo de espacio a reorganizar con una distribución óptima.'
                      : 'Select the room type to rearrange with an optimized spatial layout.'}
                  </p>
                </div>

                {/* 2열 알약(Pill Capsule) 버튼 그리드 - 실내인테리어와 동일한 2열 형식 (아이들방 포함) */}
                <div className="mt-4 grid grid-cols-2 gap-3 pb-3">
                  {ROOM_OPTIONS.map((room) => {
                    const isSelected = (selectedRoom === room.id) || (!selectedRoom && room.id === 'bedroom');
                    const roomName = lang === 'ko' ? room.label : lang === 'ja' ? (room.labelJa || room.label) : lang === 'es' ? (room.labelEs || room.labelEn) : room.labelEn;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoom(room.id);
                          if (room.id === 'living_room') {
                            setSelectedSofaType('three_seater');
                            setSelectedBedType('none');
                            setSelectedDiningType('none');
                          } else if (room.id === 'bedroom') {
                            setSelectedBedType('super_single');
                            setSelectedSofaType('none');
                            setSelectedDiningType('none');
                          } else if (room.id === 'kitchen') {
                            setSelectedDiningType('four_person');
                            setSelectedBedType('none');
                            setSelectedSofaType('none');
                          } else if (room.id === 'study_room') {
                            setSelectedDeskType('standard');
                            setSelectedBedType('none');
                            setSelectedSofaType('none');
                          } else if (room.id === 'kids_room') {
                            setSelectedBedType('single');
                            setSelectedDeskType('compact');
                            setSelectedSofaType('none');
                            setSelectedDiningType('none');
                          }
                        }}
                        className={`group relative flex items-center gap-2.5 rounded-full px-4 py-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30 scale-[1.01]'
                            : 'border border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98]'
                        }`}
                      >
                        <span className={`text-xl shrink-0 transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                          {room.icon}
                        </span>
                        <div className="flex flex-col text-left leading-tight truncate min-w-0">
                          <span className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-amber-300 font-black' : 'text-slate-100'
                          }`}>
                            {roomName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 하단 탐색 버튼: 이전 + 계속하기 (Step 3 가구 보존/배치 페이지로 이동) */}
              <div className="mt-4 pt-2 border-t border-slate-900 sticky bottom-0 bg-slate-950/95 backdrop-blur-md pb-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/4 rounded-full border border-slate-700 bg-slate-850 py-4 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Atrás' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-3/4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-[0.98] py-4 text-sm sm:text-base font-black text-slate-950 shadow-xl shadow-amber-500/30 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{lang === 'ko' ? '계속하기 ➔' : lang === 'ja' ? '次へ ➔' : lang === 'es' ? 'Continuar ➔' : 'Continue ➔'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 3 / 4: 공간 레이아웃 모드 전용 - 방 크기 & 가구 실측 비례 맞춤 (단독 전용 페이지) */}
          {wizardStep === 3 && selectedTool.id === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base">📐</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>
                          {lang === 'ko'
                            ? '방 크기 & 가구 실측 비례 맞춤'
                            : lang === 'ja'
                            ? '部屋サイズ＆家具比率設定'
                            : lang === 'es'
                            ? 'Dimensiones y Escala'
                            : 'Room Dimensions & Scale Fit'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lang === 'ko'
                          ? '방 크기와 주요 가구 규격에 꼭 맞는 현실적 비례와 보행 통로(60~70cm)를 설계합니다.'
                          : 'Designs realistic furniture sizing and clearances tailored to your room dimensions.'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                    {lang === 'ko' ? '스마트 비례 맞춤' : 'Smart Scale'}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {/* 1. 가로 & 세로 치수 미세조절 (프리셋 삭제, 직관적 +/- 및 슬라이더) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300">
                        {lang === 'ko' ? '📏 방 실측 치수 조절' : '📏 Room Dimensions'}
                      </span>
                      <span className="text-[11px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                        {roomWidth.toFixed(1)}m × {roomLength.toFixed(1)}m
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {/* 방 가로(폭) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                          <span className="flex items-center gap-1">
                            <span className="text-amber-400">↔</span>
                            {lang === 'ko' ? '방 가로 (폭)' : 'Width'}
                          </span>
                          <span className="text-amber-400 font-black text-xs bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{roomWidth.toFixed(1)}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRoomWidth((w) => Math.max(1.8, Math.round((w - 0.1) * 10) / 10))}
                            className="h-8 w-8 shrink-0 rounded-lg bg-slate-800 text-sm font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1.8"
                            max="10.0"
                            step="0.1"
                            value={roomWidth}
                            onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                            className="min-w-0 flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => setRoomWidth((w) => Math.min(10.0, Math.round((w + 0.1) * 10) / 10))}
                            className="h-8 w-8 shrink-0 rounded-lg bg-slate-800 text-sm font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 방 세로(길이) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                          <span className="flex items-center gap-1">
                            <span className="text-amber-400">↕</span>
                            {lang === 'ko' ? '방 세로 (길이)' : 'Length'}
                          </span>
                          <span className="text-amber-400 font-black text-xs bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{roomLength.toFixed(1)}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRoomLength((l) => Math.max(1.8, Math.round((l - 0.1) * 10) / 10))}
                            className="h-8 w-8 shrink-0 rounded-lg bg-slate-800 text-sm font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1.8"
                            max="10.0"
                            step="0.1"
                            value={roomLength}
                            onChange={(e) => setRoomLength(parseFloat(e.target.value))}
                            className="min-w-0 flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => setRoomLength((l) => Math.min(10.0, Math.round((l + 0.1) * 10) / 10))}
                            className="h-8 w-8 shrink-0 rounded-lg bg-slate-800 text-sm font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 가구 규격 선택 4종 (침대, 소파, 식탁, 책상) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-md space-y-3.5">
                    <span className="text-xs font-black text-amber-300 block">
                      {lang === 'ko' ? '🛋️ 주요 가구 규격 선택' : '🛋️ Key Furniture Sizing'}
                    </span>

                    {/* 침대 규격 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-300">
                          {lang === 'ko' ? '🛏️ 침대 규격:' : '🛏️ Bed:'}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {activeBedOption.width > 0 ? `${activeBedOption.width}×${activeBedOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {BED_SIZE_OPTIONS.map((bed) => (
                          <button
                            key={bed.id}
                            type="button"
                            onClick={() => setSelectedBedType(bed.id as any)}
                            className={`py-1.5 px-1 rounded-xl text-[9.5px] font-bold text-center transition-all cursor-pointer ${
                              selectedBedType === bed.id
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {bed.shortLabel}
                            <span className="block text-[8px] opacity-80">{bed.width > 0 ? `${bed.width}×${bed.length}m` : '-'}</span>
                          </button>
                        ))}
                      </div>

                      {/* 💡 실측 비례 스마트 진단 안내 (침대 2개 / 방 길이 비례 검증) */}
                      {Math.max(roomWidth, roomLength) < 4.1 && (selectedBedType === 'twin_two' || selectedBedType === 'single') && (
                        <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-start gap-2">
                          <span className="text-xs shrink-0 mt-0.5">💡</span>
                          <div className="text-[11px] leading-relaxed text-amber-200">
                            <span className="font-extrabold text-amber-300">
                              {lang === 'ko' ? '실측 비례 검증 안내:' : 'Ergonomic Placement Insight:'}
                            </span>{' '}
                            <span className="text-slate-300">
                              {lang === 'ko'
                                ? `현재 방 최대 길이(${Math.max(roomWidth, roomLength).toFixed(1)}m)는 침대 2개 직렬(4.0m)보다 짧아 일렬 배치가 불가합니다. AI가 창문 앞을 가리지 않도록 11자 병렬 또는 L자 코너 배치로 현실적 비례와 동선을 설계합니다.`
                                : `Room length (${Math.max(roomWidth, roomLength).toFixed(1)}m) is less than 4.0m required for 2 beds in a straight line. AI will optimize using parallel (11-shape) or L-shape placement to keep windows and clearances open.`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 소파 규격 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-300">
                          {lang === 'ko' ? '🛋️ 소파 규격:' : '🛋️ Sofa:'}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {activeSofaOption.width > 0 ? `${activeSofaOption.width}×${activeSofaOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {SOFA_SIZE_OPTIONS.map((sofa) => (
                          <button
                            key={sofa.id}
                            type="button"
                            onClick={() => setSelectedSofaType(sofa.id as any)}
                            className={`py-1.5 px-1 rounded-xl text-[9.5px] font-bold text-center transition-all cursor-pointer ${
                              selectedSofaType === sofa.id
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {sofa.shortLabel}
                            <span className="block text-[8px] opacity-80">{sofa.width > 0 ? `${sofa.width}×${sofa.length}m` : '-'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 식탁 규격 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-300">
                          {lang === 'ko' ? '🍽️ 식탁 규격:' : '🍽️ Dining:'}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {activeDiningOption.width > 0 ? `${activeDiningOption.width}×${activeDiningOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {DINING_TABLE_OPTIONS.map((dining) => (
                          <button
                            key={dining.id}
                            type="button"
                            onClick={() => setSelectedDiningType(dining.id as any)}
                            className={`py-1.5 px-1 rounded-xl text-[9.5px] font-bold text-center transition-all cursor-pointer ${
                              selectedDiningType === dining.id
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {dining.shortLabel}
                            <span className="block text-[8px] opacity-80">{dining.width > 0 ? `${dining.width}×${dining.length}m` : '-'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 책상 규격 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-300">
                          {lang === 'ko' ? '🖥️ 책상 규격:' : '🖥️ Desk:'}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {activeDeskOption.width > 0 ? `${activeDeskOption.width}×${activeDeskOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {DESK_SIZE_OPTIONS.map((desk) => (
                          <button
                            key={desk.id}
                            type="button"
                            onClick={() => setSelectedDeskType(desk.id as any)}
                            className={`py-1.5 px-1 rounded-xl text-[9.5px] font-bold text-center transition-all cursor-pointer ${
                              selectedDeskType === desk.id
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {desk.shortLabel}
                            <span className="block text-[8px] opacity-80">{desk.width > 0 ? `${desk.width}×${desk.length}m` : '-'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. 실시간 스마트 공간 분석 & 통로 가이드 박스 */}
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3.5 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white">면적:</span>
                        <span className="text-amber-300 font-black">{roomAreaSqM}㎡ (약 {roomPyeong}평)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">가구 점유율:</span>
                        <span className={`font-black ${furnitureOccupancyPercent <= 35 ? 'text-emerald-400' : furnitureOccupancyPercent <= 50 ? 'text-amber-400' : 'text-orange-400'}`}>
                          {totalFurnitureArea}㎡ ({furnitureOccupancyPercent}%)
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-1.5">
                      <p className="text-[10.5px] text-slate-300 leading-snug">
                        {lang === 'ko' ? circulationStatus.textKo : circulationStatus.textEn}
                        <span className="block text-[9.5px] text-slate-400 mt-0.5">
                          {lang === 'ko' ? circulationStatus.descKo : circulationStatus.descEn}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 탐색 버튼: 이전 + 다음단계(가구 보존 설정) */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '다음 단계 (가구 보존 설정) ➔' : lang === 'ja' ? '次のステップ（家具保持）➔' : lang === 'es' ? 'Siguiente (Conservación) ➔' : 'Next (Preservation) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 4 / 4: 공간 레이아웃 모드 전용 - 가구 보존 & AI 자동 감지 품목 체크리스트 (독립 분리 페이지) */}
          {wizardStep === 4 && selectedTool.id === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>
                      {lang === 'ko'
                        ? '✨ 가구 보존 및 배치 설정'
                        : lang === 'ja'
                        ? '✨ 家具保持・配置設定'
                        : lang === 'es'
                        ? '✨ Conservación y Distribución'
                        : '✨ Furniture Preservation & Layout'}
                    </span>
                  </h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                    {lang === 'ko'
                      ? '스마트 레이아웃 재배치'
                      : lang === 'ja'
                      ? 'スマートレイアウト再配置'
                      : lang === 'es'
                      ? 'Reorganización Inteligente'
                      : 'Smart Layout Relocation'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ko'
                    ? '사진 속에서 위치 이동 및 최적화 재배치를 원하시는 품목을 선택해 주세요.'
                    : lang === 'ja'
                    ? '位置変更や最適な再配置を行いたいアイテムを選択してください。'
                    : lang === 'es'
                    ? 'Seleccione los elementos que desea mover y reorganizar en el espacio.'
                    : 'Select items you wish to relocate and optimize within the room.'}
                </p>

                {/* AI 인식 완료 안내 카드 */}
                <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base">🔍</span>
                    <div>
                      <span className="text-xs font-bold text-amber-300">
                        {lang === 'ko'
                          ? `AI 이미지 분석 완료 (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.label || '공간'})`
                          : lang === 'ja'
                          ? `AI画像解析完了 (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.labelJa || '空間'})`
                          : `AI Image Analysis Completed (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.labelEn || 'Room'})`}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'ko'
                          ? '골조/벽체는 100% 고정하고 가구만 이동합니다'
                          : lang === 'ja'
                          ? '構造・壁面は100%固定し家具のみを再配置します'
                          : lang === 'es'
                          ? 'La estructura se mantiene intacta, solo se mueven los muebles'
                          : 'Wall structures remain intact; only furniture moves'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const roomKey = selectedRoom || 'bedroom';
                      const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['bedroom'];
                      const allIds = presetItems.map((i) => i.id);
                      const allSelected = allIds.every((id) => selectedLayoutItemIds.includes(id));
                      if (allSelected) {
                        setSelectedLayoutItemIds([]);
                      } else {
                        setSelectedLayoutItemIds(allIds);
                      }
                    }}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {(() => {
                      const roomKey = selectedRoom || 'bedroom';
                      const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['bedroom'];
                      const allIds = presetItems.map((i) => i.id);
                      const isAll = allIds.every((id) => selectedLayoutItemIds.includes(id));
                      return isAll
                        ? (lang === 'ko' ? '전체 해제' : lang === 'ja' ? '選択解除' : lang === 'es' ? 'Deseleccionar' : 'Deselect All')
                        : (lang === 'ko' ? '전체 선택' : lang === 'ja' ? 'すべて選択' : lang === 'es' ? 'Seleccionar Todo' : 'Select All');
                    })()}
                  </button>
                </div>

                {/* 🛡️ 기존 가구 100% 보존 (가구 변형 금지) 토글 카드 */}
                <button
                  type="button"
                  onClick={() => setPreserveLayoutFurniture(!preserveLayoutFurniture)}
                  className={`mt-3.5 flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                    preserveLayoutFurniture
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 shadow-md ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                        preserveLayoutFurniture ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${preserveLayoutFurniture ? 'text-amber-300' : 'text-slate-300'}`}>
                          {lang === 'ko'
                            ? '기존 가구 100% 보존 (가구 변형 금지)'
                            : lang === 'ja'
                            ? '既存家具100%保持（変形・差し替え禁止）'
                            : lang === 'es'
                            ? '100% Conservar Muebles (Sin Deformación)'
                            : '100% Preserve Existing Furniture (No Deformation)'}
                        </span>
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                          {lang === 'ko' ? '추천' : 'BEST'}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">
                        {lang === 'ko'
                          ? '사진 속 가구의 디자인·색상·형태를 그대로 유지하며 완전히 새로운 배치 공간을 창출합니다'
                          : lang === 'ja'
                          ? '写真内の家具デザイン・色・形を完全に維持し、新しい配置空間を創出します'
                          : lang === 'es'
                          ? 'Mantiene el diseño y color exactos de los muebles, creando una nueva distribución'
                          : 'Keeps exact furniture design, colors, and materials while creating a brand-new spatial flow'}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                      preserveLayoutFurniture ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300' : 'border-2 border-slate-700 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </button>

                {/* 감지된 가구 리스트 체크박스 Grid */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                  {(() => {
                    const roomKey = selectedRoom || 'bedroom';
                    const presetItems = DETECTED_FURNITURE_PRESETS[roomKey] || DETECTED_FURNITURE_PRESETS['bedroom'];

                    const furnitureLabels: Record<string, Record<Language, string>> = {
                      sofa: { ko: '소파/카우치', ja: 'ソファ / カウチ', en: 'Sofa / Couch', es: 'Sofá / Chaise' },
                      table: { ko: '커피 테이블', ja: 'コーヒーテーブル', en: 'Coffee Table', es: 'Mesa de centro' },
                      tv_unit: { ko: 'TV 거실장', ja: 'テレビボード', en: 'TV Console Unit', es: 'Mueble de TV' },
                      rug: { ko: '러그/카펫', ja: 'ラグ / カーペット', en: 'Area Rug / Carpet', es: 'Alfombra' },
                      lighting: { ko: '플로어 스탠드 조명', ja: 'フロアスタンド照明', en: 'Floor Standing Lamp', es: 'Lámpara de pie' },
                      bed: { ko: '침대 (벽체 분리 이동)', ja: 'ベッド (壁面移動)', en: 'Bed & Bedframe', es: 'Cama' },
                      nightstand: { ko: '협탁', ja: 'サイドテーブル', en: 'Nightstand / Side Table', es: 'Mesa de noche' },
                      dresser: { ko: '서랍장/화장대 & 거울', ja: 'ドレッサー / 鏡台', en: 'Dresser Vanity & Mirror', es: 'Cómoda con espejo' },
                      chair: { ko: '1인 라운지 체어', ja: 'ラウンジチェア', en: 'Accent Lounge Chair', es: 'Sillón individual' },
                      wardrobe: { ko: '옷장/드레스룸', ja: 'ワードローブ / 収納', en: 'Wardrobe / Closet', es: 'Armario' },
                      desk: { ko: '서재 책상', ja: 'デスク / ワーク机', en: 'Desk & Chair', es: 'Escritorio' },
                      dining_table: { ko: '식탁 세트', ja: 'ダイニングテーブルセット', en: 'Dining Table & Chairs', es: 'Juego de comedor' },
                      island: { ko: '아일랜드 식탁', ja: 'アイランドカウンター', en: 'Kitchen Island Counter', es: 'Isla de cocina' },
                      chairs: { ko: '바 체어', ja: 'バーチェア / 스툴', en: 'Bar Stools / High Chairs', es: 'Taburetes de bar' },
                      child_bed: { ko: '어린이 침대/이층침대', ja: '子供用ベッド', en: 'Child Bed / Bunk Bed', es: 'Cama Infantil' },
                      study_desk: { ko: '공부 책상 & 의자', ja: '学習机・椅子', en: 'Study Desk & Chair', es: 'Escritorio de Estudio' },
                      bookshelf: { ko: '책장/수납장', ja: '本棚・収納', en: 'Bookshelf / Bookcase', es: 'Estantería' },
                      toy_storage: { ko: '장난감 정리함/수납함', ja: 'おもちゃ箱・収納', en: 'Toy Storage Chest / Bins', es: 'Caja de Juguetes' },
                      kids_rug: { ko: '놀이 매트/키즈 러그', ja: 'プレイマット・ラグ', en: 'Play Mat / Kids Rug', es: 'Alfombra Infantil' },
                      kids_lighting: { ko: '아이방 조명/스탠드', ja: '子供部屋ライト', en: 'Kids Room Lighting', es: 'Luz Infantil' },
                      furniture: { ko: '가구 전반', ja: '家具全般', en: 'Main Furniture', es: 'Muebles principales' },
                      sub_furniture: { ko: '보조 테이블/의자', ja: '補助テーブル / 椅子', en: 'Secondary Table / Chairs', es: 'Mesas y sillas auxiliares' },
                      decor: { ko: '인테리어 소품', ja: 'インテリア小物・観葉植物', en: 'Interior Decor & Plants', es: 'Decoración y plantas' },
                    };

                    return presetItems.map((item) => {
                      const isChecked = selectedLayoutItemIds.includes(item.id);
                      const displayLabel = furnitureLabels[item.id]?.[lang] || (lang === 'en' ? item.enName : item.label);
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
                            <span className="text-xs font-bold leading-tight">{displayLabel}</span>
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

                {/* 고품질 단일 시안 안내 */}
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span className="text-xs font-bold text-amber-200">
                      {lang === 'ko' ? '최적화된 맞춤 가구 재배치 시안 생성' : lang === 'ja' ? '最適化された家具配置デザインを生成' : lang === 'es' ? 'Diseño de Distribución Optimizado' : 'Optimized Furniture Layout Design'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-1">
                    {lang === 'ko' ? '1 크레딧 차감' : lang === 'ja' ? '1クレジット消費' : lang === 'es' ? '1 Crédito' : '1 Credit'}
                  </span>
                </div>
              </div>

              {/* 하단 탐색 버튼 (이전단계 + 생성하기) */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '✨ 가구 재배치 생성하기' : lang === 'ja' ? '✨ 家具再配置を生成する' : lang === 'es' ? '✨ Generar Distribución' : '✨ Generate Spatial Layout'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 4: 건물 외관 변경 요소 선택 (건물 외관 리모델링 도구 전용) */}
          {wizardStep === 2 && selectedTool.id === 'exterior' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '외형 변경 요소 선택' : lang === 'ja' ? '外観変更要素の選択' : lang === 'es' ? 'Elementos a Modificar' : 'Select Exterior Elements'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? `변화를 줄 건축 요소를 선택해 주세요 (${selectedExteriorElementIds.length}/8)` : lang === 'ja' ? `リフォームする建築要素を選択してください (${selectedExteriorElementIds.length}/8)` : lang === 'es' ? `Elige los elementos a transformar (${selectedExteriorElementIds.length}/8)` : `Select building elements to upgrade (${selectedExteriorElementIds.length}/8)`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllExteriorElements}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    {selectedExteriorElementIds.length === EXTERIOR_ELEMENT_OPTIONS.length
                      ? (lang === 'ko' ? '전체 해제' : lang === 'ja' ? '選択解除' : lang === 'es' ? 'Deseleccionar' : 'Deselect All')
                      : (lang === 'ko' ? '전체 선택' : lang === 'ja' ? 'すべて選択' : lang === 'es' ? 'Seleccionar Todo' : 'Select All')}
                  </button>
                </div>

                {/* 8가지 외형 변경 요소 선택 그리드 */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {EXTERIOR_ELEMENT_OPTIONS.map((element) => {
                    const isChecked = selectedExteriorElementIds.includes(element.id);
                    return (
                      <button
                        key={element.id}
                        type="button"
                        onClick={() => toggleExteriorElementId(element.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="text-2xl">{element.icon}</span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                              isChecked
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className={`text-xs font-black leading-tight ${isChecked ? 'text-amber-300' : 'text-slate-200'}`}>
                            {lang === 'ko' ? element.label : element.enName}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                            {lang === 'ko' ? element.desc : element.enName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 고품질 단일 시안 안내 */}
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏛️</span>
                    <span className="text-xs font-bold text-amber-200">
                      {lang === 'ko' ? '고품질 건축 외관 모던 리모델링 시안 생성' : lang === 'ja' ? '高品質な建築外観リフォーム案を生成' : lang === 'es' ? 'Diseño Exterior de Alta Calidad' : 'High-Quality Architectural Remodeling'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-1">
                    {lang === 'ko' ? '1 크레딧 차감' : lang === 'ja' ? '1クレジット消費' : lang === 'es' ? '1 Crédito' : '1 Credit'}
                  </span>
                </div>

                {/* 건축 보존 안내 배너 */}
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
                  <span className="text-sm">🏛️</span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {lang === 'ko'
                      ? '건물의 층수, 면적, 뼈대는 100% 안전하게 유지되며, 선택된 외형 요소들만 정밀하게 모던 리모델링됩니다.'
                      : lang === 'ja'
                      ? '建物の階数、面積、骨組みは100%保持され、選択した外観要素のみ精密にリノベーションされます。'
                      : lang === 'es'
                      ? 'La altura, estructura y dimensiones del edificio se preservan 100%, modernizando solo los elementos seleccionados.'
                      : 'Building height, massing, and footprint are 100% locked, precision remodeling only selected facade elements.'}
                  </p>
                </div>
              </div>

              {/* 하단 탐색 버튼 */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (스타일) ➔' : lang === 'ja' ? '次のステップ（スタイル）➔' : lang === 'es' ? 'Siguiente Paso (Estilo) ➔' : 'Next Step (Style) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 4: 정원 & 테라스 구조물/옵션 선택 (정원 도구 전용) */}
          {wizardStep === 2 && selectedTool.id === 'garden' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '정원 옵션 & 구조물 선택' : lang === 'ja' ? '庭園オプション＆構造物の選択' : lang === 'es' ? 'Estructuras y Opciones de Jardín' : 'Garden Options & Structures'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? `배치할 시설과 요소를 선택해 주세요 (${selectedGardenStructureIds.length}/8)` : lang === 'ja' ? `配置したい施設や要素を選択してください (${selectedGardenStructureIds.length}/8)` : lang === 'es' ? `Elige las instalaciones a colocar (${selectedGardenStructureIds.length}/8)` : `Select features & amenities to install (${selectedGardenStructureIds.length}/8)`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllGardenStructures}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    {selectedGardenStructureIds.length === GARDEN_STRUCTURE_OPTIONS.length
                      ? (lang === 'ko' ? '전체 해제' : lang === 'ja' ? '選択解除' : lang === 'es' ? 'Deseleccionar' : 'Deselect All')
                      : (lang === 'ko' ? '전체 선택' : lang === 'ja' ? 'すべて選択' : lang === 'es' ? 'Seleccionar Todo' : 'Select All')}
                  </button>
                </div>

                {/* 8가지 정원 구조물/옵션 선택 그리드 */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {GARDEN_STRUCTURE_OPTIONS.map((item) => {
                    const isChecked = selectedGardenStructureIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleGardenStructureId(item.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="text-2xl">{item.icon}</span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                              isChecked
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className={`text-xs font-black leading-tight ${isChecked ? 'text-amber-300' : 'text-slate-200'}`}>
                            {lang === 'ko' ? item.label : item.enName}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                            {lang === 'ko' ? item.desc : item.enName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 고품질 단일 시안 안내 */}
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌿</span>
                    <span className="text-xs font-bold text-emerald-200">
                      {lang === 'ko' ? '고품질 정원 & 테라스 프리미엄 조경 시안 생성' : lang === 'ja' ? '高品質な庭園・テラス造園案を生成' : lang === 'es' ? 'Diseño de Jardín y Terraza Premium' : 'Premium Garden & Landscape Design'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2.5 py-1">
                    {lang === 'ko' ? '1 크레딧 차감' : lang === 'ja' ? '1クレジット消費' : lang === 'es' ? '1 Crédito' : '1 Credit'}
                  </span>
                </div>

                {/* 정원 보존 안내 배너 */}
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
                  <span className="text-sm">🌿</span>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    {lang === 'ko'
                      ? '기존 주택 외관과 대지 경계는 100% 안전하게 유지되며, 선택된 아웃도어 시설과 프리미엄 조경이 조화롭게 배치됩니다.'
                      : lang === 'ja'
                      ? '既存の住宅外観と敷地境界は100%維持され、選択したアウトドア施設とプレミアム造園が調和して配置されます。'
                      : lang === 'es'
                      ? 'La fachada y límites de la propiedad se preservan 100%, integrando armónicamente las áreas y vegetación elegidas.'
                      : 'Existing house facade and boundaries are 100% preserved, seamlessly integrating chosen landscape features.'}
                  </p>
                </div>
              </div>

              {/* 하단 탐색 버튼 */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (스타일) ➔' : lang === 'ja' ? '次のステップ（スタイル）➔' : lang === 'es' ? 'Siguiente Paso (Estilo) ➔' : 'Next Step (Style) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 2: 치울 대상 선택 (청소 & 짐 정리 도구 전용) */}
          {wizardStep === 2 && selectedTool.id === 'cleanup' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '치울 대상 선택 (마스킹 & 마크)' : lang === 'ja' ? '片付け対象の選択（マスキング＆マーク）' : lang === 'es' ? 'Seleccionar Objetos a Limpiar' : 'Select Clutter to Erase'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? '치우고자 하는 가구나 쓰레기, 소품을 칠하거나 탭하여 마크해 주세요' : lang === 'ja' ? '消去したい家具や荷物、ゴミを塗るかタップしてマークしてください' : lang === 'es' ? 'Pinta o toca los objetos y desorden que desees eliminar' : 'Paint or tap to mark unwanted furniture, clutter, or trash'}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-black text-rose-400 border border-rose-500/30 shrink-0">
                    {lang === 'ko' ? '🧹 스마트 클린업' : lang === 'ja' ? '🧹 スマートクリーンアップ' : lang === 'es' ? '🧹 Limpieza Inteligente' : '🧹 Smart Clean Up'}
                  </span>
                </div>

                {/* 툴바 컨트롤: 도구(색칠/마크/지우개) + 브러시 크기 + Undo + 초기화 */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 backdrop-blur-md">
                  {/* 도구 선택 모드 */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCleanupToolMode('brush')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                        cleanupToolMode === 'brush'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>🖌️</span>
                      <span>{lang === 'ko' ? '색칠하기' : lang === 'ja' ? '塗る' : lang === 'es' ? 'Pintar' : 'Brush'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCleanupToolMode('pin')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                        cleanupToolMode === 'pin'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>📍</span>
                      <span>{lang === 'ko' ? '마크 찍기' : lang === 'ja' ? 'マーク' : lang === 'es' ? 'Punto' : 'Pin'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCleanupToolMode('eraser')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                        cleanupToolMode === 'eraser'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>🧽</span>
                      <span>{lang === 'ko' ? '지우개' : lang === 'ja' ? '消しゴム' : lang === 'es' ? 'Borrador' : 'Eraser'}</span>
                    </button>
                  </div>

                  {/* 브러시 크기 & 액션 버튼 */}
                  <div className="flex items-center gap-1.5">
                    {cleanupToolMode !== 'pin' && (
                      <div className="flex items-center gap-1 bg-slate-950/80 rounded-xl p-1 border border-slate-800">
                        {[15, 25, 40].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setCleanupBrushSize(size)}
                            className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              cleanupBrushSize === size
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {size === 15 ? (lang === 'ko' ? '소' : lang === 'ja' ? '小' : 'S') : size === 25 ? (lang === 'ko' ? '중' : lang === 'ja' ? '中' : 'M') : (lang === 'ko' ? '대' : lang === 'ja' ? '大' : 'L')}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleCleanupUndo}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                      title={lang === 'ko' ? '실행 취소' : lang === 'ja' ? '元に戻す' : lang === 'es' ? 'Deshacer' : 'Undo'}
                    >
                      ↩️
                    </button>
                    <button
                      type="button"
                      onClick={handleCleanupClear}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                      title={lang === 'ko' ? '전체 초기화' : lang === 'ja' ? 'リセット' : lang === 'es' ? 'Reiniciar' : 'Reset'}
                    >
                      🔄
                    </button>
                  </div>
                </div>

                {/* 인터랙티브 마스킹/마크 캔버스 영역 */}
                <div
                  ref={cleanupContainerRef}
                  style={{ aspectRatio: `${cleanupImgAspectRatio}` }}
                  className="relative mt-3 w-full max-h-[52vh] rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl touch-none select-none mx-auto"
                >
                  <img
                    ref={cleanupImageRef}
                    src={uploadedImage || EXAMPLE_PHOTOS[0]}
                    alt="Clean target"
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth && img.naturalHeight) {
                        setCleanupImgAspectRatio(img.naturalWidth / img.naturalHeight);
                        setTimeout(initCleanupCanvas, 50);
                      }
                    }}
                  />
                  <canvas
                    ref={cleanupCanvasRef}
                    className="absolute inset-0 h-full w-full cursor-crosshair z-10 touch-none"
                    onMouseDown={handleCleanupPointerDown}
                    onMouseMove={handleCleanupPointerMove}
                    onMouseUp={handleCleanupPointerUp}
                    onMouseLeave={handleCleanupPointerUp}
                    onTouchStart={handleCleanupPointerDown}
                    onTouchMove={handleCleanupPointerMove}
                    onTouchEnd={handleCleanupPointerUp}
                  />

                  {/* 캔버스 상단 마킹 안내 툴팁 */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-black text-rose-300 backdrop-blur-md border border-rose-500/40 shadow-lg pointer-events-none">
                    <span>{cleanupToolMode === 'brush' ? (lang === 'ko' ? '🖌️ 반투명 틴트로 칠해진 영역' : lang === 'ja' ? '🖌️ 塗られた領域' : '🖌️ Brushed Area') : cleanupToolMode === 'pin' ? (lang === 'ko' ? '📍 마크된 소품/가구' : lang === 'ja' ? '📍 マークしたアイテム' : '📍 Marked Item') : (lang === 'ko' ? '🧽 지우개 모드' : lang === 'ja' ? '🧽 消しゴム' : '🧽 Eraser')}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-white">
                      {cleanupMarksCount > 0
                        ? (lang === 'ko' ? `${cleanupMarksCount}개 대상 지정됨` : lang === 'ja' ? `${cleanupMarksCount}件の対象を指定` : lang === 'es' ? `${cleanupMarksCount} objetos marcados` : `${cleanupMarksCount} items marked`)
                        : (lang === 'ko' ? '화면을 드래그하거나 탭하세요' : lang === 'ja' ? '画面をドラッグまたはタップ' : lang === 'es' ? 'Arrastra o toca la pantalla' : 'Drag or tap the image')}
                    </span>
                  </div>
                </div>

                {/* 치울 대상 카테고리 칩 선택 (복수 선택) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      {lang === 'ko' ? '치울 대상 종류 (복수 선택)' : lang === 'ja' ? '片付け対象のカテゴリー（複数選択）' : lang === 'es' ? 'Categorías a eliminar' : 'Clutter Categories (Multi-select)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lang === 'ko' ? '체크된 대상 우선 삭제' : lang === 'ja' ? 'チェックした項目を優先消去' : lang === 'es' ? 'Prioridad de borrado' : 'Prioritize checked items'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {CLEANUP_TARGET_CATEGORIES.map((cat) => {
                      const isChecked = selectedCleanupCategories.includes(cat.id);
                      const catLabels: Record<string, string> = {
                        floor_trash: lang === 'ko' ? '바닥 쓰레기·잡동사니' : lang === 'ja' ? '床のゴミ・散乱物' : lang === 'es' ? 'Basura del suelo' : 'Floor Trash & Clutter',
                        boxes: lang === 'ko' ? '적재 박스·짐' : lang === 'ja' ? '段ボール箱・荷物' : lang === 'es' ? 'Cajas de mudanza' : 'Boxes & Moving Luggage',
                        furniture: lang === 'ko' ? '불필요한 가구·의자' : lang === 'ja' ? '不要な家具・椅子' : lang === 'es' ? 'Muebles redundantes' : 'Redundant Furniture',
                        cables: lang === 'ko' ? '지저분한 전선·멀티탭' : lang === 'ja' ? '散らかった配線コード' : lang === 'es' ? 'Cables y enchufes' : 'Messy Cables & Wires',
                        clothes: lang === 'ko' ? '옷가지·침구 주름' : lang === 'ja' ? '衣類・散らかった布' : lang === 'es' ? 'Ropa y telas' : 'Clothes & Laundry',
                        table_clutter: lang === 'ko' ? '식탁/테이블 위 소품' : lang === 'ja' ? 'テーブルの上の小物' : lang === 'es' ? 'Desorden de mesa' : 'Tabletop Clutter',
                      };
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCleanupCategory(cat.id)}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                            isChecked
                              ? 'border-rose-400 bg-rose-500/10 font-bold text-white shadow-sm ring-1 ring-rose-400/40'
                              : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cat.icon}</span>
                            <span className={`text-xs ${isChecked ? 'text-rose-300 font-black' : 'text-slate-300'}`}>
                              {catLabels[cat.id] || cat.label}
                            </span>
                          </div>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black transition-all ${
                              isChecked
                                ? 'bg-rose-500 text-white'
                                : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 결과물 개수: 1장 고정 단일 시안 배너 */}
                <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 flex items-start gap-2.5">
                  <span className="text-base">🖼️</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300">
                        {lang === 'ko' ? '단일 고화질 정밀 복원 (1장 생성)' : lang === 'ja' ? '高画質精密復元 (1枚生成)' : lang === 'es' ? 'Restauración precisa (1 imagen)' : 'Precision Clean Up (Single)'}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-400">1 Credit</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {lang === 'ko'
                        ? '지정한 가구·소품·쓰레기만 깨끗이 삭제되고 원래 바닥과 벽면이 완벽하게 복원됩니다.'
                        : lang === 'ja'
                        ? '指定した家具・荷物・ゴミのみ綺麗に消去され、元の床や壁が自然に復元されます。'
                        : lang === 'es'
                        ? 'Los objetos seleccionados se eliminarán limpiamente, restaurando paredes y suelos con naturalidad.'
                        : 'Designated clutter is seamlessly erased, naturally restoring the original floor and walls.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼 (이전단계 + 즉시 생성하기) */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '✨ 선택 영역 깨끗이 청소하기 (1장)' : lang === 'ja' ? '✨ 選択エリアをクリーンアップ (1枚)' : lang === 'es' ? '✨ Limpiar Áreas Seleccionadas (1)' : '✨ Clean Selected Clutter (1)'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 3: 수정할 공간 영역 선택 (벽지 & 페인트 교체 도구 전용) */}
          {wizardStep === 2 && selectedTool.id === 'paint' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>{lang === 'ko' ? '🎨 수정할 공간 영역 선택' : lang === 'ja' ? '🎨 施工する空間領域の選択' : lang === 'es' ? '🎨 Áreas a Transformar' : '🎨 Select Surfaces to Renovate'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? `새롭게 시공할 공간 영역을 선택해 주세요 (${selectedPaintSurfaceIds.length}/${PAINT_SURFACE_OPTIONS.length})` : lang === 'ja' ? `施工する領域を選択してください (${selectedPaintSurfaceIds.length}/${PAINT_SURFACE_OPTIONS.length})` : lang === 'es' ? `Elige las áreas a modificar (${selectedPaintSurfaceIds.length}/${PAINT_SURFACE_OPTIONS.length})` : `Select surfaces to renovate (${selectedPaintSurfaceIds.length}/${PAINT_SURFACE_OPTIONS.length})`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllPaintSurfaces}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    {selectedPaintSurfaceIds.length === PAINT_SURFACE_OPTIONS.length
                      ? (lang === 'ko' ? '전체 해제' : lang === 'ja' ? '選択解除' : lang === 'es' ? 'Deseleccionar' : 'Deselect All')
                      : (lang === 'ko' ? '전체 선택' : lang === 'ja' ? 'すべて選択' : lang === 'es' ? 'Seleccionar Todo' : 'Select All')}
                  </button>
                </div>

                {/* AI 자동 공간 분석 배너 (초이스룸 대체 안내) */}
                <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base">🔍</span>
                    <div>
                      <span className="text-xs font-bold text-amber-300">
                        {lang === 'ko' ? `AI 공간 자동 감지 (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.label || '실내 공간'})` : lang === 'ja' ? `AI空間自動検出 (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.labelJa || '室内空間'})` : `AI Space Detection (${ROOM_OPTIONS.find((r) => r.id === selectedRoom)?.labelEn || 'Interior'})`}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'ko' ? '골조와 가구는 100% 보존되며 선택된 표면만 정밀 시공됩니다' : lang === 'ja' ? '骨組みと家具は100%保持され、選択した表面のみ精密施工されます' : lang === 'es' ? 'Estructura y muebles 100% preservados, modificando solo superficies seleccionadas' : 'Architecture & furniture 100% preserved, precision remodeling chosen surfaces.'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                    {lang === 'ko' ? '가구 100% 락' : lang === 'ja' ? '家具100%ロック' : lang === 'es' ? 'Muebles Bloqueados' : 'Furniture 100% Locked'}
                  </span>
                </div>

                {/* 5가지 시공 영역 선택 리스트 */}
                <div className="mt-4 flex flex-col gap-2.5">
                  {PAINT_SURFACE_OPTIONS.map((surface) => {
                    const isChecked = selectedPaintSurfaceIds.includes(surface.id);
                    return (
                      <button
                        key={surface.id}
                        type="button"
                        onClick={() => togglePaintSurfaceId(surface.id)}
                        className={`group relative flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'border-amber-400 bg-amber-500/10 font-bold text-white shadow-md ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl border border-slate-700">
                            {surface.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${isChecked ? 'text-amber-300' : 'text-slate-200'}`}>
                                {lang === 'ko' ? surface.label : surface.enName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {surface.enName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                              {lang === 'ko' ? surface.desc : surface.enName}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                            isChecked
                              ? 'bg-amber-400 text-slate-950 shadow'
                              : 'border border-slate-700 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 단일 결과물 고정 안내 배너 */}
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
                  <span className="text-base">🖼️</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        {lang === 'ko' ? '단일 고화질 정밀 시공 (1장 생성)' : lang === 'ja' ? '高画質精密施工 (1枚生成)' : lang === 'es' ? 'Renovación de Precisión (1)' : 'Precision Renovation (Single)'}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-400">1 Credit</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {lang === 'ko' ? '다음 단계에서 선택된 영역별로 원하는 재료(벽돌, 대리석, 벽지, 페인트, 원목 등)와 색상을 지정합니다.' : lang === 'ja' ? '次のステップで選択領域ごとに希望の素材（壁紙、ペイント、大理石など）と色を指定します。' : lang === 'es' ? 'En el siguiente paso podrás elegir materiales y colores para cada área.' : 'In the next step, customize materials (wallpaper, paint, marble, wood) and colors.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 하단 네비게이션 버튼 */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (색상 & 재료 선택) ➔' : lang === 'ja' ? '次のステップ（色・素材選択）➔' : lang === 'es' ? 'Siguiente Paso (Color y Material) ➔' : 'Next Step (Color & Material) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 3: 가구 디자인 스타일 선택 (가구 & 소품 교체 도구 전용: 8가지 가구 스타일) */}
          {wizardStep === 2 && selectedTool.id === 'replace' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>{lang === 'ko' ? '🛋️ 가구 디자인 스타일' : lang === 'ja' ? '🛋️ 家具デザインスタイル' : lang === 'es' ? '🛋️ Estilos de Muebles' : '🛋️ Furniture Design Styles'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'ko' ? '원하시는 8가지 가구 디자인 스타일 중 하나를 선택해 주세요.' : lang === 'ja' ? 'ご希望の8つの家具デザインスタイルから1つ選択してください。' : lang === 'es' ? 'Elige uno de los 8 estilos de diseño de muebles.' : 'Select one of the 8 bespoke furniture design styles.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-400 border border-amber-500/30">
                    {lang === 'ko' ? '8대 디자인 양식' : lang === 'ja' ? '8大デザイン様式' : lang === 'es' ? '8 Estilos' : '8 Styles'}
                  </span>
                </div>

                {/* 8가지 가구 디자인 양식 선택 그리드 */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {REPLACE_FURNITURE_STYLES.map((style) => {
                    const isSelected = selectedFurnitureStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedFurnitureStyle(style.id)}
                        className={`relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 font-bold text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="text-2xl">{style.icon}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {style.badge}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{lang === 'ko' ? style.label : style.enName}</span>
                            {isSelected && (
                              <span className="text-amber-400 text-[11px] font-black">✓</span>
                            )}
                          </div>
                          <span className="block text-[10px] text-amber-300/80 font-medium">{style.enName}</span>
                          <p className="mt-1 text-[10px] text-slate-400 leading-tight line-clamp-2">
                            {lang === 'ko' ? style.desc : style.enName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 하단 네비게이션 버튼 */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (색상 & 질감 선택) ➔' : lang === 'ja' ? '次のステップ（色・質感選択）➔' : lang === 'es' ? 'Siguiente Paso (Color y Textura) ➔' : 'Next Step (Color & Texture) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 4: 파티 종류 선택 (초이스룸 대신 파티 테마 8종 선택) */}
          {wizardStep === 2 && selectedTool.id === 'party_room' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '파티 종류 선택' : lang === 'ja' ? 'パーティー種類の選択' : lang === 'es' ? 'Tipo de Fiesta' : 'Select Party Theme'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? '특별한 날을 빛내줄 8가지 스페셜 파티 & 이벤트 테마' : lang === 'ja' ? '特別な日を彩る8つのスペシャルパーティー＆イベントテーマ' : lang === 'es' ? '8 temas especiales para tus celebraciones' : '8 special party & event themes for your special day'}
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-black text-pink-400 border border-pink-500/30 shrink-0">
                    {lang === 'ko' ? '🎉 8대 파티 테마' : lang === 'ja' ? '🎉 8大パーティーテーマ' : lang === 'es' ? '🎉 8 Temas' : '🎉 8 Party Themes'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
                  {PARTY_STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    const styleLabel = lang === 'ko' ? style.label : lang === 'ja' ? (style.labelJa || style.label) : lang === 'es' ? (style.labelEs || style.enName) : style.enName;
                    const subLabel = lang === 'ko' ? style.enName : lang === 'ja' ? style.enName : style.label;
                    const styleBadge = lang === 'ko' ? style.badge : lang === 'ja' ? (style.badgeJa || style.badge) : lang === 'es' ? (style.badgeEs || style.badge) : (style.badgeEn || style.badge);
                    const styleDesc = lang === 'ko' ? style.desc : lang === 'ja' ? (style.descJa || style.desc) : lang === 'es' ? (style.descEs || style.desc) : (style.descEn || style.desc);

                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setSelectedRoom('party_room');
                        }}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-pink-400 ring-2 ring-pink-400/50 scale-[0.98] shadow-lg shadow-pink-500/25 bg-slate-900'
                            : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="relative aspect-square w-full overflow-hidden">
                          <Image
                            src={style.image}
                            alt={styleLabel}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-slate-950/85 px-2 py-0.5 text-[10px] font-black text-pink-300 backdrop-blur-md border border-pink-500/30 shadow-md">
                            <span>{style.icon}</span>
                            <span>{styleBadge}</span>
                          </span>

                          {isSelected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-black text-white shadow-md">
                              ✓
                            </span>
                          )}

                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className={`text-xs font-black leading-tight block ${isSelected ? 'text-pink-300' : 'text-white'}`}>
                              {styleLabel}
                            </span>
                            <span className="text-[9px] text-slate-300 font-bold block truncate">
                              {subLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-950/60 flex-1 flex flex-col justify-center">
                          <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                            {styleDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (컬러 선택) ➔' : lang === 'ja' ? '次のステップ（カラー設定）➔' : lang === 'es' ? 'Siguiente Paso (Color) ➔' : 'Next Step (Color) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 2 / 4: 공간 선택 (기타 일반 실내 인테리어 도구용 - 첨부 이미지 알약 캡슐 및 레드 액센트 스타일) */}
          {wizardStep === 2 && selectedTool.id !== 'layout' && selectedTool.id !== 'exterior' && selectedTool.id !== 'garden' && selectedTool.id !== 'cleanup' && selectedTool.id !== 'paint' && selectedTool.id !== 'replace' && selectedTool.id !== 'party_room' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="pb-1">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {lang === 'ko' ? '공간 선택' : lang === 'ja' ? '部屋タイプの選択' : lang === 'es' ? 'Elegir Espacio' : 'Choose Room'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'ko'
                      ? '디자인을 적용할 공간을 선택하세요. 원하는 스타일에 맞춰 변환됩니다.'
                      : lang === 'ja'
                      ? 'デザインを適用する空間を選択してください。希望のスタイルに合わせて変換されます。'
                      : lang === 'es'
                      ? 'Selecciona un espacio para transformar con tu estilo preferido.'
                      : 'Select a room to design and see it transformed in your chosen style.'}
                  </p>
                </div>

                {/* 2열 알약(Pill Capsule) 버튼 그리드 - 순수 한글 및 다국어 지원 */}
                <div className="mt-4 grid grid-cols-2 gap-3 pb-3">
                  {ROOM_OPTIONS.map((room) => {
                    const isSelected = (selectedRoom === room.id) || (!selectedRoom && room.id === 'kitchen');
                    const roomName = lang === 'ko' ? room.label : lang === 'ja' ? (room.labelJa || room.label) : lang === 'es' ? (room.labelEs || room.labelEn) : room.labelEn;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoom(room.id)}
                        className={`group relative flex items-center gap-2.5 rounded-full px-4 py-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20 ring-1 ring-red-500/30 scale-[1.01]'
                            : 'border border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98]'
                        }`}
                      >
                        <span className={`text-xl shrink-0 transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                          {room.icon}
                        </span>
                        <div className="flex flex-col text-left leading-tight truncate min-w-0">
                          <span className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-red-400 font-black' : 'text-slate-100'
                          }`}>
                            {roomName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 📐 방 실측 규격 & 가구 비례 맞춤 설정 카드 */}
                <div className="mt-2 mb-3 rounded-2xl border border-amber-500/30 bg-slate-900/95 p-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-sm">📐</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">
                            {lang === 'ko' ? '방 크기 & 가구 실측 비례 맞춤' : lang === 'ja' ? '部屋サイズ＆家具比率設定' : lang === 'es' ? 'Dimensiones y Escala' : 'Room Dimensions & Scale Fit'}
                          </span>
                          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[8px] font-bold text-amber-400 border border-amber-500/30">
                            {lang === 'ko' ? '비례 맞춤' : 'Smart Scale'}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400">
                          {lang === 'ko' ? '방 크기에 꼭 맞는 현실적 가구 크기와 통로(60~70cm)를 설계합니다' : 'Calculates realistic furniture sizing and clearances for your room'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDimensionCustomEnabled(!isDimensionCustomEnabled)}
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-black transition-all cursor-pointer ${
                        isDimensionCustomEnabled
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isDimensionCustomEnabled ? (lang === 'ko' ? 'ON 적용중' : 'ON Active') : (lang === 'ko' ? 'OFF 끄기' : 'OFF')}
                    </button>
                  </div>

                  {isDimensionCustomEnabled && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
                      {/* 1. 빠른 대표 규격 4종 선택 */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                          {lang === 'ko' ? '자주 쓰는 방 크기 선택:' : 'Quick Room Presets:'}
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {ROOM_DIMENSION_PRESETS.map((preset) => {
                            const isPresetActive = Math.abs(roomWidth - preset.width) < 0.15 && Math.abs(roomLength - preset.length) < 0.15;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setRoomWidth(preset.width);
                                  setRoomLength(preset.length);
                                }}
                                className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-center transition-all cursor-pointer ${
                                  isPresetActive
                                    ? 'border border-amber-400 bg-amber-500/20 text-amber-300 font-black shadow-sm ring-1 ring-amber-400/40'
                                    : 'border border-slate-800 bg-slate-800/70 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className="text-xs">{preset.icon}</span>
                                <span className="text-[9px] font-bold mt-0.5 leading-tight">{lang === 'ko' ? preset.label : preset.labelEn}</span>
                                <span className="text-[8px] text-slate-400">{preset.width}×{preset.length}m</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. 가로 & 세로 길이 미세조절 (+/- 및 슬라이더) */}
                      <div className="space-y-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                            <span className="flex items-center gap-1">
                              <span className="text-amber-400">↔</span>
                              {lang === 'ko' ? '방 가로 (폭)' : 'Width'}
                            </span>
                            <span className="text-amber-400 font-black text-xs bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{roomWidth.toFixed(1)}m</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRoomWidth((w) => Math.max(1.8, Math.round((w - 0.1) * 10) / 10))}
                              className="h-7 w-7 shrink-0 rounded-lg bg-slate-800 text-xs font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                            >
                              -
                            </button>
                            <input
                              type="range"
                              min="1.8"
                              max="8.0"
                              step="0.1"
                              value={roomWidth}
                              onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                              className="min-w-0 flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => setRoomWidth((w) => Math.min(10.0, Math.round((w + 0.1) * 10) / 10))}
                              className="h-7 w-7 shrink-0 rounded-lg bg-slate-800 text-xs font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                            <span className="flex items-center gap-1">
                              <span className="text-amber-400">↕</span>
                              {lang === 'ko' ? '방 세로 (길이)' : 'Length'}
                            </span>
                            <span className="text-amber-400 font-black text-xs bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{roomLength.toFixed(1)}m</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRoomLength((l) => Math.max(1.8, Math.round((l - 0.1) * 10) / 10))}
                              className="h-7 w-7 shrink-0 rounded-lg bg-slate-800 text-xs font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                            >
                              -
                            </button>
                            <input
                              type="range"
                              min="1.8"
                              max="8.0"
                              step="0.1"
                              value={roomLength}
                              onChange={(e) => setRoomLength(parseFloat(e.target.value))}
                              className="min-w-0 flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => setRoomLength((l) => Math.min(10.0, Math.round((l + 0.1) * 10) / 10))}
                              className="h-7 w-7 shrink-0 rounded-lg bg-slate-800 text-xs font-black text-slate-200 hover:bg-slate-700 active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700 select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 3. 침대, 소파, 식탁, 책상 규격 선택기 */}
                      <div className="space-y-2.5">
                        {/* 침대 규격 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {lang === 'ko' ? '🛏️ 침대 규격:' : '🛏️ Bed:'}
                            </span>
                            <span className="text-[9px] text-amber-400 font-bold">
                              {activeBedOption.width > 0 ? `${activeBedOption.width}×${activeBedOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                            {BED_SIZE_OPTIONS.map((bed) => (
                              <button
                                key={bed.id}
                                type="button"
                                onClick={() => setSelectedBedType(bed.id as any)}
                                className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                                  selectedBedType === bed.id
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {bed.shortLabel}
                                <span className="block text-[7.5px] opacity-80">{bed.width > 0 ? `${bed.width}×${bed.length}m` : '-'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 소파 규격 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {lang === 'ko' ? '🛋️ 소파 규격:' : '🛋️ Sofa:'}
                            </span>
                            <span className="text-[9px] text-amber-400 font-bold">
                              {activeSofaOption.width > 0 ? `${activeSofaOption.width}×${activeSofaOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {SOFA_SIZE_OPTIONS.map((sofa) => (
                              <button
                                key={sofa.id}
                                type="button"
                                onClick={() => setSelectedSofaType(sofa.id as any)}
                                className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                                  selectedSofaType === sofa.id
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {sofa.shortLabel}
                                <span className="block text-[7.5px] opacity-80">{sofa.width > 0 ? `${sofa.width}×${sofa.length}m` : '-'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 식탁 규격 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {lang === 'ko' ? '🍽️ 식탁 규격:' : '🍽️ Dining:'}
                            </span>
                            <span className="text-[9px] text-amber-400 font-bold">
                              {activeDiningOption.width > 0 ? `${activeDiningOption.width}×${activeDiningOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {DINING_TABLE_OPTIONS.map((dining) => (
                              <button
                                key={dining.id}
                                type="button"
                                onClick={() => setSelectedDiningType(dining.id as any)}
                                className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                                  selectedDiningType === dining.id
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {dining.shortLabel}
                                <span className="block text-[7.5px] opacity-80">{dining.width > 0 ? `${dining.width}×${dining.length}m` : '-'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 책상 규격 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {lang === 'ko' ? '✏️ 책상 규격:' : '✏️ Desk:'}
                            </span>
                            <span className="text-[9px] text-amber-400 font-bold">
                              {activeDeskOption.width > 0 ? `${activeDeskOption.width}×${activeDeskOption.length}m` : (lang === 'ko' ? '없음' : 'None')}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {DESK_SIZE_OPTIONS.map((desk) => (
                              <button
                                key={desk.id}
                                type="button"
                                onClick={() => setSelectedDeskType(desk.id as any)}
                                className={`py-1 px-1.5 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                                  selectedDeskType === desk.id
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {desk.shortLabel}
                                <span className="block text-[7.5px] opacity-80">{desk.width > 0 ? `${desk.width}×${desk.length}m` : '-'}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 4. 실시간 스마트 공간 분석 & 통로 가이드 박스 */}
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white">면적:</span>
                            <span className="text-amber-300 font-black">{roomAreaSqM}㎡ (약 {roomPyeong}평)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">가구 점유율:</span>
                            <span className={`font-black ${furnitureOccupancyPercent <= 35 ? 'text-emerald-400' : furnitureOccupancyPercent <= 50 ? 'text-amber-400' : 'text-orange-400'}`}>
                              약 {furnitureOccupancyPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5">
                          <p className="text-[10px] text-slate-300 leading-snug">
                            {lang === 'ko' ? circulationStatus.textKo : circulationStatus.textEn}
                            <span className="block text-[9px] text-slate-400 mt-0.5">
                              {lang === 'ko' ? circulationStatus.descKo : circulationStatus.descEn}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 탐색 버튼: 첨부 이미지 스타일의 레드 Continue 알약 버튼 */}
              <div className="mt-4 pt-2 border-t border-slate-900 sticky bottom-0 bg-slate-950/95 backdrop-blur-md pb-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/4 rounded-full border border-slate-700 bg-slate-850 py-4 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Atrás' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-3/4 rounded-full bg-red-600 hover:bg-red-500 active:scale-[0.98] py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-red-600/30 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{lang === 'ko' ? '계속하기 ➔' : lang === 'ja' ? '次へ ➔' : lang === 'es' ? 'Continuar ➔' : 'Continue ➔'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 3 / 4: 건물 외관 스타일 선택 (10개국 대표 건축 양식) */}
          {wizardStep === 3 && selectedTool.id === 'exterior' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '외관 건축 스타일 선택' : lang === 'ja' ? '外観建築スタイルを選択' : lang === 'es' ? 'Seleccionar Estilo Exterior' : 'Select Exterior Style'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? '각 나라별 특징을 살린 10가지 글로벌 건축 디자인' : lang === 'ja' ? '各国・地域の特徴を活かした10種のグローバル建築様式' : lang === 'es' ? '10 diseños arquitectónicos globales característicos' : '10 global architectural styles tailored to world regions'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                    {lang === 'ko' ? '10개국 대표 건축' : lang === 'ja' ? '10ヶ国代表建築' : lang === 'es' ? '10 Países Clásicos' : '10 Global Architectures'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
                  {EXTERIOR_STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    const cName = COUNTRY_I18N[style.country]?.[lang] || style.country;
                    const sLabel = EXTERIOR_STYLE_I18N[style.id]?.[lang]?.label || style.label;
                    const sDesc = EXTERIOR_STYLE_I18N[style.id]?.[lang]?.desc || style.desc;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.id)}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98] shadow-lg shadow-amber-500/25 bg-slate-900'
                            : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                        }`}
                      >
                        {/* 건축 썸네일 이미지 */}
                        <div className="relative aspect-square w-full overflow-hidden">
                          <Image
                            src={style.image}
                            alt={sLabel}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

                          {/* 국기 및 국가 라벨 배지 */}
                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-slate-950/85 px-2 py-0.5 text-[10px] font-black text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-md">
                            <span>{style.flag}</span>
                            <span>{cName}</span>
                          </span>

                          {/* 선택 체크 배지 */}
                          {isSelected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">
                              ✓
                            </span>
                          )}

                          {/* 하단 스타일 명칭 */}
                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className={`text-xs font-black leading-tight block ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                              {sLabel}
                            </span>
                            <span className="text-[9px] text-slate-300 font-bold block truncate">
                              {style.enName}
                            </span>
                          </div>
                        </div>

                        {/* 건축 특징 설명 */}
                        <div className="p-2.5 bg-slate-950/60 flex-1 flex flex-col justify-center">
                          <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                            {sDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (모드) ➔' : lang === 'ja' ? '次のステップ（モード）➔' : lang === 'es' ? 'Siguiente Paso (Modo) ➔' : 'Next Step (Mode) ➔'}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 3 / 4: 정원 & 테라스 스타일 선택 (8개국/지역 대표 조경 양식) */}
          {wizardStep === 3 && selectedTool.id === 'garden' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {lang === 'ko' ? '정원 & 테라스 스타일 선택' : lang === 'ja' ? '庭園＆テラススタイルを選択' : lang === 'es' ? 'Seleccionar Estilo de Jardín y Terraza' : 'Select Garden & Patio Style'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'ko' ? '각 나라/지역 특징을 살린 8가지 프리미엄 정원 디자인' : lang === 'ja' ? '各国・地域の特徴を活かした8種のプレミアム庭園デザイン' : lang === 'es' ? '8 diseños de jardín premium según regiones' : '8 premium garden designs representing world regions'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                    {lang === 'ko' ? '8대 정원 양식' : lang === 'ja' ? '8大庭園様式' : lang === 'es' ? '8 Estilos de Jardín' : '8 Garden Styles'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
                  {GARDEN_STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    const cName = COUNTRY_I18N[style.country]?.[lang] || style.country;
                    const sLabel = GARDEN_STYLE_I18N[style.id]?.[lang]?.label || style.label;
                    const sDesc = GARDEN_STYLE_I18N[style.id]?.[lang]?.desc || style.desc;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.id)}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98] shadow-lg shadow-amber-500/25 bg-slate-900'
                            : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                        }`}
                      >
                        {/* 정원 썸네일 이미지 */}
                        <div className="relative aspect-square w-full overflow-hidden">
                          <Image
                            src={style.image}
                            alt={sLabel}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

                          {/* 국기 및 국가 라벨 배지 */}
                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-slate-950/85 px-2 py-0.5 text-[10px] font-black text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-md">
                            <span>{style.flag}</span>
                            <span>{cName}</span>
                          </span>

                          {/* 선택 체크 배지 */}
                          {isSelected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">
                              ✓
                            </span>
                          )}

                          {/* 하단 스타일 명칭 */}
                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className={`text-xs font-black leading-tight block ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                              {sLabel}
                            </span>
                            <span className="text-[9px] text-slate-300 font-bold block truncate">
                              {style.enName}
                            </span>
                          </div>
                        </div>

                        {/* 정원 특징 설명 */}
                        <div className="p-2.5 bg-slate-950/60 flex-1 flex flex-col justify-center">
                          <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                            {sDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '다음 단계 (모드) ➔' : lang === 'ja' ? '次のステップ（モード）➔' : lang === 'es' ? 'Siguiente Paso (Modo) ➔' : 'Next Step (Mode) ➔'}
                </button>
              </div>
            </div>
          )}



          {/* 마법사 스텝 3 / 3: 벽지 & 페인트 교체 - 선택 공간별 맞춤 시공 (색상 및 하위 3종 재질 선택) */}
          {wizardStep === 3 && selectedTool.id === 'paint' && (() => {
            const validSurfaces = selectedPaintSurfaceIds.length > 0 ? selectedPaintSurfaceIds : ['wall'];
            const activeSurfaceId = validSurfaces.includes(activePaintConfigTab) ? activePaintConfigTab : validSurfaces[0];
            const currentSurfaceMeta = PAINT_SURFACE_OPTIONS.find((s) => s.id === activeSurfaceId) || PAINT_SURFACE_OPTIONS[0];
            const currentConfig = paintSurfaceConfigs[activeSurfaceId] || {
              material: currentSurfaceMeta.defaultMaterial,
              color: currentSurfaceMeta.defaultColor,
            };
            const availableMaterials = SURFACE_MATERIAL_MAP[activeSurfaceId] || SURFACE_MATERIAL_MAP['wall'];
            const currentColorMeta = PAINT_COLOR_OPTIONS.find((c) => c.id === currentConfig.color) || PAINT_COLOR_OPTIONS[0];
            const currentMaterialMeta = availableMaterials.find((m) => m.id === currentConfig.material) || availableMaterials[0];

            return (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{lang === 'ko' ? '🎨 공간별 시공 & 색상 설정' : lang === 'ja' ? '🎨 空間別リフォーム・カラー設定' : lang === 'es' ? '🎨 Ajustes de Superficie y Color' : '🎨 Surface & Color Settings'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lang === 'ko' ? '이전 단계에서 선택한 공간별로 색상과 세부 재질(실크/일반 등)을 지정해 주세요' : lang === 'ja' ? '選択した空間ごとに色と質感（壁紙・塗装など）を指定してください' : lang === 'es' ? 'Elige colores y texturas de materiales para cada espacio' : 'Specify color and material textures for each selected surface'}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 shrink-0">
                      {lang === 'ko' ? '가구 100% 보존' : lang === 'ja' ? '家具100%保持' : lang === 'es' ? 'Muebles 100% Intactos' : '100% Furniture Lock'}
                    </span>
                  </div>

                  {/* 1. 이전 단계에서 선택한 공간 탭 바 (selectedPaintSurfaceIds) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="text-[11px] font-bold text-slate-300">
                        {lang === 'ko' ? `선택된 시공 공간 (${validSurfaces.length}개)` : lang === 'ja' ? `選択された施工空間 (${validSurfaces.length}箇所)` : lang === 'es' ? `Espacios Seleccionados (${validSurfaces.length})` : `Selected Spaces (${validSurfaces.length})`}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold">
                        {lang === 'ko' ? '탭을 클릭하여 각 공간별 설정을 변경하세요' : lang === 'ja' ? 'タブをタップして各空間の設定を変更できます' : lang === 'es' ? 'Toca las pestañas para configurar cada área' : 'Tap tabs to configure each area'}
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {validSurfaces.map((surfaceId) => {
                        const sMeta = PAINT_SURFACE_OPTIONS.find((s) => s.id === surfaceId);
                        const sCfg = paintSurfaceConfigs[surfaceId] || {
                          material: sMeta?.defaultMaterial || 'matte_paint',
                          color: sMeta?.defaultColor || 'warm_beige',
                        };
                        const sCol = PAINT_COLOR_OPTIONS.find((c) => c.id === sCfg.color);
                        const sMat = (SURFACE_MATERIAL_MAP[surfaceId] || []).find((m) => m.id === sCfg.material);
                        const isActive = activeSurfaceId === surfaceId;
                        const sLabel = SURFACE_I18N[surfaceId]?.[lang]?.label.split(/[\s（]/)[0] || sMeta?.label.split(' ')[0] || surfaceId;
                        const matLabel = MATERIAL_I18N[sCfg.material]?.[lang]?.label.split(/[\s（]/)[0] || sMat?.label.split(' ')[0] || '';
                        const colLabel = PAINT_COLOR_I18N[sCfg.color]?.[lang] || sCol?.label || '';

                        return (
                          <button
                            key={surfaceId}
                            type="button"
                            onClick={() => setActivePaintConfigTab(surfaceId)}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                              isActive
                                ? 'border-amber-400 bg-amber-500/20 text-white shadow-md ring-1 ring-amber-400/50'
                                : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-base">{sMeta?.icon || '🎨'}</span>
                            <div className="flex flex-col text-left">
                              <span className="leading-tight">{sLabel}</span>
                              <span className={`text-[9px] font-medium leading-none mt-0.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`}>
                                {matLabel}
                              </span>
                            </div>
                            <span
                              className="h-3 w-3 rounded-full border border-white/20 ml-1 shrink-0 shadow-sm"
                              style={{ backgroundColor: sCol?.hex || '#ccc' }}
                              title={`${colLabel} (${matLabel})`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. 현재 선택된 공간의 색상 팔레트 선택 */}
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-slate-950">
                          1
                        </span>
                        <span className="text-xs font-extrabold text-white">
                          {lang === 'ko'
                            ? `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label} 컬러(색상) 선택`
                            : lang === 'ja'
                            ? `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label} カラー選択`
                            : `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label} Color Selection`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300">
                        {PAINT_COLOR_I18N[currentConfig.color]?.[lang] || currentColorMeta.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PAINT_COLOR_OPTIONS.map((color) => {
                        const isColorSelected = currentConfig.color === color.id;
                        const colLabel = PAINT_COLOR_I18N[color.id]?.[lang] || color.label.split(' ')[0];
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => updatePaintSurfaceConfig(activeSurfaceId, undefined, color.id)}
                            className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all cursor-pointer ${
                              isColorSelected
                                ? 'border-amber-400 bg-amber-500/10 shadow-md ring-2 ring-amber-400/60 scale-[1.03]'
                                : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <span
                              className={`h-7 w-7 rounded-full shadow-inner flex items-center justify-center transition-transform ${
                                isColorSelected ? 'scale-110' : 'group-hover:scale-105'
                              }`}
                              style={{
                                backgroundColor: color.hex,
                                border: `2px solid ${color.border || '#999'}`,
                              }}
                            >
                              {isColorSelected && (
                                <span className={`text-[11px] font-black ${
                                  ['pure_white', 'light_grey', 'warm_beige'].includes(color.id)
                                    ? 'text-slate-900'
                                    : 'text-white'
                                }`}>
                                  ✓
                                </span>
                              )}
                            </span>
                            <span className={`text-[10px] font-bold leading-tight truncate w-full ${
                              isColorSelected ? 'text-amber-300' : 'text-slate-300'
                            }`}>
                              {colLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 하위 선택: 3종 시공 재질 (벽지 실크/일반합지/페인트 등) */}
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-slate-950">
                          2
                        </span>
                        <span className="text-xs font-extrabold text-white">
                          {lang === 'ko'
                            ? (activeSurfaceId === 'wall'
                              ? '벽지 / 시공 종류 하위 선택 (3종 중 택 1)'
                              : `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label} 시공 재질 선택 (3종 중 택 1)`)
                            : lang === 'ja'
                            ? (activeSurfaceId === 'wall'
                              ? '壁紙・施工種類を選択（3種より1つ）'
                              : `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label}の施工素材を選択（3種より1つ）`)
                            : (activeSurfaceId === 'wall'
                              ? 'Wallpaper & Finish Selection (Pick 1 of 3)'
                              : `${SURFACE_I18N[activeSurfaceId]?.[lang]?.label || currentSurfaceMeta.label} Material Selection (Pick 1 of 3)`)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">
                        {MATERIAL_I18N[currentConfig.material]?.[lang]?.label || currentMaterialMeta.label}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {lang === 'ko' ? (
                        <>선택하신 <span className="text-amber-300 font-bold">&apos;{PAINT_COLOR_I18N[currentConfig.color]?.[lang] || currentColorMeta.label}&apos;</span> 색상이 아래 3가지 재질 특성에 맞춰 사실적으로 렌더링됩니다.</>
                      ) : lang === 'ja' ? (
                        <>選択された <span className="text-amber-300 font-bold">&apos;{PAINT_COLOR_I18N[currentConfig.color]?.[lang] || currentColorMeta.label}&apos;</span> カラーが以下の3つの素材特性に合わせてリアルに再現されます。</>
                      ) : (
                        <>The chosen <span className="text-amber-300 font-bold">&apos;{PAINT_COLOR_I18N[currentConfig.color]?.[lang] || currentColorMeta.label}&apos;</span> color will be rendered across the 3 material textures below.</>
                      )}
                    </p>

                    <div className="mt-2.5 flex flex-col gap-2">
                      {availableMaterials.map((mat) => {
                        const isMatSelected = currentConfig.material === mat.id;
                        const matLabel = MATERIAL_I18N[mat.id]?.[lang]?.label || mat.label;
                        const matDesc = MATERIAL_I18N[mat.id]?.[lang]?.desc || mat.desc;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => updatePaintSurfaceConfig(activeSurfaceId, mat.id, undefined)}
                            className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                              isMatSelected
                                ? 'border-amber-400 bg-amber-500/15 shadow-md ring-1 ring-amber-400/50'
                                : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl border ${
                                isMatSelected
                                  ? 'bg-amber-500/20 border-amber-400/50'
                                  : 'bg-slate-800 border-slate-700'
                              }`}>
                                {mat.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black ${
                                    isMatSelected ? 'text-amber-300' : 'text-slate-200'
                                  }`}>
                                    {matLabel}
                                  </span>
                                  {mat.badge && (
                                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-400 border border-amber-500/30">
                                      {mat.badge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {mat.enName}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                  {matDesc}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                                isMatSelected
                                  ? 'bg-amber-400 text-slate-950 shadow'
                                  : 'border border-slate-700 text-transparent'
                              }`}
                            >
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* 다중 공간 선택 시 다음 공간으로 빠른 이동 버튼 */}
                    {validSurfaces.length > 1 && (() => {
                      const currentIndex = validSurfaces.indexOf(activeSurfaceId);
                      const nextIndex = (currentIndex + 1) % validSurfaces.length;
                      const nextSurfaceId = validSurfaces[nextIndex];
                      const nextMeta = PAINT_SURFACE_OPTIONS.find((s) => s.id === nextSurfaceId);
                      const nextLabel = SURFACE_I18N[nextSurfaceId]?.[lang]?.label.split(/[\s（]/)[0] || nextMeta?.label.split(' ')[0];
                      return (
                        <div className="mt-2.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActivePaintConfigTab(nextSurfaceId)}
                            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
                          >
                            <span>
                              {lang === 'ko'
                                ? `다음 공간 (${nextMeta?.icon} ${nextLabel}) 설정하기`
                                : lang === 'ja'
                                ? `次の空間 (${nextMeta?.icon} ${nextLabel}) を設定`
                                : `Configure Next Area (${nextMeta?.icon} ${nextLabel})`}
                            </span>
                            <span>➔</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 4. 빠른 원클릭 베스트 조합 프리셋 */}
                  <div className="mt-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 pb-2">
                      <span>💡</span> {lang === 'ko' ? '추천 원클릭 시공 테마 (전체 공간 자동 매칭)' : lang === 'ja' ? 'おすすめワンタップ施工テーマ（全空間一括マッチング）' : lang === 'es' ? 'Temas Rápidos Recomendados' : 'Recommended 1-Tap Themes (Auto-match All Areas)'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PAINT_QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPaintPreset(preset.id)}
                          className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-amber-400/60 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{preset.icon}</span>
                          <span>{PAINT_PRESET_I18N[preset.id]?.[lang] || preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. 선택된 공간 시공 계획 최종 요약 카드 */}
                  <div className="mt-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/90 p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
                        <span>📋</span> {lang === 'ko' ? `이번 시공에 적용될 공간 (${validSurfaces.length}개 영역)` : lang === 'ja' ? `今回のリフォーム適用空間 (${validSurfaces.length}箇所)` : `Surfaces Applied in this Renovation (${validSurfaces.length})`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {lang === 'ko' ? '가구 100% 보존' : lang === 'ja' ? '家具100%保持' : '100% Furniture Lock'}
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {validSurfaces.map((sId) => {
                        const sMeta = PAINT_SURFACE_OPTIONS.find((s) => s.id === sId);
                        const sCfg = paintSurfaceConfigs[sId] || {
                          material: sMeta?.defaultMaterial || 'matte_paint',
                          color: sMeta?.defaultColor || 'warm_beige',
                        };
                        const sMat = (SURFACE_MATERIAL_MAP[sId] || []).find((m) => m.id === sCfg.material);
                        const sCol = PAINT_COLOR_OPTIONS.find((c) => c.id === sCfg.color);
                        const isCurrentActive = activeSurfaceId === sId;
                        const sLabel = SURFACE_I18N[sId]?.[lang]?.label.split(/[\s（]/)[0] || sMeta?.label.split(' ')[0];
                        const matLabel = MATERIAL_I18N[sCfg.material]?.[lang]?.label.split(/[\s（]/)[0] || sMat?.label.split(' ')[0];
                        const colLabel = PAINT_COLOR_I18N[sCfg.color]?.[lang] || sCol?.label.split(' ')[0];

                        return (
                          <button
                            key={sId}
                            type="button"
                            onClick={() => setActivePaintConfigTab(sId)}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-left border transition-all cursor-pointer ${
                              isCurrentActive
                                ? 'bg-amber-500/15 border-amber-400/70 ring-1 ring-amber-400/40 shadow-sm'
                                : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-slate-200 font-extrabold flex items-center gap-1.5">
                              <span>{sMeta?.icon}</span>
                              <span>{sLabel}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: sCol?.hex || '#ccc' }}
                              />
                              <span className="text-slate-200">{colLabel}</span>
                              <span className="text-slate-500">/</span>
                              <span className="font-bold text-amber-400">{matLabel}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 하단 네비게이션 버튼 */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                  >
                    {lang === 'ko' ? '◀ 이전단계 (공간 선택)' : lang === 'ja' ? '◀ 前へ（空間選択）' : lang === 'es' ? '◀ Anterior (Espacios)' : '◀ Back (Room Selection)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    {lang === 'ko' ? '✨ AI 시공 결과물 생성하기 (1장) ➔' : lang === 'ja' ? '✨ AIリフォーム結果を生成する (1枚) ➔' : lang === 'es' ? '✨ Generar Diseño con IA (1) ➔' : '✨ Generate AI Renovation (1) ➔'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 마법사 스텝 3 / 3: 가구 색상 및 소재 질감 선택 & 취합 요약 (가구 & 소품 교체 도구 전용) */}
          {wizardStep === 3 && selectedTool.id === 'replace' && (() => {
            const currentStyleMeta = REPLACE_FURNITURE_STYLES.find((s) => s.id === selectedFurnitureStyle) || REPLACE_FURNITURE_STYLES[0];
            const currentColorMeta = REPLACE_FURNITURE_COLORS.find((c) => c.id === selectedFurnitureColor) || REPLACE_FURNITURE_COLORS[0];
            const currentMaterialMeta = REPLACE_FURNITURE_MATERIALS.find((m) => m.id === selectedFurnitureMaterial) || REPLACE_FURNITURE_MATERIALS[0];

            return (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between animate-fade-in space-y-4">
                <div className="space-y-4">
                  {/* 상단 타이틀 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{lang === 'ko' ? '🎨 좌방석·등받이 소재 & 컬러 결합' : lang === 'ja' ? '🎨 クッション・背もたれ素材＆カラー指定' : lang === 'es' ? '🎨 Materiales y Colores de Cojines' : '🎨 Cushion Material & Color Styling'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {lang === 'ko' ? (
                          <>1단계에서 선택한 <strong className="text-amber-400">[{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}]</strong> 뼈대 프레임에 입힐 좌방석·등받이의 프리미엄 질감과 색상을 골라주세요.</>
                        ) : lang === 'ja' ? (
                          <>1段階で選択した<strong className="text-amber-400">[{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}]</strong>の基本フレームに合わせるクッション・背もたれの素材とカラーを選択してください。</>
                        ) : (
                          <>Select premium textures and colors for cushions to combine with <strong className="text-amber-400">[{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}]</strong> frame.</>
                        )}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      {lang === 'ko' ? '장인 융합 창작' : lang === 'ja' ? '職人ハイブリッド創作' : lang === 'es' ? 'Diseño Artesanal' : 'Artisan Fusion'}
                    </span>
                  </div>

                  {/* 1. 가구 컬러 팔레트 선택 (8가지 컬러) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎨</span>
                        <div>
                          <h4 className="text-xs font-black text-white">
                            {lang === 'ko' ? '좌방석 & 등받이 컬러 팔레트 (8가지)' : lang === 'ja' ? 'クッション＆背もたれカラーパレット (8色)' : 'Cushion & Backrest Color Palette (8 Colors)'}
                          </h4>
                          <span className="text-[9px] text-slate-400">
                            {lang === 'ko' ? '프레임과 대비되어 고급스럽게 어우러지는 포인트 톤' : lang === 'ja' ? 'フレームを引き立てる上品なアクセントトーン' : 'Accented tones that elegantly complement the frame'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">
                        {REPLACE_COLOR_I18N[currentColorMeta.id]?.[lang] || currentColorMeta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {REPLACE_FURNITURE_COLORS.map((color) => {
                        const isSelected = selectedFurnitureColor === color.id;
                        const colLabel = REPLACE_COLOR_I18N[color.id]?.[lang] || color.label.split('/')[0].trim();
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setSelectedFurnitureColor(color.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/60 shadow-md'
                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className="relative h-7 w-7 rounded-full shadow-inner flex items-center justify-center border"
                              style={{
                                backgroundColor: color.hex,
                                borderColor: color.border || 'rgba(255,255,255,0.15)',
                              }}
                            >
                              {isSelected && (
                                <span
                                  className="text-xs font-black"
                                  style={{ color: color.textColor }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-200 line-clamp-1">
                              {colLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. 가구 소재 및 질감 선택 (4가지 프리미엄 텍스처) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🧵</span>
                        <div>
                          <h4 className="text-xs font-black text-white">
                            {lang === 'ko' ? '좌방석 & 등받이 프리미엄 소재/질감 (4가지)' : lang === 'ja' ? 'クッション＆背もたれプレミアム素材/質感 (4種)' : 'Cushion Premium Materials & Textures (4 Types)'}
                          </h4>
                          <span className="text-[9px] text-slate-400">
                            {lang === 'ko' ? '피부에 닿는 쿠션에 적용될 실제 입체 텍스처' : lang === 'ja' ? '肌に触れるクッションに適用されるリアルな立体テクスチャ' : 'Realistic 3D textures applied to cushions and backrests'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">
                        {REPLACE_MATERIAL_I18N[currentMaterialMeta.id]?.[lang]?.label || currentMaterialMeta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {REPLACE_FURNITURE_MATERIALS.map((mat) => {
                        const isSelected = selectedFurnitureMaterial === mat.id;
                        const matBadge = REPLACE_MATERIAL_I18N[mat.id]?.[lang]?.badge || mat.badge;
                        const matTitle = REPLACE_MATERIAL_I18N[mat.id]?.[lang]?.label || mat.label;
                        const matDesc = REPLACE_MATERIAL_I18N[mat.id]?.[lang]?.desc || mat.desc;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => setSelectedFurnitureMaterial(mat.id)}
                            className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow-md'
                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xl">{mat.icon}</span>
                              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {matBadge}
                              </span>
                            </div>

                            <div className="mt-1.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-white">{matTitle}</span>
                                {isSelected && <span className="text-amber-400 text-[10px] font-black">✓</span>}
                              </div>
                              <p className="mt-0.5 text-[9px] text-slate-400 leading-tight line-clamp-2">
                                {matDesc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 취합 요약 카드 (Summary Card) */}
                  <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-slate-900 to-orange-500/10 p-3.5 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">✨</span>
                        <span className="text-xs font-black text-amber-300">
                          {lang === 'ko' ? '가구 뼈대 + 좌방석/등받이 융합 설계' : lang === 'ja' ? '家具フレーム＋クッション融合設計' : 'Furniture Frame + Cushion Fusion Design'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {lang === 'ko' ? '장인 맞춤 창조 합성' : lang === 'ja' ? '職人オーダーメイド合成' : 'Artisan Bespoke Synthesis'}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                        <span className="block text-[9px] text-amber-400 font-bold">
                          {lang === 'ko' ? '1단계 기본 뼈대' : lang === 'ja' ? '1段階 基本フレーム' : 'Step 1 Frame'}
                        </span>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span className="text-xs">{currentStyleMeta.icon}</span>
                          <span className="text-[10px] font-black text-white line-clamp-1">
                            {REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label.split('&')[0].trim()}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                        <span className="block text-[9px] text-amber-400 font-bold">
                          {lang === 'ko' ? '2단계 방석 색상' : lang === 'ja' ? '2段階 クッション色' : 'Step 2 Color'}
                        </span>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: currentColorMeta.hex }}
                          />
                          <span className="text-[10px] font-black text-white line-clamp-1">
                            {REPLACE_COLOR_I18N[currentColorMeta.id]?.[lang] || currentColorMeta.label.split('/')[0].trim()}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                        <span className="block text-[9px] text-amber-400 font-bold">
                          {lang === 'ko' ? '2단계 방석 소재' : lang === 'ja' ? '2段階 クッション素材' : 'Step 2 Material'}
                        </span>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span className="text-xs">{currentMaterialMeta.icon}</span>
                          <span className="text-[10px] font-black text-white line-clamp-1">
                            {REPLACE_MATERIAL_I18N[currentMaterialMeta.id]?.[lang]?.label || currentMaterialMeta.label.split('&')[0].trim()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-2.5 text-[10px] text-amber-200/90 text-center font-medium leading-relaxed bg-amber-500/10 rounded-lg py-1.5 px-2">
                      {lang === 'ko' ? (
                        <>💡 <strong>[독창적 장인 창작 결합]</strong>: <strong>{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}</strong> 고유의 뼈대와 프레임 위에 <strong>{REPLACE_COLOR_I18N[currentColorMeta.id]?.[lang] || currentColorMeta.label}</strong> 톤의 <strong>{REPLACE_MATERIAL_I18N[currentMaterialMeta.id]?.[lang]?.label || currentMaterialMeta.label}</strong> 좌방석 및 등받이가 정밀 결합된 오리지널 디자이너 가구로 창조됩니다.</>
                      ) : lang === 'ja' ? (
                        <>💡 <strong>[職人オーダーメイド合成]</strong>: <strong>{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}</strong>特有のフレームに、<strong>{REPLACE_COLOR_I18N[currentColorMeta.id]?.[lang] || currentColorMeta.label}</strong>トーンの<strong>{REPLACE_MATERIAL_I18N[currentMaterialMeta.id]?.[lang]?.label || currentMaterialMeta.label}</strong>クッションが精密に結合されたデザイナー家具を創出します。</>
                      ) : (
                        <>💡 <strong>[Artisan Bespoke Synthesis]</strong>: Original designer furniture created with <strong>{REPLACE_STYLE_I18N[currentStyleMeta.id]?.[lang]?.label || currentStyleMeta.label}</strong> frame combined with <strong>{REPLACE_COLOR_I18N[currentColorMeta.id]?.[lang] || currentColorMeta.label}</strong> <strong>{REPLACE_MATERIAL_I18N[currentMaterialMeta.id]?.[lang]?.label || currentMaterialMeta.label}</strong> cushions.</>
                      )}
                    </p>
                  </div>
                </div>

                {/* 하단 네비게이션 버튼 */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                  >
                    {lang === 'ko' ? '◀ 이전단계 (스타일 변경)' : lang === 'ja' ? '◀ 前へ（スタイル変更）' : lang === 'es' ? '◀ Anterior' : '◀ Back (Style)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    {lang === 'ko' ? '✨ 가구 교체 결과물 생성하기 ➔' : lang === 'ja' ? '✨ 家具交換結果を生成する ➔' : lang === 'es' ? '✨ Generar Muebles Renovados ➔' : '✨ Generate Furniture Swap ➔'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 마법사 스텝 3 / 4: 실내 인테리어 스타일 선택 (일반 도구용 - 레이아웃, 외관, 정원, 벽지페인트, 가구교체, 파티룸 제외) */}
          {wizardStep === 3 && selectedTool.id !== 'layout' && selectedTool.id !== 'exterior' && selectedTool.id !== 'garden' && selectedTool.id !== 'paint' && selectedTool.id !== 'replace' && selectedTool.id !== 'party_room' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white">
                    {lang === 'ko' ? '인테리어 스타일 선택' : lang === 'ja' ? 'インテリアスタイル選択' : lang === 'es' ? 'Seleccionar Estilo' : 'Select Style'}
                  </h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                    {lang === 'ko' ? '20가지 프리미엄 스타일' : lang === 'ja' ? '20種のプレミアムスタイル' : lang === 'es' ? '20 Estilos Premium' : '20 Premium Styles'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ko' ? '원하시는 인테리어 및 건축 스타일을 선택하세요' : lang === 'ja' ? 'ご希望のインテリア・建築スタイルを選択してください' : lang === 'es' ? 'Selecciona tu estilo interior y arquitectónico preferido' : 'Select your desired interior & architectural style'}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    const styleLabel = lang === 'ko' ? style.label : lang === 'ja' ? (style.labelJa || style.label) : lang === 'es' ? (style.labelEs || style.label) : (style.labelEn || style.label);
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-95 shadow-lg shadow-amber-500/30'
                            : 'border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <Image src={style.image} alt={styleLabel} fill className="object-cover" />

                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">
                            ✓
                          </span>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2 flex items-end">
                          <span className={`text-[11px] font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                            {styleLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {translations.wizard.next[lang]}
                </button>
              </div>
            </div>
          )}

          {/* 마법사 스텝 4 / 4: 모드 & 팔레트 (일반 도구 전용 - 공간 재배치 모드는 전용 Step 4 사용으로 제외) */}
          {wizardStep === 4 && selectedTool.id !== 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  {lang === 'ko' ? '테마 컬러 & 분위기 선택' : lang === 'ja' ? 'テーマカラー＆雰囲気の選択' : lang === 'es' ? 'Paleta de Color y Ambiente' : 'Theme Color & Atmosphere'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ko' ? '공간에 적용할 프리미엄 테마 컬러 팔레트를 선택하세요' : lang === 'ja' ? '空間に適用するテーマカラーパレットを選択してください' : lang === 'es' ? 'Elige la paleta de colores para ambientar tu espacio' : 'Choose a premium theme color palette for your space'}
                </p>

                {/* 단일 최적화 리모델링 모드 안내 배지 */}
                <div className="mt-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-lg border border-amber-500/30">
                    ✨
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {lang === 'ko' ? 'AI 프리미엄 공간 리모델링 모드' : lang === 'ja' ? 'AIプレミアム空間リフォームモード' : lang === 'es' ? 'Modo Remodelación Premium AI' : 'AI Premium Space Remodeling Mode'}
                      </span>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30">
                        STANDARD
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {lang === 'ko'
                        ? '선택하신 공간 유형과 스타일에 맞춰 가구와 조명, 인테리어를 최적의 조화로 완성합니다'
                        : lang === 'ja'
                        ? '選択した空間タイプとスタイルに合わせて、家具・照明・インテリアを最適な調和で完成させます'
                        : lang === 'es'
                        ? 'Armoniza muebles, iluminación y decoración según el espacio y estilo elegidos'
                        : 'Seamlessly transforms furniture, lighting, and interior harmony to your chosen style'}
                    </p>
                  </div>
                </div>

                {/* 팔레트 선택 */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-300">
                    {lang === 'ko' ? '테마 컬러 팔레트 선택' : lang === 'ja' ? 'テーマカラーパレットを選択' : lang === 'es' ? 'Seleccionar Paleta de Color' : 'Select Palette'}
                  </span>
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
                        <span className="text-xs font-bold text-white">
                          {lang === 'ko' ? (pal.nameKo || pal.name) : lang === 'ja' ? (pal.nameJa || pal.name) : lang === 'es' ? (pal.nameEs || pal.name) : pal.name}
                        </span>
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
                {/* 고품질 단일 시안 안내 */}
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span className="text-xs font-bold text-amber-200">
                      {lang === 'ko' ? '고품질 프리미엄 4K 단일 디자인 시안 생성' : lang === 'ja' ? '高品質プレミアム4Kデザイン1案生成' : lang === 'es' ? 'Diseño 4K Premium Individual' : 'High-Quality Premium 4K Design'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-1">
                    {lang === 'ko' ? '1 크레딧 사용' : lang === 'ja' ? '1クレジット消費' : lang === 'es' ? '1 Crédito' : '1 Credit'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 rounded-2xl border border-slate-700 bg-slate-850 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                >
                  {lang === 'ko' ? '◀ 이전단계' : lang === 'ja' ? '◀ 前へ' : lang === 'es' ? '◀ Anterior' : '◀ Back'}
                </button>
                <button
                  onClick={handleNextStep}
                  className="w-2/3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {lang === 'ko' ? '4K 디자인 생성하기 ✨' : lang === 'ja' ? '4Kデザインを生成する ✨' : lang === 'es' ? 'Generar Diseño 4K ✨' : 'Generate 4K Design ✨'}
                </button>
              </div>
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
                      <span className="text-sm font-black text-white">
                        {lang === 'ko' ? 'AI가 공간을 멋지게 연출하는 중...' : lang === 'ja' ? 'AIが空間をスタイリング中...' : lang === 'es' ? 'AI diseñando tu espacio...' : 'Rendering Your Space...'}
                      </span>
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-400">
                        {lang === 'ko' ? '⚡ 4K 초고속 렌더링 엔진 가동 중' : lang === 'ja' ? '⚡ 4K高速レンダリング' : lang === 'es' ? '⚡ Motor 4K activo' : '⚡ Speed Up Available'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {lang === 'ko' ? '나의 디자인 보드' : lang === 'ja' ? 'デザインボード' : lang === 'es' ? 'Tu Tablero' : 'Your Board'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {boardHistory.length > 0
                          ? (lang === 'ko' ? `${boardHistory.length}개 컨셉 보관 중` : lang === 'ja' ? `${boardHistory.length}件のコンセプト保存中` : lang === 'es' ? `${boardHistory.length} conceptos guardados` : `${boardHistory.length} concepts saved`)
                          : (lang === 'ko' ? `${resultImages.length}개 컨셉 생성됨` : lang === 'ja' ? `${resultImages.length}件のコンセプト生成済み` : lang === 'es' ? `${resultImages.length} conceptos generados` : `${resultImages.length} concepts generated`)
                        }
                      </p>
                    </div>

                    {/* 전체 선택 / 해제 토글 버튼 */}
                    {(boardHistory.length > 0 || resultImages.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          const allItems = boardHistory.length > 0
                            ? boardHistory
                            : resultImages.map((src, i) => ({ id: String(i), title: `Concept #${i + 1}`, image: src, style: 'Concept' }));
                          const allIds = allItems.map((i) => i.id);
                          const allSelected = allIds.every((id) => selectedBoardItemIds.includes(id));
                          setSelectedBoardItemIds(allSelected ? [] : allIds);
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {(() => {
                          const allItems = boardHistory.length > 0
                            ? boardHistory
                            : resultImages.map((src, i) => ({ id: String(i), title: `Concept #${i + 1}`, image: src, style: 'Concept' }));
                          const allIds = allItems.map((i) => i.id);
                          const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedBoardItemIds.includes(id));
                          if (isAllSelected) {
                            return lang === 'ko' ? '전체 해제' : lang === 'ja' ? '選択解除' : lang === 'es' ? 'Deseleccionar' : 'Deselect All';
                          } else {
                            return lang === 'ko' ? '전체 선택' : lang === 'ja' ? 'すべて選択' : lang === 'es' ? 'Seleccionar Todo' : 'Select All';
                          }
                        })()}
                      </button>
                    )}
                  </div>

                  {/* 🌟 선택된 항목 일괄 작업 바 (선택 다운로드 & 선택 삭제) */}
                  {selectedBoardItemIds.length > 0 && (
                    <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 shadow-lg animate-fade-in">
                      <span className="text-xs font-extrabold text-amber-300">
                        ✓ {lang === 'ko' ? `${selectedBoardItemIds.length}개 선택됨` : lang === 'ja' ? `${selectedBoardItemIds.length}件選択中` : lang === 'es' ? `${selectedBoardItemIds.length} seleccionados` : `${selectedBoardItemIds.length} selected`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadSelectedBoardItems}
                          className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-100 shadow active:scale-95 transition-all cursor-pointer"
                        >
                          <span>⬇️</span>
                          <span>{lang === 'ko' ? '다운로드' : lang === 'ja' ? 'ダウンロード' : lang === 'es' ? 'Descargar' : 'Download'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const confirmDeleteMsg = lang === 'ko'
                              ? `${selectedBoardItemIds.length}개 결과물을 삭제하시겠습니까?`
                              : lang === 'ja'
                              ? `${selectedBoardItemIds.length}件のデザインを削除しますか？`
                              : lang === 'es'
                              ? `¿Eliminar ${selectedBoardItemIds.length} diseños?`
                              : `Delete ${selectedBoardItemIds.length} designs?`;
                            if (confirm(confirmDeleteMsg)) {
                              handleDeleteBoardItems(selectedBoardItemIds);
                            }
                          }}
                          className="flex items-center gap-1 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 shadow active:scale-95 transition-all cursor-pointer"
                        >
                          <span>🗑️</span>
                          <span>{lang === 'ko' ? '삭제' : lang === 'ja' ? '削除' : lang === 'es' ? 'Eliminar' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 결과물 그리드 또는 빈 상태 */}
                  {(boardHistory.length > 0 || resultImages.length > 0) ? (
                    <div className="grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                      {(boardHistory.length > 0
                        ? boardHistory
                        : resultImages.map((src, i) => ({ id: String(i), title: `Concept #${i + 1}`, image: src, style: 'Concept' }))
                      ).map((item, idx) => {
                        const isSelected = selectedBoardItemIds.includes(item.id);
                        return (
                          <div
                            key={item.id || idx}
                            className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-slate-900 shadow-xl transition-all group ${
                              isSelected
                                ? 'border-amber-400 ring-2 ring-amber-400/60'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {/* 이미지 클릭 시 상세 비교 뷰어 오픈 */}
                            <div
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
                              className="w-full h-full cursor-pointer"
                            >
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-2.5 flex flex-col justify-end pointer-events-none">
                                <span className="text-[9px] font-bold text-amber-400">{item.style}</span>
                                <span className="text-[11px] font-bold text-white line-clamp-1">{item.title}</span>
                              </div>
                            </div>

                            {/* 좌측 상단: 선택 체크박스 버튼 */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBoardItemIds((prev) =>
                                  prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                                );
                              }}
                              className={`absolute top-2 left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 font-black text-xs shadow-md'
                                  : 'bg-slate-950/70 border border-slate-600 text-transparent hover:border-amber-400'
                              }`}
                            >
                              ✓
                            </button>

                            {/* 우측 상단: 개별 다운로드 & 삭제 퀵 버튼 */}
                            <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadImage(item.image, `reroom_${item.style}_${item.id}.png`);
                                }}
                                title={lang === 'ko' ? '다운로드' : lang === 'ja' ? 'ダウンロード' : lang === 'es' ? 'Descargar' : 'Download'}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/80 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 active:scale-95 shadow-md cursor-pointer"
                              >
                                ⬇️
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBoardItems([item.id]);
                                }}
                                title={lang === 'ko' ? '삭제' : lang === 'ja' ? '削除' : lang === 'es' ? 'Eliminar' : 'Delete'}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/80 border border-slate-700 text-[10px] text-rose-400 hover:bg-rose-950 active:scale-95 shadow-md cursor-pointer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 py-12 px-4 text-center">
                      <span className="text-3xl">📭</span>
                      <p className="mt-2 text-sm font-bold text-slate-300">
                        {lang === 'ko' ? '보관된 결과물이 없습니다' : lang === 'ja' ? '保存されたデザインがありません' : lang === 'es' ? 'No hay resultados guardados' : 'No saved designs yet'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lang === 'ko' ? '이전 단계로 돌아가 새로운 인테리어를 생성해 보세요!' : lang === 'ja' ? '前のステップに戻って新しいデザインを生成してみましょう！' : lang === 'es' ? '¡Regresa y genera nuevos diseños!' : 'Go back to create a new interior concept!'}
                      </p>
                    </div>
                  )}

                  {/* 하단 버튼: 이전단계 (설정 변경) + 완료 & 홈으로 */}
                  <div className="mt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-1/2 rounded-2xl border border-slate-700 bg-slate-900/90 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center"
                    >
                      {lang === 'ko' ? '◀ 이전단계 (설정 변경)' : lang === 'ja' ? '◀ 前へ（設定変更）' : lang === 'es' ? '◀ Anterior (Cambiar)' : '◀ Back (Settings)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWizardOpen(false)}
                      className="w-1/2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                    >
                      {lang === 'ko' ? '완료 & 홈으로 ➔' : lang === 'ja' ? '完了＆ホームへ ➔' : lang === 'es' ? 'Listo e Inicio ➔' : 'Done & Home ➔'}
                    </button>
                  </div>
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
            <h4 className="text-sm font-black text-white">
              {lang === 'ko' ? 'AI 디자인 결과 비교' : lang === 'ja' ? 'AIデザイン結果' : lang === 'es' ? 'Resultado de Diseño' : 'Your Design Concept'}
            </h4>
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
                  {lang === 'ko' ? '↔️ 슬라이더 비교' : lang === 'ja' ? '↔️ スライダー比較' : lang === 'es' ? '↔️ Deslizador' : '↔️ Slider Compare'}
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
                  {lang === 'ko' ? '✨ AI 결과 (After)' : lang === 'ja' ? '✨ AI結果 (After)' : lang === 'es' ? '✨ Resultado AI' : '✨ AI Design (After)'}
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
                  {lang === 'ko' ? '📷 원본 사진 (Before)' : lang === 'ja' ? '📷 元の写真 (Before)' : lang === 'es' ? '📷 Foto Original' : '📷 Original (Before)'}
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

            {/* Smart Tools (색상/벽지 변경, 가구 교체, 식물/소품 추가) */}
            <div className="mt-4 flex w-full justify-around rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
              <button
                type="button"
                onClick={() => {
                  setSmartEditInput('');
                  setActiveSmartEditTool('paint');
                }}
                className="flex flex-col items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-xl">🎨</span>
                <span>{lang === 'ko' ? '색상/벽지 변경' : lang === 'ja' ? '色・壁紙の変更' : lang === 'es' ? 'Color y Pared' : 'Color & Wall'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmartEditInput('');
                  setActiveSmartEditTool('replace');
                }}
                className="flex flex-col items-center gap-1 text-xs font-bold text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-xl">🛋️</span>
                <span>{lang === 'ko' ? '가구/소품 교체' : lang === 'ja' ? '家具・小物の交換' : lang === 'es' ? 'Cambiar Muebles' : 'Swap Furniture'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmartEditInput('');
                  setActiveSmartEditTool('plant');
                }}
                className="flex flex-col items-center gap-1 text-xs font-bold text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-xl">🪴</span>
                <span>{lang === 'ko' ? '식물/소품 추가' : lang === 'ja' ? '植物・小物の追加' : lang === 'es' ? 'Añadir Plantas' : 'Add Plants & Decor'}</span>
              </button>
            </div>

            {/* 하단 액션 버튼 (보드로 복귀, 저장 4K 다운로드, 삭제, 재생성) */}
            <div className="mt-4 grid grid-cols-4 gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                }}
                className="rounded-2xl border border-amber-500/50 bg-amber-500/10 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer text-center"
              >
                {lang === 'ko' ? '◀ 보드로' : lang === 'ja' ? '◀ ボードへ' : lang === 'es' ? '◀ Al Tablero' : '◀ To Board'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetImg = resultImages[selectedResultIndex];
                  if (!targetImg) return;

                  if (isPaidUser) {
                    // 👑 유료 구독자: 4K 초고화질 즉시 다운로드
                    handleDownloadImage(targetImg, `reroom_4k_${Date.now()}.png`);
                  } else {
                    // 🔒 무료 사용자: 4K 유료 잠금 안내 및 일반 화질 무료 저장 / 업그레이드 선택
                    const confirmStandard = confirm(
                      lang === 'ko'
                        ? '👑 4K 초고화질 다운로드는 유료 구독자(PRO) 전용 혜택입니다.\n\n• [확인]: 일반 화질(HD)로 무료 저장\n• [취소]: 4K 초고화질 PRO 요금제 업그레이드'
                        : lang === 'ja'
                        ? '👑 4K超高画質ダウンロードは有料会員（PRO）専用特典です。\n\n• [OK]: 標準画質（HD）で無料保存\n• [キャンセル]: 4K PROプランへアップグレード'
                        : lang === 'es'
                        ? '👑 La descarga 4K Ultra-HD es exclusiva para miembros PRO.\n\n• [Aceptar]: Guardar en calidad estándar (HD) gratis\n• [Cancelar]: Ver planes PRO 4K'
                        : '👑 4K Ultra-HD Download is exclusive to PRO members.\n\n• Click [OK] to save in standard HD for free\n• Click [Cancel] to upgrade to 4K PRO plan'
                    );
                    if (confirmStandard) {
                      handleDownloadImage(targetImg, `reroom_standard_${Date.now()}.png`);
                    } else {
                      setIsPricingModalOpen(true);
                    }
                  }
                }}
                className={`rounded-2xl border py-3 text-xs font-bold transition-all cursor-pointer text-center shadow ${
                  isPaidUser
                    ? 'border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-amber-500/25 hover:brightness-110'
                    : 'border-amber-500/40 bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                {isPaidUser
                  ? (lang === 'ko' ? '⬇️ 4K 저장' : lang === 'ja' ? '⬇️ 4K保存' : lang === 'es' ? '⬇️ Guardar 4K' : '⬇️ Save 4K')
                  : (lang === 'ko' ? '🔒 4K (PRO)' : lang === 'ja' ? '🔒 4K (PRO)' : lang === 'es' ? '🔒 4K (PRO)' : '🔒 4K (PRO)')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetImg = resultImages[selectedResultIndex];
                  const confirmMsg = lang === 'ko'
                    ? '이 결과물을 보드에서 삭제하시겠습니까?'
                    : lang === 'ja'
                    ? 'このデザインをボードから削除しますか？'
                    : lang === 'es'
                    ? '¿Eliminar este diseño del tablero?'
                    : 'Delete this design from the board?';
                  if (targetImg && confirm(confirmMsg)) {
                    const matching = boardHistory.find((b) => b.image === targetImg);
                    if (matching) {
                      handleDeleteBoardItems([matching.id]);
                    } else {
                      setResultImages((prev) => prev.filter((_, i) => i !== selectedResultIndex));
                    }
                    setShowResultModal(false);
                  }
                }}
                className="rounded-2xl border border-rose-500/40 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer text-center"
              >
                {lang === 'ko' ? '🗑️ 삭제' : lang === 'ja' ? '🗑️ 削除' : lang === 'es' ? '🗑️ Eliminar' : '🗑️ Delete'}
              </button>
              <button
                type="button"
                onClick={runGeneration}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
              >
                {lang === 'ko' ? '🔄 재생성' : lang === 'ja' ? '🔄 再生成' : lang === 'es' ? '🔄 Regenerar' : '🔄 Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🪄 스마트 편집 다이얼로그 (색상/벽지 변경, 가구 교체, 식물/소품 추가) ── */}
      {activeSmartEditTool && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl animate-slide-up flex flex-col max-h-[88vh] overflow-y-auto">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {activeSmartEditTool === 'paint' ? '🎨' : activeSmartEditTool === 'replace' ? '🛋️' : '🪴'}
                </span>
                <h4 className="text-base font-black text-white">
                  {activeSmartEditTool === 'paint'
                    ? (lang === 'ko' ? '벽지 & 페인트 색상 변경' : lang === 'ja' ? '壁紙＆ペイント色の変更' : lang === 'es' ? 'Cambiar Pintura y Pared' : 'Change Paint & Wallpaper')
                    : activeSmartEditTool === 'replace'
                    ? (lang === 'ko' ? '가구 & 소품 스타일 교체' : lang === 'ja' ? '家具＆小物の交換' : lang === 'es' ? 'Cambiar Muebles y Decoración' : 'Swap Furniture & Decor')
                    : (lang === 'ko' ? '감성 식물 & 소품 추가' : lang === 'ja' ? '植物＆小物の追加' : lang === 'es' ? 'Añadir Plantas y Decoración' : 'Add Plants & Decor')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => !isSmartEditing && setActiveSmartEditTool(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 안내 문구 */}
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              {activeSmartEditTool === 'paint'
                ? (lang === 'ko' ? '현재 배치와 가구는 100% 그대로 유지하고, 벽면 색상과 벽지 질감만 새로 변경합니다.' : lang === 'ja' ? '現在の配置と家具は100%保持し、壁の色と質感のみ新しく変更します。' : lang === 'es' ? 'Mantiene muebles y distribución, cambiando solo colores y texturas de pared.' : 'Preserve furniture and layout 100%, updating only wall paint and wallpaper textures.')
                : activeSmartEditTool === 'replace'
                ? (lang === 'ko' ? '방 전체 구조는 보존하고, 특정 가구의 스타일/소재(패브릭, 원목, 가죽 등)를 교체합니다.' : lang === 'ja' ? '部屋全体の構造は保持し、特定家具のスタイルや素材を交換します。' : lang === 'es' ? 'Conserva la estructura y cambia el estilo o material de muebles específicos.' : 'Preserve room layout and swap specific furniture style and materials.')
                : (lang === 'ko' ? '완성된 방에 플랜테리어 화분, 러그, 액자, 반려동물 등을 자연스럽게 추가합니다.' : lang === 'ja' ? '完成した部屋に観葉植物、ラグ、絵画、ペットなどを自然に追加します。' : lang === 'es' ? 'Añade plantas, alfombras, cuadros y mascotas a tu habitación con armonía.' : 'Naturally add potted plants, rugs, wall art, or pets to your finished room.')}
            </p>

            {/* 추천 프리셋 칩 목록 */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-amber-400">
                {lang === 'ko' ? '추천 프리셋 (1-Tap 선택)' : lang === 'ja' ? 'おすすめプリセット（1タップ選択）' : lang === 'es' ? 'Ajustes Recomendados (1 toque)' : 'Recommended Presets (1-Tap)'}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(activeSmartEditTool === 'paint'
                  ? [
                      {
                        label: lang === 'ko' ? '🌿 세이지 그린' : lang === 'ja' ? '🌿 セージグリーン' : lang === 'es' ? '🌿 Verde Salvia' : '🌿 Sage Green',
                        val: lang === 'ko' ? '차분하고 감성적인 세이지 그린(Sage Green) 페인트 벽면' : lang === 'ja' ? '落ち着いたセージグリーン（Sage Green）のペイント壁' : lang === 'es' ? 'Paredes pintadas en relajante verde salvia' : 'Calm, atmospheric sage green painted wall',
                      },
                      {
                        label: lang === 'ko' ? '🍦 웜 크림 베이지' : lang === 'ja' ? '🍦 ウォームクリーム' : lang === 'es' ? '🍦 Crema Cálido' : '🍦 Warm Ivory Beige',
                        val: lang === 'ko' ? '포근하고 아늑한 웜톤 크림 아이보리(Warm Ivory Beige) 벽지' : lang === 'ja' ? '温かみのあるクリームアイボリー（Warm Ivory Beige）の壁紙' : lang === 'es' ? 'Papel tapiz en tono crema marfil cálido' : 'Cozy warm ivory beige wallpaper',
                      },
                      {
                        label: lang === 'ko' ? '🤍 모던 퓨어 화이트' : lang === 'ja' ? '🤍 ピュアホワイト' : lang === 'es' ? '🤍 Blanco Puro' : '🤍 Pure White',
                        val: lang === 'ko' ? '깔끔하고 화사한 모던 퓨어 화이트(Pure White) 벽면' : lang === 'ja' ? '清潔感のあるモダンピュアホワイト（Pure White）の壁' : lang === 'es' ? 'Paredes en blanco puro moderno' : 'Clean and bright modern pure white walls',
                      },
                      {
                        label: lang === 'ko' ? '🪵 우드 템바보드' : lang === 'ja' ? '🪵 ウッドリブパネル' : lang === 'es' ? '🪵 Panel de Madera' : '🪵 Wood Slat Wall',
                        val: lang === 'ko' ? '한쪽 벽면을 따뜻한 내추럴 오크 템바보드(Wood Slat Wall)로 시공' : lang === 'ja' ? '片側の壁をナチュラルオークのウッドスラット（木製リブパネル）に施工' : lang === 'es' ? 'Pared acentuada con listones de madera de roble' : 'Accent wall with warm natural oak wood slats',
                      },
                      {
                        label: lang === 'ko' ? '🏢 차콜 모던 그레이' : lang === 'ja' ? '🏢 チャコールグレー' : lang === 'es' ? '🏢 Gris Carbón' : '🏢 Charcoal Gray',
                        val: lang === 'ko' ? '세련되고 도시적인 차콜 그레이(Charcoal Gray) 매트 벽면' : lang === 'ja' ? '洗練された都会的なチャコールグレー（Charcoal Gray）マット壁' : lang === 'es' ? 'Pared mate en elegante gris carbón moderno' : 'Sophisticated matte charcoal gray accent wall',
                      },
                      {
                        label: lang === 'ko' ? '🧱 소프트 테라코타' : lang === 'ja' ? '🧱 テラコッタ' : lang === 'es' ? '🧱 Terracota Suave' : '🧱 Soft Terracotta',
                        val: lang === 'ko' ? '유럽풍의 따스한 테라코타 브릭 오렌지(Terracotta) 벽면' : lang === 'ja' ? 'ヨーロッパ風の温かいテラコッタ（Terracotta）壁面' : lang === 'es' ? 'Paredes cálidas en tono terracota mediterráneo' : 'Warm European terracotta brick tone wall',
                      },
                    ]
                  : activeSmartEditTool === 'replace'
                  ? [
                      {
                        label: lang === 'ko' ? '🛋️ 패브릭 모듈 소파' : lang === 'ja' ? '🛋️ ファブリックソファ' : lang === 'es' ? '🛋️ Sofá Modular' : '🛋️ Fabric Modular Sofa',
                        val: lang === 'ko' ? '소파를 포근한 크림 베이지 패브릭 모듈 소파로 교체' : lang === 'ja' ? 'ソファを温かみのあるクリームベージュのファブリックモジュールソファに交換' : lang === 'es' ? 'Cambiar sofá por uno modular de tela beige' : 'Replace sofa with cozy cream beige fabric modular sofa',
                      },
                      {
                        label: lang === 'ko' ? '🪵 원목 월넛 테이블' : lang === 'ja' ? '🪵 ウォールナット机' : lang === 'es' ? '🪵 Mesa de Nogal' : '🪵 Walnut Coffee Table',
                        val: lang === 'ko' ? '커피 테이블을 고급스러운 월넛 원목 티 테이블로 교체' : lang === 'ja' ? 'コーヒーテーブルを高級ウォールナット無垢材テーブルに交換' : lang === 'es' ? 'Mesa de centro de madera maciza de nogal' : 'Replace coffee table with premium solid walnut tea table',
                      },
                      {
                        label: lang === 'ko' ? '💡 아크 플로어 조명' : lang === 'ja' ? '💡 アークスタンド' : lang === 'es' ? '💡 Lámpara de Arco' : '💡 Arc Floor Lamp',
                        val: lang === 'ko' ? '조명을 미니멀한 황동/블랙 아크형 플로어 스탠드로 교체' : lang === 'ja' ? '照明をミニマルな真鍮／ブラックのアーク型フロアスタンドに交換' : lang === 'es' ? 'Lámpara de pie de arco minimalista en latón o negro' : 'Replace lamp with minimalist brass or black arc floor lamp',
                      },
                      {
                        label: lang === 'ko' ? '🎨 기하학 모던 러그' : lang === 'ja' ? '🎨 幾何学モダンラグ' : lang === 'es' ? '🎨 Alfombra Geométrica' : '🎨 Geometric Modern Rug',
                        val: lang === 'ko' ? '바닥 러그를 세련된 북유럽 기하학 라인 러그로 교체' : lang === 'ja' ? 'フロアラグを洗練された北欧ジオメトリックラグに交換' : lang === 'es' ? 'Cambiar alfombra por una moderna nórdica con líneas' : 'Replace rug with stylish Nordic geometric line rug',
                      },
                      {
                        label: lang === 'ko' ? '🪑 라운지 1인 암체어' : lang === 'ja' ? '🪑 1人掛けラウンジチェア' : lang === 'es' ? '🪑 Sillón de Descanso' : '🪑 Lounge Armchair',
                        val: lang === 'ko' ? '1인 의자를 고급 가죽 라운지 체어로 교체' : lang === 'ja' ? '1人用チェアを高級レザーラウンジチェアに交換' : lang === 'es' ? 'Sillón individual de cuero de alta gama' : 'Replace chair with premium leather lounge armchair',
                      },
                    ]
                  : [
                      {
                        label: lang === 'ko' ? '🌿 대형 몬스테라' : lang === 'ja' ? '🌿 大型モンステラ' : lang === 'es' ? '🌿 Gran Monstera' : '🌿 Large Monstera',
                        val: lang === 'ko' ? '창가 쪽에 싱그러운 대형 몬스테라 플랜테리어 화분 추가' : lang === 'ja' ? '窓辺にみずみずしい大型モンステラの鉢植えを追加' : lang === 'es' ? 'Añadir maceta grande de monstera junto a la ventana' : 'Add fresh large potted monstera plant near window',
                      },
                      {
                        label: lang === 'ko' ? '🪴 감성 올리브 나무' : lang === 'ja' ? '🪴 オリーブの木' : lang === 'es' ? '🪴 Olivo en Maceta' : '🪴 Olive Tree in Pot',
                        val: lang === 'ko' ? '소파 옆에 키 큰 감성 올리브 나무 토분 화분 배치' : lang === 'ja' ? 'ソファの横に背の高いオリーブの木の素焼き鉢植えを配置' : lang === 'es' ? 'Colocar olivo en maceta de terracota al lado del sofá' : 'Place tall potted olive tree next to sofa',
                      },
                      {
                        label: lang === 'ko' ? '🐕 소파 위 낮잠 강아지' : lang === 'ja' ? '🐕 お昼寝ワンちゃん' : lang === 'es' ? '🐕 Perrito Durmiendo' : '🐕 Sleeping Dog on Sofa',
                        val: lang === 'ko' ? '소파 위에 포근하게 누워 낮잠 자는 귀여운 골든리트리버 강아지' : lang === 'ja' ? 'ソファの上で気持ちよさそうにお昼寝する可愛いゴールデンレトリバー' : lang === 'es' ? 'Lindo golden retriever durmiendo plácidamente en el sofá' : 'Cute golden retriever taking a cozy nap on sofa',
                      },
                      {
                        label: lang === 'ko' ? '🐈 러그 위 귀여운 고양이' : lang === 'ja' ? '🐈 ラグの上の猫' : lang === 'es' ? '🐈 Lindo Gatito' : '🐈 Cute Cat on Rug',
                        val: lang === 'ko' ? '바닥 러그 위에 식빵 굽고 있는 귀여운 고양이' : lang === 'ja' ? 'ラグの上で香箱座りをしている可愛い猫' : lang === 'es' ? 'Lindo gatito acurrucado en la alfombra' : 'Cute cat resting comfortably on the floor rug',
                      },
                      {
                        label: lang === 'ko' ? '📚 매거진 & 캔들 트레이' : lang === 'ja' ? '📚 雑誌＆キャンドルトレイ' : lang === 'es' ? '📚 Revistas y Velas' : '📚 Magazine & Candle Tray',
                        val: lang === 'ko' ? '테이블 위에 아트 매거진 북과 감성 캔들 트레이 소품 추가' : lang === 'ja' ? 'テーブルの上にアート雑誌とアロマキャンドルトレイを追加' : lang === 'es' ? 'Bandeja con velas aromáticas y libros de arte en la mesa' : 'Add art magazine books and scented candle tray on table',
                      },
                      {
                        label: lang === 'ko' ? '🖼️ 벽면 대형 갤러리 액자' : lang === 'ja' ? '🖼️ 大型アートフレーム' : lang === 'es' ? '🖼️ Cuadro de Galería' : '🖼️ Large Gallery Canvas',
                        val: lang === 'ko' ? '소파 뒷벽에 모던 추상화 대형 갤러리 캔버스 액자 걸기' : lang === 'ja' ? 'ソファ背面の壁にモダン抽象画の大型キャンバスフレームを掛ける' : lang === 'es' ? 'Colgar cuadro abstracto de galería en la pared detrás del sofá' : 'Hang large abstract modern canvas gallery frame on wall behind sofa',
                      },
                    ]
                ).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSmartEditInput(preset.val)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      smartEditInput === preset.val
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 입력 영역 */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-300">
                {lang === 'ko' ? '직접 입력' : lang === 'ja' ? '直接入力' : lang === 'es' ? 'Entrada Personalizada' : 'Custom Prompt'}
              </label>
              <textarea
                value={smartEditInput}
                onChange={(e) => setSmartEditInput(e.target.value)}
                placeholder={
                  activeSmartEditTool === 'paint'
                    ? (lang === 'ko' ? '원하는 벽지 색상이나 질감을 적어주세요 (예: 파스텔 핑크 페인트, 빈티지 회벽)' : lang === 'ja' ? '希望の壁紙の色や質感を記入してください（例：パステルピンク、ヴィンテージ漆喰壁）' : lang === 'es' ? 'Escribe el color o textura deseada (ej. pintura rosa pastel)' : 'Enter wall color or texture (e.g. pastel pink paint, vintage plaster)')
                    : activeSmartEditTool === 'replace'
                    ? (lang === 'ko' ? '교체할 가구와 원하는 디자인을 적어주세요 (예: 거실장을 블랙 스틸 선반으로 교체)' : lang === 'ja' ? '交換したい家具とデザインを記入してください（例：ブラックスチール棚に変更）' : lang === 'es' ? 'Escribe el mueble y diseño a cambiar' : 'Specify furniture to swap (e.g. replace console with black steel shelves)')
                    : (lang === 'ko' ? '추가할 소품을 적어주세요 (예: 창가에 마크라메 행잉 플랜트 추가)' : lang === 'ja' ? '追加したい小物を記入してください（例：窓辺にハンギングプランツを追加）' : lang === 'es' ? 'Escribe los accesorios a añadir (ej. plantas colgantes)' : 'Describe items to add (e.g. hanging plant by the window)')
                }
                rows={2}
                className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* 실행 버튼 */}
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSmartEditTool(null)}
                disabled={isSmartEditing}
                className="w-1/3 rounded-2xl border border-slate-700 bg-slate-800 py-3.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                {lang === 'ko' ? '취소' : lang === 'ja' ? 'キャンセル' : lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleApplySmartEdit()}
                disabled={isSmartEditing || !smartEditInput.trim()}
                className={`w-2/3 rounded-2xl py-3.5 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSmartEditing || !smartEditInput.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95'
                }`}
              >
                {isSmartEditing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span>{lang === 'ko' ? 'AI 디자인 적용 중...' : lang === 'ja' ? 'AIデザインを適用中...' : lang === 'es' ? 'Aplicando diseño AI...' : 'Applying AI Design...'}</span>
                  </>
                ) : (
                  <span>{lang === 'ko' ? '✨ 디자인 적용하기' : lang === 'ja' ? '✨ デザインを適用する' : lang === 'es' ? '✨ Aplicar Diseño' : '✨ Apply Design'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 📷 MEDIA SOURCE SELECTOR SHEET ── */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full rounded-t-3xl border-t border-slate-800 bg-slate-900 p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4">
              <h4 className="text-base font-black text-white">
                {lang === 'ko' ? '사진 업로드 방식 선택' : lang === 'ja' ? 'メディアソースの選択' : lang === 'es' ? 'Seleccionar Fuente' : 'Select Media Source'}
              </h4>
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
                  <span className="text-sm block">
                    {lang === 'ko' ? '카메라로 즉시 촬영' : lang === 'ja' ? 'カメラで撮影' : lang === 'es' ? 'Tomar foto con la cámara' : 'Take photo from camera'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'ko' ? '휴대폰 카메라를 직접 실행합니다' : lang === 'ja' ? 'スマホのカメラを直接起動します' : lang === 'es' ? 'Usa la cámara de tu teléfono' : 'Use your phone camera directly'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-left font-bold text-white hover:bg-slate-800"
              >
                <span className="text-xl">🖼️</span>
                <div>
                  <span className="text-sm block">
                    {lang === 'ko' ? '사진첩/갤러리에서 선택' : lang === 'ja' ? 'アルバムから選択' : lang === 'es' ? 'Elegir de la galería' : 'Choose from gallery'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'ko' ? '기기에 저장된 방 사진을 선택합니다' : lang === 'ja' ? '端末に保存された写真を選択します' : lang === 'es' ? 'Elige fotos de tu dispositivo' : 'Pick room photos from device'}
                  </span>
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
            <span className="text-[10px]">{translations.home.tabs.tools[lang]}</span>
          </button>

          <button
            onClick={() => startWizard()}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'create' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">➕</span>
            <span className="text-[10px]">{translations.home.tabs.create[lang]}</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">✨</span>
            <span className="text-[10px]">{translations.home.tabs.discover[lang]}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px]">{translations.home.tabs.profile[lang]}</span>
          </button>
        </div>
      </nav>

      {/* 🤖 RoomFit AI™ 에이전트 대화형 챗봇 드로어/모달 (z-[100] 최상단 레이어) */}
      {isAgentOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
          <div className="flex h-[85vh] max-h-[680px] w-full max-w-md flex-col rounded-t-3xl sm:rounded-3xl border border-amber-500/40 bg-slate-950 shadow-2xl overflow-hidden">
            {/* 챗봇 헤더 */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-xl border border-amber-500/40">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{translations.agentModal.title[lang]}</span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30">
                      ON-DEMAND AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{translations.agentModal.subtitle[lang]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAgentOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* 빠른 추천 키워드 태그 (1-Tap 빠른 입력) */}
            <div className="border-b border-slate-800/60 bg-slate-900/60 p-2.5">
              <span className="text-[10px] font-extrabold text-amber-400 block mb-1.5 px-1">
                {translations.agentModal.tagTitle[lang]}
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {translations.agentModal.quickTags.map((tagObj, idx) => {
                  const tagText = (tagObj as any)[lang] || tagObj['en'];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAgentMessage(tagText)}
                      className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      {tagText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 대화 히스토리 메인 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
              {agentMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-md'
                        : msg.promptAction
                        ? 'border border-amber-500/40 bg-amber-500/10 text-amber-200 font-bold'
                        : 'border border-slate-800 bg-slate-900 text-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* 입력 폼 및 적용 버튼 */}
            <div className="border-t border-slate-800 bg-slate-900 p-3 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAgentMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder={translations.agentModal.placeholder[lang]}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  {translations.agentModal.send[lang]}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsAgentOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-3 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {translations.agentModal.apply[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── 💳 온보딩 첫 접속 요금제 & 2 크레딧 제공 안내 팝업 모달 (메인화면 고유 크기 유지) ── */}
    <PricingModal
      isOpen={isPricingModalOpen}
      onClose={() => setIsPricingModalOpen(false)}
      onClaimFreeCredits={() => setFreeCountRaw(String(Math.min(2, freeCount + 2)))}
      onPurchasePlan={(plan) => {
        if (plan.id === 'starter') {
          setFreeCountRaw(String(freeCount + 30));
          setUserPlan('starter');
        } else {
          // 월간/연간 무제한 플랜
          setFreeCountRaw('999');
          setUserPlan('pro');
        }
      }}
      onStartExperience={() => {
        setIsPricingModalOpen(false);
        setActiveTab('tools');
      }}
      freeCreditsCount={freeCount}
      lang={lang}
      onLanguageChange={setLang}
    />

    {/* ── 📷 항상 전역에서 안전하게 동작하는 파일 업로드 인풋 (갤러리 / 카메라) ── */}
    <input
      ref={galleryInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
        e.target.value = '';
      }}
    />
    <input
      ref={cameraInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
        e.target.value = '';
      }}
    />
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
        e.target.value = '';
      }}
    />
  </>
);
}
