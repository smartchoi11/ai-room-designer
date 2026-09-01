'use client';

import { useState, useEffect } from 'react';
import CompareSlider from './CompareSlider';
import Reveal from './Reveal';
import { DICTIONARY, Language } from '@/lib/dictionary';

const SHOWCASE_PRESETS = [
  {
    id: 'sage_paint',
    labelEn: '🎨 Sage Green Paint',
    labelKr: '🎨 세이지 그린 벽지·페인트',
    labelJa: '🎨 セージグリーン壁紙・ペイント',
    beforeSrc: '/wall_paint_before.png',
    afterSrc: '/wall_paint_sage_after.png',
    tagEn: 'Wall Paint Edit (Furniture 100% Preserved)',
    tagKr: '가구·인테리어 유지 + 세이지 그린 벽지',
    tagJa: '家具・レイアウト維持＋セ이지グリーン壁紙',
  },
  {
    id: 'herringbone_floor',
    labelEn: '🧱 Terracotta & Herringbone',
    labelKr: '🧱 테라코타 벽 + 헤링본 바닥',
    labelJa: '🧱 テラコッタ壁＋ヘリンボーン床',
    beforeSrc: '/wall_paint_before.png',
    afterSrc: '/floor_herringbone_after.png',
    tagEn: 'Wall Paint & Hardwood Flooring Edit',
    tagKr: '가구·인테리어 유지 + 테라코타 벽 & 헤링본 바닥재',
    tagJa: '家具・レイアウト維持＋テラコッタ壁＆ヘリンボーン床',
  },
  {
    id: 'japandi',
    labelEn: '🌿 Japandi Style',
    labelKr: '🌿 재팬디 풀 스타일링',
    labelJa: '🌿 ジャパンディスタイリング',
    beforeSrc: '/living_room_before.png',
    afterSrc: '/living_room_after.png',
    tagEn: 'Full Room Interior Transformation',
    tagKr: '전체 공간 스타일 변환',
    tagJa: '空間全体のスタイル変革',
  },
];

export default function Hero() {
  const [lang, setLang] = useState<Language>('kr');
  const [activePresetId, setActivePresetId] = useState('japandi');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].hero;
  const currentPreset = SHOWCASE_PRESETS.find((p) => p.id === activePresetId) || SHOWCASE_PRESETS[0];

  return (
    <section id="top" className="relative w-full overflow-hidden bg-paper pt-12 pb-20 md:pt-20 md:pb-28">
      {/* 3초 시선 강탈용 배경 글로우 그래디언트 오라 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-clay-soft via-amber-200/40 to-clay-soft/20 opacity-70 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
          {/* 상단 뱃지 & 실시간 평점 리드 */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-clay/30 bg-paper-raised/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-clay-deep shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
              </span>
              {t.badge}
            </span>
            <span className="rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-xs font-semibold text-ink-soft">
              ⭐ 4.9/5 (50,000+ Rooms Transformed)
            </span>
          </div>

          {/* 메인 매혹적인 타이틀 */}
          <h1 className="font-display max-w-4xl text-4xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-[64px]">
            {t.titleLine1}
            <br />
            <span className="bg-gradient-to-r from-clay via-amber-700 to-clay-deep bg-clip-text text-transparent">
              {t.titleLine2}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg md:text-xl">
            {t.subtitle}
          </p>

          {/* 돋보이는 CTA 액션 버튼 */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#studio"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-ink px-8 py-4 text-sm sm:text-base font-bold text-paper shadow-lift transition-all duration-300 hover:scale-[1.03] hover:bg-clay hover:shadow-2xl"
            >
              <span>{t.ctaPrimary}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#styles"
              className="rounded-full border border-line-strong bg-paper-raised/90 backdrop-blur-sm px-7 py-4 text-sm sm:text-base font-semibold text-ink transition-all duration-300 hover:border-ink hover:bg-paper"
            >
              {t.ctaSecondary}
            </a>
          </div>

          {/* 주요 실시간 통계 하이라이트 */}
          <dl className="mt-12 flex flex-wrap justify-center items-center divide-x divide-line rounded-2xl border border-line bg-paper-raised/60 backdrop-blur-sm py-4 px-2 shadow-sm">
            {t.stats.map((stat) => (
              <div key={stat.label} className="px-6 sm:px-10 py-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-xl sm:text-2xl font-black tracking-tight text-ink">
                  {stat.value}
                </dd>
                <dd className="mt-0.5 text-[11px] font-medium tracking-wide text-ink-soft">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* ── 3초 시선 강탈: 실시간 인터랙티브 비포/애프터 쇼케이스 ── */}
        <Reveal delay={120} className="mt-8 sm:mt-14 w-full max-w-4xl">
          <div className="rounded-2xl sm:rounded-3xl border border-line bg-paper-raised p-2.5 sm:p-6 shadow-2xl backdrop-blur-md">
            {/* 스타일 변경 프리셋 탭 버튼 */}
            <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 sm:pb-4">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-ink">
                <span className="flex h-2 w-2 rounded-full bg-clay animate-pulse" />
                <span>
                  {lang === 'en'
                    ? 'Live Style Demo:'
                    : lang === 'ja'
                    ? 'リアルタイム変革デモ:'
                    : '실시간 비포/애프터 시연:'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {SHOWCASE_PRESETS.map((preset) => {
                  const label =
                    lang === 'en'
                      ? preset.labelEn
                      : lang === 'ja'
                      ? preset.labelJa
                      : preset.labelKr;
                  const isActive = preset.id === activePresetId;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePresetId(preset.id)}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] sm:px-3.5 sm:py-1.5 sm:text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-clay text-paper shadow-sm'
                          : 'bg-paper text-ink-soft hover:bg-line-soft hover:text-ink'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 비교 슬라이더 본체 */}
            <div className="relative overflow-hidden rounded-2xl border border-line shadow-inner">
              <CompareSlider
                key={currentPreset.id}
                beforeSrc={currentPreset.beforeSrc}
                afterSrc={currentPreset.afterSrc}
                beforeAlt="Original Room Before AI Redesign"
                afterAlt={`Redesigned Room in ${currentPreset.id}`}
                priority
              />

              {/* 하단 오버레이 안내 바 */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-xl bg-ink/75 backdrop-blur-md px-3.5 py-2 text-xs text-paper shadow-lg">
                <span className="font-semibold text-paper/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> BEFORE
                </span>
                <span className="text-[11px] font-bold tracking-wide text-clay-soft flex items-center gap-1">
                  <span>↔</span>{' '}
                  {lang === 'en'
                    ? 'Drag slider handle left / right'
                    : lang === 'ja'
                    ? 'スライダーをドラッグ'
                    : '핸들을 좌우로 드래그하세요'}
                </span>
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  ✨ AFTER (
                  {lang === 'en'
                    ? currentPreset.tagEn
                    : lang === 'ja'
                    ? currentPreset.tagJa
                    : currentPreset.tagKr}
                  )
                </span>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-ink-faint">
              {lang === 'en'
                ? '💡 Click preset buttons above to preview different interior styles instantly!'
                : lang === 'ja'
                ? '💡 上のスタイルボタンをクリックして、様々なインテリアデザインを体感してください！'
                : '💡 상단 스타일 버튼을 클릭하면 다양한 인테리어 디자인 변환을 즉시 비교할 수 있습니다!'}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
