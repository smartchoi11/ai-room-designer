'use client';

import { useState, useEffect } from 'react';
import { STYLES } from '@/lib/constants';
import Reveal from './Reveal';
import { Language } from '@/lib/dictionary';

/** 스타일 갤러리 카드. 클릭 시 스튜디오로 스크롤하며 해당 스타일을 미리 선택한다. */
export default function StyleCards() {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const pickStyle = (styleId: string) => {
    window.dispatchEvent(new CustomEvent('reroom:style', { detail: styleId }));
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-4 md:grid-cols-4">
      {STYLES.map((style, i) => (
        <Reveal key={style.id} delay={i * 40}>
          <button
            type="button"
            onClick={() => pickStyle(style.id)}
            className="group flex h-full w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper p-3.5 sm:p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              {style.swatch.map((color) => (
                <span
                  key={color}
                  className="h-3.5 w-3.5 sm:h-5 sm:w-5 rounded-full border border-ink/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-4 sm:mt-8 min-w-0 w-full">
              <h3 className="font-display text-sm sm:text-lg font-bold text-ink leading-snug break-words">
                {style.label}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-ink-soft break-words line-clamp-2">
                {style.desc}
              </p>
              <p className="mt-2 text-[11px] sm:text-xs font-semibold text-clay opacity-0 sm:opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden sm:block">
                이 스타일로 디자인하기 →
              </p>
            </div>
          </button>
        </Reveal>
      ))}
    </div>
  );
}
