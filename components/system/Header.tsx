'use client';

import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { MuteToggle } from './MuteToggle';

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between px-6 lg:px-10 py-5">
        <div className="pointer-events-auto kicker-mono opacity-80">林 · LIN</div>
        <div className="pointer-events-auto flex items-center gap-3">
          <LocaleToggle />
          <span className="w-px h-4 bg-[var(--color-gold)] opacity-30" aria-hidden="true" />
          <MuteToggle />
        </div>
      </div>
    </header>
  );
}
