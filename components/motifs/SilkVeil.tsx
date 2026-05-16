'use client';

type Props = { className?: string };

/**
 * Vertical silk veil — soft pinstriped gold band.
 * Floats subtly via CSS keyframes (sway).
 */
export function SilkVeil({ className = '' }: Props) {
  return (
    <div aria-hidden="true" className={`silk-veil ${className}`} />
  );
}
