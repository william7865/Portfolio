import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
    >
      {t('skipLink')}
    </a>
  );
}
