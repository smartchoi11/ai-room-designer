'use client';

import React, { useState } from 'react';

export default function IconSelectionPage() {
  const [selected, setSelected] = useState(1);

  const candidates = [
    {
      id: 1,
      title: '울트라바이올렛 & 골든 체어 & AI 스파크',
      desc: '신비롭고 럭셔리한 퍼플 배경 + 눈부신 골드 라운지체어 + 반짝이는 AI 마법 별빛 (가장 독창적이며 저작권 100% 안전)',
      src: '/store_assets/unique_option1.jpg',
      badge: '👑 김부장 독창성 1픽',
      highlight: true,
    },
    {
      id: 2,
      title: '에메랄드 그린 아치 & 테라코타 코랄 & 오브 조명',
      desc: '감각적인 건축 아치형 구조 벽면 + 따스한 코랄 벨벳 소파 + 은은한 구형 오브 조명 (세련된 유럽 부티크 룩)',
      src: '/store_assets/unique_option2.jpg',
      badge: '건축/디자인 감성',
    },
    {
      id: 3,
      title: '선셋 코랄 핑크 & 로열 블루 체어 & 올리브 화분',
      desc: '화사한 코랄 핑크 배경 + 깊은 로열 블루 벨벳 체어 + 싱그러운 올리브 나무 (스토어 검색창에서 압도적인 주목도)',
      src: '/store_assets/unique_option3.jpg',
      badge: '시선 강탈 보색대비',
    },
    {
      id: 4,
      title: '딥 코발트 블루 & 탠저린 오렌지 체어 & 몬스테라',
      desc: '깊은 로열 블루 + 선명한 탠저린 오렌지 라운지체어 + 대형 몬스테라 화분 (경쾌하고 에너지 넘치는 보색 조화)',
      src: '/store_assets/unique_option4.jpg',
      badge: '생동감 넘치는 대비',
    },
    {
      id: 5,
      title: '미드나잇 인디고 & 네온 라임 체어 & 슬림 램프',
      desc: '깊은 네이비 인디고 + 톡톡 튀는 네온 라임 체어 + 미니멀 블랙 스탠드 (현대적이고 세련된 테크 인테리어)',
      src: '/store_assets/unique_option5.jpg',
      badge: '모던 하이테크',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-white p-6 sm:p-10 flex flex-col items-center font-sans">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
            ✨ 독창적 & 저작권 안전 공식 앱 아이콘 후보
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            RoomFit AI 독창적 고대비 공식 앱 아이콘 5종
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            기존 앱과의 유사성 논란을 완벽히 피하면서,
            <br />
            <span className="text-amber-400 font-semibold">독창적인 색감 조합과 심플한 가구 배치</span>로 스토어에서 시선을 사로잡는 5가지 디자인입니다.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {candidates.map((c) => {
            const isSelected = selected === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={
                  'cursor-pointer rounded-2xl p-4 transition-all duration-300 relative flex flex-col items-center ' +
                  (isSelected
                    ? 'bg-neutral-900 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-[1.03]'
                    : 'bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 hover:scale-[1.01]')
                }
              >
                {/* Badge */}
                <div
                  className={
                    'absolute -top-3 px-3 py-0.5 rounded-full text-[11px] font-bold shadow-md ' +
                    (c.highlight
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black'
                      : 'bg-neutral-800 border border-neutral-700 text-neutral-300')
                  }
                >
                  {c.badge}
                </div>

                {/* Image */}
                <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl my-3 bg-black border border-white/10 relative">
                  <img
                    src={c.src}
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 border-4 border-amber-400 rounded-xl pointer-events-none" />
                  )}
                </div>

                <div className="text-xs font-black text-amber-400 mb-1">
                  옵션 {c.id}번
                </div>
                <h3 className="text-sm font-bold text-white text-center">
                  {c.title}
                </h3>
                <p className="text-[11px] text-neutral-400 text-center mt-2 leading-relaxed flex-grow">
                  {c.desc}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(c.id);
                  }}
                  className={
                    'w-full mt-4 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md ' +
                    (isSelected
                      ? 'bg-amber-400 text-black shadow-amber-400/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300')
                  }
                >
                  {isSelected ? '✓ 선택됨 (이걸로 결정)' : '선택하기'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-base font-bold text-amber-400">
              현재 선택: [옵션 {selected}번] {candidates.find((c) => c.id === selected)?.title}
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              채팅창에 <span className="text-white font-bold">"{selected}번으로 해줘"</span>라고 말씀해 주시면, 구글 플레이 스토어 공식 규격(512x512 PNG)으로 즉시 변환 생성합니다.
            </p>
          </div>
          <div className="text-xs text-neutral-400 font-mono bg-black/60 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            512 x 512 px / 32-bit PNG / 구글 공식 규격
          </div>
        </div>
      </div>
    </div>
  );
}
