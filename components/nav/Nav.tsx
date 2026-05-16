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
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-4 flex items-center justify-between mix-blend-difference text-paper"
    >
      <Link href={base} className="label-mono">
        WL <span className="opacity-50">·</span> 2026
      </Link>
      <ul className="flex items-center gap-6 label-mono">
        <li className="hidden md:block">
          <Link href={`${base}/projects`} className="hover:text-shuttle">
            {t('projects')}
          </Link>
        </li>
        <li className="hidden md:block">
          <Link href={`${base}/now`} className="hover:text-shuttle">
            {t('now')}
          </Link>
        </li>
        <li className="hidden md:block">
          <Link href={`${base}/skills`} className="hover:text-shuttle">
            {t('skills')}
          </Link>
        </li>
        <li>
          <LangSwitch />
        </li>
      </ul>
    </nav>
  );
}
