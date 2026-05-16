import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';

export function DropShot() {
  const t = useTranslations('drop');
  const locale = useLocale();
  return (
    <ScoredSection id="drop" className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">
        Drop shot · {t('subtitle')}
      </p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <p className="mt-6 text-lg leading-relaxed text-muted">{t('teaser')}</p>
      <Link
        href={`/${locale}/now`}
        className="inline-block mt-6 font-mono text-xs text-court-line hover:underline"
      >
        → {t('cta')}
      </Link>
    </ScoredSection>
  );
}
