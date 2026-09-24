'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Language, SUPPORTED_LANGUAGES, translations } from '@/lib/i18n';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimFreeCredits?: () => void;
  onPurchasePlan?: (plan: PricingPlan) => void;
  onStartExperience?: () => void;
  freeCreditsCount?: number;
  lang?: Language;
  onLanguageChange?: (newLang: Language) => void;
}

export type PlanId = 'starter' | 'amateur' | 'pro';

export interface PricingPlan {
  id: PlanId;
  name: string;
  badge?: string;
  highlighted?: boolean;
  priceText: string;
  dollarPrice?: string;
  wonPrice?: string;
  periodText: string;
  creditsText: string;
  tagline: string;
  features: string[];
  lemonCheckoutUrl?: string;
}

// 📌 요금제 3종 (달러 단독 표기: 스타터 $3.99 / 아마추어 $12.99 / 프로 $19.99)
export const NEW_APP_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    badge: 'Budget',
    priceText: '$3.99',
    dollarPrice: '$3.99',
    periodText: 'One-time',
    creditsText: '30 Credits',
    tagline: 'One-time recharge for 1-2 rooms remodel',
    features: ['30 Interior Generations', 'Permanent Validity', '4K High-Res Download'],
  },
  {
    id: 'amateur',
    name: 'Amateur Pack',
    badge: 'Monthly',
    priceText: '$12.99',
    dollarPrice: '$12.99',
    periodText: '$12.99 / mo',
    creditsText: '1 Month Pass',
    tagline: 'Unlimited interior design for a whole month',
    features: ['1 Month Unlimited', 'All Premium Styles', 'Priority Ultra-Fast Rendering'],
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    badge: 'BEST VALUE',
    highlighted: true,
    priceText: '$19.99',
    dollarPrice: '$19.99',
    periodText: '$6.66 / mo',
    creditsText: '3 Months Pass',
    tagline: 'Complete moving & renovation 3-month all-pass',
    features: ['3 Months Unlimited', 'All Future Features Unlocked', 'Commercial License Included'],
    lemonCheckoutUrl: 'https://airoomdesigner.lemonsqueezy.com/checkout/buy/c69ce40f-635c-4d36-b078-0993f9c2b30d',
  },
];

export interface ShowcaseFeature {
  id: string;
  stepNum: string;
  title: string;
  subtitle: string;
  beforeImg: string;
  afterImg: string;
}

// 🎬 7대 핵심 기능 순차 비디오 스토리보드 (실제 존재하는 에셋 경로)
export const SHOWCASE_FEATURES: ShowcaseFeature[] = [
  {
    id: 'interior',
    stepNum: '01',
    title: 'Interior Redesign',
    subtitle: 'Complete stylish space transformation in 3 seconds from 1 photo',
    beforeImg: '/living_room_before.png',
    afterImg: '/living_room_after.png',
  },
  {
    id: 'layout',
    stepNum: '02',
    title: 'Spatial Layout Optimization',
    subtitle: '100% structural lock + smart furniture circulation flow',
    beforeImg: '/concept_layout_before.png',
    afterImg: '/concept_layout_after.png',
  },
  {
    id: 'replace',
    stepNum: '03',
    title: 'Furniture & Decor Swap',
    subtitle: 'Keep room structure, swap bespoke furniture & material',
    beforeImg: '/new_sofa_step0_resized.png',
    afterImg: '/sofa_hanok_exact_room_16x9.png',
  },
  {
    id: 'exterior',
    stepNum: '04',
    title: 'Architectural Exterior',
    subtitle: 'Preserve building massing + modern facade finishes & lighting',
    beforeImg: '/exterior_showcase_before.png',
    afterImg: '/exterior_showcase_after.png',
  },
  {
    id: 'garden',
    stepNum: '05',
    title: 'Garden & Patio Landscape',
    subtitle: 'Outdoor perspective lock + pool & luxury greenery staging',
    beforeImg: '/garden_showcase_before.png',
    afterImg: '/garden_showcase_after.png',
  },
  {
    id: 'cleanup',
    stepNum: '06',
    title: 'Clean Up & Declutter',
    subtitle: 'Preserve interior, erase unwanted clutter & furniture',
    beforeImg: '/cleanup_showcase_before.png',
    afterImg: '/cleanup_showcase_after.png',
  },
  {
    id: 'paint',
    stepNum: '07',
    title: 'Wall Paint & Floor Replace',
    subtitle: 'Preserve furniture + 1-Tap wallpaper, paint & flooring swap',
    beforeImg: '/wall_paint_before.png',
    afterImg: '/floor_herringbone_after.png',
  },
];

