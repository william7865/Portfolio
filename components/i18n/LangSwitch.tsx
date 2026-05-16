'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function LangSwitch() {
  const locale = useLocale();
  const t = useTranslations('lang');
  const pathname = usePathname();
  const { emit } = useScore();
  const other = locale === 'fr' ? 'en' : 'fr';
  const otherPath = pathname.replace(/^\/(fr|en)/, `/${other}`);

  return (
    <Link
      href={otherPath}
      prefetch
      onClick={() => emit({ type: 'lang_switch' })}
      className="font-mono text-xs uppercase tracking-widest hover:text-court"
      aria-label={`${t('label')} → ${other.toUpperCase()}`}
    >
      {t('switch')}
    </Link>
  );
}
