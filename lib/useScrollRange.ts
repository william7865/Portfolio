'use client';

import { transform, useTransform, type MotionValue } from 'framer-motion';

/**
 * Range-mapped `useTransform` that stays on the JS scroll tracker.
 *
 * framer-motion 12.x offloads `useTransform(scrollYProgress, range, range)` to a
 * native ScrollTimeline when the value lands on `opacity`. With a `target` ref,
 * the timeline factory runs before the ref is hydrated, so the animation binds to
 * the whole document instead of the section: opacities then drift out of sync
 * with the transforms driven by the same progress. A function transformer is
 * never accelerated, which keeps every scroll-linked value on the same clock.
 */
export function useScrollRange(
  value: MotionValue<number>,
  input: number[],
  output: number[]
): MotionValue<number>;
export function useScrollRange(
  value: MotionValue<number>,
  input: number[],
  output: string[]
): MotionValue<string>;
export function useScrollRange(
  value: MotionValue<number>,
  input: number[],
  output: number[] | string[]
): MotionValue<number> | MotionValue<string> {
  const map = transform<number | string>(input, output as (number | string)[]);
  return useTransform(value, map) as MotionValue<number> | MotionValue<string>;
}
