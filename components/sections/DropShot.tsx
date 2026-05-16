'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';

export function DropShot() {
  const t = useTranslations('drop');
  const locale = useLocale();

  return (
    <ScoredSection id="drop" className="px-6 md:px-10 py-32">
      <div className="grid grid-cols-12 gap-6 mb-16">
        <div className="col-span-12 md:col-span-3 label-mono text-court self-end">
          04 — DROP SHOT
        </div>
        <div className="col-span-12 md:col-span-9">
          <h2 className="display-black-condensed text-mega text-ink">
            Currently<span className="text-court">.</span>
          </h2>
        </div>
      </div>

      <div className="rule-double mb-12"></div>

      {/* Daily-report style card */}
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-3 label-mono text-ink-soft tabular">
          <div>2026 · 05 · 16</div>
          <div className="text-court mt-1">last update</div>
        </div>

        <article className="col-span-12 md:col-span-7 border-l-4 border-ink pl-6 md:pl-10">
          <p className="editorial-body text-xl md:text-2xl leading-[1.5] text-ink">
            {t('teaser')}
          </p>

          <Link
            href={`/${locale}/now`}
            className="magnetic inline-flex items-center gap-2 mt-8 label-mono hover:text-court underline decoration-2 underline-offset-[6px]"
          >
            {t('cta')} <span aria-hidden>→</span>
          </Link>
        </article>
      </div>
    </ScoredSection>
  );
}
