import type { ReactNode } from 'react';
import { RangeSelector } from './RangeSelector';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="dash-wrap">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="dash-cartouche">
          <span className="han" style={{ fontSize: '1.6rem' }}>
            觀客
          </span>
          <span className="kicker-mono">VISITORS · LIVE</span>
        </div>
        <div className="flex items-center gap-5">
          <RangeSelector />
          <form action="/api/dashboard/logout" method="post">
            <button
              type="submit"
              className="font-mono text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
              style={{ color: 'var(--color-gold)' }}
            >
              ⏻ Sortir
            </button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}
