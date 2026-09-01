'use client';

import { useState, useEffect } from 'react';
import { DICTIONARY, Language } from '@/lib/dictionary';

export default function Footer() {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].footer;

  return (
    <footer className="w-full border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-ink-faint md:flex-row">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm font-bold text-ink">
            ReRoom<span className="text-clay">.</span>
          </span>
          <span>© 2026 ReRoom AI. {t.rights}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="transition-colors hover:text-ink">
            {t.privacy}
          </a>
          <a href="/terms" className="transition-colors hover:text-ink">
            {t.terms}
          </a>
        </div>
      </div>
    </footer>
  );
}
