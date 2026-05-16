'use client';
import { useEffect } from 'react';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function NowTracker() {
  const { emit } = useScore();
  useEffect(() => {
    emit({ type: 'now_visit' });
  }, [emit]);
  return null;
}
