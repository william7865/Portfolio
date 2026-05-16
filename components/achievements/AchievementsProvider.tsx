'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type EvalContext
} from '@/lib/achievements';
import { storage } from '@/lib/storage';
import { useScore } from '@/components/scoreboard/ScoreProvider';
import { useArcade } from '@/components/arcade/ArcadeProvider';

const KEY_UNLOCKED = 'mp.achievements';
const KEY_EGGS = 'mp.eggs';
const KEY_LAST_LANG = 'mp.lastLang';

type Toast = { id: string; title: string; description: string };
type Ctx = {
  unlocked: Set<string>;
  toasts: Toast[];
  dismiss: (id: string) => void;
};

const AchCtx = createContext<Ctx | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { state } = useScore();
  const { unlocked: arcadeUnlocked } = useArcade();
  const locale = useLocale() as 'fr' | 'en';
  const [unlocked, setUnlocked] = useState<Set<string>>(
    () => new Set<string>(storage.get<string[]>(KEY_UNLOCKED, []))
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [langSwitched, setLangSwitched] = useState(false);

  useEffect(() => {
    storage.set(KEY_UNLOCKED, [...unlocked]);
  }, [unlocked]);

  useEffect(() => {
    const initial = storage.get<string>(KEY_LAST_LANG, '');
    if (initial && initial !== locale) setLangSwitched(true);
    storage.set(KEY_LAST_LANG, locale);
  }, [locale]);

  useEffect(() => {
    const caseStudies = new Set<string>(
      state.events
        .filter((e) => e.startsWith('case_study_open:'))
        .map((e) => e.split(':')[1] ?? '')
        .filter(Boolean)
    );
    const sectionsSeen = state.events.filter((e) => e.startsWith('section_read:')).length;
    const ctx: EvalContext = {
      caseStudiesOpened: caseStudies,
      konamiUnlocked: arcadeUnlocked,
      eggsFound: new Set<string>(storage.get<string[]>(KEY_EGGS, [])),
      langSwitched,
      scoreReached21: state.matchPoint,
      sectionsVisitedInOneMinute: sectionsSeen
    };
    const newly = evaluateAchievements(ctx, unlocked);
    if (newly.size === 0) return;
    setUnlocked((prev) => new Set([...prev, ...newly]));
    setToasts((prev) => [
      ...prev,
      ...[...newly].map((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        return def
          ? { id, title: def.title[locale], description: def.description[locale] }
          : { id, title: id, description: '' };
      })
    ]);
  }, [state, arcadeUnlocked, langSwitched, locale, unlocked]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return <AchCtx.Provider value={{ unlocked, toasts, dismiss }}>{children}</AchCtx.Provider>;
}

export function useAchievements(): Ctx {
  const ctx = useContext(AchCtx);
  if (!ctx) throw new Error('useAchievements outside provider');
  return ctx;
}
