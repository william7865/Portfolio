'use client';

import { motion } from 'framer-motion';
import type { DayPoint } from '@/lib/analytics/series';

export function FrequencyChart({ data }: { data: DayPoint[] }) {
  const max = data.reduce((m, p) => Math.max(m, p.views), 0) || 1;

  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-6">
        <span className="han">頻</span>
        <span className="kicker">Fréquence · vues &amp; uniques / jour</span>
      </div>
      <div className="flex items-end gap-[3px] h-48" role="img" aria-label="Vues par jour">
        {data.map((p) => {
          const viewsPct = (p.views / max) * 100;
          const uniquesPct = p.views > 0 ? (p.uniques / p.views) * 100 : 0;
          return (
            <div
              key={p.day}
              className="flex-1 h-full flex items-end group relative"
              title={`${p.day} · ${p.views} vues · ${p.uniques} uniques`}
            >
              <motion.div
                className="dash-bar w-full"
                initial={{ height: 0 }}
                animate={{ height: `${viewsPct}%` }}
                transition={{ duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }}
              >
                <div className="dash-bar-uniques" style={{ height: `${uniquesPct}%` }} />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
