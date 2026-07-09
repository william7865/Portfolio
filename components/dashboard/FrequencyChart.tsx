'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Point } from '@/lib/analytics/series';
import type { Bucket } from '@/lib/analytics/range';
import { niceMax, xTicks } from '@/lib/analytics/ticks';

const LONG_MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

function pointLabel(key: string, bucket: Bucket): string {
  const d = new Date(key);
  const date = `${d.getUTCDate()} ${LONG_MONTHS_FR[d.getUTCMonth()]}`;
  if (bucket === 'hour') return `${date}, ${String(d.getUTCHours()).padStart(2, '0')}h UTC`;
  if (bucket === 'week') return `semaine du ${date}`;
  return date;
}

/**
 * A tooltip centred on the first or last bar hangs half its width outside the panel,
 * where `body { overflow-x: hidden }` truncates it on narrow screens. Anchor those inward.
 */
function edgeClass(index: number, total: number): string {
  if (index <= 1) return ' dash-tooltip-start';
  if (index >= total - 2) return ' dash-tooltip-end';
  return '';
}

export function FrequencyChart({ data, bucket }: { data: Point[]; bucket: Bucket }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const peak = data.reduce((m, p) => Math.max(m, p.views), 0);
  const max = niceMax(peak);
  const ticks = xTicks(data, bucket);
  const tickAt = new Map(ticks.map((t) => [t.index, t.label]));

  return (
    <section className="dash-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <div className="dash-cartouche">
          <span className="han">頻</span>
          <span className="kicker">Fréquence · vues &amp; uniques</span>
        </div>
        <div className="dash-legend">
          <span>
            <span
              className="dash-legend-swatch"
              style={{ background: 'var(--color-gold)' }}
            />
            Vues
          </span>
          <span>
            <span
              className="dash-legend-swatch"
              style={{ background: 'var(--color-gold-bright)' }}
            />
            Uniques
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative h-48 w-10 shrink-0">
          {[1, 0.5, 0].map((f) => (
            <span
              key={f}
              className="dash-axis-label absolute right-0 -translate-y-1/2"
              style={{ top: `${(1 - f) * 100}%` }}
            >
              {Math.round(max * f)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-48">
            {[1, 0.5, 0].map((f) => (
              <div key={f} className="dash-chart-grid" style={{ top: `${(1 - f) * 100}%` }} />
            ))}

            <div className="absolute inset-0 flex items-end gap-[3px]">
              {data.map((p, i) => {
                const viewsPct = (p.views / max) * 100;
                const uniquesPct = (p.uniques / max) * 100;
                return (
                  <div
                    key={p.key}
                    className="flex-1 h-full flex items-end relative"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  >
                    {hovered === i && (
                      <div className={`dash-tooltip${edgeClass(i, data.length)}`}>
                        <div style={{ color: 'var(--color-gold-bright)' }}>
                          {pointLabel(p.key, bucket)}
                          {p.partial ? ' · en cours' : ''}
                        </div>
                        <div>
                          {p.views} vues · {p.uniques} uniques
                        </div>
                      </div>
                    )}
                    <motion.div
                      className={`dash-bar w-full${p.partial ? ' dash-bar-partial' : ''}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${viewsPct}%` }}
                      transition={{ duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }}
                    >
                      {/* Same Y scale as views, so heights compare across buckets. */}
                      <div
                        className="dash-bar-uniques"
                        style={{ height: p.views > 0 ? `${(uniquesPct / viewsPct) * 100}%` : '0%' }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="relative h-5 mt-2">
            {data.map((p, i) =>
              tickAt.has(i) ? (
                <span
                  key={p.key}
                  className="dash-axis-label absolute top-0"
                  style={{ left: `${((i + 0.5) / data.length) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {tickAt.get(i)}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Vues et visiteurs uniques par période</caption>
        <thead>
          <tr>
            <th scope="col">Période</th>
            <th scope="col">Vues</th>
            <th scope="col">Uniques</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.key}>
              <th scope="row">
                {pointLabel(p.key, bucket)}
                {p.partial ? ' (en cours)' : ''}
              </th>
              <td>{p.views}</td>
              <td>{p.uniques}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
