'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Language } from '@/lib/dictionary';
import Link from 'next/link';

export default function PrivacyPage() {
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
          {lang === 'kr' ? '개인정보 처리방침' : lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-ink-faint mb-12">
          {lang === 'kr' ? '최종 수정일: 2026년 8월 24일' : lang === 'ja' ? '最終更新日: 2026年8月24日' : 'Last Updated: August 24, 2026'}
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-ink-soft">
          {/* Section 1 */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '1. 수집하는 개인정보 항목' : lang === 'ja' ? '1. 収集する個人情報' : '1. Information We Collect'}
            </h2>
            <p>
              {lang === 'kr'
                ? 'ReRoom AI는 최소한의 개인정보만을 수집합니다. 소셜 로그인 시 제공되는 이메일 주소, 업로드된 공간 이미지, AI 생성 히스토리가 서비스 제공을 위해 안전하게 수집 및 처리됩니다.'
                : 'We collect minimal information necessary to deliver our service: account email address, uploaded room photos for processing, and generated interior history.'}
            </p>
          </section>

          {/* Section 2: Image & Data Security */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '2. 업로드된 공간 사진 및 이미지 보안' : lang === 'ja' ? '2. 画像とデータのセキュリティ' : '2. Image & Room Data Security'}
            </h2>
            <p className="mb-3">
              {lang === 'kr'
                ? '사용자가 업로드한 원본 공간 사진은 오직 3D 인테리어 시안 생성 목적으로만 일시적으로 사용되며, 외부 3인에게 공유되거나 무단으로 재활용되지 않습니다. 사용자는 언제든지 마이페이지에서 생성 기록과 이미지를 삭제하실 수 있습니다.'
                : 'Uploaded room photos are strictly used to render 3D interior transformations via secure cloud infrastructure. We do not sell or share private user images with third parties.'}
            </p>
          </section>

          {/* Section 3: Payment Data */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '3. 결제 정보 보호 (PG사 전자결제)' : lang === 'ja' ? '3. 決済情報の保護' : '3. Payment Information Security'}
            </h2>
            <p>
              {lang === 'kr'
                ? 'ReRoom AI 서버는 고객님의 신용카드 번호나 CVC 등 민감한 결제 정보를 직접 저장하지 않습니다. 모든 카드 결제는 PCI-DSS 최고 수준 보안을 준수하는 전문 전자결제사(Lemon Squeezy / Stripe)를 통해 안전하게 암호화 처리됩니다.'
                : 'We never store sensitive credit card numbers or security credentials on our servers. All transaction details are encrypted and securely handled by PCI-DSS compliant payment gateways (Lemon Squeezy / Stripe).'}
            </p>
          </section>

          {/* Section 4: Contact */}
          <section className="bg-paper-raised p-6 md:p-8 rounded-2xl border border-line">
            <h2 className="text-lg font-bold text-ink mb-3">
              {lang === 'kr' ? '4. 개인정보 보호 문의' : lang === 'ja' ? '4. お問い合わせ' : '4. Contact Information'}
            </h2>
            <p>
              {lang === 'kr'
                ? '개인정보 보호 관련 문의사항이나 정보 삭제 요청은 공식 지원 이메일(privacy@reroom.ai)로 접수해 주시면 24시간 이내 신속히 처리해 드립니다.'
                : 'For privacy concerns or data removal requests, please contact our Data Protection Team at privacy@reroom.ai.'}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
