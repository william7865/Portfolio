import { getSql } from './db';
import { fillDays, pctDelta, type DayPoint } from './series';

export type RangeDays = 7 | 30 | 90;

export function normalizeRange(value: string | undefined): RangeDays {
  const n = Number(value);
  return n === 7 || n === 90 ? n : 30;
}

export interface Kpis {
  views: number;
  uniques: number;
  countries: number;
  mobilePct: number;
  deltas: {
    views: number | null;
    uniques: number | null;
    countries: number | null;
    mobilePct: number | null;
  };
}

interface KpiRow {
  views: number;
  uniques: number;
  countries: number;
  mobile_ratio: number;
}

const ZERO_KPI: KpiRow = { views: 0, uniques: 0, countries: 0, mobile_ratio: 0 };

export async function getKpis(range: RangeDays): Promise<Kpis> {
  const sql = getSql();

  const cur =
    ((await sql`
      SELECT count(*)::int AS views,
             count(distinct visitor_hash)::int AS uniques,
             count(distinct country)::int AS countries,
             coalesce(avg((device = 'mobile')::int), 0)::float AS mobile_ratio
      FROM events
      WHERE ts >= now() - make_interval(days => ${range})
    `) as KpiRow[])[0] ?? ZERO_KPI;

  const prev =
    ((await sql`
      SELECT count(*)::int AS views,
             count(distinct visitor_hash)::int AS uniques,
             count(distinct country)::int AS countries,
             coalesce(avg((device = 'mobile')::int), 0)::float AS mobile_ratio
      FROM events
      WHERE ts >= now() - make_interval(days => ${range * 2})
        AND ts <  now() - make_interval(days => ${range})
    `) as KpiRow[])[0] ?? ZERO_KPI;

  const curMobilePct = Math.round(cur.mobile_ratio * 100);
  const prevMobilePct = Math.round(prev.mobile_ratio * 100);

  return {
    views: cur.views,
    uniques: cur.uniques,
    countries: cur.countries,
    mobilePct: curMobilePct,
    deltas: {
      views: pctDelta(cur.views, prev.views),
      uniques: pctDelta(cur.uniques, prev.uniques),
      countries: pctDelta(cur.countries, prev.countries),
      mobilePct: pctDelta(curMobilePct, prevMobilePct)
    }
  };
}

export async function getDailySeries(range: RangeDays): Promise<DayPoint[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS day,
           count(*)::int AS views,
           count(distinct visitor_hash)::int AS uniques
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
    GROUP BY 1
    ORDER BY 1
  `) as DayPoint[];
  return fillDays(rows, range, new Date());
}

export interface RankRow {
  label: string;
  views: number;
}

export async function getTopPages(range: RangeDays, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT path AS label, count(*)::int AS views
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
    GROUP BY path ORDER BY views DESC LIMIT ${limit}
  `) as RankRow[];
}

export async function getReferrers(range: RangeDays, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT referrer_host AS label, count(*)::int AS views
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
      AND referrer_host IS NOT NULL
    GROUP BY referrer_host ORDER BY views DESC LIMIT ${limit}
  `) as RankRow[];
}

export async function getCountries(range: RangeDays, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT coalesce(country, '??') AS label, count(*)::int AS views
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
    GROUP BY country ORDER BY views DESC LIMIT ${limit}
  `) as RankRow[];
}

export async function getDevices(range: RangeDays): Promise<RankRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT device AS label, count(*)::int AS views
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
    GROUP BY device ORDER BY views DESC
  `) as RankRow[];
}
