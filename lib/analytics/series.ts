export interface DayPoint {
  day: string; // YYYY-MM-DD
  views: number;
  uniques: number;
}

/** Expand a sparse list of daily rows into one point per day, ascending, zero-filled. */
export function fillDays(rows: DayPoint[], rangeDays: number, today: Date): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DayPoint[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? { day: key, views: 0, uniques: 0 });
  }
  return out;
}

/** Relative change in percent. null = no baseline (prev 0, cur > 0). */
export function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}
