'use client';

import { useState, useEffect } from 'react';
import Reveal from './Reveal';
import StyleCards from './StyleCards';
import { DICTIONARY, Language } from '@/lib/dictionary';

export default function StyleGallery() {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].styles;

  return (
    <section id="styles" className="w-full border-t border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">
            {t.badge}
          </p>
          <h2 className="font-display mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-2 sm:mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-ink-soft md:text-base">
            {t.subtitle}
          </p>
        </Reveal>

        <StyleCards />
      </div>
    </section>
  );
}
