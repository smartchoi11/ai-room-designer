'use client';

import { useState, useEffect } from 'react';
import { DICTIONARY, Language } from '@/lib/dictionary';

interface HeaderProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Header({ currentLang = 'kr', onLanguageChange }: HeaderProps) {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
    if (onLanguageChange) onLanguageChange('kr');
  }, [onLanguageChange]);

  const toggleLanguage = (newLang: Language) => {
    setLang('kr');
    localStorage.setItem('reroom_lang', 'kr');
    if (onLanguageChange) onLanguageChange('kr');
    window.dispatchEvent(new CustomEvent('reroom:lang', { detail: 'kr' }));
  };

  const t = DICTIONARY['kr'].nav;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-baseline gap-2.5">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            RoomFit<span className="text-clay">.</span>
          </span>
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            🇰🇷 AI 스튜디오 (한국 전용)
          </span>
        </a>

        <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
          <a href="#styles" className="hidden transition-colors hover:text-ink sm:block">
            {t.styles}
          </a>
          <a href="#how-it-works" className="hidden transition-colors hover:text-ink sm:block">
            {t.howItWorks}
          </a>
          <a href="#pricing" className="hidden transition-colors hover:text-ink sm:block">
            {t.pricing}
          </a>

          <a
            href="#studio"
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-all duration-200 hover:bg-clay shadow-sm"
          >
            {t.designNow}
          </a>
        </nav>
      </div>
    </header>
  );
}
