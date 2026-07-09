'use client';

import { motion } from 'framer-motion';
import type { HourPoint } from '@/lib/analytics/queries';
import { niceMax } from '@/lib/analytics/ticks';

export function HourlyChart({ data }: { data: HourPoint[] }) {
  const max = niceMax(data.reduce((m, p) => Math.max(m, p.views), 0));

  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-6">
        <span className="han">時</span>
        <span className="kicker">Heures d&apos;affluence · UTC</span>
      </div>

      <div className="relative h-32 flex items-end gap-[3px]">
        {data.map((p, i) => (
          <div key={p.hour} className="flex-1 h-full flex items-end relative group">
            {/* Edge tooltips anchor inward: centred, they hang outside the panel. */}
            <div
              className={`dash-tooltip hidden group-hover:block${
                i <= 1 ? ' dash-tooltip-start' : i >= data.length - 2 ? ' dash-tooltip-end' : ''
              }`}
            >
              {String(p.hour).padStart(2, '0')}h · {p.views} vues
            </div>
            <motion.div
              className="dash-bar w-full"
              initial={{ height: 0 }}
              animate={{ height: `${(p.views / max) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.65, 0.05, 0.36, 1] }}
            />
          </div>
        ))}
      </div>

      <div className="relative h-5 mt-2">
        {data.map((p) =>
          p.hour % 6 === 0 ? (
            <span
              key={p.hour}
              className="dash-axis-label absolute top-0"
              style={{ left: `${((p.hour + 0.5) / 24) * 100}%`, transform: 'translateX(-50%)' }}
            >
              {String(p.hour).padStart(2, '0')}h
            </span>
          ) : null
        )}
      </div>

      <table className="sr-only">
        <caption>Vues par heure de la journée, en UTC</caption>
        <tbody>
          {data.map((p) => (
            <tr key={p.hour}>
              <th scope="row">{String(p.hour).padStart(2, '0')}h</th>
              <td>{p.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
