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
 * Cinema title-card transition (fade au noir — Wes Anderson pacing).
 *
 * Timeline (in seconds, parallel with the scroll snap-lock):
 *   0.00 - 0.80   screen fades to black slowly (snap-scroll runs underneath)
 *   0.80 - 1.30   title group lifts in (hanzi, kicker, name, divider, tag)
 *   1.30 - 2.80   HOLD (1.5s — the moment, time to read and breathe)
 *   2.80 - 3.20   title group fades out + lifts up 8px
 *   3.20 - 3.80   black overlay dissolves back to reveal the section
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
        <TitleCard
          hanzi={hanzi}
          kicker={kicker}
          name={name}
          subtitle={subtitle}
          static
        />
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
      {/* === BLACK OVERLAY — slow fade in (~0.8s), long hold, slow fade out (~0.6s) === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [0, 1, 1, 0] } : false}
        transition={{
          duration: 3.8,
          times: [0, 0.21, 0.84, 1],
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
          duration: 3.8,
          times: [0, 0.21, 0.34, 0.74, 0.84],
          ease: 'easeInOut'
        }}
        className="relative z-40"
      >
        <TitleCard
          hanzi={hanzi}
          kicker={kicker}
          name={name}
          subtitle={subtitle}
          play={play}
        />
      </motion.div>
    </section>
  );
}

/* ============================================================ */

function TitleCard({
  hanzi,
  kicker,
  name,
  subtitle,
  play = false,
  static: isStatic = false
}: {
  hanzi: string;
  kicker: string;
  name: string;
  subtitle?: string;
  play?: boolean;
  static?: boolean;
}) {
  return (
    <div className="text-center px-6">
      {/* Hanzi — Tang anchor, sits above the Latin chapter number */}
      <div
        className="font-display-hanzi text-[var(--color-gold-bright)]"
        style={{
          fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
          lineHeight: 1,
          marginBottom: '0.85rem',
          textShadow: '0 0 18px rgba(233,196,106,0.4)'
        }}
      >
        {hanzi}
      </div>

      {/* Kicker (small mono, wide-spaced) — Latin chapter number */}
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
          duration: 3.8,
          times: [0, 0.28, 0.40, 0.74, 0.84],
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
