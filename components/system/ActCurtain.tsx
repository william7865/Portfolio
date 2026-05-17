'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/lenisInstance';

const PLAY_DURATION_MS = 3800;
const SNAP_DURATION_S = 0.7;

type Props = {
  hanzi: string;
  label: string;
  /** Short epigraph rendered as `— subtitle —` below the divider. Optional. */
  subtitle?: string;
};

/**
 * Two-phase cinema title card (Wes Anderson / Bertolucci pacing).
 *
 * Phase 1 — Latin introduction (kicker + name + divider + subtitle).
 * Phase 2 — Hanzi ceremonial finale (大 first frame, then transitions to scene).
 *
 * Timeline (in seconds, parallel with the scroll snap-lock):
 *   0.00 - 0.70   screen fades to black slowly
 *   0.70 - 1.00   Latin card lifts in
 *   1.00 - 1.60   HOLD Latin (~0.6s — read the chapter and name)
 *   1.60 - 1.80   Latin card fades out + lifts up
 *   1.80 - 2.00   beat of pure black (the breath between phases)
 *   2.00 - 2.30   hanzi rises in (large, ceremonial)
 *   2.30 - 3.20   HOLD hanzi (0.9s — the Tang moment)
 *   3.20 - 3.40   hanzi fades out + lifts up
 *   3.40 - 3.80   black dissolves back to reveal the section
 *
 * `once: true` — re-entering the section never replays the cut.
 */
export function ActCurtain({ hanzi, label, subtitle }: Props) {
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
        <div className="text-center px-6 space-y-8">
          <HanziCard hanzi={hanzi} />
          <LatinCard kicker={kicker} name={name} subtitle={subtitle} />
        </div>
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
      {/* === BLACK OVERLAY — slow fade in, long hold across both phases, slow fade out === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [0, 1, 1, 0] } : false}
        transition={{
          duration: 3.8,
          times: [0, 0.18, 0.89, 1],
          ease: 'easeInOut'
        }}
        className="absolute inset-0 bg-black z-30 pointer-events-none"
      />

      {/* === PHASE 1 — Latin card: kicker · name · divider · subtitle === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={
          play
            ? { opacity: [0, 0, 1, 1, 0], y: [12, 12, 0, 0, -8] }
            : false
        }
        transition={{
          duration: 3.8,
          times: [0, 0.18, 0.26, 0.42, 0.47],
          ease: 'easeInOut'
        }}
        className="absolute inset-0 grid place-items-center z-40 pointer-events-none"
      >
        <LatinCard
          kicker={kicker}
          name={name}
          subtitle={subtitle}
          play={play}
        />
      </motion.div>

      {/* === PHASE 2 — Hanzi finale: large, alone, ceremonial === */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={
          play
            ? { opacity: [0, 0, 1, 1, 0], y: [16, 16, 0, 0, -10] }
            : false
        }
        transition={{
          duration: 3.8,
          times: [0, 0.53, 0.61, 0.84, 0.89],
          ease: 'easeInOut'
        }}
        className="absolute inset-0 grid place-items-center z-40 pointer-events-none"
      >
        <HanziCard hanzi={hanzi} />
      </motion.div>
    </section>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function LatinCard({
  kicker,
  name,
  subtitle,
  play
}: {
  kicker: string;
  name: string;
  subtitle?: string;
  play?: boolean;
}) {
  return (
    <div className="text-center px-6">
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

      <h2
        className="font-display italic font-light text-[var(--color-ivory)] leading-none"
        style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          letterSpacing: '-0.02em'
        }}
      >
        <em style={{ color: 'var(--color-gold-bright)' }}>{name}</em>
      </h2>

      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={play ? { scaleX: [0, 0, 1, 1, 0] } : false}
        transition={{
          duration: 3.8,
          times: [0, 0.22, 0.30, 0.42, 0.47],
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mx-auto mt-7 w-24 h-px origin-center"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-gold-bright) 50%, transparent 100%)',
          boxShadow: '0 0 6px rgba(233,196,106,0.5)'
        }}
      />

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

function HanziCard({ hanzi }: { hanzi: string }) {
  return (
    <div
      className="font-display-hanzi text-center text-[var(--color-gold-bright)]"
      style={{
        fontSize: 'clamp(6rem, 14vw, 12rem)',
        lineHeight: 1,
        letterSpacing: '0.08em',
        textShadow:
          '0 0 40px rgba(233,196,106,0.5), 0 0 80px rgba(233,196,106,0.25)',
        filter: 'drop-shadow(0 0 30px rgba(233,196,106,0.3))'
      }}
    >
      {hanzi}
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
