import { getSql } from './db';
import { RANGES, type RangeKey, type RangeSpec } from './range';
import { fillBuckets, pctDelta, pointDelta, type Point } from './series';

export { normalizeRange, type RangeKey } from './range';

/**
 * Offsets for `make_interval`. Exactly one is non-zero.
 * Keeping all three bound as parameters avoids splicing a unit into the SQL text.
 *
 * Exported for tests: `count - 1` is where an off-by-one silently shifts the whole window.
 */
export function offsets(spec: RangeSpec) {
  const n = spec.count - 1;
  return {
    hours: spec.bucket === 'hour' ? n : 0,
    days: spec.bucket === 'day' ? n : 0,
    weeks: spec.bucket === 'week' ? n : 0
  };
}

export interface Kpis {
  views: number;
  /** Mean of the daily unique counts. See the note on `uniques` below. */
  uniquesPerDay: number;
  countries: number;
  mobilePct: number;
  deltas: {
    views: number | null;
    uniquesPerDay: number | null;
    countries: number | null;
    /** In percentage points, not percent: 40% -> 50% reads +10 pts. */
    mobilePct: number;
  };
}

interface KpiRow {
  cur_views: number;
  cur_uniques: number;
  cur_countries: number;
  cur_mobile_ratio: number;
  prev_views: number;
  prev_uniques: number;
  prev_countries: number;
  prev_mobile_ratio: number;
  /** Null when `events` holds no row at all. */
  window_days: number | null;
}

const ZERO_KPI: KpiRow = {
  cur_views: 0, cur_uniques: 0, cur_countries: 0, cur_mobile_ratio: 0,
  prev_views: 0, prev_uniques: 0, prev_countries: 0, prev_mobile_ratio: 0,
  window_days: 1
};

/**
 * `visitor_hash` is salted per UTC day (see lib/analytics/hash.ts), so a visitor's id
 * changes at midnight. `count(distinct visitor_hash)` over N days is therefore the SUM of
 * the daily unique counts, not the number of distinct people. Dividing by the window length
 * turns it back into a meaningful "uniques per day".
 *
 * Known cost of that design, not a bug: on the 24h range a visitor straddling midnight UTC
 * is counted twice.
 */
export async function getKpis(range: RangeKey): Promise<Kpis> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);

  const row =
    ((await sql`
      WITH w AS (
        SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
               - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
      ),
      s AS (
        SELECT start, (now() AT TIME ZONE 'UTC') - start AS span FROM w
      ),
      -- Bounded to the oldest instant the FILTER clauses below can ever need
      -- (the start of the previous comparison window), so this doesn't scan
      -- every row ever collected on every render.
      ev AS (
        SELECT (ts AT TIME ZONE 'UTC') AS t, visitor_hash, country, device
        FROM events, s
        WHERE ts >= ((s.start - s.span) AT TIME ZONE 'UTC')
      )
      SELECT
        count(*) FILTER (WHERE t >= s.start)::int AS cur_views,
        count(distinct visitor_hash) FILTER (WHERE t >= s.start)::int AS cur_uniques,
        count(distinct country) FILTER (WHERE t >= s.start)::int AS cur_countries,
        coalesce(avg((device = 'mobile')::int) FILTER (WHERE t >= s.start), 0)::float AS cur_mobile_ratio,

        count(*) FILTER (WHERE t >= s.start - s.span AND t < s.start)::int AS prev_views,
        count(distinct visitor_hash) FILTER (WHERE t >= s.start - s.span AND t < s.start)::int AS prev_uniques,
        count(distinct country) FILTER (WHERE t >= s.start - s.span AND t < s.start)::int AS prev_countries,
        coalesce(avg((device = 'mobile')::int) FILTER (WHERE t >= s.start - s.span AND t < s.start), 0)::float AS prev_mobile_ratio,

        (extract(epoch FROM max(s.span)) / 86400.0)::float AS window_days
      -- LEFT JOIN, not a cross join: on an empty events table a cross join yields zero rows,
      -- so max(s.span) would come back NULL and window_days would divide by nothing.
      FROM s LEFT JOIN ev ON true
    `) as KpiRow[])[0] ?? ZERO_KPI;

  // Never divide by less than one hour, whatever the range.
  const windowDays = Math.max(Number(row.window_days ?? 0), 1 / 24);
  const curPerDay = Math.round(row.cur_uniques / windowDays);
  const prevPerDay = Math.round(row.prev_uniques / windowDays);
  const curMobilePct = Math.round(row.cur_mobile_ratio * 100);
  const prevMobilePct = Math.round(row.prev_mobile_ratio * 100);

  return {
    views: row.cur_views,
    uniquesPerDay: curPerDay,
    countries: row.cur_countries,
    mobilePct: curMobilePct,
    deltas: {
      views: pctDelta(row.cur_views, row.prev_views),
      uniquesPerDay: pctDelta(curPerDay, prevPerDay),
      countries: pctDelta(row.cur_countries, row.prev_countries),
      mobilePct: pointDelta(curMobilePct, prevMobilePct)
    }
  };
}

