'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('reroom_lang') as Language;
      if (saved && (saved === 'en' || saved === 'ko' || saved === 'ja' || saved === 'es')) {
        setLang(saved);
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-black text-lg text-white">
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              RoomFit AI
            </span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-full px-2 py-0.5 text-xs font-bold transition-all cursor-pointer ${
                  lang === l.code
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{l.flag}</span> <span className="uppercase">{l.code}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-xs font-bold text-amber-400 hover:underline mb-4">
            ← {lang === 'ko' ? '메인 앱으로 돌아가기' : lang === 'ja' ? 'ホームに戻る' : lang === 'es' ? 'Volver al Inicio' : 'Back to App'}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'ko' ? '개인정보처리방침' : lang === 'ja' ? 'プライバシーポリシー' : lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ko'
              ? '최종 개정일: 2026년 9월 25일 | 시행자: Hwanggeumson (황금손) / RoomFit AI'
              : 'Last Updated: September 25, 2026 | Operator: Hwanggeumson (RoomFit AI)'}
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Overview */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <h2 className="text-base font-bold text-white mb-2">
              {lang === 'ko' ? '1. 총칙 및 서비스 제공자 정보' : '1. Overview & Service Provider'}
            </h2>
            <p>
              {lang === 'ko'
                ? 'Hwanggeumson (이하 "회사")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 개인정보보호법에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다. 본 방침은 회사가 제공하는 RoomFit AI 모바일 애플리케이션 및 관련 제반 서비스에 적용됩니다.'
                : 'Hwanggeumson ("Company", "we", "our") operates the RoomFit AI mobile application and web services. This Privacy Policy describes how we collect, use, process, and protect your information when you use our services.'}
            </p>
          </section>

          {/* Data Collected */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <h2 className="text-base font-bold text-white mb-2">
              {lang === 'ko' ? '2. 수집하는 정보 및 권한 (카메라 및 사진 접근)' : '2. Information We Collect & Device Permissions'}
            </h2>
            <div className="space-y-3">
              <p>
                {lang === 'ko'
                  ? '회사는 AI 인테리어 디자인 및 리모델링 시뮬레이션 서비스 제공을 위해 최소한의 정보만을 처리합니다:'
                  : 'We collect and process minimal data necessary to deliver AI spatial interior transformation:'}
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-2">
                <li>
                  <strong className="text-white">
                    {lang === 'ko' ? '카메라 권한 (CAMERA):' : 'Camera Permission:'}
                  </strong>{' '}
                  {lang === 'ko'
                    ? '이용자가 직접 촬영하여 방 또는 공간 사진을 AI 변환에 제공할 때만 일시적으로 사용됩니다.'
                    : 'Used solely when you choose to take a photo of your room to generate AI designs.'}
                </li>
                <li>
                  <strong className="text-white">
                    {lang === 'ko' ? '사진 / 저장소 접근 (READ_MEDIA_IMAGES):' : 'Photos / Storage Permission:'}
                  </strong>{' '}
                  {lang === 'ko'
                    ? '기기에 저장된 방 사진을 선택하여 업로드하거나 완성된 4K 결과물을 저장하기 위해 사용됩니다.'
                    : 'Used to select existing room photos from your gallery or download generated 4K results.'}
                </li>
                <li>
                  <strong className="text-white">
                    {lang === 'ko' ? 'AI 렌더링 프롬프트 및 설정:' : 'Design Prompts & Room Selections:'}
                  </strong>{' '}
                  {lang === 'ko'
                    ? '사용자가 선택한 공간 유형, 스타일, 가구 변경 텍스트.'
                    : 'Style selections and custom text prompts entered for AI transformation.'}
                </li>
              </ul>
            </div>
          </section>

          {/* AI Processing & Cloud Security */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <h2 className="text-base font-bold text-white mb-2">
              {lang === 'ko' ? '3. AI 이미지 처리 및 데이터 보안 (제3자 제공)' : '3. AI Processing & Third-Party Services'}
            </h2>
            <p className="mb-2">
              {lang === 'ko'
                ? '이용자가 업로드한 공간 사진은 AI 렌더링을 위해 암호화된 HTTPS 통신을 거쳐 Google Cloud / Google AI (Gemini) 보안 API로 전송됩니다. 전송된 이미지는 오직 해당 디자인 시안을 생성하는 용도로만 일시적으로 처리되며, 구글이나 회사의 공개 광고 또는 외부 3자에게 절대 판매되거나 무단 유출되지 않습니다.'
                : 'Uploaded photos are securely transmitted via encrypted HTTPS to Google Cloud / Google AI (Gemini) APIs strictly to perform architectural design generation. Private room photos are never sold, rented, or used for public advertisements.'}
            </p>
          </section>

          {/* Data Retention & Deletion */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <h2 className="text-base font-bold text-white mb-2">
              {lang === 'ko' ? '4. 보유 기간 및 데이터 파기 (삭제 요청 권리)' : '4. Data Retention & Your Right to Deletion'}
            </h2>
            <p className="mb-2">
              {lang === 'ko'
                ? '이용자는 언제든지 앱 내 보관함에서 생성된 이미지 히스토리를 직접 삭제할 수 있습니다. 또한 아래 연락처로 데이터 삭제를 요청하시면 지체 없이 서버 및 관련 임시 파일 일체를 영구 파기합니다.'
                : 'Users can delete generated image history directly within the application at any time. You may also request permanent deletion of any associated records by contacting us at the email below.'}
            </p>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-sm">
            <h2 className="text-base font-bold text-amber-300 mb-2">
              {lang === 'ko' ? '5. 개인정보 보호책임자 및 문의처' : '5. Contact & Privacy Officer'}
            </h2>
            <div className="space-y-1 text-xs text-slate-300">
              <p>
                <strong className="text-white">{lang === 'ko' ? '회사/개발사' : 'Company'}:</strong> Hwanggeumson (황금손) / RoomFit AI
              </p>
              <p>
                <strong className="text-white">{lang === 'ko' ? '책임자' : 'Representative'}:</strong> Hyeongseok Choi (최형석)
              </p>
              <p>
                <strong className="text-white">{lang === 'ko' ? '사업장 주소' : 'Address'}:</strong> 103-305, 10 Motgol-ro, Dongducheon-si, Gyeonggi-do, Republic of Korea
              </p>
              <p>
                <strong className="text-white">{lang === 'ko' ? '공식 문의 이메일' : 'Email'}:</strong>{' '}
                <a href="mailto:const11@naver.com" className="text-amber-400 underline">
                  const11@naver.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        © 2026 Hwanggeumson · RoomFit AI. All rights reserved.
      </footer>
    </div>
  );
}
