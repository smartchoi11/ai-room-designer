'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import { Language } from '@/lib/dictionary';

interface ShowcaseItem {
  id: string;
  titleEn: string;
  titleKr: string;
  titleJa: string;
  styleEn: string;
  styleKr: string;
  styleJa: string;
  image: string;
  styleId: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: '1',
    titleEn: 'Serene Japandi Living Room',
    titleKr: '평온한 재팬디 리빙룸',
    titleJa: '和モダンの静けさ漂うリビング',
    styleEn: 'Japandi Balance',
    styleKr: '재팬디 스타일',
    styleJa: 'ジャパンディ',
    image: '/living_room_after.png',
    styleId: 'japandi',
  },
  {
    id: '2',
    titleEn: 'Penthouse Hotel Lounge',
    titleKr: '펜트하우스 호텔 럭셔리 라운지',
    titleJa: '高級ペントハウスホテルのラウンジ',
    styleEn: 'Hotel Luxury',
    styleKr: '호텔 럭셔리',
    styleJa: 'ホテルラグジュアリー',
    image: '/living_room_luxury.png',
    styleId: 'hotel_lounge',
  },
  {
    id: '4',
    titleEn: 'Warm Minimalist Bedroom',
    titleKr: '은은한 베이지 모던 침실',
    titleJa: '温かみのあるモダンミニマル寝室',
    styleEn: 'Modern Minimal',
    styleKr: '모던 미니멀',
    styleJa: 'モダンミニマル',
    image: '/showcase_bedroom.png',
    styleId: 'japandi',
  },
  {
    id: '5',
    titleEn: 'Nordic Open Timber Kitchen',
    titleKr: '노르딕 우드 & 마블 아일랜드 주방',
    titleJa: '北欧調オープンアイランドキッチン',
    styleEn: 'Scandinavian',
    styleKr: '북유럽 스타일',
    styleJa: '北欧スタイル',
    image: '/showcase_kitchen.png',
    styleId: 'japandi',
  },
  {
    id: '7',
    titleEn: 'Industrial Brick Loft Workspace',
    titleKr: '빈티지 레더 인더스트리얼 서재',
    titleJa: 'インダストリアルロフトワークスペース',
    styleEn: 'Industrial Loft',
    styleKr: '인더스트리얼',
    styleJa: 'インダストリアル',
    image: '/showcase_office.png',
    styleId: 'industrial',
  },
  {
    id: '8',
    titleEn: 'Cozy Sunlit Living Room',
    titleKr: '따뜻한 햇살이 머무는 거실',
    titleJa: '陽光が差し込むアットホームなリビング',
    styleEn: 'Cozy Residential',
    styleKr: '아늑한 가정집',
    styleJa: 'アットホーム',
    image: '/cozy_home_living.png',
    styleId: 'japandi',
  },
  {
    id: '9',
    titleEn: 'Relaxing Warm Master Bedroom',
    titleKr: '포근한 원목 안방 침실',
    titleJa: 'リラックスできる温かみのある主寝室',
    styleEn: 'Cozy Residential',
    styleKr: '아늑한 가정집',
    styleJa: 'アットホーム',
    image: '/cozy_home_bedroom.png',
    styleId: 'japandi',
  },
  {
    id: '10',
    titleEn: 'Scandi Oak Family Dining Room',
    titleKr: '정갈한 우드 감성 다이닝룸',
    titleJa: '木の温もり感じるファミリーダイニング',
    styleEn: 'Cozy Residential',
    styleKr: '아늑한 가정집',
    styleJa: 'アットホーム',
    image: '/cozy_home_dining.png',
    styleId: 'japandi',
  },
  {
    id: '11',
    titleEn: 'Pastel Organised Kids Playroom',
    titleKr: '깔끔하게 정리된 파스텔 아이방',
    titleJa: 'きれいに整頓された子供部屋',
    styleEn: 'Cozy Residential',
    styleKr: '아늑한 가정집',
    styleJa: 'アットホーム',
    image: '/cozy_home_kids.png',
    styleId: 'minimalist',
  },
  {
    id: '13',
    titleEn: 'Sleek Modern Executive Office',
    titleKr: '스마트 모던 워크스페이스 오피스',
    titleJa: '洗練されたモダンエグゼクティブオフィス',
    styleEn: 'Modern Office',
    styleKr: '모던 오피스',
    styleJa: 'モダンオフィス',
    image: '/showcase_modern_office.png',
    styleId: 'minimalist',
  },
  {
    id: '15',
    titleEn: 'Minimalist Black & Marble Kitchen',
    titleKr: '모던 블랙 & 마블 아일랜드 주방',
    titleJa: 'モダンブラック＆大理石アイランドキッチン',
    styleEn: 'Modern Kitchen',
    styleKr: '모던 주방',
    styleJa: 'モダンキッチン',
    image: '/showcase_modern_kitchen.png',
    styleId: 'modern',
  },
  {
    id: '16',
    titleEn: 'Italian Minimalist Urban Lounge',
    titleKr: '모던 아크로 리빙룸',
    titleJa: '洗練されたモダンアーバンリビング',
    styleEn: 'Modern Minimal',
    styleKr: '모던 미니멀',
    styleJa: 'モダンミニマル',
    image: '/showcase_modern_living.png',
    styleId: 'minimalist',
  },
  {
    id: '17',
    titleEn: 'Luxury Glass Walk-In Wardrobe',
    titleKr: '모던 글래스 파우더 & 드레스룸',
    titleJa: 'モダンガラスウォークインクローゼット',
    styleEn: 'Modern Closet',
    styleKr: '모던 드레스룸',
    styleJa: 'モダンドレスルーム',
    image: '/showcase_modern_closet.png',
    styleId: 'hotel_lounge',
  },
  {
    id: '18',
    titleEn: 'Full Room Modern Luxury Living',
    titleKr: '와이드 모던 럭셔리 리빙룸 (전체 조망)',
    titleJa: '広角モダンラグジュアリーリビング（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_01_modern_living_wide_1787467045143.png',
    styleId: 'hotel_lounge',
  },
  {
    id: '19',
    titleEn: 'Wide Perspective Japandi Living',
    titleKr: '와이드 재팬디 감성 리빙룸 (전체 조망)',
    titleJa: '広角ジャパンディリビング（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_02_japandi_living_wide_1787467061088.png',
    styleId: 'japandi',
  },
  {
    id: '20',
    titleEn: 'Wide Monochromatic Minimalist Lounge',
    titleKr: '와이드 미니멀 모노톤 거실 (전체 조망)',
    titleJa: '広角ミニマルリビング（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_03_minimalist_living_wide_1787467081200.png',
    styleId: 'minimalist',
  },
  {
    id: '22',
    titleEn: 'Bright Nordic Scandinavian Living',
    titleKr: '와이드 노르딕 북유럽 거실 (전체 조망)',
    titleJa: '広角北欧スタイルリビング（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_05_nordic_living_wide_1787467117362.png',
    styleId: 'japandi',
  },
  {
    id: '23',
    titleEn: 'Mid-Century Modern Full Room',
    titleKr: '와이드 미드센추리 모던 거실 (전체 조망)',
    titleJa: '広角ミッドセンチュリーリビング（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_06_midcentury_living_wide_1787467133885.png',
    styleId: 'modern',
  },
  {
    id: '25',
    titleEn: 'Wide Wabi-Sabi Japandi Bed Suite',
    titleKr: '와이드 와비사비 재팬디 침실 (전체 조망)',
    titleJa: '広角和モダン寝室（全体全景）',
    styleEn: 'Wide Architecture',
    styleKr: '와이드 조망',
    styleJa: '広角全景',
    image: '/gallery_08_japandi_bedroom_wide_1787467164852.png',
    styleId: 'japandi',
  },
  {
    id: '27',
    titleEn: 'Matte Black & Brass Modern Kitchen',
    titleKr: '매트 블랙 & 브라스 포인트 모던 주방',
    titleJa: 'マットブラック＆ブラスモダンキッチン',
    styleEn: 'Modern Kitchen',
    styleKr: '모던 주방',
    styleJa: 'モダンキッチン',
    image: '/kitchen_option_02.png',
    styleId: 'modern',
  },
  {
    id: '28',
    titleEn: 'Walnut & Terrazzo Farmhouse Kitchen',
    titleKr: '월넛 우드 & 테라조 모던 팜하우스 주방',
    titleJa: 'ウォールナット＆テラゾーキッチン',
    styleEn: 'Modern Farmhouse',
    styleKr: '우드 팜하우스',
    styleJa: 'ファームハウス',
    image: '/kitchen_option_03.png',
    styleId: 'japandi',
  },
  {
    id: '31',
    titleEn: 'Cozy Pastel Cream Nursery',
    titleKr: '포근한 파스텔 크림 & 원목 아기방',
    titleJa: 'パステルクリームベビールーム',
    styleEn: 'Nursery / Kids',
    styleKr: '아기방 / 자녀방',
    styleJa: 'ベビールーム',
    image: '/baby_room_01.png',
    styleId: 'minimalist',
  },
  {
    id: '32',
    titleEn: 'Nordic Sage & Birch Wooden Nursery',
    titleKr: '노르딕 세이지 그린 & 내추럴 우드 자녀방',
    titleJa: '北欧セージグリーン子供部屋',
    styleEn: 'Nursery / Kids',
    styleKr: '아기방 / 자녀방',
    styleJa: 'ベビールーム',
    image: '/baby_room_02.png',
    styleId: 'japandi',
  },
  {
    id: '33',
    titleEn: 'Dusty Blue Scandi Nursery',
    titleKr: '더스티 블루 & 오크 원목 스칸디 아기방',
    titleJa: 'ダスティブルーベビールーム',
    styleEn: 'Nursery / Kids',
    styleKr: '아기방 / 자녀방',
    styleJa: 'ベビールーム',
    image: '/baby_room_03.png',
    styleId: 'japandi',
  },
  {
    id: '34',
    titleEn: 'Monotone Grey Minimalist Playroom',
    titleKr: '모노톤 그레이 & 애쉬 우드 미니멀 놀이방',
    titleJa: 'モノトーングレーミニマル子供部屋',
    styleEn: 'Nursery / Kids',
    styleKr: '아기방 / 자녀방',
    styleJa: 'ベビールーム',
    image: '/baby_room_04.png',
    styleId: 'minimalist',
  },
  {
    id: '35',
    titleEn: 'Peach Blush & Gold Luxury Nursery',
    titleKr: '피치 블러시 & 골드 포인트 럭셔리 아기방',
    titleJa: 'ピーチブラッシュラグジュアリー子供部屋',
    styleEn: 'Nursery / Kids',
    styleKr: '아기방 / 자녀방',
    styleJa: 'ベビールーム',
    image: '/baby_room_05.png',
    styleId: 'hotel_lounge',
  },
];

