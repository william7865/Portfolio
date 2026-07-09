'use client';

import { motion } from 'framer-motion';
import type { RankRow } from '@/lib/analytics/queries';

/** Bar length tracks whichever metric the row is ranked on. */
function metric(r: RankRow): number {
  return r.uniques ?? r.views;
}

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
  const max = rows.reduce((m, r) => Math.max(m, metric(r)), 0) || 1;
  const hasUniques = rows.some((r) => r.uniques !== undefined);

  return (
    <section className="dash-panel">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div className="dash-cartouche">
          <span className="han">{han}</span>
          <span className="kicker">{title}</span>
        </div>
        {hasUniques && <span className="dash-axis-label">uniques · vues</span>}
      </div>

      {rows.length === 0 ? (
        <p className="font-mono text-xs opacity-50">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="truncate pr-3">{r.label}</span>
                <span className="shrink-0">
                  <span style={{ color: 'var(--color-gold-bright)' }}>{metric(r)}</span>
                  {r.uniques !== undefined && (
                    <span style={{ color: 'rgba(254, 243, 199, 0.45)' }}> · {r.views}</span>
                  )}
                </span>
              </div>
              <div className="dash-rank-track">
                <motion.div
                  className="dash-rank-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric(r) / max) * 100}%` }}
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
