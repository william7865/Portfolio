type Props = { orientation?: 'vertical' | 'horizontal'; className?: string };

/**
 * Handscroll cap — gold-tipped vermillon roller.
 */
export function GoldRoller({ orientation = 'vertical', className = '' }: Props) {
  const isVertical = orientation === 'vertical';
  return (
    <div
      aria-hidden="true"
      className={`gold-roller ${className}`}
      style={
        isVertical
          ? { height: '100%' }
          : {
              width: '100%',
              height: 22,
              transform: 'rotate(90deg) translateY(0)'
            }
      }
    />
  );
}
