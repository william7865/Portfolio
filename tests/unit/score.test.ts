import { describe, it, expect } from 'vitest';
import { createScoreState, applyEvent, type ScoreEvent } from '@/lib/score';

describe('score', () => {
  it('starts at 0', () => {
    const s = createScoreState();
    expect(s.points).toBe(0);
    expect(s.events).toEqual([]);
    expect(s.matchPoint).toBe(false);
  });

  it('adds 1 point per unique event', () => {
    let s = createScoreState();
    s = applyEvent(s, { type: 'section_read', id: 'service' });
    s = applyEvent(s, { type: 'section_read', id: 'rallye' });
    expect(s.points).toBe(2);
  });

  it('deduplicates identical events', () => {
    let s = createScoreState();
    s = applyEvent(s, { type: 'section_read', id: 'service' });
    s = applyEvent(s, { type: 'section_read', id: 'service' });
    expect(s.points).toBe(1);
  });

  it('contact_send is worth 2 points', () => {
    let s = createScoreState();
    s = applyEvent(s, { type: 'contact_send' });
    expect(s.points).toBe(2);
  });

  it('caps at 21 (match point)', () => {
    let s = createScoreState();
    const events: ScoreEvent[] = Array.from({ length: 30 }, (_, i) => ({
      type: 'section_read',
      id: `s${i}`
    }));
    for (const e of events) s = applyEvent(s, e);
    expect(s.points).toBe(21);
    expect(s.matchPoint).toBe(true);
  });
});
