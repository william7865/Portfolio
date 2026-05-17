'use client';

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue
} from 'framer-motion';
import { useRef } from 'react';

type Props = {
  hanzi: string;
  label: string;
  /** Optional subtitle below the act marker. */
  subtitle?: string;
};

/**
 * Theatrical act transition.
 *
 * Choreography (scrollYProgress 0 -> 1):
 *   0.00 - 0.18  closed curtain, a faint ember leaks through the center seam
 *   0.18 - 0.55  curtains rise upward (y -120%) and slightly part (x +/-10%)
 *                tassels lift with them, spotlight bloom grows
 *   0.42 - 0.62  text is revealed BEHIND the rising curtain via clip-path
 *                opening from the center outward — synced to the rise climax
 *   0.50 - 0.78  letter-by-letter label stagger, underline bar grows
 *   0.78 - 1.00  text fades, letterbox bars open back, stage rests
 */
export function ActCurtain({ hanzi, label, subtitle }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // ===== CURTAIN MOTION =====
  // Primary: rise upward off-stage. Secondary: subtle outward sway (the ropes pull).
  // Timing: curtain is fully off-stage by 0.38 so the reveal lands when the
  // section reaches the centre of the viewport (~0.5), not after it leaves.
  const curtainY     = useTransform(scrollYProgress, [0.08, 0.38], ['0%', '-118%']);
  const leftX        = useTransform(scrollYProgress, [0.08, 0.38], ['0%', '-12%']);
  const rightX       = useTransform(scrollYProgress, [0.08, 0.38], ['0%', '12%']);
  const curtainScale = useTransform(scrollYProgress, [0.08, 0.38], [1, 1.04]);

  // ===== STAGE LIGHT BLOOM =====
  const bloomScale   = useTransform(scrollYProgress, [0.02, 0.45],            [0.22, 1.6]);
  const bloomOpacity = useTransform(scrollYProgress, [0.0,  0.22, 0.88, 1.0], [0, 0.95, 1, 0.5]);

  // ===== SPOTLIGHT CONE (from above onto the text) =====
  const spotOpacity = useTransform(scrollYProgress, [0.20, 0.40, 0.88, 1.0], [0, 0.85, 0.75, 0.25]);
  const spotScale   = useTransform(scrollYProgress, [0.20, 0.50],            [0.85, 1]);

  // ===== LETTERBOX BARS =====
  const barHeight = useTransform(
    scrollYProgress,
    [0.22, 0.38, 0.82, 0.94],
    ['0px', '48px', '48px', '0px']
  );

  // ===== TEXT REVEAL (peak right at section centre, long hold) =====
  const textOpacity = useTransform(scrollYProgress, [0.32, 0.48, 0.86, 0.97], [0, 1, 1, 0]);
  const textY       = useTransform(scrollYProgress, [0.32, 0.50],             [42, 0]);
  const textScale   = useTransform(scrollYProgress, [0.32, 0.78],             [0.92, 1.05]);
  // clip-path expands from center outward
  const clipPct  = useTransform(scrollYProgress, [0.32, 0.50], [50, 0]);
  const textClip = useTransform(clipPct, (v) => `inset(0% ${v}% 0% ${v}%)`);

  // Underline bar grows after the hanzi resolves
  const underlineScale = useTransform(scrollYProgress, [0.48, 0.62], [0, 1]);

  // Subtitle (slightly delayed vs hanzi)
  const subOpacity = useTransform(scrollYProgress, [0.42, 0.58, 0.86, 0.97], [0, 1, 1, 0]);
  const subY       = useTransform(scrollYProgress, [0.42, 0.58],             [18, 0]);

  // Center-seam ember (visible while curtain is mostly closed, then fades)
  const emberOpacity = useTransform(scrollYProgress, [0.0, 0.06, 0.22, 0.34], [0.6, 1, 0.7, 0]);

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
        style={{ opacity: bloomOpacity, scale: bloomScale }}
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
        style={{ opacity: spotOpacity, scaleY: spotScale }}
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
        style={{ opacity: emberOpacity }}
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
        style={{ opacity: textOpacity, y: textY, scale: textScale, clipPath: textClip }}
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
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Underline bar grows from center */}
        <motion.div
          aria-hidden="true"
          className="mx-auto mt-4 h-px w-32 origin-center"
          style={{
            scaleX: underlineScale,
            background:
              'linear-gradient(90deg, transparent 0%, var(--color-gold) 30%, var(--color-gold-bright) 50%, var(--color-gold) 70%, transparent 100%)',
            boxShadow: '0 0 8px rgba(233, 196, 106, 0.55)'
          }}
        />

        {subtitle && (
          <motion.div
            style={{ opacity: subOpacity, y: subY }}
            className="lede italic mt-5 text-[var(--color-gold-bright)] opacity-80 max-w-md mx-auto"
          >
            {subtitle}
          </motion.div>
        )}
      </motion.div>

      {/* ====================================================== */}
      {/*  CURTAIN PANELS — z-30, rise upward off-stage           */}
      {/* ====================================================== */}
      <CurtainPanel
        side="left"
        x={leftX}
        y={curtainY}
        scale={curtainScale}
      />
      <CurtainPanel
        side="right"
        x={rightX}
        y={curtainY}
        scale={curtainScale}
      />

      {/* === TOP VALANCE (gold rod + dougong-inspired pelmet) === */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none"
      >
        {/* Brass rod */}
        <div
          className="h-3.5"
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold-deep) 0%, var(--color-gold) 40%, var(--color-gold-bright) 55%, var(--color-gold) 70%, var(--color-gold-deep) 100%)',
            boxShadow:
              '0 6px 20px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(0,0,0,0.4)'
          }}
        />
        {/* End caps */}
        <span
          className="absolute -left-1 top-0 h-5 w-5 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, var(--color-gold-bright), var(--color-gold-deep))',
            boxShadow: '0 2px 6px rgba(0,0,0,0.6), 0 0 10px rgba(233,196,106,0.45)'
          }}
        />
        <span
          className="absolute -right-1 top-0 h-5 w-5 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, var(--color-gold-bright), var(--color-gold-deep))',
            boxShadow: '0 2px 6px rgba(0,0,0,0.6), 0 0 10px rgba(233,196,106,0.45)'
          }}
        />
        {/* Pelmet teeth (Tang dougong inspired) */}
        <div className="curtain-pelmet h-3.5 -mt-px" />
      </div>

      {/* === LETTERBOX BARS (cinematic) === */}
      <motion.div
        aria-hidden="true"
        style={{ height: barHeight }}
        className="absolute left-0 right-0 top-0 bg-[var(--color-ink-dark)] pointer-events-none z-30"
      />
      <motion.div
        aria-hidden="true"
        style={{ height: barHeight }}
        className="absolute left-0 right-0 bottom-0 bg-[var(--color-ink-dark)] pointer-events-none z-30"
      />
    </section>
  );
}

