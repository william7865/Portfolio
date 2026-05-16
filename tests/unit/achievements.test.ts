import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, evaluateAchievements, type EvalContext } from '@/lib/achievements';

const baseCtx = (): EvalContext => ({
  caseStudiesOpened: new Set(),
  konamiUnlocked: false,
  eggsFound: new Set(),
  langSwitched: false,
  scoreReached21: false,
  sectionsVisitedInOneMinute: 0
});

describe('achievements', () => {
  it('registry has V1 essentials', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    [
      'first_blood',
      'double_kill',
      'triple_kill',
      'quadrakill',
      'pentakill',
      'konami_master',
      'set_won',
      'polyglot',
      'speedrunner',
      'match_point_sent'
    ].forEach((id) => expect(ids).toContain(id));
  });

  it('first_blood unlocks at 1 case study', () => {
    const ctx = baseCtx();
    ctx.caseStudiesOpened.add('matchfit');
    expect(evaluateAchievements(ctx, new Set()).has('first_blood')).toBe(true);
  });

  it('pentakill requires 5 case studies', () => {
    const ctx = baseCtx();
    ['a', 'b', 'c', 'd'].forEach((s) => ctx.caseStudiesOpened.add(s));
    expect(evaluateAchievements(ctx, new Set()).has('pentakill')).toBe(false);
    ctx.caseStudiesOpened.add('e');
    expect(evaluateAchievements(ctx, new Set()).has('pentakill')).toBe(true);
  });

  it('already-unlocked are not re-unlocked', () => {
    const ctx = baseCtx();
    ctx.caseStudiesOpened.add('matchfit');
    expect(evaluateAchievements(ctx, new Set(['first_blood'])).has('first_blood')).toBe(false);
  });
});
