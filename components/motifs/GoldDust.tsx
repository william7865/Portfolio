'use client';

type Props = {
  count?: number;
  className?: string;
};

/**
 * Suspended gold dust drifting upward.
 * Used on Hero and Final sections only.
 * Disabled via prefers-reduced-motion in globals.css.
 */
export function GoldDust({ count = 14, className = '' }: Props) {
  const particles = Array.from({ length: count }, (_, i) => {
    const left = (i * 7.3 + 5) % 100;
    const delay = (i * 0.83) % 7;
    const duration = 6 + ((i * 1.7) % 4);
    const size = 2 + ((i * 0.9) % 2);
    return { left, delay, duration, size };
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="gold-dust"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}
