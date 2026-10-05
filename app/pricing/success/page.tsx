'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 승인 파라미터가 유효하지 않습니다.');
      return;
    }

    async function confirmPayment() {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), planId }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // 크레딧 충전 반영
          const addedCredits = planId === 'starter_pack' ? 50 : planId === 'pro_pack' ? 180 : 300;
          const current = Number(localStorage.getItem('reroom_free_generations') || '2');
          localStorage.setItem('reroom_free_generations', String(current + addedCredits));
          if (planId === 'studio_agency') {
            localStorage.setItem('reroom_pro_subscribed', 'true');
          }

          setPaymentDetails(data.payment);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || '결제 승인에 실패했습니다.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || '네트워크 오류가 발생했습니다.');
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, planId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24 text-center">
      {status === 'loading' && (
        <div className="rounded-3xl border border-line bg-paper-raised p-8 shadow-lift">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-clay border-t-transparent"></div>
          <h2 className="mt-6 text-xl font-bold text-ink">결제를 승인하고 있습니다...</h2>
          <p className="mt-2 text-xs text-ink-soft">잠시만 기다려 주시면 크레딧이 즉시 충전됩니다.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="rounded-3xl border border-emerald-500/30 bg-paper-raised p-8 shadow-lift">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-3xl">
            ✓
          </div>
          <span className="mt-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
            결제 완료 & 크레딧 충전 완료
          </span>
          <h2 className="mt-3 text-2xl font-bold text-ink">성공적으로 결제되었습니다!</h2>
          <p className="mt-2 text-xs text-ink-soft">
            RoomFit AI의 프리미엄 AI 인테리어 서비스를 이용하실 수 있습니다.
          </p>

          {paymentDetails && (
            <div className="mt-6 space-y-2 rounded-2xl bg-paper p-4 text-left text-xs text-ink-soft border border-line">
              <div className="flex justify-between">
                <span>주문명:</span>
                <span className="font-semibold text-ink">{paymentDetails.orderName}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 금액:</span>
                <span className="font-semibold text-clay">{Number(paymentDetails.totalAmount).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>결제 수단:</span>
                <span className="font-semibold text-ink">{paymentDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span>주문 번호:</span>
                <span className="font-mono text-[10px] text-ink-muted">{paymentDetails.orderId}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-2xl bg-clay px-6 py-3.5 text-sm font-bold text-paper shadow-md transition hover:bg-clay-dark"
            >
              🎨 지금 바로 AI 인테리어 디자인 시작하기
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full rounded-2xl border border-line bg-paper px-6 py-3 text-xs font-medium text-ink-soft hover:bg-paper-raised"
            >
              요금제 페이지로 돌아가기
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-3xl border border-red-500/30 bg-paper-raised p-8 shadow-lift">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-3xl">
            ✕
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">결제 승인에 실패했습니다</h2>
          <p className="mt-2 text-xs text-red-500">{errorMessage}</p>

          <button
            onClick={() => router.push('/pricing')}
            className="mt-6 w-full rounded-2xl bg-clay px-6 py-3 text-sm font-bold text-paper transition hover:bg-clay-dark"
          >
            다시 시도하기
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-ink-soft">로딩 중...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
