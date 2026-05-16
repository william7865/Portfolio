'use client';

import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations();
  return (
    <a href="#main" className="skip-link">
      {t('skipLink')}
    </a>
  );
}
