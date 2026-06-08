'use client';

import { motion } from 'framer-motion';
import type { RankRow } from '@/lib/analytics/queries';

export function RankBars({
  title,
  han,
  rows,
  emptyLabel = 'Aucune donnée'
}: {
  title: string;
  han: string;
  rows: RankRow[];
  emptyLabel?: string;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.views), 0) || 1;
  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-5">
        <span className="han">{han}</span>
        <span className="kicker">{title}</span>
      </div>
      {rows.length === 0 ? (
        <p className="font-mono text-xs opacity-50">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="truncate pr-3">{r.label}</span>
                <span style={{ color: 'var(--color-gold-bright)' }}>{r.views}</span>
              </div>
              <div className="dash-rank-track">
                <motion.div
                  className="dash-rank-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.views / max) * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.65, 0.05, 0.36, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
