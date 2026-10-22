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
  priceKrw?: number;
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
    wonPrice: '₩5,500',
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
    wonPrice: '₩17,900',
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
    wonPrice: '₩27,900',
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 🔗 브라우저 주소 간편 복사 핸들러
  const handleCopyUrl = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://ai-room-smart-designer-choi.vercel.app';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      console.warn('URL copy failed:', e);
    }
  };

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

  // 무료 체험 시작 (10회 지급)
  const handleTryFree = () => {
    try {
      if (onClaimFreeCredits) onClaimFreeCredits();
    } catch (e) {
      console.error('Error claiming free credits:', e);
    }
    onClose();
    if (onStartExperience) onStartExperience();
  };

  // 🍋 실제 결제 진행 (레몬스퀴지 Lemon Squeezy 글로벌 안전 결제창 연동)
  const handleContinue = () => {
    if (isProcessingPayment) return;
    try {
      setIsProcessingPayment(true);
      const checkoutUrl =
        currentPlan.lemonCheckoutUrl ||
        'https://airoomdesigner.lemonsqueezy.com/checkout/buy/c69ce40f-635c-4d36-b078-0993f9c2b30d';

      if (typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Lemon Squeezy error:', err);
      alert(lang === 'ko' ? '결제창을 여는 도중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' : 'Checkout error. Please try again.');
    } finally {
      setTimeout(() => setIsProcessingPayment(false), 800);
    }
  };

  const handlePrevFeature = () => {
    setCurrentIdx((prev) => (prev - 1 + SHOWCASE_FEATURES.length) % SHOWCASE_FEATURES.length);
  };

  const handleNextFeature = () => {
    setCurrentIdx((prev) => (prev + 1) % SHOWCASE_FEATURES.length);
  };

  return (
    <div className="pricing-modal-root fixed inset-0 z-50 flex flex-col bg-white text-slate-900 shadow-2xl animate-fade-in sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[94vh] sm:rounded-[36px] sm:border sm:border-slate-200/90 overflow-y-auto cursor-default touch-manipulation select-none">

      {/* ─────────────────────────────────────────────────────────────
          1. [상단 비주얼 영역]: 화면의 약 1/2을 채우는 전면 쇼케이스 (Edge-to-Edge)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[44vh] min-h-[290px] max-h-[380px] bg-slate-900 overflow-hidden shrink-0 select-none">
        {/* 🎬 7-Segment 스토리 인디케이터 (상단 얇은 바) */}
        <div className="absolute top-2 inset-x-3 z-30 grid grid-cols-7 gap-1 pointer-events-none">
          {SHOWCASE_FEATURES.map((feat, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={feat.id}
                className="h-1 rounded-full bg-white/25 overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-100 ${
                    isCompleted
                      ? 'w-full bg-white'
                      : isCurrent
                      ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]'
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

        {/* 🔝 이미지 위 플로팅 상단 바: 좌측 닫기(✕), 우측 주소복사 및 언어선택 */}
        <div className="absolute top-4 inset-x-3 z-30 flex items-center justify-between pointer-events-auto">
          {/* 좌측 닫기 버튼 (원형 다크 글래스) */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white transition-all text-xs font-bold cursor-pointer shadow-md"
            aria-label="Close"
          >
            ✕
          </button>

          {/* 우측 버튼 그룹 */}
          <div className="flex items-center gap-1.5">
            {/* 🔗 주소 복사 버튼 */}
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
              title="웹 브라우저 주소 복사"
            >
              <span className="text-xs">{copyFeedback ? '✓' : '🔗'}</span>
              <span className="text-[10px] font-bold">
                {copyFeedback ? (lang === 'ko' ? '복사됨!' : 'Copied!') : (lang === 'ko' ? '주소복사' : 'Copy URL')}
              </span>
            </button>

            {/* 🌐 언어 선택 드롭다운 */}
            {onLanguageChange && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
                  title="Change Language"
                >
                  <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.flag || '🌐'}</span>
                  <span className="font-bold uppercase text-[10px]">{lang}</span>
                  <span className="text-[8px] text-white/70">▾</span>
                </button>
                {isLangDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsLangDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 z-50 flex flex-col rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl p-1.5 min-w-[130px]">
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            onLanguageChange(l.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                            lang === l.code ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{l.flag}</span>
                            <span>{l.nativeName}</span>
                          </div>
                          {lang === l.code && <span className="text-rose-600 text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🖼️ 비포 원본 이미지 */}
        <Image
          src={currentFeature.beforeImg}
          alt={`${currentFeature.title} Before`}
          fill
          className="object-cover object-center"
          priority
        />

        {/* 🖼️ 애프터 변환 이미지 (스캔 와이프) */}
        <div
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 ${Math.max(0, 100 - scanPos)}% 0 0)` }}
        >
          <Image
            src={currentFeature.afterImg}
            alt={`${currentFeature.title} After`}
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* ⚡ 스캔 레이저 바 & 중앙 ◀ ▶ 조절 핸들 (참조 이미지와 동일) */}
        <div
          className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] pointer-events-none"
          style={{ left: `${scanPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 h-7 w-7 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center text-[10px] font-black pointer-events-none select-none tracking-tighter border border-slate-200">
            ◀▶
          </div>
        </div>

        {/* 🏷️ Before 뱃지 (참조 이미지 하단 중앙 뱃지 스타일) */}
        <span className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/55 backdrop-blur-md px-3.5 py-1 text-[11px] font-black text-white pointer-events-none shadow-md">
          {translations.pricing.before[lang]}
        </span>

        {/* 좌우 이동 화살표 */}
        <button
          type="button"
          onClick={handlePrevFeature}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 active:scale-95 transition-all text-sm font-bold cursor-pointer"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={handleNextFeature}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 active:scale-95 transition-all text-sm font-bold cursor-pointer"
          aria-label="Next"
        >
          ›
        </button>

        {/* 하단 소프트 화이트 페이드 그라데이션 (화이트 배경으로 자연스러운 전환) */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. [하단 화이트 영역]: 타이틀 + 혜택 칩 + 가로배치 요금제 + 결제 버튼
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 -mt-5 flex-1 flex flex-col justify-between px-4 pb-4 pt-1 bg-white space-y-3">
        {/* 헤드라인 타이틀 (참조 이미지: Unlock Unlimited Access) */}
        <div className="text-center pt-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'ko'
              ? '무제한 인테리어 AI 이용권'
              : lang === 'ja'
              ? '無制限インテリアAIアクセス'
              : lang === 'es'
              ? 'Acceso Ilimitado Interior AI'
              : 'Unlock Unlimited Access'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            {currentFeature.stepNum}/07 {currentTitle} · {currentSubtitle}
          </p>
        </div>

        {/* 혜택 칩 (참조 이미지: Faster Outcomes, No Ads 등 가로 칩 배치) */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 shadow-2xs">
            <span className="text-[#ff2d55] text-xs font-bold">⚡</span>
            <span className="text-xs font-bold text-slate-800">
              {lang === 'ko' ? '빠른 AI 렌더링' : 'Faster Outcomes'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 shadow-2xs">
            <span className="text-[#ff2d55] text-xs font-bold">🔒</span>
            <span className="text-xs font-bold text-slate-800">
              {lang === 'ko' ? '광고 없는 무제한' : 'No Ads'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 shadow-2xs">
            <span className="text-[#ff2d55] text-xs font-bold">💎</span>
            <span className="text-xs font-bold text-slate-800">
              {lang === 'ko' ? '4K 초고화질' : 'Ultra 4K HD'}
            </span>
          </div>
        </div>

        {/* 💳 요금제 가로배치 (참조 이미지 스타일: 가로 와이드 카드 스택) */}
        <div className="flex flex-col gap-2.5">
          {NEW_APP_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const pTrans = translations.pricing.plans[plan.id];
            const pName = pTrans?.name[lang] || pTrans?.name['en'] || plan.name;
            const pCredits = pTrans?.creditsText[lang] || pTrans?.creditsText['en'] || plan.creditsText;
            const isPro = plan.id === 'pro';

            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative w-full rounded-2xl p-3 sm:p-3.5 text-left transition-all duration-200 cursor-pointer touch-manipulation flex items-center justify-between ${
                  isSelected
                    ? 'border-2 border-[#ff2d55] bg-rose-50/30 shadow-md ring-1 ring-[#ff2d55]/20'
                    : 'border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                {/* BEST OFFER 뱃지 (프로 팩 상단 우측에 부착, 참조 이미지와 100% 동일) */}
                {isPro && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-[#ff2d55] px-2.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm tracking-wider">
                    BEST OFFER
                  </span>
                )}

                {/* 좌측: 주기 설명 및 플랜명 & 크레딧 */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[11px] font-medium text-slate-500 leading-tight">
                    {plan.id === 'starter'
                      ? (lang === 'ko' ? '1회 충전 · 30 크레딧' : 'Billed Once · 30 Credits')
                      : plan.id === 'amateur'
                      ? (lang === 'ko' ? '월간 결제 · 1개월 무제한' : 'Billed Monthly · 1 Month Pass')
                      : (lang === 'ko' ? '3개월 일괄 결제 · 3개월 무제한' : 'Billed 3-Months · 3 Months Pass')}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                      {pName}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ({pCredits})
                    </span>
                  </div>
                </div>

                {/* 우측: 가격 */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-none">
                    {plan.dollarPrice || plan.priceText}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                    {plan.id === 'starter'
                      ? (lang === 'ko' ? '1회 충전' : 'One-time')
                      : plan.id === 'amateur'
                      ? (lang === 'ko' ? '/ 월' : '/ Month')
                      : (lang === 'ko' ? '월 $6.66 상당' : '$6.66 / mo')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 🎁 구글 플레이 출시 기념 10크레딧 무료 증정 배너 */}
        <button
          type="button"
          onClick={handleTryFree}
          className="w-full flex items-center justify-between p-2.5 px-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-left hover:bg-amber-100/60 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">🎁</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-amber-950 truncate">
                {lang === 'ko' ? 'Google Play 출시 기념 10크레딧 무료 증정' : 'Google Play Launch 10 Free Credits'}
              </span>
              <span className="text-[9.5px] font-semibold text-amber-800 truncate">
                {lang === 'ko' ? '10월 31일까지 누구나 10회 무료 체험 가능!' : '10 free trials for everyone until Oct 31!'}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm whitespace-nowrap">
            {lang === 'ko' ? '지금 10회 받기 ➔' : 'Claim 10 ➔'}
          </span>
        </button>

        {/* 메인 액션 버튼 (참조 이미지의 Continue 버튼: 밝은 코랄 레드 풀와이드 버튼) */}
        <div className="space-y-1.5 text-center pt-0.5">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isProcessingPayment}
            className="w-full rounded-2xl bg-[#ff2d55] hover:bg-[#e02449] py-3.5 sm:py-4 text-white shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed font-black text-base sm:text-lg tracking-tight"
          >
            {isProcessingPayment ? (
              <span className="flex items-center gap-2 text-sm font-black text-white">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {lang === 'ko' ? '결제창 여는 중...' : 'Loading checkout...'}
              </span>
            ) : (
              <span>
                {lang === 'ko'
                  ? `계속하기 (${currentPlan.dollarPrice || currentPlan.priceText})`
                  : `Continue (${currentPlan.dollarPrice || currentPlan.priceText})`}
              </span>
            )}
          </button>

          {/* 결제 파트너 보안 안내 뱃지 */}
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-slate-500 pt-0.5">
            <span>🔒</span>
            <span>
              {lang === 'ko'
                ? '신용카드 · Apple Pay · Google Pay 지원 (Lemon Squeezy 안전 결제)'
                : 'Credit Card · Apple Pay · Google Pay (Lemon Squeezy)'}
            </span>
          </div>

          {/* 푸터 이용약관 및 자동갱신 안내 링크 (참조 이미지 하단과 동일) */}
          <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-slate-400 pt-1">
            <a href="/terms" target="_blank" className="hover:text-slate-600 underline underline-offset-2">
              {lang === 'ko' ? '이용약관' : 'Terms'}
            </a>
            <span>•</span>
            <span>{lang === 'ko' ? '언제든 해지 가능' : 'Auto Renewal, Cancel Anytime'}</span>
            <span>•</span>
            <a href="/privacy" target="_blank" className="hover:text-slate-600 underline underline-offset-2">
              {lang === 'ko' ? '개인정보처리방침' : 'Privacy'}
            </a>
          </div>

          <p className="text-center text-[9px] text-slate-400 mt-0.5 leading-tight">
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
