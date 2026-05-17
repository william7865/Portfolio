'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/lenisInstance';

/** Total length of the curtain choreography, in milliseconds.
 *  Matches the latest motion delay+duration (subtitle lands at 2.2 + 0.5 = 2.7s). */
const PLAY_DURATION_MS = 2900;
/** Duration of the snap-to-top scroll, in seconds. */
const SNAP_DURATION_S = 0.7;
/** Weighted ease — slow lift, steady mid, gentle settle. Mimics counterweight rigging. */
const RISE_EASE: [number, number, number, number] = [0.7, 0, 0.2, 1];

type Props = {
  hanzi: string;
  label: string;
  /** Optional subtitle below the act marker. */
  subtitle?: string;
};

/**
 * Theatrical act transition with scroll lock — when the section reaches 50%
 * visible the page snap-scrolls to its top, the scroll wheel is paused for the
 * length of the choreography, then released.
 *
 * Timeline (seconds from the trigger; runs in parallel with the snap-scroll):
 *   0.0   snap-scroll starts, ember pulses, curtain shut
 *   0.3   stage bloom grows, spotlight fades in
 *   0.5   curtain rises (1.0s), letterbox bars close, ember fades
 *   0.7   snap-scroll lands
 *   1.1   text revealed via clip-path opening from the center
 *   1.95  underline draws, label characters cascade from the middle
 *   2.2   subtitle fades in
 *   2.7   scene settled — Lenis resumes, user may scroll freely
 *
 * The trigger fires once per section per page load. Reduced-motion and touch
 * devices skip the snap+lock and fall back to a plain auto-play (or static
 * scene under prefers-reduced-motion).
 */
