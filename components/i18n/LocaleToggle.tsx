'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export function LocaleToggle() {
  const params = useParams();
  const pathname = usePathname();
  const current = (params?.lang as string) || 'fr';
  const next = current === 'fr' ? 'en' : 'fr';
  const target = pathname.replace(`/${current}`, `/${next}`);

  return (
    <Link
      href={target}
      aria-label={`Switch language to ${next.toUpperCase()}`}
      className="font-mono text-xs tracking-[0.24em] text-[var(--color-gold)] hover:text-[var(--color-gold-bright)] transition-colors px-2 py-1"
    >
      <span className={current === 'fr' ? 'text-[var(--color-gold-bright)]' : 'opacity-60'}>FR</span>
      <span className="mx-1 opacity-40">/</span>
      <span className={current === 'en' ? 'text-[var(--color-gold-bright)]' : 'opacity-60'}>EN</span>
    </Link>
  );
}
