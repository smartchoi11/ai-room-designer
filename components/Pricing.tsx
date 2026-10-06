'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

export type KrPlan = {
  id: string;
  name: string;
  tagline: string;
  priceKrw: number;
  priceFormatted: string;
  creditsText: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
  buttonText: string;
};

export const KR_PLANS: KrPlan[] = [
  {
    id: 'free',
    name: '무료 체험',
    tagline: 'AI 인테리어 변환을 부담없이 체험해보세요',
    priceKrw: 0,
    priceFormatted: '무료',
    creditsText: '기본 무료 2회 제공',
    features: [
      '무료 AI 인테리어 디자인 2회',
      '20가지 프리미엄 스타일 전체 이용',
      '3단계 공간 변환 모드 지원',
      '신용카드/결제 정보 등록 없이 즉시 시작',
    ],
    buttonText: '지금 무료로 시작하기',
  },
  {
    id: 'starter_pack',
    name: '스타터 충전 팩',
    tagline: '이사, 자취방 및 단품 인테리어 리모델링 프로젝트용 (1회성)',
    priceKrw: 9900,
    priceFormatted: '9,900원',
    creditsText: '50 크레딧 1회 충전 (회당 198원 · 유효기간 없음)',
    badge: '🔥 B2C 추천 1위',
    highlighted: true,
    features: [
      '50회 인테리어 생성 크레딧 (평생 소장/유효기간 없음)',
      '1회 요청 시 최대 4개 시안 동시 생성',
      '수정 히스토리 & Undo/Redo 지원',
      '4K 초고화질 원본 이미지 다운로드',
      '초고속 AI 렌더링 우선권 부여',
    ],
    buttonText: '50 크레딧 충전 (9,900원)',
  },
  {
    id: 'pro_pack',
    name: '프로 충전 팩',
    tagline: '집 전체 리모델링, 인테리어 블로거 & 열정 유저용 (1회성)',
    priceKrw: 29000,
    priceFormatted: '29,000원',
    creditsText: '180 크레딧 1회 충전 (회당 161원 · 유효기간 없음)',
    badge: '👑 최고 가치',
    features: [
      '180회 인테리어 생성 크레딧 (평생 소장/유효기간 없음)',
      '스타터 팩 대비 3.6배 대용량 제공 (개당 161원 가성비)',
      '전체 20가지 인테리어 스타일 프리미엄 이용',
      '4K 초고화질 원본 다운로드 및 히스토리 보존',
      '상업적 이용 라이선스 완전 포함',
    ],
    buttonText: '180 크레딧 충전 (29,000원)',
  },
  {
    id: 'studio_agency',
    name: '스튜디오 에이전시',
    tagline: '인테리어 설계사무소 및 법인 팀 전용 월 정기 구독',
    priceKrw: 54900,
    priceFormatted: '54,900원 / 월',
    creditsText: '최대 3인 팀 라이선스 + 매월 무제한 생성',
    badge: '🏢 B2B 팀 전용',
    features: [
      '매월 무제한 AI 인테리어 시안 생성 (300회 터보 포함)',
      '최대 3인 팀 다중 접속 계정 지원',
      '여러 장의 사진 일괄(Batch) 변환 기능',
      '워터마크 완전 제거 및 커스텀 브랜드 적용',
      '영업일 24시간 내 우선 고객지원 (이메일)',
    ],
    buttonText: '에이전시 플랜 시작 (54,900원/월)',
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<KrPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'toss' | 'google_play'>('toss');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPlan = (plan: KrPlan) => {
    if (plan.id === 'free') {
      const studioElem = document.getElementById('studio');
      if (studioElem) {
        studioElem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setSelectedPlan(plan);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleTossCheckout = async () => {
    if (!selectedPlan) return;

    if (selectedGateway === 'google_play') {
      setErrorMessage('구글 플레이 인앱결제(글로벌 결제)는 현재 판매자 계정 검토 준비 중입니다. 국내 간편결제(토스/카카오/카드)를 이용해 주세요!');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      // 공식 토스페이먼츠 테스트 클라이언트 키 (환경변수 키 우선)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJqK4WBaqkxl3OBryNqmE';
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      const orderId = `roomfit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-room-smart-designer-choi.vercel.app';

      // 토스 결제창 띄우기 (신용카드, 카카오페이, 네이버페이, 토스페이 통합 지원)
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: selectedPlan.priceKrw,
        },
        orderId,
        orderName: `RoomFit AI ${selectedPlan.name}`,
        successUrl: `${origin}/pricing/success?planId=${selectedPlan.id}`,
        failUrl: `${origin}/pricing/fail`,
        customerEmail: 'customer@roomfit.ai',
        customerName: 'RoomFit AI 고객',
      });
    } catch (err: any) {
      console.error('Toss Payments request error:', err);
      // 사용자가 창을 닫은 경우 등
      if (err.code !== 'USER_CANCEL') {
        setErrorMessage(err.message || '결제창을 여는 도중 문제가 발생했습니다.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <section id="pricing" className="w-full border-t border-line bg-paper py-12 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-clay/10 px-4 py-1.5 text-[11px] font-bold text-clay uppercase tracking-[0.15em] border border-clay/20 shadow-sm">
            <span>🎉 Google Play 정식 출시 기념 오픈 프로모션</span>
            <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] text-paper">
              15일간 한정 (~2026.10.21)
            </span>
          </div>
          <h2 className="font-display mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-ink md:text-5xl">
            합리적인 가격으로 인테리어를 완성하세요
          </h2>
          <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-ink-soft md:text-base">
            토스페이, 카카오페이, 네이버페이, 신용카드 간편결제 지원. 10월 21일까지 신규 가입 2회 무료 체험 및 한정 얼리버드 충전 혜택을 제공합니다.
          </p>
        </Reveal>

        {/* 요금제 카드 4종 그리드 */}
        <div className="mt-8 sm:mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KR_PLANS.map((plan, idx) => (
            <Reveal key={plan.id} delay={idx * 80}>
              <div
                className={`relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border p-5 sm:p-7 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-clay bg-paper-raised shadow-lift ring-2 ring-clay/30'
                    : 'border-line bg-paper hover:border-line-strong hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
                    {plan.badge && (
                      <span className="shrink-0 rounded-full bg-clay px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-paper shadow-sm">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft min-h-[36px]">{plan.tagline}</p>

                  <div className="my-6 border-y border-line py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
                        {plan.priceFormatted}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-clay">{plan.creditsText}</p>
                  </div>

                  <ul className="flex flex-col gap-2.5 text-xs text-ink-soft">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mt-0.5 shrink-0 text-clay"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-8 w-full rounded-2xl py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    plan.highlighted
                      ? 'bg-clay text-paper shadow-lift hover:bg-clay-deep active:scale-95'
                      : 'bg-ink text-paper hover:bg-clay active:scale-95'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 결제 수단 안내 뱃지 */}
        <div className="mt-12 rounded-2xl border border-line bg-paper-raised p-6 text-center text-xs text-ink-soft flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-ink">
            🛡️ 토스페이먼츠 전자금융 안전결제
          </span>
          <span className="text-line-strong">|</span>
          <span>카카오페이</span>
          <span>·</span>
          <span>토스페이</span>
          <span>·</span>
          <span>네이버페이</span>
          <span>·</span>
          <span>국내 모든 신용/체크카드</span>
          <span className="text-line-strong">|</span>
          <span className="text-clay font-medium">1초 원클릭 간편결제 지원</span>
        </div>
      </div>

      {/* 결제 수단 선택 모달 (Toss Payments / Google Play) */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-line bg-paper-raised p-6 shadow-2xl md:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-paper text-ink-faint transition-colors hover:text-ink"
            >
              ✕
            </button>

            <div>
              <span className="rounded-full bg-clay/10 px-3 py-1 text-[10px] font-bold text-clay uppercase tracking-wider">
                주문 및 결제 확인
              </span>
              <h3 className="font-display mt-3 text-2xl font-bold text-ink">
                {selectedPlan.name}
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                {selectedPlan.creditsText}
              </p>

              <div className="my-5 rounded-2xl border border-line bg-paper p-4">
                <div className="flex justify-between text-sm font-bold text-ink">
                  <span>최종 결제 금액</span>
                  <span className="text-clay font-mono text-base">
                    {selectedPlan.priceFormatted}
                  </span>
                </div>
              </div>

              {/* 결제 채널 선택 (토스 vs 구글플레이) */}
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-bold text-ink">결제 방식 선택</label>
                
                <button
                  type="button"
                  onClick={() => { setSelectedGateway('toss'); setErrorMessage(''); }}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer flex items-center justify-between ${
                    selectedGateway === 'toss'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        토스페이먼츠 간편결제
                        <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">국내 추천</span>
                      </div>
                      <div className="text-[11px] text-ink-soft mt-0.5">
                        카카오페이 · 토스페이 · 네이버페이 · 모든 카드
                      </div>
                    </div>
                  </div>
                  <input type="radio" checked={selectedGateway === 'toss'} readOnly className="accent-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGateway('google_play')}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer flex items-center justify-between ${
                    selectedGateway === 'google_play'
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">▶️</span>
                    <div>
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        Google Play 인앱결제
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">Global 준비중</span>
                      </div>
                      <div className="text-[11px] text-ink-soft mt-0.5">
                        외국인/해외 카드 · Google Play 잔액 결제
                      </div>
                    </div>
                  </div>
                  <input type="radio" checked={selectedGateway === 'google_play'} readOnly className="accent-indigo-600" />
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 border border-amber-500/30">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleTossCheckout}
                disabled={isProcessing}
                className="w-full cursor-pointer rounded-2xl bg-clay py-4 text-xs font-bold text-paper shadow-lift transition-all hover:bg-clay-deep active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? '토스 결제창을 불러오는 중...' : `${selectedPlan.priceFormatted} 결제창 열기`}
              </button>

              <p className="mt-3 text-center text-[10px] text-ink-faint">
                토스페이먼츠의 안전한 암호화 결제창이 열립니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