export function ActCurtain({ hanzi, label, subtitle }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const playedRef = useRef(false);
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const section = ref.current;
    if (!section || playedRef.current) return;

    if (reduce) {
      // Reduced motion: never animate, never lock.
      return;
    }

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
        // No hijacking: just play the animation in place.
        setPlay(true);
        return;
      }

      // Snap to the section top, lock the wheel, run the animation in parallel,
      // then release after the full choreography has played out.
      lenis.stop();
      setPlay(true);
      lenis.scrollTo(section, {
        duration: SNAP_DURATION_S,
        force: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
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
        className="relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, var(--color-vermillion-bright) 0%, var(--color-vermillion-deep) 80%)'
        }}
        aria-label={label}
      >
        <div className="relative z-10 text-center px-6">
          <div className="act-marker">{hanzi}</div>
          <div className="kicker mt-6">{label}</div>
          {subtitle && (
            <div className="lede italic mt-3 text-[var(--color-gold-bright)] opacity-70 max-w-md mx-auto">
              {subtitle}
            </div>
          )}
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
          'radial-gradient(70% 90% at 50% 50%, #1a0204 0%, var(--color-ink-dark) 70%, #0a0102 100%)'
      }}
    >
      {/* === BACKSTAGE: faint vertical floorboards / atmosphere === */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 80px)'
        }}
      />

      {/* === STAGE FLOOR LINE === */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: '32%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 30%, rgba(233,196,106,0.55) 50%, rgba(212,175,55,0.35) 70%, transparent 100%)',
          filter: 'blur(0.4px)'
        }}
      />

      {/* === STAGE LIGHT BLOOM (radial halo at center) === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.22 }}
        animate={play ? { opacity: 0.95, scale: 1.55 } : false}
        transition={{ delay: 0.3, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '85vmin',
            height: '85vmin',
            background:
              'radial-gradient(closest-side, rgba(233,196,106,0.58) 0%, rgba(233,196,106,0.28) 28%, rgba(212,175,55,0.10) 55%, transparent 78%)',
            filter: 'blur(8px)'
          }}
        />
      </motion.div>

      {/* === SPOTLIGHT CONE (from above) === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scaleY: 0.85 }}
        animate={play ? { opacity: 0.8, scaleY: 1 } : false}
        transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none origin-top"
      >
        <div
          style={{
            width: '60vmin',
            height: '95vh',
            background:
              'linear-gradient(180deg, rgba(233,196,106,0.22) 0%, rgba(233,196,106,0.10) 35%, rgba(233,196,106,0.04) 65%, transparent 100%)',
            clipPath: 'polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(14px)',
            animation: 'spotlight-flicker 6s ease-in-out infinite'
          }}
        />
      </motion.div>

      {/* === CENTER-SEAM EMBER (visible before curtain rises) === */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={play ? { opacity: 0 } : false}
        transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 pointer-events-none z-[5]"
      >
        <div
          style={{
            width: '12px',
            height: '70vh',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(233,196,106,0.55) 35%, rgba(255,221,140,0.9) 50%, rgba(233,196,106,0.55) 65%, transparent 100%)',
            filter: 'blur(6px)',
            transform: 'translate(-50%, -50%)',
            animation: 'ember-pulse 3.2s ease-in-out infinite'
          }}
        />
      </motion.div>

      {/* === DRIFTING DUST IN THE STAGE LIGHT === */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {DUST.map((p, i) => (
          <span
            key={i}
            className="gold-dust"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: 0.55
            }}
          />
        ))}
      </div>

      {/* ====================================================== */}
      {/*  TEXT LAYER — z-20, BEHIND curtain (z-30), revealed     */}
      {/*  via clip-path as the curtain rises off-stage           */}
      {/* ====================================================== */}
      <motion.div
        initial={{
          opacity: 0,
          y: 42,
          scale: 0.92,
          clipPath: 'inset(0% 50% 0% 50%)'
        }}
        animate={
          play
            ? {
                opacity: 1,
                y: 0,
                scale: 1.05,
                clipPath: 'inset(0% 0% 0% 0%)'
              }
            : false
        }
        transition={{ delay: 1.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 text-center px-6 will-change-transform"
      >
        {/* Hanzi with golden halo + stage-floor reflection */}
        <div className="relative inline-block">
          <span
            className="act-marker block"
            style={{
              filter: 'drop-shadow(0 0 36px rgba(233, 196, 106, 0.5))'
            }}
          >
            {hanzi}
          </span>
          {/* Reflection on the stage floor */}
          <span
            aria-hidden="true"
            className="act-marker absolute left-0 right-0 pointer-events-none select-none"
            style={{
              top: '100%',
              opacity: 0.22,
              transform: 'scaleY(-0.45)',
              transformOrigin: 'top center',
              WebkitMaskImage:
                'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 85%)',
              maskImage:
                'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 85%)',
              filter: 'blur(1px)'
            }}
          >
            {hanzi}
          </span>
        </div>

        {/* Staggered label — characters cascade open from the middle */}
        <div className="kicker mt-10 flex justify-center" aria-label={label}>
          {label.split('').map((c, i, arr) => (
            <StaggerChar
              key={i}
              char={c}
              index={i}
              total={arr.length}
              play={play}
            />
          ))}
        </div>

        {/* Underline bar grows from center */}
        <motion.div
          aria-hidden="true"
          className="mx-auto mt-4 h-px w-32 origin-center"
          initial={{ scaleX: 0 }}
          animate={play ? { scaleX: 1 } : false}
          transition={{ delay: 2.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--color-gold) 30%, var(--color-gold-bright) 50%, var(--color-gold) 70%, transparent 100%)',
            boxShadow: '0 0 8px rgba(233, 196, 106, 0.55)'
          }}
        />

        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={play ? { opacity: 0.8, y: 0 } : false}
            transition={{ delay: 2.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lede italic mt-5 text-[var(--color-gold-bright)] max-w-md mx-auto"
          >
            {subtitle}
          </motion.div>
        )}
      </motion.div>

      {/* ====================================================== */}
      {/*  CURTAIN PANELS — z-30, rise upward off-stage           */}
      {/* ====================================================== */}
      <CurtainPanel side="left" play={play} />
      <CurtainPanel side="right" play={play} />

      {/* === TOP VALANCE — fixed scenery (does not rise) === */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none"
      >
        {/* Brass rod */}
        <div
          className="relative h-3.5"
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold-deep) 0%, var(--color-gold) 40%, var(--color-gold-bright) 55%, var(--color-gold) 70%, var(--color-gold-deep) 100%)',
            boxShadow:
              '0 6px 20px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(0,0,0,0.4)'
          }}
        >
          {/* Acorn finials at the ends of the rod */}
          <span className="finial-acorn -left-2.5 -top-2" />
          <span className="finial-acorn -right-2.5 -top-2" />
        </div>

        {/* Brocade pelmet — taller, with central medallion + dougong teeth */}
        <div className="pelmet-body">
          <span className="pelmet-trim-top" />
          {/* Damask brocade overlay */}
          <div className="absolute inset-0 curtain-damask opacity-[0.22] mix-blend-overlay" />
          {/* Central gold medallion with 幕 (curtain) hanzi */}
          <span className="pelmet-medallion">幕</span>
          {/* Dougong teeth at the bottom */}
          <div className="curtain-pelmet absolute bottom-0 left-0 right-0 h-3.5" />
        </div>
      </div>

      {/* === LETTERBOX BARS (cinematic — close and stay) === */}
      <motion.div
        aria-hidden="true"
        initial={{ height: 0 }}
        animate={play ? { height: 48 } : false}
        transition={{ delay: 0.5, duration: 0.55, ease: [0.65, 0.05, 0.36, 1] }}
        className="absolute left-0 right-0 top-0 bg-[var(--color-ink-dark)] pointer-events-none z-30"
      />
      <motion.div
        aria-hidden="true"
        initial={{ height: 0 }}
        animate={play ? { height: 48 } : false}
        transition={{ delay: 0.5, duration: 0.55, ease: [0.65, 0.05, 0.36, 1] }}
        className="absolute left-0 right-0 bottom-0 bg-[var(--color-ink-dark)] pointer-events-none z-30"
      />
    </section>
  );
}

