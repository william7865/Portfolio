'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion, type MotionValue } from 'framer-motion';
import { ScenePlate } from '@/components/motifs/ScenePlate';

type Scene = 'hero' | 'scroll' | 'gate';
type Props = {
  scene: Scene;
  /**
   * 0 → 1 playhead. When given, the clip never plays on its own: the scroll
   * drives it frame by frame (the files are encoded all-keyframes for this).
   * When omitted, the clip loops.
   */
  progress?: MotionValue<number>;
  priority?: boolean;
  className?: string;
};

/**
 * Decorative video backdrop. Fills its positioned parent.
 * Under prefers-reduced-motion only the poster frame is rendered.
 */
export function SceneVideo({ scene, progress, priority = false, className = '' }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    const video = ref.current;
    if (!video || !progress) return;

    const seek = (p: number) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (!Number.isFinite(video.duration)) return;
        // Stop just short of the end: seeking to `duration` blanks the frame in Safari.
        video.currentTime = Math.min(Math.max(p, 0), 1) * (video.duration - 0.05);
      });
    };
    // Land on the right frame once metadata arrives (the page may load mid-scroll).
    const sync = () => seek(progress.get());
    video.addEventListener('loadedmetadata', sync);
    sync();
    const unsubscribe = progress.on('change', seek);

    return () => {
      unsubscribe();
      video.removeEventListener('loadedmetadata', sync);
      cancelAnimationFrame(frame.current);
    };
  }, [progress, reduce]);

  if (reduce) return <ScenePlate scene={scene} priority={priority} className={className} />;

  return (
    <video
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      poster={`/scenes/${scene}.jpg`}
      muted
      playsInline
      disablePictureInPicture
      autoPlay={!progress}
      loop={!progress}
      preload="auto"
      className={`absolute inset-0 h-full w-full object-cover select-none pointer-events-none ${className}`}
    >
      <source media="(max-width: 767px)" src={`/scenes/${scene}-sm.mp4`} type="video/mp4" />
      <source src={`/scenes/${scene}.mp4`} type="video/mp4" />
    </video>
  );
}
