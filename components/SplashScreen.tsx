'use client';

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const FULL_TEXT = 'ROOMFIT AI';

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isFading, setIsFading] = useState(false);

  // ⌨️ 알파벳 한 글자씩 빠르게 타이핑되는 효과
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      currentIndex++;
      setDisplayedText(FULL_TEXT.slice(0, currentIndex));

      // 영문 타이핑이 모두 완성된 직후
      if (currentIndex >= FULL_TEXT.length) {
        clearInterval(typingInterval);

        // 글자 완성 후 잠시(350ms) 머문 뒤 부드럽게 페이드아웃하며 요금제 화면으로 전환
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            onFinish();
          }, 300);
        }, 350);
      }
    }, 75); // 글자당 75ms의 경쾌하고 빠른 타이핑 속도

    return () => clearInterval(typingInterval);
  }, [onFinish]);

  // 터치 시 즉시 요금제 화면으로 스킵
  const handleSkip = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center px-6 select-none cursor-pointer transition-all duration-300 ease-out ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        // 🌟 요청하신 연한 하늘색(Soft Light Sky Blue) 그라데이션
        background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 45%, #7dd3fc 100%)',
      }}
    >
      {/* 🌟 은은하고 화사한 소프트 조명 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] bg-white/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-sky-200/40 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8">
        {/* 🌟 1. 타이핑 효과로 빠르게 새겨지는 영문 글자 (ROOMFIT AI) */}
        <div className="h-14 sm:h-16 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-[0.16em] uppercase drop-shadow-[0_4px_14px_rgba(2,132,199,0.35)] flex items-center">
            <span>{displayedText}</span>
            {displayedText.length < FULL_TEXT.length && (
              <span className="inline-block w-1 h-8 sm:h-10 ml-1.5 bg-white rounded-full animate-blink shadow-sm" />
            )}
          </h1>
        </div>

        {/* 🌟 2. 손 흔드는 마스코트 캐릭터 (오른쪽 주머니에 망치 장착) */}
        <div className="relative animate-mascot-sway">
          {/* 발밑 부드러운 그림자 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-6 bg-sky-900/15 rounded-full blur-md" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot_waving_hammer_transparent.png"
            alt="RoomFit AI Mascot Waving"
            className="w-60 h-60 sm:w-72 sm:h-72 object-contain filter drop-shadow-[0_16px_30px_rgba(2,132,199,0.25)]"
            loading="eager"
          />
        </div>
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
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-mascot-sway {
          animation: mascotSway 1.5s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-blink {
          animation: blink 0.6s infinite;
        }
      `}</style>
    </div>
  );
}
