'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { MuteToggle } from './MuteToggle';

export function Header() {
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  return (
    <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between px-6 lg:px-10 py-5">
        <Link
          href={`/${lang}`}
          aria-label="Return to prologue"
          className="pointer-events-auto kicker-mono opacity-80 hover:opacity-100 hover:text-[var(--color-gold-bright)] transition-colors"
        >
          林 · LIN
        </Link>
        <div className="pointer-events-auto flex items-center gap-3">
          <LocaleToggle />
          <span className="w-px h-4 bg-[var(--color-gold)] opacity-30" aria-hidden="true" />
          <MuteToggle />
        </div>
      </div>
    </header>
  );
}
