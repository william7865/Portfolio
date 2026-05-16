'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { applyEvent, createScoreState, type ScoreEvent, type ScoreState } from '@/lib/score';
import { storage } from '@/lib/storage';

const KEY = 'mp.score';

type Ctx = { state: ScoreState; emit: (e: ScoreEvent) => void };
const ScoreCtx = createContext<Ctx | null>(null);

function reducer(state: ScoreState, e: ScoreEvent): ScoreState {
  return applyEvent(state, e);
}

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined as unknown as ScoreState,
    () => storage.get<ScoreState>(KEY, createScoreState())
  );

  useEffect(() => {
    storage.set(KEY, state);
  }, [state]);

  return <ScoreCtx.Provider value={{ state, emit: dispatch }}>{children}</ScoreCtx.Provider>;
}

export function useScore(): Ctx {
  const ctx = useContext(ScoreCtx);
  if (!ctx) throw new Error('useScore must be used inside ScoreProvider');
  return ctx;
}
