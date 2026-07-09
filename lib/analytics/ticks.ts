import type { Bucket } from './range';
import type { Point } from './series';

/** Hardcoded, not Intl: assertions must not depend on the installed ICU version. */
const WEEKDAYS_FR = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as const;
const MONTHS_FR = [
  'janv', 'févr', 'mars', 'avr', 'mai', 'juin',
  'juil', 'août', 'sept', 'oct', 'nov', 'déc'
] as const;

export interface Tick {
  /** Position in the `points` array the label sits under. */
  index: number;
  label: string;
}

/** Round a series maximum up to the next 1, 2 or 5 x 10^n. Always >= 1. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const frac = value / pow;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * pow;
}

/**
 * Pick which bars carry an x-axis label, so the axis never crowds.
 *  hour -> every 6h    day (<=7) -> every weekday
 *  day  -> every 7th   week      -> each new month
 */
export function xTicks(points: Point[], bucket: Bucket): Tick[] {
  const out: Tick[] = [];

  if (bucket === 'hour') {
    points.forEach((p, index) => {
      const h = new Date(p.key).getUTCHours();
      if (h % 6 === 0) out.push({ index, label: `${String(h).padStart(2, '0')}h` });
    });
    return out;
  }

  if (bucket === 'day') {
    if (points.length <= 7) {
      return points.map((p, index) => {
        const mondayFirst = (new Date(p.key).getUTCDay() + 6) % 7;
        return { index, label: WEEKDAYS_FR[mondayFirst]! };
      });
    }
    points.forEach((p, index) => {
      if (index % 7 !== 0) return;
      const d = new Date(p.key);
      out.push({ index, label: `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]!}` });
    });
    return out;
  }

  let lastMonth = -1;
  points.forEach((p, index) => {
    const month = new Date(p.key).getUTCMonth();
    if (month === lastMonth) return;
    out.push({ index, label: MONTHS_FR[month]! });
    lastMonth = month;
  });
  return out;
}
