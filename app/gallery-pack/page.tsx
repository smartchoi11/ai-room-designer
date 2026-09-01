'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryItem {
  id: number;
  filename: string;
  titleEn: string;
  titleKr: string;
  titleJa: string;
  category: string;
  aspectRatio: string;
  src: string;
}

const GALLERY_PACK_ITEMS: GalleryItem[] = [
  // ── [신규 추가] 주방 인테리어 옵션 5종 (#26 ~ #30) ──
  {
    id: 26,
    filename: 'kitchen_option_01.png',
    titleEn: 'Scandinavian Light Oak & White Marble Kitchen',
    titleKr: '북유럽 화이트 마블 & 우드 아일랜드 주방 (옵션 1)',
    titleJa: '北欧調ホワイトマーブル＆ウッドキッチン（案1）',
    category: '🍳 Kitchen Option 1',
    aspectRatio: '4:3',
    src: '/kitchen_option_01.png',
  },
  {
    id: 27,
    filename: 'kitchen_option_02.png',
    titleEn: 'Sleek Matte Black & Brass Handleless Kitchen',
    titleKr: '매트 블랙 & 브라스 포인트 모던 주방 (옵션 2)',
    titleJa: 'マットブラック＆ブラスモダンキッチン（案2）',
    category: '🍳 Kitchen Option 2',
    aspectRatio: '4:3',
    src: '/kitchen_option_02.png',
  },
  {
    id: 28,
    filename: 'kitchen_option_03.png',
    titleEn: 'Warm Modern Farmhouse Kitchen with Open Shelves',
    titleKr: '따뜻한 감성 우드 팜하우스 주방 (옵션 3)',
    titleJa: '温かみのあるウッドファームハウスキッチン（案3）',
    category: '🍳 Kitchen Option 3',
    aspectRatio: '4:3',
    src: '/kitchen_option_03.png',
  },
  {
    id: 29,
    filename: 'kitchen_option_04.png',
    titleEn: 'Penthouse Luxury Gold & Quartz Kitchen',
    titleKr: '럭셔리 펜트하우스 골드 & 쿼츠 주방 (옵션 4)',
    titleJa: 'ペントハウスラグジュアリーゴールドキッチン（案4）',
    category: '🍳 Kitchen Option 4',
    aspectRatio: '4:3',
    src: '/kitchen_option_04.png',
  },
  {
    id: 30,
    filename: 'kitchen_option_05.png',
    titleEn: 'Industrial Loft Brick & Steel Open Kitchen',
    titleKr: '빈티지 벽돌 & 인더스트리얼 주방 (옵션 5)',
    titleJa: 'インダストリアルロフトオープンキッチン（案5）',
    category: '🍳 Kitchen Option 5',
    aspectRatio: '4:3',
    src: '/kitchen_option_05.png',
  },

  // ── [신규 추가] 아기방 / 자녀방 인테리어 옵션 5종 (#31 ~ #35) ──
  {
    id: 31,
    filename: 'baby_room_01.png',
    titleEn: 'Cozy Soft Pastel Cream Nursery with Wooden Crib',
    titleKr: '포근한 파스텔 크림 & 원목 아기방 (옵션 1)',
    titleJa: '温かみのあるパステルクリームベビールーム（案1）',
    category: '👶 Baby Room Option 1',
    aspectRatio: '4:3',
    src: '/baby_room_01.png',
  },
  {
    id: 32,
    filename: 'baby_room_02.png',
    titleEn: 'Nordic Forest Birch Wooden Baby Room',
    titleKr: '노르딕 세이지 그린 & 내추럴 우드 자녀방 (옵션 2)',
    titleJa: '北欧セージグリーン＆ナチュラルウッド子供部屋（案2）',
    category: '👶 Baby Room Option 2',
    aspectRatio: '4:3',
    src: '/baby_room_02.png',
  },
  {
    id: 33,
    filename: 'baby_room_03.png',
    titleEn: 'Modern Minimal Sage & Hidden LED Nursery',
    titleKr: '모던 미니멀 간접조명 아기방 (옵션 3)',
    titleJa: 'モダンミニマル間接照明ベビールーム（案3）',
    category: '👶 Baby Room Option 3',
    aspectRatio: '4:3',
    src: '/baby_room_03.png',
  },
  {
    id: 34,
    filename: 'baby_room_04.png',
    titleEn: 'Organic Rattan & Woven Canopy Boho Nursery',
    titleKr: '오가닉 라탄 & 캐노피 보헤미안 아기방 (옵션 4)',
    titleJa: 'オーガニックラタン＆キャノピーボヘミアンベビールーム（案4）',
    category: '👶 Baby Room Option 4',
    aspectRatio: '4:3',
    src: '/baby_room_04.png',
  },
  {
    id: 35,
    filename: 'baby_room_05.png',
    titleEn: 'Clean Montessori Wooden Playroom & Nursery',
    titleKr: '몬테소리 스타일 교구 선반 & 자녀방 (옵션 5)',
    titleJa: 'モンテッソーリ調教具棚＆子供部屋（案5）',
    category: '👶 Baby Room Option 5',
    aspectRatio: '4:3',
    src: '/baby_room_05.png',
  },

  // ── [기존 선택 시안 25종] ──
  {
    id: 1,
    filename: 'living_room_after.png',
    titleEn: 'Serene Japandi Living Room',
    titleKr: '평온한 재팬디 거실 (오리지널 3D)',
    titleJa: '和モダン Japandi リビング',
    category: 'Living Room',
    aspectRatio: '16:9 Wide',
    src: '/living_room_after.png',
  },
  {
    id: 2,
    filename: 'living_room_luxury.png',
    titleEn: 'Penthouse Hotel Luxury Lounge',
    titleKr: '펜트하우스 호텔 럭셔리 라운지',
    titleJa: '高級ホテルラウンジ',
    category: 'Living Room',
    aspectRatio: '16:9 Wide',
    src: '/living_room_luxury.png',
  },
  {
    id: 3,
    filename: 'living_room_cyberpunk.png',
    titleEn: 'Futuristic Cyberpunk Lounge',
    titleKr: '미래형 네온 사이버펑크 거실',
    titleJa: 'ネオンサイバーパンク空間',
    category: 'Gaming / Special',
    aspectRatio: '16:9 Wide',
    src: '/living_room_cyberpunk.png',
  },
  {
    id: 4,
    filename: 'showcase_bedroom.png',
    titleEn: 'Modern Minimalist Master Bedroom',
    titleKr: '은은한 베이지 모던 침실',
    titleJa: 'モダンミニマル主寝室',
    category: 'Bedroom',
    aspectRatio: '4:3',
    src: '/showcase_bedroom.png',
  },
  {
    id: 5,
    filename: 'showcase_kitchen.png',
    titleEn: 'Scandinavian Open Timber Kitchen',
    titleKr: '노르딕 우드 아일랜드 주방',
    titleJa: '北欧調オープンキッチン',
    category: 'Kitchen',
    aspectRatio: '4:3',
    src: '/showcase_kitchen.png',
  },
  {
    id: 6,
    filename: 'showcase_bohemian.png',
    titleEn: 'Organic Botanical Bohemian Sanctuary',
    titleKr: '자연 감성의 보헤미안 거실',
    titleJa: 'ボタニカル感性リビング',
    category: 'Living Room',
    aspectRatio: '4:3',
    src: '/showcase_bohemian.png',
  },
  {
    id: 7,
    filename: 'showcase_office.png',
    titleEn: 'Industrial Loft Leather Workspace',
    titleKr: '빈티지 레더 인더스트리얼 서재',
    titleJa: 'インダストリアル書斎',
    category: 'Office',
    aspectRatio: '4:3',
    src: '/showcase_office.png',
  },
  {
    id: 8,
    filename: 'cozy_home_living.png',
    titleEn: 'Cozy Sunlit Residential Living Room',
    titleKr: '따뜻한 햇살 아늑한 가정집 거실',
    titleJa: '陽光の差すアットホームなリビング',
    category: 'Cozy Home',
    aspectRatio: '4:3',
    src: '/cozy_home_living.png',
  },
  {
    id: 9,
    filename: 'cozy_home_bedroom.png',
    titleEn: 'Relaxing Warm Linen Master Bedroom',
    titleKr: '포근한 원목 가정집 침실',
    titleJa: '温かみのある家庭的寝室',
    category: 'Cozy Home',
    aspectRatio: '4:3',
    src: '/cozy_home_bedroom.png',
  },
  {
    id: 10,
    filename: 'cozy_home_dining.png',
    titleEn: 'Scandi Oak Family Dining Room',
    titleKr: '정갈한 우드 감성 다이닝룸',
    titleJa: '木の温もりファミリーダイニング',
    category: 'Cozy Home / Dining',
    aspectRatio: '4:3',
    src: '/cozy_home_dining.png',
  },
  {
    id: 11,
    filename: 'cozy_home_kids.png',
    titleEn: 'Pastel Organised Kids Playroom',
    titleKr: '정돈된 파스텔 자녀방',
    titleJa: '整頓された子供部屋',
    category: 'Cozy Home / Kids',
    aspectRatio: '4:3',
    src: '/cozy_home_kids.png',
  },
  {
    id: 12,
    filename: 'cozy_home_balcony.png',
    titleEn: 'Golden Hour Sunset Balcony Cafe',
    titleKr: '노을 빛 아파트 홈카페 베란다',
    titleJa: 'ベランダホームカフェ',
    category: 'Cozy Home / Special',
    aspectRatio: '4:3',
    src: '/cozy_home_balcony.png',
  },
  {
    id: 13,
    filename: 'showcase_modern_office.png',
    titleEn: 'Sleek Modern Executive Home Office',
    titleKr: '스마트 모던 워크스페이스 서재',
    titleJa: 'モダンエグゼクティブオフィス',
    category: 'Modern / Office',
    aspectRatio: '4:3',
    src: '/showcase_modern_office.png',
  },
  {
    id: 14,
    filename: 'showcase_gaming_room.png',
    titleEn: 'High-Tech RGB Clean Gaming Station',
    titleKr: '하이테크 미니멀 게이밍룸',
    titleJa: 'ハイテクゲーミングルーム',
    category: 'Modern / Gaming',
    aspectRatio: '4:3',
    src: '/showcase_gaming_room.png',
  },
  {
    id: 15,
    filename: 'showcase_modern_kitchen.png',
    titleEn: 'Minimalist Black & Marble Kitchen Island',
    titleKr: '모던 블랙 & 마블 아일랜드 주방',
    titleJa: 'モダンブラック＆大理石キッチン',
    category: 'Modern / Kitchen',
    aspectRatio: '4:3',
    src: '/showcase_modern_kitchen.png',
  },
  {
    id: 16,
    filename: 'showcase_modern_living.png',
    titleEn: 'Italian Minimalist Urban Apartment Lounge',
    titleKr: '모던 아크로 리빙룸',
    titleJa: 'モダンアーバンリビング',
    category: 'Modern / Living',
    aspectRatio: '4:3',
    src: '/showcase_modern_living.png',
  },
  {
    id: 17,
    filename: 'showcase_modern_closet.png',
    titleEn: 'Luxury Glass Walk-In Wardrobe',
    titleKr: '모던 글래스 드레스룸',
    titleJa: 'モダンドレスルーム',
    category: 'Modern / Closet',
    aspectRatio: '4:3',
    src: '/showcase_modern_closet.png',
  },
  {
    id: 18,
    filename: 'gallery_01_modern_living_wide.png',
    titleEn: 'Full Room Architectural Modern Luxury Living',
    titleKr: '와이드 모던 럭셔리 리빙룸 (전체 조망)',
    titleJa: '広角モダンラグジュアリーリビング（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_01_modern_living_wide_1787467045143.png',
  },
  {
    id: 19,
    filename: 'gallery_02_japandi_living_wide.png',
    titleEn: 'Wide Perspective Tranquil Japandi Living',
    titleKr: '와이드 재팬디 감성 리빙룸 (전체 조망)',
    titleJa: '広角ジャパンディリビング（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_02_japandi_living_wide_1787467061088.png',
  },
  {
    id: 20,
    filename: 'gallery_03_minimalist_living_wide.png',
    titleEn: 'Wide Monochromatic Minimalist Lounge',
    titleKr: '와이드 미니멀 모노톤 거실 (전체 조망)',
    titleJa: '広角ミニマルリビング（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_03_minimalist_living_wide_1787467081200.png',
  },
  {
    id: 21,
    filename: 'gallery_04_industrial_loft_living_wide.png',
    titleEn: 'Spacious Industrial Loft Brick Living Room',
    titleKr: '와이드 인더스트리얼 로프트 거실 (전체 조망)',
    titleJa: '広角インダストリアルロフト（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_04_industrial_loft_living_wide_1787467098855.png',
  },
  {
    id: 22,
    filename: 'gallery_05_nordic_living_wide.png',
    titleEn: 'Bright Nordic Sunlit Scandinavian Living',
    titleKr: '와이드 노르딕 북유럽 거실 (전체 조망)',
    titleJa: '広角北欧スタイルリビング（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_05_nordic_living_wide_1787467117362.png',
  },
  {
    id: 23,
    filename: 'gallery_06_midcentury_living_wide.png',
    titleEn: 'Full Perspective Mid-Century Modern Living',
    titleKr: '와이드 미드센추리 모던 거실 (전체 조망)',
    titleJa: '広角ミッドセンチュリーリビング（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_06_midcentury_living_wide_1787467133885.png',
  },
  {
    id: 24,
    filename: 'gallery_07_modern_master_bedroom_wide.png',
    titleEn: 'Full Room Modern Executive Master Bedroom',
    titleKr: '와이드 모던 마스터 침실 (전체 조망)',
    titleJa: '広角モダンマスター寝室（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_07_modern_master_bedroom_wide_1787467148091.png',
  },
  {
    id: 25,
    filename: 'gallery_08_japandi_bedroom_wide.png',
    titleEn: 'Wide Angle Wabi-Sabi Japandi Bed Suite',
    titleKr: '와이드 와비사비 재팬디 침실 (전체 조망)',
    titleJa: '広角和モダン寝室（全体全景）',
    category: 'Wide Architecture',
    aspectRatio: '16:9 Wide',
    src: '/gallery_08_japandi_bedroom_wide_1787467164852.png',
  },
];

