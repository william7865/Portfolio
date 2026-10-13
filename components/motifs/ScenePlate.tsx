import Image from 'next/image';

type Scene = 'hero' | 'scroll' | 'gate' | 'brush' | 'stamp' | 'stamp-end';
type Props = {
  scene: Scene;
  /** Passed to next/image so the browser picks the right width. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Decorative photographic backdrop. Fills its positioned parent.
 */
export function ScenePlate({
  scene,
  sizes = '100vw',
  priority = false,
  className = ''
}: Props) {
  return (
    <Image
      src={`/scenes/${scene}.webp`}
      alt=""
      aria-hidden="true"
      fill
      sizes={sizes}
      priority={priority}
      // A priority still is the first screen's main image: decode it with the
      // first paint instead of letting it slip to a later frame.
      decoding={priority ? 'sync' : 'async'}
      className={`object-cover select-none pointer-events-none ${className}`}
    />
  );
}
