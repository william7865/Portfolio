'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/lenisInstance';

const PLAY_DURATION_MS = 2900;
const SNAP_DURATION_S = 0.7;

type Props = {
  hanzi: string;
  label: string;
  /** Kept for API compatibility, currently unused by the blackout cut. */
  subtitle?: string;
};

/**
 * Cinema title-card transition between acts.
 *
 * Timeline (seconds from the in-view trigger; runs in parallel with the snap):
 *   0.00   snap-scroll begins, black overlay cuts in (~0.15s)
 *   0.40   hanzi appears
 *   0.55   kicker (mono) appears
 *   0.75   big italic title appears
 *   1.00   gold divider draws across
 *   1.30   corner BLACKOUT tag fades in
 *   1.50   HOLD (everything visible, breathing)
 *   2.20   title group fades out
 *   2.40   black overlay fades out
 *   2.90   section revealed, Lenis released, user free to scroll
 *
 * `once: true` — re-entering the section never replays the cut.
 */
export function ActCurtain({ hanzi, label }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const playedRef = useRef(false);
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(false);
  const { kicker, name } = splitLabel(label);

  useEffect(() => {
    const section = ref.current;
    if (!section || playedRef.current) return;
    if (reduce) return;

    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const fire = () => {
      if (playedRef.current) return;
      playedRef.current = true;

      const rect = section.getBoundingClientRect();
      const lenis = getLenis();
      const tooLateToSnap = rect.top < 50;

      if (isTouch || !lenis || tooLateToSnap) {
        setPlay(true);
        return;
      }

      lenis.stop();
      setPlay(true);
      lenis.scrollTo(section, {
        duration: SNAP_DURATION_S,
        force: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          window.setTimeout(
            () => lenis.start(),
            PLAY_DURATION_MS - SNAP_DURATION_S * 1000
          );
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            fire();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0.5] }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduce]);

  if (reduce) {
    return (
      <section
        ref={ref}
        className="relative min-h-screen overflow-hidden flex items-center justify-center bg-black"
        aria-label={label}
      >
        <TitleStack hanzi={hanzi} kicker={kicker} name={name} animated={false} />
        <CornerTag animated={false} />
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center justify-center isolate"
      aria-label={label}
      style={{
        background:
          'radial-gradient(70% 90% at 50% 50%, #1a0204 0%, #0a0102 100%)'
      }}
    >
      {/* === BLACK OVERLAY — cut in fast, hold, fade out === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [1, 1, 0] } : false}
        transition={{
          duration: 2.9,
          times: [0.05, 0.83, 1],
          ease: 'easeInOut'
        }}
        className="absolute inset-0 bg-black z-30 pointer-events-none"
      />

      {/* === TITLE STACK — z-40, fades out before the black opens === */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={play ? { opacity: 0 } : false}
        transition={{ delay: 2.2, duration: 0.45, ease: 'easeOut' }}
        className="relative z-40"
      >
        <TitleStack hanzi={hanzi} kicker={kicker} name={name} animated />
      </motion.div>

      {/* === CORNER TAG (Tang signature) === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [0, 0, 0.4, 0.4, 0] } : false}
        transition={{
          duration: 2.9,
          times: [0, 0.42, 0.55, 0.74, 0.83],
          ease: 'easeInOut'
        }}
        className="absolute bottom-6 right-7 z-40 pointer-events-none"
      >
        <CornerTag animated />
      </motion.div>
    </section>
  );
}

/* ============================================================ */

function TitleStack({
  hanzi,
  kicker,
  name,
  animated
}: {
  hanzi: string;
  kicker: string;
  name: string;
  animated: boolean;
}) {
  const inner = (delay: number) =>
    animated
      ? {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            delay,
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
          }
        }
      : { initial: false, animate: false, transition: undefined };

  return (
    <div className="text-center px-6">
      {/* Hanzi */}
      <motion.div
        {...inner(0.4)}
        className="font-display-hanzi text-[var(--color-gold-bright)] mb-5"
        style={{
          fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
          lineHeight: 1,
          opacity: animated ? undefined : 0.85,
          textShadow: '0 0 16px rgba(233,196,106,0.35)'
        }}
      >
        {hanzi}
      </motion.div>

      {/* Kicker (small mono) */}
      <motion.div
        {...inner(0.55)}
        className="font-mono uppercase text-[var(--color-gold)] mb-7"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.42em',
          opacity: animated ? undefined : 0.65
        }}
      >
        {kicker}
      </motion.div>

      {/* Big italic name */}
      <motion.h2
        {...inner(0.75)}
        className="font-display italic font-light text-[var(--color-ivory)] leading-none"
        style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          letterSpacing: '-0.02em'
        }}
      >
        <em style={{ color: 'var(--color-gold-bright)' }}>{name}</em>
      </motion.h2>

      {/* Divider */}
      <motion.div
        aria-hidden="true"
        initial={animated ? { scaleX: 0 } : false}
        animate={animated ? { scaleX: 1 } : false}
        transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-7 w-24 h-px origin-center"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-gold-bright) 50%, transparent 100%)',
          boxShadow: '0 0 6px rgba(233,196,106,0.45)'
        }}
      />
    </div>
  );
}

function CornerTag({ animated }: { animated: boolean }) {
  return (
    <div
      className="flex items-baseline gap-2 font-mono text-[var(--color-gold)]"
      style={{
        fontSize: '0.55rem',
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        opacity: animated ? undefined : 0.35
      }}
    >
      <span
        className="font-display-hanzi"
        style={{ fontSize: '0.78rem', letterSpacing: 0 }}
      >
        暗轉
      </span>
      <span>Blackout</span>
    </div>
  );
}

/** "ACT I · WORKS" -> { kicker: "ACT I", name: "Works" } */
function splitLabel(label: string): { kicker: string; name: string } {
  const parts = label.split('·').map((s) => s.trim());
  if (parts.length < 2) return { kicker: label, name: '' };
  const upper = parts[1] ?? '';
  const name = upper
    .split(' ')
    .map((w) => (w ? w.charAt(0) + w.slice(1).toLowerCase() : w))
    .join(' ');
  return { kicker: parts[0] ?? '', name };
}
