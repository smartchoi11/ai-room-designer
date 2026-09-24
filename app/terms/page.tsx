'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Language } from '@/lib/dictionary';
import Link from 'next/link';

export default function TermsPage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = (localStorage.getItem('reroom_lang') as Language) || 'en';
    setLang(saved);

    const handleLang = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('reroom:lang', handleLang as EventListener);
    return () => window.removeEventListener('reroom:lang', handleLang as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-clay hover:underline mb-8">
          ← {lang === 'kr' ? '메인으로 돌아가기' : lang === 'ja' ? 'ホームに戻る' : 'Back to Home'}
        </Link>

        <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink mb-4">
          {lang === 'kr' ? '서비스 이용약관 & 환불 정책' : lang === 'ja' ? '利用規約と返金方針' : 'Terms of Service & Refund Policy'}
        </h1>
        <p className="text-xs text-ink-faint mb-12">
          {lang === 'kr' ? '최종 수정일: 2026년 8월 24일' : lang === 'ja' ? '最終更新日: 2026年8월24日' : 'Last Updated: August 24, 2026'}
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-ink-soft">
          {/* Section 1 */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '1. 서비스 개요 및 승인' : lang === 'ja' ? '1. サービス概要' : '1. Service Overview & Acceptance'}
            </h2>
            <p>
              {lang === 'kr'
                ? 'RoomFit AI는 사용자가 업로드한 방 사진을 기반으로 다양한 3D 인테리어 컨셉을 초고화질로 렌더링하는 AI 인테리어 리디자인 SaaS 플랫폼입니다. 본 플랫폼을 이용하거나 계정을 생성함으로써 귀하는 본 이용약관 및 결제 조건에 동의하게 됩니다.'
                : 'RoomFit AI is an AI-powered interior redesign SaaS platform that transforms room photos into high-resolution 3D design concepts. By using our website and services, you agree to these Terms of Service.'}
            </p>
          </section>

          {/* Section 2: Payment & Subscriptions */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '2. 구독 결제 및 크레딧 이용' : lang === 'ja' ? '2. サブスクリプションと支払い' : '2. Subscriptions & Credit Payments'}
            </h2>
            <p className="mb-3">
              {lang === 'kr'
                ? 'RoomFit AI는 월간/연간 구독 플랜 및 크레딧 충전 방식으로 서비스를 제공합니다. 결제는 글로벌 결제 파트너(Lemon Squeezy / Stripe)를 통해 안전하게 처리되며 해외 신용카드, Apple Pay, Google Pay를 지원합니다.'
                : 'RoomFit AI offers subscription plans and credit-based generation tiers. Payments are securely processed via trusted Merchant of Record partners (Lemon Squeezy / Stripe), supporting major credit cards, Apple Pay, and Google Pay.'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-ink-faint">
              <li>{lang === 'kr' ? '구독은 익월 자동 갱신되며, 언제든지 마이페이지에서 해지하실 수 있습니다.' : 'Subscriptions auto-renew unless cancelled at least 24 hours before the end of the billing period.'}</li>
              <li>{lang === 'kr' ? '구독 해지 시 해당 결제 주기 마지막 날까지 유효한 크레딧을 자유롭게 사용하실 수 있습니다.' : 'Cancelling subscription keeps active features valid until the end of the current billing cycle.'}</li>
            </ul>
          </section>

          {/* Section 3: Refund Policy */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '3. 100% 환불 정책 (7일 보장)' : lang === 'ja' ? '3. 返金ポリシー (7日保証)' : '3. 100% Refund Policy (7-Day Money-Back Guarantee)'}
            </h2>
            <p className="mb-3">
              {lang === 'kr'
                ? '고객 만족을 위해 결제 후 7일 이내에 AI 생성 기능을 사용하지 않으셨거나(생성 건수 3회 이하), 기술적 오류로 서비스 이용이 불가능했던 경우 100% 전액 환불을 보장합니다.'
                : 'We offer a 100% refund within 7 days of purchase if you have generated fewer than 3 AI images or experienced critical technical errors prevents usage.'}
            </p>
            <div className="bg-clay-soft/20 p-4 rounded-xl text-xs border border-clay/30 text-ink font-medium">
              📩 {lang === 'kr' ? '환불 신청 및 문의' : 'Refund Requests'}: <span className="font-bold text-clay">support@reroom.ai</span>
            </div>
          </section>

          {/* Section 4: Intellectual Property */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '4. 생성된 이미지 지식재산권' : lang === 'ja' ? '4. 知的財産権' : '4. Intellectual Property & Commercial Usage'}
            </h2>
            <p>
              {lang === 'kr'
                ? 'RoomFit AI 유료 플랜 사용자가 생성한 모든 3D 인테리어 결과물은 사용자의 상업적 이용(부동산 홍보, 인테리어 시공 마케팅 등)이 100% 허용되며, 모든 소유권은 사용자에게 귀속됩니다.'
                : 'Paid plan users retain full commercial rights to all 3D interior transformation renders created through RoomFit AI for marketing, staging, and real estate presentations.'}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
