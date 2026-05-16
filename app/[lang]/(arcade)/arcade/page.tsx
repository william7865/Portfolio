import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function ArcadeHubPage() {
  const t = useTranslations('arcade');
  const locale = useLocale();
  return (
    <section className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court uppercase">
        {t('subtitle')}
      </p>
      <h1 className="font-display italic text-6xl mt-2">{t('title')}</h1>
      <ul className="mt-12 font-mono text-sm space-y-3">
        <li>
          → <Link href={`/${locale}/arcade/achievements`} className="hover:text-court underline">
            {t('achievements')}
          </Link>
        </li>
        <li className="text-muted">→ {t('minigame')}</li>
        <li className="text-muted">→ {t('championSelect')}</li>
      </ul>
    </section>
  );
}
