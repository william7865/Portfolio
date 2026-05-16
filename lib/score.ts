export type ScoreEvent =
  | { type: 'section_read'; id: string }
  | { type: 'project_click'; id: string }
  | { type: 'case_study_open'; slug: string }
  | { type: 'skill_inspect'; name: string }
  | { type: 'lang_switch' }
  | { type: 'now_visit' }
  | { type: 'easter_egg'; id: string }
  | { type: 'contact_fill' }
  | { type: 'contact_send' };

export type ScoreState = {
  points: number;
  events: string[];
  matchPoint: boolean;
};

const CAP = 21;

function keyOf(e: ScoreEvent): string {
  if ('id' in e) return `${e.type}:${e.id}`;
  if ('slug' in e) return `${e.type}:${e.slug}`;
  if ('name' in e) return `${e.type}:${e.name}`;
  return e.type;
}

function pointsOf(e: ScoreEvent): number {
  return e.type === 'contact_send' ? 2 : 1;
}

export function createScoreState(): ScoreState {
  return { points: 0, events: [], matchPoint: false };
}

export function applyEvent(state: ScoreState, e: ScoreEvent): ScoreState {
  const key = keyOf(e);
  if (state.events.includes(key)) return state;
  const newPoints = Math.min(CAP, state.points + pointsOf(e));
  return {
    points: newPoints,
    events: [...state.events, key],
    matchPoint: newPoints >= CAP
  };
}
