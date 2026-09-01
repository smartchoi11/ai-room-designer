'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimFreeCredits?: () => void;
  onStartExperience?: () => void;
  freeCreditsCount?: number;
}

export type PlanId = 'starter' | 'amateur' | 'pro';

export interface PricingPlan {
  id: PlanId;
  name: string;
  badge?: string;
  highlighted?: boolean;
  priceText: string;
  periodText: string;
  creditsText: string;
  tagline: string;
  features: string[];
  lemonCheckoutUrl?: string;
}

// 📌 요금제 3종 (스타터 $3.99 / 아마추어 1개월 $14.99 / 프로 1년 45,000원)
export const NEW_APP_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: '스타터 팩',
    badge: '알뜰 팩',
    priceText: '₩4,900',
    periodText: '($3.99 / 1회)',
    creditsText: '30 크레딧 충전',
    tagline: '1~2개 방 리모델링용 1회성 충전',
    features: ['30회 인테리어 생성', '유효기간 없음 (영구)', '4K 고화질 원본 다운로드'],
  },
  {
    id: 'amateur',
    name: '아마추어 팩',
    badge: '월간 무제한',
    priceText: '₩19,900',
    periodText: '($14.99 / 월)',
    creditsText: '1개월 무제한 사용',
    tagline: '한 달간 부담없이 무제한 인테리어 디자인',
    features: ['1개월 동안 무제한 생성', '20+ 모든 프리미엄 스타일', '초고속 우선 렌더링'],
  },
  {
    id: 'pro',
    name: '프로 팩',
    badge: '90% 절약 BEST',
    highlighted: true,
    priceText: '₩45,000',
    periodText: '(주당 ₩865원 / 1년)',
    creditsText: '1년 무제한 사용',
    tagline: '가장 합리적인 1년 무제한 플랜',
    features: ['1년 동안 무제한 생성', '모든 신규 스타일 자동 해제', '상업적 이용 라이선스 포함'],
    lemonCheckoutUrl: 'https://airoomdesigner.lemonsqueezy.com/checkout/buy/c69ce40f-635c-4d36-b078-0993f9c2b30d',
  },
];

export interface ShowcaseTheme {
  id: string;
  label: string;
  title: string;
  beforeImg: string;
  afterImg: string;
  desc: string;
  detailText: string;
}

export const SHOWCASE_THEMES: ShowcaseTheme[] = [
  {
    id: 'interior',
    label: '🛋️ 인테리어',
    title: '실내 인테리어 3초 리디자인',
    beforeImg: '/living_room_before.png',
    afterImg: '/living_room_after.png',
    desc: '사진 1장으로 완성하는 스타일 공간 재창조',
    detailText: '원하는 방 사진 1장만 업로드하면 3초 만에 20가지 넘는 프리미엄 스타일로 공간을 감각적으로 리모델링합니다.',
  },
  {
    id: 'exterior',
    label: '🏡 건물 외관',
    title: '건물 외형 보존 & 파사드 무드 변환',
    beforeImg: '/exterior_showcase_before.png',
    afterImg: '/exterior_showcase_after.png',
    desc: '건물 크기는 유지한 채 마감재와 조명 분위기 변환',
    detailText: '건물의 전체 층수, 외형 크기, 뼈대는 그대로 고정한 채 우드 루버, 징크 마감, 분위기 있는 건축 조명으로 스타일만 변경합니다.',
  },
  {
    id: 'garden',
    label: '🌿 정원 테라스',
    title: '정원 뼈대 보존 & 꽃·나무·연못 조경 연출',
    beforeImg: '/garden_showcase_before.png',
    afterImg: '/garden_showcase_after.png',
    desc: '공간 구도는 유지한 채 꽃, 나무, 연못 조경 연출',
    detailText: '야외 테라스 및 정원의 기본 구조와 배치는 그대로 보존하고, 화려한 꽃과 나무, 미니 연못, 감성 조명을 더해 힐링 정원으로 조경 분위기를 연출합니다.',
  },
  {
    id: 'cleanup',
    label: '🧹 청소 짐정리',
    title: '특정 가구 삭제 & 쓰레기 부분 클린업',
    beforeImg: '/cleanup_showcase_before.png',
    afterImg: '/cleanup_showcase_after.png',
    desc: '인테리어는 보존하고 가구 및 쓰레기만 부분 삭제',
    detailText: '기존 완성된 인테리어 사진에서 지우고 싶은 특정 가구 하나나 바닥에 어지럽게 널린 쓰레기·잡동사니를 선택적으로 깔끔하게 지워 클린업합니다.',
  },
  {
    id: 'paint',
    label: '🎨 벽지 페인트',
    title: '가구 보존 & 벽지·페인트·바닥재 부분 교체',
    beforeImg: '/wall_paint_before.png',
    afterImg: '/floor_herringbone_after.png',
    desc: '인테리어 유지 + 벽지, 페인트색, 바닥 질감 1-Tap 교체',
    detailText: '가구 배치와 인테리어 구조는 100% 그대로 유지하면서, 원하는 벽지·페인트색 및 헤링본 바닥재 질감만 스마트하게 교체합니다.',
  },
];

