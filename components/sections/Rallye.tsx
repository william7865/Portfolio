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
    <ScoredSection id="rallye" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">
        Rallye · {t('subtitle')}
      </p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        <div className="space-y-4 text-lg leading-relaxed">
          {about.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="/CV.pdf"
              target="_blank"
              rel="noopener"
              className="px-5 py-2 bg-ink text-hall-floor font-mono text-xs hover:bg-court-line"
            >
              {t('cvButton')} →
            </a>
            <a
              href={`mailto:${cv.email}`}
              className="px-5 py-2 border border-ink font-mono text-xs hover:bg-ink hover:text-hall-floor"
            >
              {t('contactButton')} →
            </a>
          </div>
        </div>
        <div>
          <SkillCourt />
        </div>
      </div>
    </ScoredSection>
  );
}
