import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LangSwitch } from '@/components/i18n/LangSwitch';

export function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const base = `/${locale}`;
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 bg-hall-floor/85 backdrop-blur border-b border-ink/10"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href={base} className="font-display italic text-xl tracking-tight">
          William Lin
        </Link>
        <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          <li>
            <Link href={base} className="hover:text-court-line">
              {t('home')}
            </Link>
          </li>
          <li>
            <Link href={`${base}/projects`} className="hover:text-court-line">
              {t('projects')}
            </Link>
          </li>
          <li>
            <Link href={`${base}/now`} className="hover:text-court-line">
              {t('now')}
            </Link>
          </li>
          <li>
            <Link href={`${base}/skills`} className="hover:text-court-line">
              {t('skills')}
            </Link>
          </li>
          <li>
            <LangSwitch />
          </li>
        </ul>
      </div>
    </nav>
  );
}