export default function PricingModal({
  isOpen,
  onClose,
  onClaimFreeCredits,
  onPurchasePlan,
  onStartExperience,
  freeCreditsCount = 2,
  lang = 'ko',
  onLanguageChange,
}: PricingModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scanPos, setScanPos] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('pro');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // 🎬 상단 영상: 1.35배 빠른 좌우 왕복 스캔 모션 (0% ➔ 100% ➔ 0%)
  useEffect(() => {
    if (!isOpen) return;

    let pos = 0;
    let phase: 'scanRight' | 'pauseRight' | 'scanLeft' | 'pauseLeft' = 'scanRight';
    let pauseTicks = 0;

    const SPEED = 1.35;
    const PAUSE_RIGHT_TICKS = 22;
    const PAUSE_LEFT_TICKS = 14;

    setScanPos(0);
    setProgressPercent(0);

    const totalTicks = Math.round((100 / SPEED) * 2 + PAUSE_RIGHT_TICKS + PAUSE_LEFT_TICKS);
    let currentTick = 0;

    const interval = setInterval(() => {
      currentTick++;
      const pct = Math.min(100, (currentTick / totalTicks) * 100);
      setProgressPercent(pct);

      if (phase === 'scanRight') {
        pos += SPEED;
        if (pos >= 100) {
          pos = 100;
          phase = 'pauseRight';
          pauseTicks = PAUSE_RIGHT_TICKS;
        }
        setScanPos(pos);
      } else if (phase === 'pauseRight') {
        pauseTicks--;
        if (pauseTicks <= 0) {
          phase = 'scanLeft';
        }
      } else if (phase === 'scanLeft') {
        pos -= SPEED;
        if (pos <= 0) {
          pos = 0;
          phase = 'pauseLeft';
          pauseTicks = PAUSE_LEFT_TICKS;
        }
        setScanPos(pos);
      } else if (phase === 'pauseLeft') {
        pauseTicks--;
        if (pauseTicks <= 0) {
          setCurrentIdx((prev) => (prev + 1) % SHOWCASE_FEATURES.length);
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [currentIdx, isOpen]);

  if (!isOpen) return null;

  const currentFeature = SHOWCASE_FEATURES[currentIdx];
  const featTrans = translations.pricing.showcaseFeatures.find((f) => f.id === currentFeature.id);
  const currentTitle = featTrans?.title[lang] || featTrans?.title['en'] || currentFeature.title;
  const currentSubtitle = featTrans?.subtitle[lang] || featTrans?.subtitle['en'] || currentFeature.subtitle;

  const currentPlan = NEW_APP_PLANS.find((p) => p.id === selectedPlanId) || NEW_APP_PLANS[2];
  const planTrans = translations.pricing.plans[currentPlan.id];
  const currentPlanName = planTrans?.name[lang] || planTrans?.name['en'] || currentPlan.name;
  const currentPlanTagline = planTrans?.tagline[lang] || planTrans?.tagline['en'] || currentPlan.tagline;

  // 무료 체험 시작 (2회 지급)
  const handleTryFree = () => {
    if (onClaimFreeCredits) onClaimFreeCredits();
    onClose();
    if (onStartExperience) onStartExperience();
  };

  // 결제 진행 (테스트 환경)
  const handleContinue = () => {
    if (onPurchasePlan) {
      onPurchasePlan(currentPlan);
    } else if (onClaimFreeCredits) {
      onClaimFreeCredits();
    }
    const alertMsg =
      lang === 'ko'
        ? `🎉 [${currentPlanName}] 테스트 결제 승인 완료!\n혜택이 성공적으로 적용되었습니다.`
        : lang === 'ja'
        ? `🎉 [${currentPlanName}] テスト決済が完了しました！\n特典が正常に適用されました。`
        : lang === 'es'
        ? `🎉 ¡Pago de prueba de [${currentPlanName}] completado!\nBeneficios aplicados con éxito.`
        : `🎉 [${currentPlanName}] Test Checkout Successful!\nBenefits have been activated.`;
    alert(alertMsg);
    onClose();
    if (onStartExperience) onStartExperience();
  };

  const handlePrevFeature = () => {
    setCurrentIdx((prev) => (prev - 1 + SHOWCASE_FEATURES.length) % SHOWCASE_FEATURES.length);
  };

  const handleNextFeature = () => {
    setCurrentIdx((prev) => (prev + 1) % SHOWCASE_FEATURES.length);
  };

  return (
    <div className="pricing-modal-root fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 text-white backdrop-blur-2xl shadow-2xl animate-fade-in sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[96vh] sm:rounded-[36px] sm:border sm:border-slate-800/80 overflow-y-auto cursor-default touch-manipulation select-none p-4 pb-5">

      {/* ─────────────────────────────────────────────────────────────
          1. 최상단 헤더 바 (모던 미니멀 스타일)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-0.5 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg sm:text-xl font-black tracking-tight text-white shrink-0 flex items-center gap-1.5">
            <span className="text-amber-400">⚡</span> RoomFit AI
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/20 truncate">
            <span>{translations.header.freeBadge[lang]}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 🌐 언어 선택 드롭다운 */}
          {onLanguageChange && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-slate-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Change Language"
              >
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.flag || '🌐'}</span>
                <span className="font-bold uppercase text-[10px]">{lang}</span>
                <span className="text-[8px] text-slate-500">▾</span>
              </button>
              {isLangDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5 min-w-[130px]">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                          lang === l.code ? 'bg-amber-500/15 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.nativeName}</span>
                        </div>
                        {lang === l.code && <span className="text-amber-400 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. [상단 영역]: 기능별 인터랙티브 비포/애프터 쇼케이스
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 my-2">
        {/* 🌟 대표님 지정: 파란색 네온 깜박임 + 오른쪽에서 왼쪽으로 흘러가는 슬로건 */}
        <div className="relative w-full overflow-hidden rounded-xl border border-sky-500/40 bg-black py-1.5 shadow-[0_0_15px_rgba(56,189,248,0.18)] select-none">
          {/* 좌우 부드러운 페이드 그라데이션 마스크 */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black to-transparent z-10" />

          {/* 오른쪽 ➔ 왼쪽으로 끊김 없이 흐르는 네온 텍스트 트랙 */}
          <div className="marquee-rtl-track flex items-center gap-12">
            {[1, 2, 3, 4].map((key) => (
              <div
                key={key}
                className="neon-blue-blink flex items-center gap-2 text-xs sm:text-sm font-black tracking-wide whitespace-nowrap"
              >
                <span className="text-sky-400 text-xs">✨</span>
                <span>
                  {lang === 'ko'
                    ? '상상이 현실이 되는 마법을 주문해보세요.'
                    : lang === 'ja'
                    ? '想像が現実になる魔法を注文してみてください。'
                    : lang === 'es'
                    ? 'Pide la magia donde la imaginación se hace realidad.'
                    : 'Order the magic where imagination becomes reality.'}
                </span>
                <span className="text-sky-400 text-xs">✨</span>
              </div>
            ))}
          </div>
        </div>

        {/* 타이틀 & 서브타이틀 */}
        <div className="flex flex-col gap-0.5 text-left px-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-400/10 px-2 py-0.5 text-[10px] sm:text-xs font-mono font-black text-amber-400 border border-amber-400/20">
              {currentFeature.stepNum} / 07
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
              {currentTitle}
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed line-clamp-1">
            {currentSubtitle}
          </p>
        </div>

        {/* 7-Segment 스토리 인디케이터 (슬릭 & 미니멀) */}
        <div className="grid grid-cols-7 gap-1 px-0.5">
          {SHOWCASE_FEATURES.map((feat, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={feat.id}
                onClick={() => setCurrentIdx(idx)}
                className="h-1 rounded-full bg-slate-800/80 overflow-hidden cursor-pointer touch-manipulation hover:bg-slate-700 transition-all"
              >
                <div
                  className={`h-full transition-all duration-100 ${
                    isCompleted
                      ? 'w-full bg-amber-400'
                      : isCurrent
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                      : 'w-0'
                  }`}
                  style={{
                    width: isCurrent ? `${progressPercent}%` : isCompleted ? '100%' : '0%',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* 실시간 스캐닝 비디오 프레임 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 shadow-xl select-none group">
          {/* 비포 원본 이미지 */}
          <Image
            src={currentFeature.beforeImg}
            alt={`${currentFeature.title} Before`}
            fill
            className="object-cover"
            priority
          />

          {/* 애프터 변환 이미지 */}
          <div
            className="absolute inset-0 z-10"
            style={{ clipPath: `inset(0 ${Math.max(0, 100 - scanPos)}% 0 0)` }}
          >
            <Image
              src={currentFeature.afterImg}
              alt={`${currentFeature.title} After`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 스캔 레이저 바 */}
          <div
            className="absolute inset-y-0 z-20 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] pointer-events-none"
            style={{ left: `${scanPos}%` }}
          >
            <div className="absolute top-2 -left-1 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
            <div className="absolute bottom-4 -left-1 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
          </div>

          {/* 좌우 수동 이동 화살표 */}
          <button
            type="button"
            onClick={handlePrevFeature}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/60 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextFeature}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/60 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            aria-label="Next"
          >
            ›
          </button>

          {/* BEFORE / AFTER 뱃지 */}
          <div className="absolute bottom-2 left-2.5 z-30 flex items-center gap-1.5 pointer-events-none">
            <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-black text-slate-300 backdrop-blur-md border border-white/10">
              {translations.pricing.before[lang]}
            </span>
            <span className="text-[10px] text-amber-400 font-bold">➔</span>
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-sm">
              {translations.pricing.after[lang]}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. [하단 영역]: 심플 & 모던 요금제 카드 (이전 상태로 복원)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
            {translations.pricing.title[lang]}
          </span>
          <span className="text-[11px] font-bold text-amber-400">
            {translations.pricing.tryBeforeBuy[lang]}
          </span>
        </div>

        {/* 3가지 요금제 카드 (이전 상태의 골드/앰버 럭셔리 스타일 복원) */}
        <div className="grid grid-cols-3 gap-2">
          {NEW_APP_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const pTrans = translations.pricing.plans[plan.id];
            const pName = pTrans?.name[lang] || pTrans?.name['en'] || plan.name;
            const pBadge = pTrans?.badge[lang] || pTrans?.badge['en'] || plan.badge;
            const pCredits = pTrans?.creditsText[lang] || pTrans?.creditsText['en'] || plan.creditsText;
            const pPeriod = pTrans?.periodText[lang] || pTrans?.periodText['en'] || plan.periodText;

            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative flex flex-col items-center justify-between rounded-2xl border p-2.5 pt-3.5 text-center transition-all duration-200 cursor-pointer touch-manipulation ${
                  isSelected
                    ? 'border-amber-400/90 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-slate-900/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50 scale-[1.02]'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700/80 hover:bg-slate-900/80 text-slate-400'
                }`}
              >
                {/* 상단 뱃지 */}
                {pBadge && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider shadow-sm ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {pBadge}
                  </span>
                )}

                {/* 플랜 이름 & 크레딧 */}
                <div className="mt-0.5 flex flex-col items-center">
                  <span className={`text-xs font-black block leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {pName}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5 leading-tight">
                    {pCredits}
                  </span>
                </div>

                {/* 가격 (선명하고 깔끔한 화이트 달러 가격) */}
                <div className="my-2 flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    {plan.dollarPrice || plan.priceText}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 whitespace-nowrap">
                    {pPeriod}
                  </span>
                </div>

                {/* 선택 상태 인디케이터 */}
                <div className="mt-0.5">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-black text-amber-300 border border-amber-400/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {lang === 'ko' ? '선택됨' : lang === 'ja' ? '選択中' : lang === 'es' ? 'Elegido' : 'Active'}
                    </span>
                  ) : (
                    <span className="inline-block h-4 text-[9px] font-medium text-slate-500">
                      {lang === 'ko' ? '선택하기' : lang === 'ja' ? '選択' : lang === 'es' ? 'Elegir' : 'Select'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택된 요금제 한 줄 혜택 (이전 상태 복원) */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-slate-200 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-400 font-bold text-sm shrink-0">✨</span>
            <span className="text-xs font-medium text-slate-200 truncate">{currentPlanTagline}</span>
          </div>
          <span className="font-black text-amber-300 shrink-0 text-sm tracking-tight bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {currentPlan.dollarPrice || currentPlan.priceText}
          </span>
        </div>

        {/* 하단 메인 결제 버튼 (블랙 버튼 + 파란색 네온 결제금액 폰트 확대) */}
        <div className="space-y-1.5 text-center mt-0.5">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-2xl bg-black border-2 border-sky-400/90 py-3.5 sm:py-4 text-white shadow-xl shadow-sky-500/25 hover:bg-slate-950 hover:border-sky-300 active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2"
          >
            <span className="text-sm sm:text-base font-black text-white">
              {translations.pricing.ctaStart[lang].replace('{name}', currentPlanName).split('(')[0].trim()}
            </span>
            <span className="neon-blue-blink text-lg sm:text-xl font-black tracking-tight">
              ({currentPlan.dollarPrice || currentPlan.priceText})
            </span>
          </button>

          <button
            type="button"
            onClick={handleTryFree}
            className="w-full py-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {translations.pricing.ctaFree[lang]}
          </button>
        </div>
      </div>

      {/* 🌟 100% 무결점 인라인 CSS (파란색 네온 깜박임 + 오른쪽 ➔ 왼쪽 마키) */}
      <style>{`
        @keyframes marquee-rtl-smooth {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes neon-blue-blink-anim {
          0%, 100% {
            color: #f0f9ff;
            text-shadow: 0 0 4px #38bdf8, 0 0 10px #0ea5e9, 0 0 20px #0284c7, 0 0 32px #0284c7;
            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.95));
            opacity: 1;
          }
          50% {
            color: #7dd3fc;
            text-shadow: 0 0 2px #38bdf8, 0 0 4px #0369a1;
            filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.35));
            opacity: 0.55;
          }
        }
        .marquee-rtl-track {
          display: flex;
          width: max-content;
          animation: marquee-rtl-smooth 15s linear infinite;
        }
        .neon-blue-blink {
          animation: neon-blue-blink-anim 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
