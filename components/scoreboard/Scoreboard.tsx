'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScore } from './ScoreProvider';
import { MatchPointScene } from './MatchPointScene';

export function Scoreboard() {
  const t = useTranslations('score');
  const { state } = useScore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (state.matchPoint) setShow(true);
  }, [state.matchPoint]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-label={t('ariaLive', { points: state.points })}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-shuttle px-4 py-3 border-2 border-ink shadow-[4px_4px_0_var(--color-court)]"
      >
        <span className="label-mono text-paper opacity-50">{t('label')}</span>
        <span className="display-black-condensed tabular text-3xl leading-none">
          {String(state.points).padStart(2, '0')}
        </span>
        <span className="label-mono text-paper opacity-50">— 21</span>
      </div>
      <MatchPointScene visible={show} onClose={() => setShow(false)} />
    </>
  );
}