export default function GalleryPackPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === GALLERY_PACK_ITEMS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(GALLERY_PACK_ITEMS.map((item) => item.id));
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-24 pt-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* 상단 툴바 & 헤더 */}
      <header className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-clay hover:underline mb-2"
          >
            ← 메인 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            🖼️ ReRoomAI 3D 갤러리 시안 패키지 (주방 5종 &amp; 아기방 5종 추가)
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            신규 주방 5종 &amp; 아기방 5종 옵션 포함 총{' '}
            <strong className="text-clay font-bold">{GALLERY_PACK_ITEMS.length}장</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/ReRoomAI_Gallery_Pack.zip"
            download="ReRoomAI_Gallery_Pack.zip"
            className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-bold text-paper shadow-lift hover:bg-clay-deep transition-all duration-200 hover:scale-105"
          >
            <span>📦 전체 이미지 ZIP 다운로드 (.zip)</span>
          </a>
        </div>
      </header>

      {/* 신규 주방 & 아기방 옵션 선택 안내 바 */}
      <div className="mb-8 rounded-2xl border border-clay/40 bg-clay-soft/30 p-5 backdrop-blur-sm shadow-sm">
        <h2 className="text-base font-bold text-clay-deep flex items-center gap-2">
          <span>✨</span> [신규] 주방 5종 &amp; 아기방 5종 선별 안내
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-ink-soft leading-relaxed">
          상단에 새로 정렬된 <strong>#26~#30번 (주방 옵션 5종)</strong> 및 <strong>#31~#35번 (아기방 옵션 5종)</strong> 중 마음에 드시는 시안 번호를 클릭하여 선택하신 후 알려주시면 바로 갤러리에 반영하겠습니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-line bg-paper px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-line-soft transition"
          >
            {selectedIds.length === GALLERY_PACK_ITEMS.length
              ? '선택 해제'
              : '전체 선택'}
          </button>
          <span className="text-xs text-ink-faint">
            선택된 번호 ({selectedIds.length}개):{' '}
            <strong className="text-clay font-mono">
              {selectedIds.length > 0
                ? selectedIds.map((id) => `#${String(id).padStart(2, '0')}`).join(', ')
                : '없음'}
            </strong>
          </span>
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {GALLERY_PACK_ITEMS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const numStr = `#${String(item.id).padStart(2, '0')}`;
          const isNewOption = item.id >= 26 && item.id <= 35;

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-2xl border overflow-hidden bg-paper-raised transition-all duration-300 ${
                isNewOption
                  ? 'border-amber-500/50 bg-amber-50/10 shadow-md ring-2 ring-amber-400/20'
                  : isSelected
                  ? 'border-clay ring-2 ring-clay/40 shadow-xl'
                  : 'border-line shadow-sm hover:shadow-md hover:border-line-strong'
              }`}
            >
              {/* 번호 뱃지 & 체크박스 */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black text-paper font-mono shadow backdrop-blur-md ${
                    isNewOption ? 'bg-amber-600' : 'bg-ink/80'
                  }`}
                >
                  {numStr} {isNewOption && '⭐ NEW'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                  className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? 'bg-clay border-clay text-paper shadow-md scale-110'
                      : 'bg-paper/80 border-line text-ink hover:bg-paper'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </button>
              </div>

              {/* 이미지 섬네일 */}
              <div
                onClick={() => setLightboxItem(item)}
                className="relative w-full aspect-[4/3] cursor-pointer overflow-hidden bg-ink/5"
              >
                <Image
                  src={item.src}
                  alt={item.titleKr}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="rounded-full bg-paper/90 px-3.5 py-1.5 text-xs font-bold text-ink shadow backdrop-blur-sm">
                    🔍 크게 보기
                  </span>
                </div>
              </div>

              {/* 하단 메타 정보 */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-clay mb-1">
                    <span>{item.category}</span>
                    <span className="text-ink-faint font-mono">{item.aspectRatio}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink line-clamp-1">
                    {item.titleKr}
                  </h3>
                  <p className="text-[11px] text-ink-soft line-clamp-1 mt-0.5">
                    {item.titleEn}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                  <a
                    href={item.src}
                    download={item.filename}
                    className="text-xs font-bold text-ink hover:text-clay transition flex items-center gap-1"
                  >
                    <span>↓</span> 다운로드
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`text-xs font-bold transition ${
                      isSelected ? 'text-clay font-black' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {isSelected ? '선택됨' : '선택하기'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 라이트박스 원본 크게보기 모달 */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-md p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] bg-paper rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper-raised">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black bg-clay text-paper px-3 py-1 rounded-full">
                  #{String(lightboxItem.id).padStart(2, '0')}
                </span>
                <h3 className="text-base font-bold text-ink">
                  {lightboxItem.titleKr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="h-9 w-9 rounded-full border border-line flex items-center justify-center font-bold text-ink hover:bg-line-soft"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 min-h-[400px] bg-ink/95">
              <Image
                src={lightboxItem.src}
                alt={lightboxItem.titleKr}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-paper-raised border-t border-line flex items-center justify-between">
              <span className="text-xs text-ink-soft font-mono">
                {lightboxItem.filename} ({lightboxItem.aspectRatio})
              </span>
              <a
                href={lightboxItem.src}
                download={lightboxItem.filename}
                className="rounded-full bg-ink px-5 py-2 text-xs font-bold text-paper hover:bg-clay transition"
              >
                고화질 원본 다운로드 ↓
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
