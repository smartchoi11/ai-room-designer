'use client';

import { useState, useEffect } from 'react';
import Reveal from './Reveal';
import { DICTIONARY, Language } from '@/lib/dictionary';

export default function HowItWorks() {
  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].howItWorks;

  const steps = [
    {
      no: '01',
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      no: '02',
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      no: '03',
      title: t.step3Title,
      desc: t.step3Desc,
    },
  ];

  return (
    <section id="how-it-works" className="w-full border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">
            {t.badge}
          </p>
          <h2 className="font-display mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink-soft">{t.subtitle}</p>
        </Reveal>

        <div className="mt-6 grid gap-2.5 sm:mt-12 sm:gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.no} delay={i * 100}>
              <div className="flex h-full flex-col rounded-xl sm:rounded-2xl border border-line bg-paper-raised p-4 sm:p-7">
                <span className="font-display text-xs sm:text-sm font-bold text-clay">
                  {step.no}
                </span>
                <h3 className="font-display mt-2 sm:mt-5 text-base sm:text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
