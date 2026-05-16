'use client';
import { useTranslations, useLocale } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { SkillCourt } from '@/components/skill-court/SkillCourt';
import cv from '@/content/data/cv.json';

export function Rallye() {
  const t = useTranslations('rallye');
  const locale = useLocale() as 'fr' | 'en';
  const about = cv.about[locale];

  return (
    <ScoredSection id="rallye" className="relative px-6 md:px-10 py-32">
      {/* Section header — asymmetric */}
      <div className="grid grid-cols-12 gap-6 mb-16">
        <div className="col-span-12 md:col-span-3 label-mono text-court self-end">
          02 — RALLYE
        </div>
        <div className="col-span-12 md:col-span-9">
          <h2 className="display-black-condensed text-mega text-ink">
            About<span className="text-court">.</span>
          </h2>
        </div>
      </div>

      <div className="rule-double mb-12"></div>

      {/* Editorial body with marginalia + skill court */}
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        {/* Marginalia */}
        <aside className="col-span-12 md:col-span-2 label-mono text-ink-soft md:pt-2">
          <div className="space-y-1">
            <div>NOTES</div>
            <div className="text-court">marges du carnet</div>
            <div className="mt-6 hidden md:block">↓</div>
          </div>
        </aside>

        {/* Body text */}
        <div className="col-span-12 md:col-span-6 dropcap">
          {about.map((p, i) => (
            <p key={i} className="editorial-body text-lg md:text-xl leading-[1.55] text-ink-soft mt-4 first:mt-0">
              {p}
            </p>
          ))}

          <div className="mt-10 flex flex-wrap gap-3 items-center">
            <a
              href="/CV.pdf"
              target="_blank"
              rel="noopener"
              className="magnetic inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 label-mono hover:bg-court"
            >
              {t('cvButton')} <span aria-hidden>↗</span>
            </a>
            <a
              href={`mailto:${cv.email}`}
              className="magnetic inline-flex items-center gap-2 border-2 border-ink px-5 py-3 label-mono hover:bg-ink hover:text-paper"
            >
              {t('contactButton')} <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        {/* Skill court — compact */}
        <div className="col-span-12 md:col-span-4">
          <div className="label-mono text-ink-soft mb-3">SKILL · COURT</div>
          <SkillCourt />
        </div>
      </div>
    </ScoredSection>
  );
}
