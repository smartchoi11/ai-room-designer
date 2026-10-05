'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message') || '사용자가 결제를 취소했거나 승인이 거절되었습니다.';

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24 text-center">
      <div className="rounded-3xl border border-line bg-paper-raised p-8 shadow-lift">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-3xl">
          !
        </div>
        <span className="mt-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600">
          결제 미완료
        </span>
        <h2 className="mt-3 text-2xl font-bold text-ink">결제가 취소되었습니다</h2>
        <p className="mt-2 text-xs text-ink-soft leading-relaxed">
          {message}
        </p>

        {code && (
          <div className="mt-4 rounded-xl bg-paper p-3 text-xs text-ink-muted border border-line font-mono">
            오류 코드: {code}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full rounded-2xl bg-clay px-6 py-3.5 text-sm font-bold text-paper shadow-md transition hover:bg-clay-dark"
          >
            요금제 페이지로 돌아가기
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-2xl border border-line bg-paper px-6 py-3 text-xs font-medium text-ink-soft hover:bg-paper-raised"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-ink-soft">로딩 중...</div>}>
          <FailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