/* ============================================================ */
/* Sub-components                                                */
/* ============================================================ */

function CurtainPanel({ side, play }: { side: 'left' | 'right'; play: boolean }) {
  const isLeft = side === 'left';
  /* Italian-rise: mostly vertical lift, only a 5% horizontal drift for theatricality. */
  const targetX = isLeft ? '-5%' : '5%';
  /* Asymmetric stagger — left panel begins 60 ms before right, so the rise reads as
     two rigged ropes catching one after the other rather than a single mechanical lift. */
  const startDelay = isLeft ? 0.45 : 0.51;
  const innerShadow = isLeft
    ? 'inset -60px 0 110px rgba(0,0,0,0.65), inset 0 -70px 80px rgba(0,0,0,0.5), inset 0 80px 90px rgba(0,0,0,0.6)'
    : 'inset 60px 0 110px rgba(0,0,0,0.65), inset 0 -70px 80px rgba(0,0,0,0.5), inset 0 80px 90px rgba(0,0,0,0.6)';

  return (
    <motion.div
      aria-hidden="true"
      initial={{ y: '0%', x: '0%', scale: 1 }}
      animate={
        play
          ? {
              /* Keyframes: tiny initial tug, main rise, gentle settle bounce */
              y: ['0%', '-1.5%', '-120%', '-117%', '-119%'],
              x: ['0%', '0%', targetX, targetX, targetX],
              scale: [1, 1, 1.04, 1.045, 1.04]
            }
          : false
      }
      transition={{
        delay: startDelay,
        duration: 1.35,
        times: [0, 0.08, 0.86, 0.93, 1],
        ease: RISE_EASE
      }}
      className={`absolute top-0 bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-1/2 pointer-events-none will-change-transform z-30`}
    >
      <div
        className="relative w-full h-full"
        style={{ boxShadow: innerShadow }}
      >
        {/* === Velvet body: layered folds + footlight + base vermilion === */}
        <div className={isLeft ? 'curtain-fabric-l' : 'curtain-fabric-r'} />

        {/* === Tang cloud-scroll damask === */}
        <div className="absolute inset-0 curtain-damask opacity-[0.22] mix-blend-overlay pointer-events-none" />

        {/* === Fractal noise grain (true velvet texture) === */}
        <div className="curtain-grain" aria-hidden="true" />

        {/* === Outer gold trim === */}
        <div
          className={`absolute top-0 bottom-0 w-1.5 ${isLeft ? 'left-0' : 'right-0'}`}
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-deep) 50%, var(--color-gold) 100%)',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)'
          }}
        />

        {/* === Inner gold trim (catches stage light) + halo === */}
        <div
          className={`absolute top-0 bottom-0 w-[3px] ${isLeft ? 'right-0' : 'left-0'} z-[1]`}
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-bright) 45%, #fff3c5 55%, var(--color-gold-bright) 70%, var(--color-gold-deep) 100%)',
            boxShadow: '0 0 12px rgba(255,235,180,0.6), 0 0 24px rgba(233,196,106,0.35)'
          }}
        />
        {/* Soft halo bleed inward */}
        <div
          className={`curtain-inner-glow absolute top-[20%] bottom-[15%] w-[40px] pointer-events-none ${isLeft ? 'right-0' : 'left-0'}`}
          aria-hidden="true"
        />

        {/* === Bottom hem === */}
        <div
          className="absolute left-0 right-0 bottom-3 h-2 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)'
          }}
        />

        {/* === Premium tassels along bottom === */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-around px-4 z-[2]">
          {Array.from({ length: 7 }).map((_, i) => (
            <Tassel key={i} alt={(i + (isLeft ? 0 : 1)) % 2 === 0} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Tassel({ alt = false }: { alt?: boolean }) {
  return (
    <div
      className="relative"
      style={{
        width: '14px',
        height: '78px',
        transformOrigin: 'top center',
        animation: `${alt ? 'tassel-sway-alt' : 'tassel-sway'} ${3.4 + (alt ? 0.7 : 0)}s ease-in-out infinite`
      }}
    >
      {/* Cord hanging from the curtain hem */}
      <div className="tassel-cord absolute left-1/2 -translate-x-1/2 top-0 w-px h-[18px]" />
      {/* Brass cap (dome where cord enters the head) */}
      <div className="tassel-cap absolute left-1/2 -translate-x-1/2 top-[16px] w-[10px] h-[5px]" />
      {/* Turk's-head knot (gold band binding the head) */}
      <div className="tassel-knot absolute left-1/2 -translate-x-1/2 top-[20px] w-[12px] h-[3px]" />
      {/* Silk-wrapped bombed head */}
      <div className="tassel-head absolute left-1/2 -translate-x-1/2 top-[22px] w-[12px] h-[16px]" />
      {/* Bullion fringe (long gold-thread skirt) */}
      <div className="tassel-fringe absolute left-1/2 -translate-x-1/2 top-[37px] w-[14px] h-[34px]" />
    </div>
  );
}

function StaggerChar({
  char,
  index,
  total,
  play
}: {
  char: string;
  index: number;
  total: number;
  play: boolean;
}) {
  // Cascade from the middle outward: distance-from-center drives delay.
  const middle = (total - 1) / 2;
  const dist = Math.abs(index - middle) / Math.max(middle, 1);
  const delay = 2.15 + dist * 0.045;
  return (
    <motion.span
      initial={{ opacity: 0, y: 14 }}
      animate={play ? { opacity: 1, y: 0 } : false}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'inline-block' }}
      className="will-change-transform"
    >
      {char === ' ' ? ' ' : char}
    </motion.span>
  );
}

/* Deterministic dust particle layout — avoids hydration mismatches */
const DUST = Array.from({ length: 18 }, (_, i) => {
  const left = (i * 7.7 + 4) % 100;
  const delay = (i * 0.91) % 8;
  const duration = 7 + ((i * 1.3) % 5);
  const size = 2 + ((i * 0.7) % 2);
  return { left, delay, duration, size };
});
