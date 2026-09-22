'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GoldDust } from '@/components/motifs/GoldDust';
import { useScrollRange } from '@/lib/useScrollRange';

/** 4 columns × 7 rows of gold studs per leaf. */
const STUDS = Array.from({ length: 28 }, (_, i) => i);
/** How far each leaf swings inward, in degrees. Past 90° the leaf is edge-on. */
const OPEN_ANGLE = 100;

/**
 * Palace gate between Act III and the Correspondance.
 *
 * Scroll-bound, pinned for ~160vh. Three phases on scrollYProgress:
 *   0.00 – 0.12  the gate settles into place
 *   0.12 – 0.55  both leaves swing inward, the room's light spills out
 *   0.70 – 0.92  the floor glow dies so the wash meets the next section flat
 *   0.50 – 1.00  the camera pushes through the doorway; the frame dissolves
 *                and a full-viewport wash hands off to the next section
 *
 * The wash is the mirror of the Correspondance background (bright at the seam),
 * so the release of the sticky container reads as continuous light.
 */
export function Gate() {
  const t = useTranslations('gate');
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const settle = useScrollRange(scrollYProgress, [0, 0.12], [0.94, 1]);
  const push = useScrollRange(scrollYProgress, [0.5, 1], [1, 3.4]);
  const scale = useTransform([settle, push], (v: number[]) => (v[0] ?? 1) * (v[1] ?? 1));
  const leftOpen = useScrollRange(scrollYProgress, [0.12, 0.55], [0, OPEN_ANGLE]);
  const rightOpen = useScrollRange(scrollYProgress, [0.12, 0.55], [0, -OPEN_ANGLE]);
  const light = useScrollRange(scrollYProgress, [0.12, 0.5], [0, 1]);
  const floor = useScrollRange(scrollYProgress, [0.12, 0.5, 0.7, 0.92], [0, 1, 1, 0]);
  const frameOpacity = useScrollRange(scrollYProgress, [0.78, 0.95], [1, 0]);
  const wash = useScrollRange(scrollYProgress, [0.62, 0.92], [0, 1]);
  const caption = useScrollRange(scrollYProgress, [0.05, 0.22], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label={t('kicker')}
      className="relative"
      style={{ height: reduce ? '100vh' : '260vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Room light: takes over the viewport during the push-through */}
        <motion.div
          aria-hidden="true"
          className="gate-wash absolute inset-0 pointer-events-none"
          style={{ opacity: reduce ? 0 : wash }}
        />

        {/* Light spilling on the floor in front of the doorway */}
        <motion.div
          aria-hidden="true"
          className="gate-floor absolute left-1/2 -translate-x-1/2 bottom-0 w-[160%] h-1/2 pointer-events-none"
          style={{ opacity: reduce ? 1 : floor }}
        />

        {/* Captions */}
        <motion.div
          className="absolute top-24 inset-x-0 text-center kicker pointer-events-none"
          style={{ opacity: reduce ? 1 : caption }}
        >
          {t('kicker')}
        </motion.div>
        <motion.div
          className="absolute bottom-10 inset-x-0 text-center pointer-events-none"
          style={{ opacity: reduce ? 0 : caption }}
        >
          <span className="kicker-mono opacity-60">↓ {t('label')}</span>
        </motion.div>

        {/* Stage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="gate relative"
            style={{
              scale: reduce ? 1 : scale,
              opacity: reduce ? 1 : frameOpacity,
              transformOrigin: '50% 56%'
            }}
          >
            <div aria-hidden="true" className="gate-roof" />
            <div aria-hidden="true" className="gate-lintel" />
            <div aria-hidden="true" className="gate-plaque font-display-hanzi">
              入
            </div>

            <div className="gate-doorway">
              {/* What lies beyond the doors */}
              <motion.div
                aria-hidden="true"
                className="gate-light absolute inset-0"
                style={{ opacity: reduce ? 1 : light }}
              >
                <GoldDust count={18} />
              </motion.div>

              {/* The two leaves */}
              <div className="gate-leaves absolute inset-0">
                <div className="flex w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                  <motion.div
                    aria-hidden="true"
                    className="gate-leaf gate-leaf-left"
                    style={{ rotateY: reduce ? OPEN_ANGLE : leftOpen }}
                  >
                    <Studs />
                    <span className="gate-ring" />
                  </motion.div>
                  <motion.div
                    aria-hidden="true"
                    className="gate-leaf gate-leaf-right"
                    style={{ rotateY: reduce ? -OPEN_ANGLE : rightOpen }}
                  >
                    <Studs />
                    <span className="gate-ring" />
                  </motion.div>
                </div>
              </div>
            </div>

            <div aria-hidden="true" className="gate-post gate-post-left" />
            <div aria-hidden="true" className="gate-post gate-post-right" />
            <div aria-hidden="true" className="gate-sill" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Studs() {
  return (
    <span aria-hidden="true" className="gate-studs">
      {STUDS.map((i) => (
        <span key={i} className="gate-stud" />
      ))}
    </span>
  );
}