export default function ShowcaseCarousel() {
  const [lang, setLang] = useState<Language>('kr');
  const [activeIndex, setActiveIndex] = useState(2); // 시작 시 중앙에 강조할 카드 인덱스
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const touchStartX = useRef(0);

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  // 자동 슬라이드 (사용자 조작 없을 시 4초 간격)
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev === 0 ? SHOWCASE_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  };

  const pickStyle = (styleId: string) => {
    const studioEl = document.getElementById('studio');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('reroom:style', { detail: styleId }));
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-paper-raised py-16 md:py-24 border-y border-line">
      {/* 배경 글로우 헤일로 */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[800px] rounded-full bg-clay-soft/40 opacity-50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay">
            {lang === 'en'
              ? 'AI CREATIONS GALLERY'
              : lang === 'ja'
              ? 'AIデザインギャラリー'
              : 'AI 3D 시안 갤러리'}
          </p>
          <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
            {lang === 'en' ? (
              <>
                Rooms that <span className="text-clay">ReRoomAI</span> created
              </>
            ) : lang === 'ja' ? (
              <>
                <span className="text-clay">ReRoomAI</span>が創り出した理想の空間
              </>
            ) : (
              <>
                <span className="text-clay">ReRoomAI</span>가 탄생시킨 공간 시안
              </>
            )}
          </h2>
          <p className="mt-3 text-sm text-ink-soft md:text-base max-w-xl mx-auto">
            {lang === 'en'
              ? 'Explore actual interior transformation concepts rendered in seconds by ReRoomAI.'
              : lang === 'ja'
              ? 'ReRoomAIが数秒でレンダリングした実際のインテリア空間の変革デザインをご覧ください。'
              : 'ReRoomAI가 수초 만에 생성한 실제 인테리어 공간 변환 시안들을 감상해보세요.'}
          </p>
        </Reveal>

        {/* ── 필름스립 카루셀 (RoomGPT 스타일 센터 포커스 롤러) ── */}
        <Reveal delay={100} className="mt-12">
          <div
            className="relative flex items-center justify-center min-h-[340px] sm:min-h-[420px]"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const deltaX = e.changedTouches[0].clientX - touchStartX.current;
              if (deltaX > 40) handlePrev();
              else if (deltaX < -40) handleNext();
            }}
          >
            {/* 좌/우 탐색 화살표 버튼 */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-line bg-paper/90 text-ink shadow-lift backdrop-blur-md transition-all hover:scale-110 hover:bg-clay hover:text-paper hover:border-clay"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 sm:right-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-line bg-paper/90 text-ink shadow-lift backdrop-blur-md transition-all hover:scale-110 hover:bg-clay hover:text-paper hover:border-clay"
            >
              →
            </button>

            {/* 카드 롤러 컨테이너 (100% 무한 순환 & 중앙 고정 3D 포커스) */}
            <div className="relative w-full overflow-hidden px-4 py-10 min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
              {SHOWCASE_ITEMS.map((item, idx) => {
                const total = SHOWCASE_ITEMS.length;
                let offset = idx - activeIndex;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const absOffset = Math.abs(offset);
                const isCenter = offset === 0;
                const isVisible = absOffset <= 2;

                if (!isVisible) return null;

                const title = lang === 'en' ? item.titleEn : lang === 'ja' ? item.titleJa : item.titleKr;
                const styleName = lang === 'en' ? item.styleEn : lang === 'ja' ? item.styleJa : item.styleKr;

                // 3D 트랜스폼 계산 (중앙 100% 고정 & 원근감)
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isCenter) {
                        pickStyle(item.styleId);
                      } else {
                        setIsAutoPlay(false);
                        setActiveIndex(idx);
                      }
                    }}
                    style={{
                      transform: `translateX(${offset * 360}px) scale(${isCenter ? 1.05 : absOffset === 1 ? 0.86 : 0.7})`,
                      zIndex: isCenter ? 30 : 20 - absOffset * 10,
                      opacity: isCenter ? 1 : absOffset === 1 ? 0.75 : 0.35,
                    }}
                    className={`absolute group cursor-pointer transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden border ${
                      isCenter
                        ? 'w-[280px] sm:w-[420px] md:w-[460px] aspect-[4/3] border-clay/60 shadow-2xl ring-4 ring-clay/20'
                        : absOffset === 1
                        ? 'w-[260px] sm:w-[380px] aspect-[4/3] border-line shadow-md hover:opacity-95'
                        : 'w-[220px] sm:w-[320px] aspect-[4/3] border-line blur-[0.5px]'
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 300px, 500px"
                      className="object-cover transform-gpu transition-transform duration-1000 ease-out group-hover:scale-105"
                      priority={isCenter}
                    />

                    {/* 카드 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/95" />

                    {/* 카테고리 태그 및 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-paper transition-all duration-500">
                      <span className="inline-block rounded-full bg-clay/90 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-paper backdrop-blur-md shadow-sm">
                        {styleName}
                      </span>
                      <h3 className="mt-2 text-sm sm:text-xl font-bold text-paper line-clamp-1 group-hover:text-amber-200 transition-colors duration-300">
                        {title}
                      </h3>
                      {isCenter && (
                        <p className="mt-1.5 text-[11px] sm:text-xs text-paper/85 flex items-center gap-1 font-medium animate-fadeIn">
                          <span>✨</span>
                          {lang === 'en'
                            ? 'Click to design room in this style →'
                            : lang === 'ja'
                            ? 'このスタイルでデザインを作成 →'
                            : '이 스타일로 인테리어 디자인 시작하기 →'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 슬라이드 도트 인디케이터 */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap px-4 max-w-2xl mx-auto">
            {SHOWCASE_ITEMS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsAutoPlay(false);
                  setActiveIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  idx === activeIndex
                    ? 'w-8 bg-clay shadow-sm'
                    : 'w-2 bg-line-strong hover:bg-ink-soft opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
