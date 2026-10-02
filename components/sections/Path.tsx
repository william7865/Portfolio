'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, type MotionValue } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SceneVideo } from '@/components/motifs/SceneVideo';
import { ParisClock } from '@/components/system/ParisClock';
import { useScrollRange } from '@/lib/useScrollRange';

type Item = {
  period: string;
  org: string;
  place: string;
  role: string;
  points: string[];
};

/** Scroll progress at which the brush touches the sheet, and lifts off it. */
const LINE_FROM = 0.27;
const LINE_TO = 0.6;

/**
 * Act III. Work and studies, newest first, on a sheet filmed from above.
 *
 * Scroll-bound, pinned for 200vh. The brush paints one vertical line down the
 * sheet; each entry is inked in as the line passes its height.
 */
export function Path() {
  const t = useTranslations('now');
  const items = t.raw('items') as Item[];
  const reduce = useReducedMotion();

  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const paint = useScrollRange(scrollYProgress, [0.04, 0.8], [0, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="now-title"
      className="relative"
      style={{ height: reduce ? '100vh' : '300vh' }}
    >
      <div className="path-desk">
        {/* Soft top and bottom edges: the sheet slides in over the same lacquer as the page */}
        <div className="scene-fade-thin absolute inset-0">
          <div className="path-stage">
            {/* brush.jpg is the finished line (reduced motion); the clip starts on a blank sheet */}
            <SceneVideo scene="brush" poster="brush-start" progress={paint} />

            <div className="path-text">
              <h2 id="now-title">{t('title')}</h2>
              <p className="path-sub">{t('subtitle')}</p>

              <ol>
                {items.map((item, i) => (
                  <Entry
                    key={item.org}
                    item={item}
                    // The line reaches entry i a little after it starts, in step with its place in the list
                    at={LINE_FROM + (LINE_TO - LINE_FROM) * ((i + 0.4) / items.length)}
                    progress={scrollYProgress}
                    still={!!reduce}
                  />
                ))}
              </ol>
            </div>
          </div>
        </div>

        <ParisClock />
      </div>
    </section>
  );
}

function Entry({
  item,
  at,
  progress,
  still
}: {
  item: Item;
  at: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const opacity = useScrollRange(progress, [at - 0.04, at + 0.02], [0, 1]);

  return (
    <motion.li style={{ opacity: still ? 1 : opacity }}>
      <p className="path-period">{item.period}</p>
      <h3>
        {item.org}
        {item.place && <span className="opacity-60">, {item.place}</span>}
      </h3>
      <p className="path-role">{item.role}</p>
      {item.points.length > 0 && <p className="path-points">{item.points.join(', ')}</p>}
    </motion.li>
  );
}
