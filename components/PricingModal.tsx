'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
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
  priceKrw: number;
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
    wonPrice: '5,500원',
    priceKrw: 5500,
    periodText: 'One-time',
    creditsText: '30 Credits',
    tagline: 'One-time recharge for 1-2 rooms remodel',
    features: ['30 Interior Generations', '30-Day Promo Validity', '4K High-Res Download'],
  },
  {
    id: 'amateur',
    name: 'Amateur Pack',
    badge: 'Monthly',
    priceText: '$12.99',
    dollarPrice: '$12.99',
    wonPrice: '17,900원',
    priceKrw: 17900,
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
    wonPrice: '27,900원',
    priceKrw: 27900,
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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 무료 체험 시작 (10회 지급)
  const handleTryFree = () => {
    if (onClaimFreeCredits) onClaimFreeCredits();
    if (lang === 'ko') {
      alert('🎉 [오픈 기념 10회 무료 체험]이 정상 지급되었습니다!\n결제 없이 바로 원하는 인테리어를 만들어보세요.');
    }
    onClose();
    if (onStartExperience) onStartExperience();
  };

  // 실제 결제 진행 (토스페이먼츠 카드/간편결제 연동)
  const handleContinue = async () => {
    try {
      setIsProcessingPayment(true);

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJqK4WBaqkxl3OBryNqmE';
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      const orderId = `roomfit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-room-smart-designer-choi.vercel.app';

      // 토스 공식 결제창 호출 (신용카드, 카카오페이, 네이버페이, 토스페이 통합 지원)
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: currentPlan.priceKrw || 27900,
        },
        orderId,
        orderName: `RoomFit AI ${currentPlanName}`,
        successUrl: `${origin}/pricing/success?planId=${currentPlan.id}&amount=${currentPlan.priceKrw || 27900}`,
        failUrl: `${origin}/pricing/fail`,
        customerEmail: 'customer@roomfit.ai',
        customerName: 'RoomFit AI 고객',
      });
    } catch (err: any) {
      console.error('Toss Payments error:', err);
      // 사용자가 결제창을 닫은 경우(USER_CANCEL) 외의 실제 에러 시 처리
      if (err.code !== 'USER_CANCEL') {
        if (currentPlan.lemonCheckoutUrl && lang !== 'ko') {
          window.open(currentPlan.lemonCheckoutUrl, '_blank');
        } else {
          alert(lang === 'ko' ? '결제창을 여는 도중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' : 'Checkout error. Please try again.');
        }
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrevFeature = () => {
    setCurrentIdx((prev) => (prev - 1 + SHOWCASE_FEATURES.length) % SHOWCASE_FEATURES.length);
  };

  const handleNextFeature = () => {
    setCurrentIdx((prev) => (prev + 1) % SHOWCASE_FEATURES.length);
  };

  return (
    <div className="pricing-modal-root fixed inset-0 z-50 flex flex-col justify-between bg-[#0B0F17]/95 text-white backdrop-blur-2xl shadow-2xl animate-fade-in sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[96vh] sm:rounded-[36px] sm:border sm:border-white/10 overflow-y-auto cursor-default touch-manipulation select-none p-4 pb-5">

      {/* ─────────────────────────────────────────────────────────────
          1. 최상단 헤더 바 (Interio 스타일 모던 미니멀 바)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-0.5 pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white shrink-0 flex items-center gap-1.5">
            RoomFit <span className="text-rose-400 font-extrabold">AI</span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-rose-300 border border-rose-500/20 truncate">
            <span>PRO</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 🌐 언어 선택 드롭다운 */}
          {onLanguageChange && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 text-xs font-medium text-slate-300 transition-all cursor-pointer"
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
                  <div className="absolute right-0 top-full mt-1.5 z-50 flex flex-col rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5 min-w-[130px]">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                          lang === l.code ? 'bg-rose-500/15 text-rose-300 font-bold' : 'text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.nativeName}</span>
                        </div>
                        {lang === l.code && <span className="text-rose-400 text-xs">✓</span>}
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
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white active:scale-95 transition-all text-xs font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. [상단 인트로 영역]: 비포/애프터 쇼케이스 & Interio 스타일 혜택 칩
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 my-2">
        {/* 실시간 스캐닝 비디오 프레임 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl select-none group">
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
            className="absolute inset-y-0 z-20 w-[1.5px] bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none"
            style={{ left: `${scanPos}%` }}
          >
            <div className="absolute top-2 -left-1 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,1)]" />
            <div className="absolute bottom-4 -left-1 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,1)]" />
          </div>

          {/* 좌우 수동 이동 화살표 */}
          <button
            type="button"
            onClick={handlePrevFeature}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextFeature}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            aria-label="Next"
          >
            ›
          </button>

          {/* BEFORE / AFTER 뱃지 */}
          <div className="absolute bottom-2 left-2.5 z-30 flex items-center gap-1.5 pointer-events-none">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-slate-300 backdrop-blur-md border border-white/10">
              {translations.pricing.before[lang]}
            </span>
            <span className="text-[10px] text-rose-400 font-bold">➔</span>
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
              {translations.pricing.after[lang]}
            </span>
          </div>
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
                className="h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer touch-manipulation hover:bg-white/20 transition-all"
              >
                <div
                  className={`h-full transition-all duration-100 ${
                    isCompleted
                      ? 'w-full bg-rose-500'
                      : isCurrent
                      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
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

        {/* 🌟 중앙 볼드 타이틀 */}
        <div className="text-center my-1 px-1">
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {lang === 'ko'
              ? 'RoomFit AI 무제한 이용권'
              : lang === 'ja'
              ? 'RoomFit AI 無制限アクセス'
              : lang === 'es'
              ? 'Acceso Ilimitado RoomFit AI'
              : 'Unlock Unlimited Access'}
          </h1>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. [하단 요금제 영역]: Interio 스타일 프리미엄 요금제 카드
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold text-slate-300 tracking-wider">
            {translations.pricing.title[lang]}
          </span>
          <span className="text-[11px] font-semibold text-rose-400">
            {translations.pricing.tryBeforeBuy[lang]}
          </span>
        </div>

        {/* 3가지 요금제 카드 */}
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
                className={`relative flex flex-col items-center justify-between rounded-2xl p-2.5 pt-3.5 pb-3 text-center transition-all duration-200 cursor-pointer touch-manipulation ${
                  isSelected
                    ? 'border-2 border-rose-500 bg-gradient-to-b from-rose-500/15 via-rose-500/[0.04] to-transparent shadow-[0_8px_20px_rgba(244,63,94,0.18)] ring-1 ring-rose-400/30 scale-[1.02]'
                    : 'border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-slate-400'
                }`}
              >
                {/* 상단 뱃지 */}
                {pBadge && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold tracking-wider shadow-sm ${
                      plan.highlighted
                        ? 'bg-rose-500 text-white shadow-rose-500/40'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {pBadge}
                  </span>
                )}

                {/* 플랜 이름 & 크레딧 */}
                <div className="mt-0.5 flex flex-col items-center">
                  <span className={`text-xs font-bold block leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {pName}
                  </span>
                  <span className={`text-[10px] font-semibold mt-0.5 leading-tight ${isSelected ? 'text-rose-400' : 'text-slate-400'}`}>
                    {pCredits}
                  </span>
                </div>

                {/* 가격 */}
                <div className="my-2 flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    {plan.dollarPrice || plan.priceText}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 whitespace-nowrap">
                    {pPeriod}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택된 요금제 한 줄 혜택 */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-200 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-rose-400 font-bold text-sm shrink-0">✦</span>
            <span className="text-xs font-medium text-slate-300 truncate">{currentPlanTagline}</span>
          </div>
          <span className="font-bold text-rose-300 shrink-0 text-xs sm:text-sm tracking-tight bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            {currentPlan.dollarPrice || currentPlan.priceText}
          </span>
        </div>

        {/* 🎁 눈에 확 띄는 오픈 기념 10크레딧 무료 체험 배너 (클릭 시 즉시 무료 체험) */}
        <div
          onClick={handleTryFree}
          role="button"
          tabIndex={0}
          className="rounded-2xl border-2 border-amber-400/90 bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-orange-500/20 p-2.5 sm:p-3 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-2.5 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all select-none group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-md group-hover:scale-105 transition-transform">
              🎁
            </div>
            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-[13px] font-black text-amber-300 tracking-tight">
                  {lang === 'ko'
                    ? '오픈 기념 10크레딧 즉시 무료 이용'
                    : lang === 'ja'
                    ? 'オープン記念 10クレジット無料進呈'
                    : lang === 'es'
                    ? '10 Créditos Gratis de Apertura'
                    : 'Claim 10 Free Credits Now'}
                </span>
                <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[8.5px] font-black text-slate-950 leading-tight">
                  {lang === 'ko' ? '무료' : 'FREE'}
                </span>
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-semibold text-slate-200 mt-0.5 truncate">
                {lang === 'ko'
                  ? '결제 없이 지금 바로 10회 생성 체험하기'
                  : lang === 'ja'
                  ? '決済なしで今すぐ10回無料体験'
                  : lang === 'es'
                  ? 'Prueba 10 renders sin pagar'
                  : 'Try 10 renders free without payment'}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md group-hover:shadow-amber-400/50 transition-all whitespace-nowrap">
            {lang === 'ko' ? '10회 받기 ➔' : lang === 'ja' ? '無料で取得 ➔' : 'Claim ➔'}
          </span>
        </div>

        {/* 하단 메인 결제 버튼 & 무료 체험 버튼 */}
        <div className="space-y-1.5 text-center mt-0.5">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isProcessingPayment}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 hover:from-rose-600 hover:to-rose-700 py-3.5 sm:py-4 text-white font-black text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(244,63,94,0.45)] hover:shadow-[0_12px_30px_-5px_rgba(244,63,94,0.55)] active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {isProcessingPayment
                ? (lang === 'ko' ? '결제창 여는 중...' : 'Loading checkout...')
                : translations.pricing.ctaStart[lang].replace('{name}', currentPlanName).split('(')[0].trim()}
            </span>
            {!isProcessingPayment && (
              <span className="text-white/80 font-bold tracking-tight">
                ({currentPlan.dollarPrice || currentPlan.priceText})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleTryFree}
            className="w-full py-2.5 px-3 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none text-amber-300 hover:text-amber-200"
          >
            <span className="text-xs sm:text-sm font-bold">
              🎁 {translations.pricing.ctaFree[lang]}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
            <span>{lang === 'ko' ? '이용약관' : 'Terms'}</span>
            <span>•</span>
            <span>{lang === 'ko' ? '언제든 해지 가능' : 'Cancel Anytime'}</span>
            <span>•</span>
            <span>{lang === 'ko' ? '개인정보처리방침' : 'Privacy'}</span>
          </div>

          <p className="text-center text-[9px] text-slate-500 mt-0.5 leading-tight">
            {lang === 'ko'
              ? '※ 프로모션 기간 내 결제 내역은 결제일로부터 30일간 유효하며, 30일 후 잔여분은 자동 소멸됩니다.'
              : lang === 'ja'
              ? '※ プロモーション期間中の購入分は30日間有効で、30日後に残高は自動消滅します。'
              : lang === 'es'
              ? '※ Válido por 30 días a partir de la compra durante la promoción.'
              : '※ Promotional purchases are valid for 30 days from purchase date and expire thereafter.'}
          </p>
        </div>
      </div>
    </div>
  );
}
