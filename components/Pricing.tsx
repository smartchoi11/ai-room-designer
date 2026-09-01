'use client';

import { useState } from 'react';
import Reveal from './Reveal';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'toss' | 'kakao' | 'naver' | 'card'>('toss');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (plan: KrPlan) => {
    if (plan.id === 'free') {
      const studioElem = document.getElementById('studio');
      if (studioElem) {
        studioElem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleDomesticCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPlan) {
        if (selectedPlan.id === 'starter_pack') {
          const current = Number(localStorage.getItem('reroom_free_generations') || '2');
          localStorage.setItem('reroom_free_generations', String(current + 50));
        } else if (selectedPlan.id === 'pro_pack') {
          const current = Number(localStorage.getItem('reroom_free_generations') || '2');
          localStorage.setItem('reroom_free_generations', String(current + 180));
        } else {
          localStorage.setItem('reroom_pro_subscribed', 'true');
        }

        // 텔레그램 결제 알림 트리거
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planName: selectedPlan.name,
            amountFormatted: selectedPlan.priceFormatted,
            paymentMethod: selectedPaymentMethod.toUpperCase(),
          }),
        }).catch((err) => console.error('Telegram notification error:', err));

        alert(`[${selectedPlan.name}] ${selectedPaymentMethod.toUpperCase()} 결제가 완료되었습니다!\n크레딧이 성공적으로 추가되었습니다.`);
      }
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <section id="pricing" className="w-full border-t border-line bg-paper py-12 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <span className="rounded-full bg-clay/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-clay">
            🇰🇷 국내 전용 원화(KRW) 요금제
          </span>
          <h2 className="font-display mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-ink md:text-5xl">
            합리적인 가격으로 인테리어를 완성하세요
          </h2>
          <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-ink-soft md:text-base">
            투명하고 합리적인 원화(KRW) 요금 정책. 2회 무료 체험부터 간편결제 크레딧 충전, 월 무제한 멤버십까지 자유롭게 선택하세요.
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
        <div className="mt-12 rounded-2xl border border-line bg-paper-raised p-6 text-center text-xs text-ink-soft">
          💳 <strong>국내 간편결제 지원:</strong> <strong>토스페이, 카카오페이, 네이버페이, 국내 모든 신용/체크카드</strong> 결제 지원. (해외 카드 및 수수료 걱정 없음)
        </div>
      </div>

      {/* 국내 결제 모달 (Toss/Kakao/Naver Pay) */}
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
                국내 간편결제 (KRW)
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

              {/* 결제 수단 선택 */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold text-ink">결제 수단 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('toss')}
                    className={`rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === 'toss'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                        : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    🔵 토스페이 (Toss)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('kakao')}
                    className={`rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === 'kakao'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm'
                        : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    🟡 카카오페이 (Kakao)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('naver')}
                    className={`rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === 'naver'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    🟢 네이버페이 (Naver)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === 'card'
                        ? 'border-clay bg-clay/10 text-clay shadow-sm'
                        : 'border-line bg-paper text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    💳 일반 신용/체크카드
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDomesticCheckout}
                disabled={isProcessing}
                className="w-full cursor-pointer rounded-2xl bg-clay py-4 text-xs font-bold text-paper shadow-lift transition-all hover:bg-clay-deep active:scale-95"
              >
                {isProcessing ? '결제 요청 처리 중...' : `${selectedPlan.priceFormatted} 결제하기`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