/** One point per bucket, gap-filled. The last point is the in-progress bucket. */
export async function getSeries(range: RangeKey): Promise<Point[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);

  const rows = (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT to_char(
             date_trunc(${spec.bucket}, ts AT TIME ZONE 'UTC'),
             'YYYY-MM-DD"T"HH24:MI:SS"Z"'
           ) AS key,
           count(*)::int AS views,
           count(distinct visitor_hash)::int AS uniques
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY 1
    ORDER BY 1
  `) as Point[];

  return fillBuckets(rows, { bucket: spec.bucket, count: spec.count, now: new Date() });
}

export interface RankRow {
  label: string;
  views: number;
  /** Present only where distinct visitors are meaningful (pages). */
  uniques?: number;
}

/**
 * Ranked by distinct visitors, not raw views: a page you reload twenty times
 * should not top the chart. Both numbers are surfaced.
 */
export async function getTopPages(range: RangeKey, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  return (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT path AS label,
           count(*)::int AS views,
           count(distinct visitor_hash)::int AS uniques
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY path
    ORDER BY uniques DESC, views DESC
    LIMIT ${limit}
  `) as RankRow[];
}

export async function getReferrers(range: RangeKey, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  return (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT referrer_host AS label, count(*)::int AS views
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
      AND referrer_host IS NOT NULL
    GROUP BY referrer_host
    ORDER BY views DESC
    LIMIT ${limit}
  `) as RankRow[];
}

export async function getCountries(range: RangeKey, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  return (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT coalesce(country, '??') AS label, count(*)::int AS views
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY 1
    ORDER BY views DESC
    LIMIT ${limit}
  `) as RankRow[];
}

export async function getDevices(range: RangeKey): Promise<RankRow[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  return (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT device AS label, count(*)::int AS views
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY device
    ORDER BY views DESC
  `) as RankRow[];
}

/** `lang` has been collected on every event since the beacon shipped, and shown nowhere. */
export async function getLanguages(range: RangeKey, limit = 8): Promise<RankRow[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  return (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT coalesce(lang, '??') AS label, count(*)::int AS views
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY 1
    ORDER BY views DESC
    LIMIT ${limit}
  `) as RankRow[];
}

export interface HourPoint {
  hour: number; // 0..23, UTC
  views: number;
}

/** Views folded onto a 24-hour clock across the whole window. */
export async function getHourly(range: RangeKey): Promise<HourPoint[]> {
  const sql = getSql();
  const spec = RANGES[range];
  const { hours, days, weeks } = offsets(spec);
  const rows = (await sql`
    WITH w AS (
      SELECT date_trunc(${spec.bucket}, now() AT TIME ZONE 'UTC')
             - make_interval(hours => ${hours}, days => ${days}, weeks => ${weeks}) AS start
    )
    SELECT extract(hour FROM ts AT TIME ZONE 'UTC')::int AS hour,
           count(*)::int AS views
    FROM events, w
    WHERE (ts AT TIME ZONE 'UTC') >= w.start
    GROUP BY 1
    ORDER BY 1
  `) as HourPoint[];

  const byHour = new Map(rows.map((r) => [r.hour, r.views]));
  return Array.from({ length: 24 }, (_, hour) => ({ hour, views: byHour.get(hour) ?? 0 }));
}
