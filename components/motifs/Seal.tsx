'use client';

import type { CSSProperties } from 'react';

type Props = {
  glyph: string;
  size?: number;
  rotate?: number;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
};

/**
 * Cinnabar seal — ivory border, hanzi glyph inside, slight rotation.
 * If onClick provided, becomes interactive (used for easter egg trigger).
 */
export function Seal({
  glyph,
  size = 44,
  rotate = -4,
  className = '',
  onClick,
  ariaLabel,
  style
}: Props) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`seal ${onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        transform: `rotate(${rotate}deg)`,
        ...style
      }}
    >
      {glyph}
    </Tag>
  );
}
