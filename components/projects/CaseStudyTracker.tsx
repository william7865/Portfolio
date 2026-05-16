'use client';
import { useEffect } from 'react';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function CaseStudyTracker({ slug }: { slug: string }) {
  const { emit } = useScore();
  useEffect(() => {
    emit({ type: 'case_study_open', slug });
  }, [slug, emit]);
  return null;
}