export default function PricingModal({
  isOpen,
  onClose,
  onClaimFreeCredits,
  onStartExperience,
  freeCreditsCount = 2,
}: PricingModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('pro');
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);
  const [sliderPos, setSliderPos] = useState<number>(50);

  // 🎬 한 화면의 비포 ➔ 애프터 변환이 완전히 끝나고(애프터 100% 공개 및 감상) 다음 기능으로 넘어가는 완벽 순차 애니메이션
  useEffect(() => {
    // 1단계: 비포 사진 100% 먼저 보여주기
    setSliderPos(100);

    // 2단계: 0.8초 후 부드럽게 슬라이딩하며 애프터 사진 100% 공개
    const slideTimer = setTimeout(() => {
      setSliderPos(0);
    }, 800);

    // 3단계: 슬라이드 완료(1.4초) + 완성된 애프터 감상(1.8초) = 4.0초 후 다음 기능 테마로 이동
    const nextThemeTimer = setTimeout(() => {
      setActiveThemeIdx((prev) => (prev + 1) % SHOWCASE_THEMES.length);
    }, 4000);

    return () => {
      clearTimeout(slideTimer);
      clearTimeout(nextThemeTimer);
    };
  }, [activeThemeIdx]);

  if (!isOpen) return null;

  const currentTheme = SHOWCASE_THEMES[activeThemeIdx];
  const currentPlan = NEW_APP_PLANS.find((p) => p.id === selectedPlanId) || NEW_APP_PLANS[2];

  // 무료 체험 진행
  const handleTryFree = () => {
    if (onClaimFreeCredits) onClaimFreeCredits();
    onClose();
    if (onStartExperience) onStartExperience();
  };

  // 결제 진행 (테스트 환경: 즉시 승인 및 +30 크레딧 충전)
  const handleContinue = () => {
    if (onClaimFreeCredits) onClaimFreeCredits();
    alert(`🎉 [${currentPlan.name}] 테스트 결제 승인 완료!\n+30 크레딧이 성공적으로 충전되었습니다.`);
    onClose();
    if (onStartExperience) onStartExperience();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 shadow-2xl animate-fade-in sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[95vh] sm:rounded-[32px] sm:border sm:border-amber-500/20 overflow-y-auto cursor-default touch-manipulation"
    >

      {/* ── 🎁 1. 상단 신규 회원 2회 무료 크레딧 안내 배너 ── */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 pt-4 pb-3 text-slate-950 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-xs font-black">🎁</span>
          <div>
            <span className="text-xs font-black block leading-tight">신규 회원 2회 무료 크레딧 지급!</span>
            <span className="text-[10px] font-bold text-slate-800">결제 없이 2회 체험으로 바로 시작 가능</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTryFree}
          className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-amber-400 shadow hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
        >
          2회 무료 체험 ⚡
        </button>
      </div>

      {/* ── 2. 히어로 영역 (5가지 기능별 비포/애프터 쇼케이스) ── */}
      <div className="relative flex flex-col items-center px-5 pt-5 pb-2 text-center bg-slate-50/80">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          ReRoom AI
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          {currentTheme.desc}
        </p>

        {/* 5개 핵심 기능 탭 */}
        <div className="mt-3 flex w-full justify-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {SHOWCASE_THEMES.map((theme, idx) => (
            <button
              type="button"
              key={theme.id}
              onClick={() => setActiveThemeIdx(idx)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black transition-all cursor-pointer ${
                activeThemeIdx === idx
                  ? 'bg-amber-400 text-slate-950 shadow-sm scale-105 ring-1 ring-amber-400'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* 비포/애프터 슬라이딩 프레임 (스무스 1.4초 모션) */}
        <div className="relative mt-2 aspect-[16/9] w-full max-w-[340px] overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-950 shadow-md">
          <Image
            src={currentTheme.afterImg}
            alt={`${currentTheme.label} After`}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0 overflow-hidden transition-all duration-[1400ms] ease-in-out border-r-2 border-amber-400 shadow-2xl"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative h-full w-[340px]">
              <Image
                src={currentTheme.beforeImg}
                alt={`${currentTheme.label} Before`}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {/* 뱃지 */}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-black text-slate-300 backdrop-blur-sm">
            BEFORE
          </span>
          <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-md">
            AFTER (AI 3초)
          </span>
        </div>

        {/* ── 💡 화면 아래 현재 기능 이름 & 동적 소개 글 박스 ── */}
        <div className="mt-2.5 w-full max-w-[340px] rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-3 text-left shadow-sm transition-all duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                ★
              </span>
              <h3 className="text-xs font-black text-slate-900 tracking-tight">
                {currentTheme.title}
              </h3>
            </div>
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-sm">
              {activeThemeIdx + 1} / 5 기능
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-700 leading-snug">
            {currentTheme.detailText}
          </p>
        </div>

        {/* 간결한 혜택 문구 */}
        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-left text-xs font-extrabold text-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">⚡</span>
            <span>20가지 모든 스타일 해제</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">🚀</span>
            <span>4K 초고화질 원본 저장</span>
          </div>
        </div>
      </div>

      {/* ── 3. 개편된 3가지 요금제 카드 ── */}
      <div className="px-5 pt-3 pb-1">
        <div className="grid grid-cols-3 gap-2">
          {NEW_APP_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative flex flex-col items-center justify-between rounded-2xl border p-2.5 text-center transition-all cursor-pointer touch-manipulation ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* 상단 뱃지 */}
                {plan.badge && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black shadow-sm ${
                      plan.highlighted
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                {/* 플랜 이름 & 크레딧 */}
                <div className="mt-1">
                  <span className="text-sm font-black text-slate-900 block">{plan.name}</span>
                  <p className="text-[10px] font-bold text-amber-600 mt-0.5 leading-tight">
                    {plan.creditsText}
                  </p>
                </div>

                {/* 가격 */}
                <div className="mt-2">
                  <span className="text-xs font-black text-slate-900 block">{plan.priceText}</span>
                  <span className="text-[9px] font-medium text-slate-500 block">{plan.periodText}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. 선택된 요금제 상세 ── */}
      <div className="px-5 py-2">
        <div className="rounded-2xl bg-slate-100 p-3 text-xs font-medium text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950">✓</span>
            <span>{currentPlan.tagline}</span>
          </div>
          <span className="font-black text-slate-900 shrink-0">{currentPlan.priceText}</span>
        </div>
      </div>

      {/* ── 5. 하단 CTA 버튼 ── */}
      <div className="px-5 pb-6 pt-1 space-y-2 text-center">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-2xl bg-amber-400 py-3.5 text-sm font-black text-slate-950 shadow-lg hover:bg-amber-300 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
        >
          {currentPlan.name} 시작하기 ({currentPlan.priceText})
        </button>

        <button
          type="button"
          onClick={handleTryFree}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 underline transition-colors"
        >
          무료 2회 체험으로 먼저 시도해보기 ➔
        </button>
      </div>
    </div>
  );
}
