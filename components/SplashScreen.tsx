'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';

interface SplashScreenProps {
  onFinish: () => void;
  lang?: Language;
  autoCloseMs?: number;
}

export default function SplashScreen({
  onFinish,
  lang = 'ko',
  autoCloseMs = 2400,
}: SplashScreenProps) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 자동 스플래시 종료 타이머
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, autoCloseMs - 400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, autoCloseMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish, autoCloseMs]);

  const handleSkip = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  // 다국어 환영 메시지
  const welcomeText = {
    ko: '나만의 맞춤 공간을 꾸며볼까요? ✨',
    en: "Let's style your dream room! ✨",
    ja: 'あなただけの空間を作ってみませんか？✨',
    es: '¡Diseñemos la habitación de tus sueños! ✨',
  }[lang] || '나만의 맞춤 공간을 꾸며볼까요? ✨';

  const greetingBadge = {
    ko: '반가워요! 👋',
    en: 'Hello! 👋',
    ja: 'こんにちは！👋',
    es: '¡Hola! 👋',
  }[lang] || '반가워요! 👋';

  const skipHint = {
    ko: '화면을 터치하면 바로 시작합니다',
    en: 'Tap anywhere to start immediately',
    ja: '画面をタップしてすぐに開始',
    es: 'Toca la pantalla para comenzar',
  }[lang] || '화면을 터치하면 바로 시작합니다';

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-between px-6 py-10 select-none cursor-pointer transition-all duration-400 ease-out ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 45%, #0284c7 100%)',
      }}
    >
      {/* 🌟 은은한 배경 광채 & 부드러운 빛 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-sky-200/30 rounded-full blur-2xl" />
        {/* 부드러운 구름/빛 파티클 */}
        <div className="absolute top-12 left-8 w-24 h-12 bg-white/15 rounded-full blur-xl animate-float-slow" />
        <div className="absolute top-24 right-6 w-32 h-14 bg-white/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-24 left-10 w-28 h-12 bg-white/10 rounded-full blur-lg" />
      </div>

      {/* 🌟 1. 상단: ROOMFIT AI 타이포그래피 로고 */}
      <div className="relative z-10 flex flex-col items-center text-center mt-6 sm:mt-10 animate-fade-in-down">
        {/* 프리미엄 로고 배지 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
          <span>✨</span>
          <span>AI SPACE & INTERIOR STUDIO</span>
        </div>

        {/* 볼드 ROOMFIT AI 로고 */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[0.18em] uppercase drop-shadow-[0_4px_16px_rgba(2,132,199,0.6)]">
          ROOMFIT AI
        </h1>
        <p className="text-sky-100 text-xs sm:text-sm font-medium tracking-wide mt-1.5 opacity-90">
          사진 1장으로 완성하는 나만의 공간 리디자인
        </p>
      </div>

      {/* 🌟 2. 중앙: 손을 흔드는 룸핏 AI 공식 마스코트 캐릭터 */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        {/* 캐릭터 머리 위 반가운 인사 말풍선 배지 */}
        <div className="mb-2 relative animate-bounce-gentle">
          <div className="px-4 py-1.5 rounded-full bg-white text-[#0284c7] font-black text-xs sm:text-sm shadow-[0_8px_20px_rgba(2,132,199,0.3)] border border-sky-100 flex items-center gap-1.5">
            <span>{greetingBadge}</span>
          </div>
          {/* 말풍선 꼬리 */}
          <div className="w-2.5 h-2.5 bg-white transform rotate-45 mx-auto -mt-1 shadow-sm" />
        </div>

        {/* 손 흔들기 애니메이션 마스코트 이미지 */}
        <div className="relative animate-mascot-sway">
          {/* 발밑 그림자 강조 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-6 bg-sky-950/20 rounded-full blur-md" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot_waving_hammer_transparent.png"
            alt="RoomFit AI Mascot Waving"
            className="w-56 h-56 sm:w-68 sm:h-68 object-contain filter drop-shadow-[0_16px_32px_rgba(2,132,199,0.35)] transition-transform duration-300"
            loading="eager"
          />
        </div>

        {/* 안내 문구 카드 */}
        <div className="mt-3 px-5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_10px_25px_rgba(2,132,199,0.25)] border border-white/60">
          <p className="text-[#0369a1] text-xs sm:text-sm font-extrabold tracking-tight text-center">
            {welcomeText}
          </p>
        </div>
      </div>

      {/* 🌟 3. 하단: 프로그레스 인디케이터 & 터치 힌트 */}
      <div className="relative z-10 flex flex-col items-center mb-4 sm:mb-6 animate-fade-in-up">
        {/* 미니 로딩 바 */}
        <div className="w-32 sm:w-40 h-1.5 bg-white/30 rounded-full overflow-hidden p-[1px]">
          <div className="h-full bg-white rounded-full animate-splash-progress" />
        </div>

        {/* 탭 안내 힌트 */}
        <p className="text-sky-100/80 text-[11px] font-medium tracking-tight mt-2.5 flex items-center gap-1">
          <span>{skipHint}</span>
          <span className="opacity-60">›</span>
        </p>
      </div>

      {/* 인라인 애니메이션 스타일 정의 */}
      <style jsx>{`
        @keyframes mascotSway {
          0%, 100% {
            transform: rotate(0deg) translateY(0);
          }
          25% {
            transform: rotate(-3.5deg) translateY(-4px);
          }
          50% {
            transform: rotate(0deg) translateY(0);
          }
          75% {
            transform: rotate(3.5deg) translateY(-4px);
          }
        }
        @keyframes bounceGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes splashProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes floatSlow {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(8px, -8px);
          }
        }
        @keyframes floatDelayed {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-10px, 8px);
          }
        }
        .animate-mascot-sway {
          animation: mascotSway 1.6s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-bounce-gentle {
          animation: bounceGentle 1.8s ease-in-out infinite;
        }
        .animate-splash-progress {
          animation: splashProgress 2.2s ease-out forwards;
        }
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: floatDelayed 7s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}
