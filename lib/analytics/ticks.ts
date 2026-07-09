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

/**
 * Round a series maximum up to an even integer >= 2, at or above `value`.
 *
 * Starts from the next 1, 2 or 5 x 10^n, but 1 and 5 are bumped up to 2 and 6:
 * the chart labels its 50% gridline with `max / 2`, so `max` must always be
 * evenly divisible by two or that label would either duplicate the top one
 * (max = 1) or land on a line that isn't actually at the midpoint (max = 5).
 */
export function niceMax(value: number): number {
  if (value <= 0) return 2;
  const pow = 10 ** Math.floor(Math.log10(value));
  const frac = value / pow;
  const nice = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
  // For value < 1, pow is fractional (e.g. 0.1), so `nice` can land under 2
  // without being an odd integer (e.g. 0.5) -- floor those at the minimum too.
  if (nice < 2) return 2;
  return nice % 2 === 0 ? nice : nice + 1;
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
