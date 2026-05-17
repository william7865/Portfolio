'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/lenisInstance';

const PLAY_DURATION_MS = 2900;
const SNAP_DURATION_S = 0.7;

type Props = {
  hanzi: string;
  label: string;
  /** Short epigraph rendered as `— subtitle —` below the divider. Optional. */
  subtitle?: string;
};

/**
 * Cinema title-card transition (cut au noir).
 *
 * Timeline (in seconds, parallel with the scroll snap-lock):
 *   0.00   snap-scroll begins, black overlay cuts in (~0.15s)
 *   0.65   title group lifts in (kicker, name, divider, tag) as one block
 *   0.85   divider scaleX starts drawing
 *   1.50   HOLD (1s of breathing room)
 *   2.10   title group fades out + lifts
 *   2.40   black overlay fades out
 *   2.90   section revealed, Lenis released
 *
 * `once: true` — re-entering the section never replays the cut.
 */
export function ActCurtain({ hanzi: _hanzi, label, subtitle }: Props) {
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
        <TitleCard kicker={kicker} name={name} subtitle={subtitle} static />
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
      {/* === BLACK OVERLAY — fast cut in, hold, fade out === */}
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

      {/* === TITLE CARD === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={
          play
            ? { opacity: [0, 0, 1, 1, 0], y: [12, 12, 0, 0, -8] }
            : false
        }
        transition={{
          duration: 2.9,
          times: [0, 0.22, 0.36, 0.72, 0.86],
          ease: 'easeInOut'
        }}
        className="relative z-40"
      >
        <TitleCard kicker={kicker} name={name} subtitle={subtitle} play={play} />
      </motion.div>
    </section>
  );
}

/* ============================================================ */

function TitleCard({
  kicker,
  name,
  subtitle,
  play = false,
  static: isStatic = false
}: {
  kicker: string;
  name: string;
  subtitle?: string;
  play?: boolean;
  static?: boolean;
}) {
  return (
    <div className="text-center px-6">
      {/* Kicker (small mono, wide-spaced) */}
      <div
        className="font-mono uppercase text-[var(--color-gold)]"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.42em',
          opacity: 0.7,
          marginBottom: '1.3rem'
        }}
      >
        {kicker}
      </div>

      {/* Big italic name */}
      <h2
        className="font-display italic font-light text-[var(--color-ivory)] leading-none"
        style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          letterSpacing: '-0.02em'
        }}
      >
        <em style={{ color: 'var(--color-gold-bright)' }}>{name}</em>
      </h2>

      {/* Divider — grows from the center as part of the title group */}
      <motion.div
        aria-hidden="true"
        initial={isStatic ? false : { scaleX: 0 }}
        animate={!isStatic && play ? { scaleX: [0, 0, 1, 1, 0] } : false}
        transition={{
          duration: 2.9,
          times: [0, 0.30, 0.45, 0.70, 0.85],
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mx-auto mt-7 w-24 h-px origin-center"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-gold-bright) 50%, transparent 100%)',
          boxShadow: '0 0 6px rgba(233,196,106,0.5)',
          transform: isStatic ? 'scaleX(1)' : undefined
        }}
      />

      {/* Subtitle tag — flanked by em-dashes, italic */}
      {subtitle && (
        <div
          className="font-display italic text-[var(--color-gold-bright)] mt-5"
          style={{
            fontSize: '0.95rem',
            opacity: 0.65,
            letterSpacing: '0.01em'
          }}
        >
          — {subtitle} —
        </div>
      )}
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
