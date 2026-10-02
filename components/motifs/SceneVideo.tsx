'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion, type MotionValue } from 'framer-motion';
import { ScenePlate } from '@/components/motifs/ScenePlate';

type Scene = 'hero' | 'scroll' | 'gate' | 'brush';
type Props = {
  scene: Scene;
  /**
   * 0 → 1 playhead. When given, the clip never plays on its own: the scroll
   * drives it frame by frame (the files are encoded all-keyframes for this).
   * When omitted, the clip loops.
   */
  progress?: MotionValue<number>;
  /**
   * Still shown while the clip loads. Defaults to `<scene>.jpg`, which is also
   * the reduced-motion image; pass another name when that one is not the
   * clip's first frame.
   */
  poster?: string;
  priority?: boolean;
  className?: string;
};

const PHONE = '(max-width: 767px)';
/** Share of the remaining distance the playhead covers per frame. */
const EASE = 0.25;
/** Below this gap (seconds) the playhead is considered arrived. */
const SETTLED = 0.01;

/**
 * Decorative video backdrop. Fills its positioned parent.
 * Under prefers-reduced-motion only the poster frame is rendered.
 */
export function SceneVideo({
  scene,
  progress,
  poster = scene,
  priority = false,
  className = ''
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !progress) return;

    let frame = 0;
    let blobUrl: string | null = null;
    let cancelled = false;

    // A seek that has to wait on the network stalls the scroll. Pull the whole
    // file down first and scrub it from memory; the poster shows until then.
    const file = `/scenes/${scene}${window.matchMedia(PHONE).matches ? '-sm' : ''}.mp4`;
    fetch(file)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;
      })
      .catch(() => {
        if (!cancelled) video.src = file;
      });

    // Ease the playhead toward the scroll position, and never queue a seek
    // while the previous one is still decoding: stacked seeks are the lag.
    const tick = () => {
      frame = 0;
      if (!Number.isFinite(video.duration)) return;
      // Stop just short of the end: seeking to `duration` blanks the frame in Safari.
      const target = Math.min(Math.max(progress.get(), 0), 1) * (video.duration - 0.05);
      const gap = target - video.currentTime;
      if (Math.abs(gap) < SETTLED) return;
      if (!video.seeking) video.currentTime += Math.abs(gap) < 0.04 ? gap : gap * EASE;
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // A browser keeps showing the poster until the first seek, even once the
    // clip is loaded. Seek straight to where the scroll already is.
    const land = () => {
      video.currentTime = Math.min(Math.max(progress.get(), 0), 1) * (video.duration - 0.05);
      wake();
    };

    video.addEventListener('loadedmetadata', land);
    const unsubscribe = progress.on('change', wake);

    return () => {
      cancelled = true;
      unsubscribe();
      video.removeEventListener('loadedmetadata', land);
      cancelAnimationFrame(frame);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [progress, reduce, scene]);

  if (reduce) return <ScenePlate scene={scene} priority={priority} className={className} />;

  return (
    <video
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      poster={`/scenes/${poster}.jpg`}
      muted
      playsInline
      disablePictureInPicture
      autoPlay={!progress}
      loop={!progress}
      preload="auto"
      className={`absolute inset-0 h-full w-full object-cover select-none pointer-events-none ${className}`}
    >
      {/* Scrubbed clips get their source from the effect above */}
      {!progress && (
        <>
          <source media={PHONE} src={`/scenes/${scene}-sm.mp4`} type="video/mp4" />
          <source src={`/scenes/${scene}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}
