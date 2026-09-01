'use client';

import { useState, useEffect } from 'react';
import Reveal from './Reveal';
import { DICTIONARY, Language } from '@/lib/dictionary';

export default function Faq() {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].faq;

  const faqs = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: t.a4 },
  ];

  return (
    <section className="w-full border-t border-line bg-paper-raised">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-clay">
            {t.badge}
          </p>
          <h2 className="font-display mt-3 text-center text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {t.title}
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-12 flex flex-col gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-line bg-paper px-6 py-5 transition-colors open:border-line-strong"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-lg font-light text-ink-faint transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