/* ============================================================ */
/* Sub-components                                                */
/* ============================================================ */

function CurtainPanel({
  side,
  x,
  y,
  scale
}: {
  side: 'left' | 'right';
  x: MotionValue<string>;
  y: MotionValue<string>;
  scale: MotionValue<number>;
}) {
  const isLeft = side === 'left';
  const innerShadow = isLeft
    ? 'inset -50px 0 90px rgba(0,0,0,0.6), inset 0 -50px 60px rgba(0,0,0,0.45)'
    : 'inset 50px 0 90px rgba(0,0,0,0.6), inset 0 -50px 60px rgba(0,0,0,0.45)';
  const fabricGradient = isLeft
    ? 'linear-gradient(90deg, var(--color-vermillion-bright) 0%, var(--color-vermillion) 70%, var(--color-vermillion-deep) 100%)'
    : 'linear-gradient(270deg, var(--color-vermillion-bright) 0%, var(--color-vermillion) 70%, var(--color-vermillion-deep) 100%)';

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y, scale }}
      className={`absolute top-0 bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-1/2 pointer-events-none will-change-transform z-30`}
    >
      <div className="relative w-full h-full">
        {/* Body */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(180deg, rgba(212,175,55,0.18) 0 1px, transparent 1px 9px),
              ${fabricGradient}
            `,
            boxShadow: innerShadow
          }}
        />
        {/* Damask overlay */}
        <div className="absolute inset-0 curtain-damask opacity-[0.18] mix-blend-overlay" />
        {/* Outer edge gold trim */}
        <div
          className={`absolute top-0 bottom-0 w-1.5 ${isLeft ? 'left-0' : 'right-0'}`}
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-deep) 50%, var(--color-gold) 100%)'
          }}
        />
        {/* Inner edge brighter trim (catches stage light) */}
        <div
          className={`absolute top-0 bottom-0 w-1 ${isLeft ? 'right-0' : 'left-0'}`}
          style={{
            background:
              'linear-gradient(180deg, var(--color-gold-bright) 0%, var(--color-gold) 50%, var(--color-gold-bright) 100%)',
            boxShadow: '0 0 8px rgba(233,196,106,0.55)'
          }}
        />
        {/* Bottom hem — darker band */}
        <div
          className="absolute left-0 right-0 bottom-3 h-2"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)'
          }}
        />
        {/* Fringe of tassels along the bottom edge */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-around px-3">
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
        width: '6px',
        height: '54px',
        transformOrigin: 'top center',
        animation: `${alt ? 'tassel-sway-alt' : 'tassel-sway'} ${3 + (alt ? 0.6 : 0)}s ease-in-out infinite`
      }}
    >
      {/* Cord */}
      <div className="tassel-cord absolute left-1/2 -translate-x-1/2 top-0 w-px h-7" />
      {/* Bob */}
      <div className="tassel-bob absolute left-1/2 -translate-x-1/2 top-6 w-2.5 h-3 rounded-[40%]" />
      {/* Fringe threads */}
      <div className="tassel-fringe absolute left-1/2 -translate-x-1/2 top-[34px] w-2 h-5" />
    </div>
  );
}

function StaggerChar({
  char,
  index,
  total,
  progress
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Cascade from the middle outward: distance-from-center drives delay
  const middle = (total - 1) / 2;
  const dist = Math.abs(index - middle) / Math.max(middle, 1);
  const start = 0.40 + dist * 0.12;
  const end = start + 0.08;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [14, 0]);
  return (
    <motion.span
      style={{ opacity, y, display: 'inline-block' }}
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
