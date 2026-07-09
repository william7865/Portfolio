# Dashboard Precision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre le dashboard analytics exact (fenêtres alignées, libellés honnêtes) et le graphique lisible (axes, légende, tooltip), et exposer trois métriques déjà collectées mais invisibles.

**Architecture:** Une couche `range.ts` remplace l'entier `RangeDays` par une clé de période portant son bucket (`hour`/`day`/`week`). Toutes les requêtes SQL passent d'une fenêtre glissante (`now() - N days`) à une fenêtre alignée sur le début de bucket, calculée en UTC explicite. La logique de présentation du graphique (choix des graduations, arrondi de l'échelle) sort dans des fonctions pures testables.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, TypeScript, Neon serverless Postgres (`@neondatabase/serverless`), framer-motion, Tailwind v4 + CSS custom dans `app/globals.css`, Vitest 4.

## Global Constraints

- **Spec de référence :** `docs/superpowers/specs/2026-07-09-dashboard-precision-design.md`
- **Aucun changement de schéma SQL.** `lang` et `visitor_hash` existent déjà dans `events`.
- **Aucune nouvelle dépendance npm.**
- **Tout raisonnement temporel est en UTC**, parce que `dailySalt()` (`lib/analytics/hash.ts:5`) sale sur la date UTC. Jamais de `date_trunc` sans `AT TIME ZONE 'UTC'`, jamais de `getFullYear()`/`getMonth()`/`getDate()` — toujours les variantes `getUTC*`.
- **Vitest ne collecte que `lib/**/*.test.ts`** en environnement `node` (`vitest.config.ts`). Pas de test de composant React. Toute logique à tester doit vivre dans `lib/`.
- **`tsconfig.json` active `noUncheckedIndexedAccess`.** Indexer un tableau donne `T | undefined`, y compris quand l'index est mathématiquement borné. Les blocs de code de ce plan ne le reflètent pas systématiquement : là où un accès `TABLEAU[i]` alimente un champ typé `string`, il faut une assertion `!` (l'index est borné par construction) ou une garde. Vérifier avec `npm run typecheck`, pas à l'œil.
- **Labels français en tableaux constants**, jamais `Intl.DateTimeFormat` — les assertions ne doivent pas dépendre de la version d'ICU.
- **Commandes :** `npm test` (vitest run), `npm run typecheck` (tsc --noEmit), `npm run lint` (eslint .), `npm run build`.
- Les uniques d'un bucket hebdomadaire sont la somme des uniques journaliers, et un visiteur à cheval sur minuit UTC compte double sur 24h. **Ces deux limites se documentent en commentaire, elles ne se corrigent pas** (voir §7 de la spec).

---

### Task 1: Couche de périodes (`range.ts`)

Remplace `normalizeRange` / `RangeDays` de `lib/analytics/queries.ts:4-9`, qui confond durée et nombre de barres.

**Files:**
- Create: `lib/analytics/range.ts`
- Test: `lib/analytics/range.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `type RangeKey = '24h' | '7d' | '30d' | '90d'`
  - `type Bucket = 'hour' | 'day' | 'week'`
  - `interface RangeSpec { bucket: Bucket; count: number }`
  - `const RANGE_KEYS: readonly RangeKey[]`
  - `const RANGES: Record<RangeKey, RangeSpec>`
  - `function normalizeRange(value: string | undefined): RangeKey`

- [ ] **Step 1: Write the failing test**

Create `lib/analytics/range.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeRange, RANGES, RANGE_KEYS } from './range';

describe('RANGES', () => {
  it('never exceeds 30 buckets, so the x-axis stays legible', () => {
    for (const key of RANGE_KEYS) {
      expect(RANGES[key].count).toBeLessThanOrEqual(30);
    }
  });

  it('maps each period to its bucket granularity', () => {
    expect(RANGES['24h']).toEqual({ bucket: 'hour', count: 24 });
    expect(RANGES['7d']).toEqual({ bucket: 'day', count: 7 });
    expect(RANGES['30d']).toEqual({ bucket: 'day', count: 30 });
    expect(RANGES['90d']).toEqual({ bucket: 'week', count: 13 });
  });
});

describe('normalizeRange', () => {
  it('accepts the four range keys', () => {
    expect(normalizeRange('24h')).toBe('24h');
    expect(normalizeRange('7d')).toBe('7d');
    expect(normalizeRange('30d')).toBe('30d');
    expect(normalizeRange('90d')).toBe('90d');
  });

  it('accepts the legacy numeric params so old links keep working', () => {
    expect(normalizeRange('7')).toBe('7d');
    expect(normalizeRange('30')).toBe('30d');
    expect(normalizeRange('90')).toBe('90d');
  });

  it('falls back to 30d on anything else', () => {
    expect(normalizeRange(undefined)).toBe('30d');
    expect(normalizeRange('')).toBe('30d');
    expect(normalizeRange('nope')).toBe('30d');
    expect(normalizeRange('365')).toBe('30d');
  });

  it('rejects prototype-chain keys, which `in` would have accepted', () => {
    expect(normalizeRange('constructor')).toBe('30d');
    expect(normalizeRange('toString')).toBe('30d');
    expect(normalizeRange('valueOf')).toBe('30d');
    expect(normalizeRange('hasOwnProperty')).toBe('30d');
    expect(normalizeRange('__proto__')).toBe('30d');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/analytics/range.test.ts`
Expected: FAIL — `Failed to resolve import "./range"`

- [ ] **Step 3: Write minimal implementation**

Create `lib/analytics/range.ts`:

```ts
export type RangeKey = '24h' | '7d' | '30d' | '90d';
export type Bucket = 'hour' | 'day' | 'week';

export interface RangeSpec {
  /** Granularity of one bar in the frequency chart. */
  bucket: Bucket;
  /** Number of buckets displayed, including the in-progress one. */
  count: number;
}

export const RANGE_KEYS = ['24h', '7d', '30d', '90d'] as const satisfies readonly RangeKey[];

/** 13 weeks = 91 days, the smallest whole-week window covering 90 days. */
export const RANGES: Record<RangeKey, RangeSpec> = {
  '24h': { bucket: 'hour', count: 24 },
  '7d': { bucket: 'day', count: 7 },
  '30d': { bucket: 'day', count: 30 },
  '90d': { bucket: 'week', count: 13 }
};

/** `?range=30` was the pre-bucket param format; keep old links alive. */
const LEGACY: Record<string, RangeKey> = { '7': '7d', '30': '30d', '90': '90d' };

export function normalizeRange(value: string | undefined): RangeKey {
  if (!value) return '30d';
  // hasOwn on both lookups. `in` walks the prototype chain, and a bare
  // `LEGACY[value] ?? '30d'` has the same hole: LEGACY['toString'] is a
  // function, not undefined, so the ?? never fires. `?range=constructor`
  // must fall back to '30d', not leak an Object.prototype member.
  if (Object.hasOwn(RANGES, value)) return value as RangeKey;
  return Object.hasOwn(LEGACY, value) ? (LEGACY[value] as RangeKey) : '30d';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/analytics/range.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/range.ts lib/analytics/range.test.ts
git commit -m "feat(analytics): range keys carrying their bucket granularity"
```

---

### Task 2: Buckets temporels et delta en points (`series.ts`)

Remplace `fillDays` (`lib/analytics/series.ts:8-18`), qui ne sait faire que des jours et dont les clés UTC divergent de la fenêtre SQL glissante.

**Files:**
- Modify: `lib/analytics/series.ts` (réécriture complète)
- Modify: `lib/analytics/series.test.ts` (réécriture complète)

**Interfaces:**
- Consumes: `Bucket` de `lib/analytics/range.ts`.
- Produces:
  - `interface Point { key: string; views: number; uniques: number; partial?: boolean }`
  - `function bucketStart(d: Date, bucket: Bucket): Date`
  - `function addBuckets(d: Date, bucket: Bucket, n: number): Date`
  - `function bucketKey(d: Date): string` — format `YYYY-MM-DDTHH:MM:SSZ`
  - `function fillBuckets(rows: Point[], opts: { bucket: Bucket; count: number; now: Date }): Point[]`
  - `function pctDelta(cur: number, prev: number): number | null` (inchangé)
  - `function pointDelta(cur: number, prev: number): number`

`DayPoint` et `fillDays` disparaissent. Leurs seuls consommateurs sont `queries.ts` (Task 4) et ce fichier de test.

- [ ] **Step 1: Write the failing test**

Replace the entire contents of `lib/analytics/series.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bucketStart, addBuckets, bucketKey, fillBuckets, pctDelta, pointDelta, type Point } from './series';

// A Thursday, 12:34 UTC.
const NOW = new Date('2026-06-11T12:34:56Z');

describe('bucketStart', () => {
  it('truncates to the hour', () => {
    expect(bucketKey(bucketStart(NOW, 'hour'))).toBe('2026-06-11T12:00:00Z');
  });

  it('truncates to UTC midnight', () => {
    expect(bucketKey(bucketStart(NOW, 'day'))).toBe('2026-06-11T00:00:00Z');
  });

  it('truncates to the preceding Monday, matching postgres date_trunc(week)', () => {
    expect(bucketKey(bucketStart(NOW, 'week'))).toBe('2026-06-08T00:00:00Z');
  });

  it('leaves a Monday on its own week', () => {
    const monday = new Date('2026-06-08T23:59:59Z');
    expect(bucketKey(bucketStart(monday, 'week'))).toBe('2026-06-08T00:00:00Z');
  });

  it('leaves a Sunday on the week that started six days earlier', () => {
    const sunday = new Date('2026-06-14T00:00:01Z');
    expect(bucketKey(bucketStart(sunday, 'week'))).toBe('2026-06-08T00:00:00Z');
  });
});

describe('addBuckets', () => {
  it('steps by hours', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-11T12:00:00Z'), 'hour', -3))).toBe('2026-06-11T09:00:00Z');
  });

  it('steps by days across a month boundary', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-02T00:00:00Z'), 'day', -3))).toBe('2026-05-30T00:00:00Z');
  });

  it('steps by whole weeks', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-08T00:00:00Z'), 'week', -2))).toBe('2026-05-25T00:00:00Z');
  });
});

describe('fillBuckets', () => {
  it('returns exactly `count` points, oldest first', () => {
    const out = fillBuckets([], { bucket: 'day', count: 7, now: NOW });
    expect(out).toHaveLength(7);
    expect(out.at(0)?.key).toBe('2026-06-05T00:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-11T00:00:00Z');
  });

  it('zero-fills gaps and keeps matching rows', () => {
    const rows: Point[] = [{ key: '2026-06-11T00:00:00Z', views: 5, uniques: 3 }];
    const out = fillBuckets(rows, { bucket: 'day', count: 3, now: NOW });
    expect(out).toEqual([
      { key: '2026-06-09T00:00:00Z', views: 0, uniques: 0 },
      { key: '2026-06-10T00:00:00Z', views: 0, uniques: 0 },
      { key: '2026-06-11T00:00:00Z', views: 5, uniques: 3, partial: true }
    ]);
  });

  it('marks only the last bucket as in-progress', () => {
    const out = fillBuckets([], { bucket: 'day', count: 4, now: NOW });
    expect(out.slice(0, 3).every((p) => p.partial === undefined)).toBe(true);
    expect(out.at(-1)?.partial).toBe(true);
  });

  it('buckets by hour', () => {
    const out = fillBuckets([], { bucket: 'hour', count: 24, now: NOW });
    expect(out).toHaveLength(24);
    expect(out.at(0)?.key).toBe('2026-06-10T13:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-11T12:00:00Z');
  });

  it('buckets by week, anchored on Mondays', () => {
    const out = fillBuckets([], { bucket: 'week', count: 13, now: NOW });
    expect(out).toHaveLength(13);
    expect(out.at(0)?.key).toBe('2026-03-16T00:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-08T00:00:00Z');
  });
});

describe('pctDelta', () => {
  it('computes a relative percentage change', () => {
    expect(pctDelta(120, 100)).toBeCloseTo(20);
    expect(pctDelta(80, 100)).toBeCloseTo(-20);
  });

  it('returns 0 when both are zero', () => {
    expect(pctDelta(0, 0)).toBe(0);
  });

  it('returns null when previous is zero but current is not (no baseline)', () => {
    expect(pctDelta(10, 0)).toBeNull();
  });
});

describe('pointDelta', () => {
  it('subtracts two percentages into percentage points', () => {
    expect(pointDelta(50, 40)).toBe(10);
    expect(pointDelta(40, 50)).toBe(-10);
    expect(pointDelta(0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/analytics/series.test.ts`
Expected: FAIL — `bucketStart is not a function` (et les imports `fillDays`/`DayPoint` n'existent plus dans le test)

- [ ] **Step 3: Write minimal implementation**

Replace the entire contents of `lib/analytics/series.ts`:

```ts
import type { Bucket } from './range';

export interface Point {
  /** UTC bucket start, `YYYY-MM-DDTHH:MM:SSZ`. Matches the SQL `to_char` format. */
  key: string;
  views: number;
  uniques: number;
  /** True on the current, still-running bucket. Rendered hatched, never trusted as final. */
  partial?: boolean;
}

/** Serialize a bucket start. Second precision: buckets never carry milliseconds. */
export function bucketKey(d: Date): string {
  return `${d.toISOString().slice(0, 19)}Z`;
}

/** Truncate to the start of the containing bucket, in UTC. Weeks start Monday, like postgres. */
export function bucketStart(d: Date, bucket: Bucket): Date {
  const x = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      bucket === 'hour' ? d.getUTCHours() : 0
    )
  );
  if (bucket === 'week') {
    const mondayOffset = (x.getUTCDay() + 6) % 7; // Sunday(0) -> 6, Monday(1) -> 0
    x.setUTCDate(x.getUTCDate() - mondayOffset);
  }
  return x;
}

/** Shift by `n` buckets (negative goes back in time). */
export function addBuckets(d: Date, bucket: Bucket, n: number): Date {
  const x = new Date(d);
  if (bucket === 'hour') x.setUTCHours(x.getUTCHours() + n);
  else if (bucket === 'day') x.setUTCDate(x.getUTCDate() + n);
  else x.setUTCDate(x.getUTCDate() + n * 7);
  return x;
}

/**
 * Expand sparse SQL rows into exactly `count` points, ascending, zero-filled.
 * The window is bucket-aligned: the oldest bucket is whole, the newest is in progress.
 */
export function fillBuckets(
  rows: Point[],
  opts: { bucket: Bucket; count: number; now: Date }
): Point[] {
  const { bucket, count, now } = opts;
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const anchor = bucketStart(now, bucket);
  const out: Point[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = bucketKey(addBuckets(anchor, bucket, -i));
    const row = byKey.get(key) ?? { key, views: 0, uniques: 0 };
    out.push(i === 0 ? { ...row, partial: true } : row);
  }
  return out;
}

/** Relative change in percent. null = no baseline (prev 0, cur > 0). */
export function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

/**
 * Difference between two percentages, in percentage points.
 * 40% -> 50% is +10 pts, not +25%. Use this for any value already expressed as a percent.
 */
export function pointDelta(cur: number, prev: number): number {
  return cur - prev;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/analytics/series.test.ts`
Expected: PASS — 17 tests

`npm test` échouera encore : `queries.ts` importe toujours `fillDays`. C'est attendu, Task 4 le corrige. Ne pas toucher `queries.ts` ici.

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/series.ts lib/analytics/series.test.ts
git commit -m "feat(analytics): hour/day/week bucketing and percentage-point delta"
```

---

### Task 3: Graduations et échelle du graphique (`ticks.ts`)

Logique pure de présentation, sortie du composant pour être testable sans DOM.

**Files:**
- Create: `lib/analytics/ticks.ts`
- Test: `lib/analytics/ticks.test.ts`

**Interfaces:**
- Consumes: `Bucket` de `./range`, `Point` de `./series`.
- Produces:
  - `interface Tick { index: number; label: string }`
  - `function niceMax(value: number): number`
  - `function xTicks(points: Point[], bucket: Bucket): Tick[]`

- [ ] **Step 1: Write the failing test**

Create `lib/analytics/ticks.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { niceMax, xTicks } from './ticks';
import { fillBuckets } from './series';

const NOW = new Date('2026-06-11T12:34:56Z'); // Thursday

describe('niceMax', () => {
  it('rounds up to the next 1/2/5 x 10^n', () => {
    expect(niceMax(7)).toBe(10);
    expect(niceMax(12)).toBe(20);
    expect(niceMax(47)).toBe(50);
    expect(niceMax(120)).toBe(200);
    expect(niceMax(1)).toBe(1);
    expect(niceMax(2)).toBe(2);
    expect(niceMax(5)).toBe(5);
  });

  it('never returns zero, so it is always a safe divisor', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(-3)).toBe(1);
  });
});

describe('xTicks', () => {
  it('labels every six hours on the 24h range', () => {
    const points = fillBuckets([], { bucket: 'hour', count: 24, now: NOW });
    const ticks = xTicks(points, 'hour');
    expect(ticks.map((t) => t.label)).toEqual(['18h', '00h', '06h', '12h']);
  });

  it('names all seven weekdays on the 7d range', () => {
    const points = fillBuckets([], { bucket: 'day', count: 7, now: NOW });
    const ticks = xTicks(points, 'day');
    expect(ticks).toHaveLength(7);
    expect(ticks.map((t) => t.label)).toEqual(['ven', 'sam', 'dim', 'lun', 'mar', 'mer', 'jeu']);
    expect(ticks.map((t) => t.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('dates every seventh bar on the 30d range', () => {
    const points = fillBuckets([], { bucket: 'day', count: 30, now: NOW });
    const ticks = xTicks(points, 'day');
    expect(ticks.map((t) => t.index)).toEqual([0, 7, 14, 21, 28]);
    expect(ticks.at(0)?.label).toBe('13 mai');
    expect(ticks.at(-1)?.label).toBe('10 juin');
  });

  it('labels month changes on the 90d range', () => {
    const points = fillBuckets([], { bucket: 'week', count: 13, now: NOW });
    const ticks = xTicks(points, 'week');
    expect(ticks.map((t) => t.label)).toEqual(['mars', 'avr', 'mai', 'juin']);
    expect(ticks.at(0)?.index).toBe(0);
  });

  it('returns no ticks for an empty series', () => {
    expect(xTicks([], 'day')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/analytics/ticks.test.ts`
Expected: FAIL — `Failed to resolve import "./ticks"`

- [ ] **Step 3: Write minimal implementation**

Create `lib/analytics/ticks.ts`:

```ts
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
        return { index, label: WEEKDAYS_FR[mondayFirst] };
      });
    }
    points.forEach((p, index) => {
      if (index % 7 !== 0) return;
      const d = new Date(p.key);
      out.push({ index, label: `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]}` });
    });
    return out;
  }

  let lastMonth = -1;
  points.forEach((p, index) => {
    const month = new Date(p.key).getUTCMonth();
    if (month === lastMonth) return;
    out.push({ index, label: MONTHS_FR[month] });
    lastMonth = month;
  });
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/analytics/ticks.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/ticks.ts lib/analytics/ticks.test.ts
git commit -m "feat(analytics): pure tick selection and nice-max scaling"
```

---

### Task 4: Requêtes sur fenêtres alignées (`queries.ts`)

Le cœur du correctif. Réécriture complète de `lib/analytics/queries.ts`.

Ce que ça répare, point par point :
- La fenêtre `ts >= now() - make_interval(days => 30)` démarre en milieu de journée. Elle devient `[date_trunc(bucket, now_utc) - (count-1) buckets, now)`.
- `fillDays` construisait ses clés depuis `today - 29` alors que le SQL renvoyait `today - 30` : une journée de vues calculée puis jetée. Les bornes coïncident désormais.
- Les deltas comparaient une fenêtre courante partielle à une précédente complète. Les deux fenêtres font maintenant exactement `span = now_utc - window_start`.
- `count(distinct visitor_hash)` sur 30 jours n'est pas « les uniques du mois » (le sel tourne chaque jour) : c'est la somme des uniques journaliers. On la divise par la durée de la fenêtre en jours pour obtenir une vraie moyenne quotidienne.
- Le delta de `mobilePct` passe en points.

**Files:**
- Modify: `lib/analytics/queries.ts` (réécriture complète)
- Test: `lib/analytics/queries.test.ts` (nouveau — couvre `offsets` uniquement)

**Interfaces:**
- Consumes: `getSql` de `./db`; `RangeKey`, `RangeSpec`, `RANGES` de `./range`; `Point`, `fillBuckets`, `pctDelta`, `pointDelta` de `./series`.
- Produces:
  - `function offsets(spec: RangeSpec): { hours: number; days: number; weeks: number }`
  - `interface Kpis { views: number; uniquesPerDay: number; countries: number; mobilePct: number; deltas: { views: number | null; uniquesPerDay: number | null; countries: number | null; mobilePct: number } }`
  - `interface RankRow { label: string; views: number; uniques?: number }`
  - `interface HourPoint { hour: number; views: number }`
  - `getKpis(range: RangeKey): Promise<Kpis>`
  - `getSeries(range: RangeKey): Promise<Point[]>`
  - `getTopPages(range: RangeKey, limit?: number): Promise<RankRow[]>`
  - `getReferrers(range: RangeKey, limit?: number): Promise<RankRow[]>`
  - `getCountries(range: RangeKey, limit?: number): Promise<RankRow[]>`
  - `getDevices(range: RangeKey): Promise<RankRow[]>`
  - `getLanguages(range: RangeKey, limit?: number): Promise<RankRow[]>`
  - `getHourly(range: RangeKey): Promise<HourPoint[]>`
  - re-export `normalizeRange` (pour ne pas casser `app/dashboard/page.tsx`)

Note SQL : `make_interval(hours => $1, days => $2, weeks => $3)` prend trois paramètres liés dont deux valent zéro — c'est ce qui permet de garder l'intervalle entièrement paramétré au lieu d'interpoler une unité dans le texte de la requête. `date_trunc($1, ...)` accepte son unité en paramètre texte.

Les huit requêtes sont des appels réseau vers Neon : elles ne se testent pas unitairement, et la tâche 10 les vérifie à l'exécution. Une seule chose ici est pure et mérite un test — `offsets`, qui traduit un `RangeSpec` en décalage `make_interval`. C'est là que se joue le `count - 1`, et un off-by-one y décale toute la fenêtre sans rien casser visiblement.

- [ ] **Step 1: Write the failing test**

Create `lib/analytics/queries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { offsets } from './queries';
import { RANGES, RANGE_KEYS } from './range';

describe('offsets', () => {
  it('shifts back by count - 1 buckets, so the window holds exactly `count` of them', () => {
    expect(offsets({ bucket: 'hour', count: 24 })).toEqual({ hours: 23, days: 0, weeks: 0 });
    expect(offsets({ bucket: 'day', count: 30 })).toEqual({ hours: 0, days: 29, weeks: 0 });
    expect(offsets({ bucket: 'week', count: 13 })).toEqual({ hours: 0, days: 0, weeks: 12 });
  });

  it('puts the offset on exactly one unit, whatever the range', () => {
    for (const key of RANGE_KEYS) {
      const o = offsets(RANGES[key]);
      const nonZero = [o.hours, o.days, o.weeks].filter((n) => n !== 0);
      expect(nonZero).toHaveLength(1);
    }
  });

  it('collapses to a zero offset on a single-bucket window', () => {
    expect(offsets({ bucket: 'day', count: 1 })).toEqual({ hours: 0, days: 0, weeks: 0 });
  });
});
```

Ce test importe `queries.ts`, qui importe `db.ts`, qui importe `neon`. Aucune connexion n'est ouverte : `getSql()` est paresseux et n'est jamais appelé ici. Pas besoin de `DATABASE_URL`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/analytics/queries.test.ts`
Expected: FAIL — `offsets` n'est pas exporté (l'ancien `queries.ts` ne le définit pas)

- [ ] **Step 3: Write the implementation**

Replace the entire contents of `lib/analytics/queries.ts`:

```ts
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
      ev AS (
        SELECT (ts AT TIME ZONE 'UTC') AS t, visitor_hash, country, device FROM events
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
      -- (No backticks in SQL comments here: this is inside a tagged template literal.)
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
```

- [ ] **Step 4: Verify the full suite is green again**

Run: `npm test`
Expected: PASS — `range`, `series`, `ticks`, `queries`, `hash`, `device`, `referrer`, `session`. `queries.ts` ne casse plus l'import de `fillDays`.

- [ ] **Step 5: Verify types**

Run: `npm run typecheck`
Expected: des erreurs **uniquement** dans `app/dashboard/page.tsx` (`getDailySeries` n'existe plus, `kpis.deltas.uniques` renommé). Aucune erreur dans `lib/`. Ces erreurs sont réparées en Task 9.

- [ ] **Step 6: Commit**

```bash
git add lib/analytics/queries.ts lib/analytics/queries.test.ts
git commit -m "fix(analytics): bucket-aligned windows, span-matched deltas, honest uniques"
```

---

### Task 5: Styles du graphique (`globals.css`)

Le bloc dashboard existe déjà (`app/globals.css:488-588`). On ajoute les classes d'axes, de légende, de tooltip et de bucket en cours, et on retaille `.dash-bar-uniques`, qui était positionné en pleine largeur pour un remplissage proportionnel — il devient une barre étroite au premier plan, sur la même échelle Y.

**Files:**
- Modify: `app/globals.css` (remplacer les lignes de `.dash-bar-uniques`, insérer les nouvelles classes avant le commentaire `/* horizontal proportion bars (rankings) */`)

**Interfaces:**
- Consumes: variables existantes `--color-gold`, `--color-gold-bright`, `--color-gold-deep`, `--color-ivory`, `--font-mono`.
- Produces: `.dash-bar-partial`, `.dash-chart-grid`, `.dash-axis-label`, `.dash-legend`, `.dash-legend-swatch`, `.dash-tooltip`; `.dash-bar-uniques` redéfini.

- [ ] **Step 1: Replace the `.dash-bar-uniques` rule**

Dans `app/globals.css`, remplacer intégralement :

```css
.dash-bar-uniques {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-gold-bright);
  box-shadow: 0 0 10px rgba(233, 196, 106, 0.6);
}
```

par :

```css
/* Uniques share the views Y scale: a narrow bar in front, never a ratio fill. */
.dash-bar-uniques {
  position: absolute;
  left: 22%;
  right: 22%;
  bottom: 0;
  background: var(--color-gold-bright);
  box-shadow: 0 0 10px rgba(233, 196, 106, 0.6);
  border-radius: 1px 1px 0 0;
}

/* The current bucket is still filling up. Hatch it so nobody reads it as final.
   The hatch goes on a pseudo-element: setting background-image directly on
   .dash-bar-partial would REPLACE .dash-bar's gold gradient (equal specificity,
   declared later) rather than layer over it. */
.dash-bar-partial {
  opacity: 0.72;
}
.dash-bar-partial::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0 3px,
    rgba(29, 2, 5, 0.55) 3px 6px
  );
}

.dash-chart-grid {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed rgba(212, 175, 55, 0.18);
}

.dash-axis-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: rgba(254, 243, 199, 0.45);
  white-space: nowrap;
}

.dash-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(254, 243, 199, 0.6);
}
.dash-legend-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 0.4rem;
  vertical-align: -1px;
}

.dash-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 6px 10px;
  border: 1px solid var(--color-gold);
  background: #1d0205;
  color: var(--color-ivory);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
}

/* Edge bars: anchor the tooltip inside the chart instead of centring it on the bar,
   which would push half of it past the panel (and past body's overflow-x: hidden). */
.dash-tooltip-start {
  left: 0;
  transform: none;
}
.dash-tooltip-end {
  left: auto;
  right: 0;
  transform: none;
}
```

- [ ] **Step 2: Verify the build still compiles the stylesheet**

Run: `npm run build`
Expected: le build peut échouer sur `app/dashboard/page.tsx` (types, Task 9) mais **aucune erreur PostCSS/Tailwind**. Si la seule erreur est un type TS, le CSS est bon.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(dashboard): axis, legend, tooltip and partial-bucket styles"
```

---

### Task 6: Cartes KPI et sélecteur de période

**Files:**
- Modify: `components/dashboard/StatCard.tsx`
- Modify: `components/dashboard/RangeSelector.tsx`

**Interfaces:**
- Consumes: `RANGE_KEYS`, `normalizeRange` de `@/lib/analytics/range`.
- Produces:
  - `type DeltaUnit = 'pct' | 'pts'`
  - `StatCard` props: `{ han: string; label: string; value: string; delta: number | null; deltaUnit?: DeltaUnit }`

- [ ] **Step 1: Rewrite StatCard**

Replace the entire contents of `components/dashboard/StatCard.tsx`:

```tsx
export type DeltaUnit = 'pct' | 'pts';

function formatDelta(delta: number | null, unit: DeltaUnit): { text: string; cls: string } {
  if (delta === null) return { text: 'nouveau', cls: 'dash-delta-up' };
  if (Math.abs(delta) < 0.5) return { text: '—', cls: 'dash-delta-flat' };
  const rounded = Math.round(delta);
  // A delta on a value that is already a percentage is a difference in points, not a ratio.
  const suffix = unit === 'pts' ? ' pts' : '%';
  return delta > 0
    ? { text: `▲ +${rounded}${suffix}`, cls: 'dash-delta-up' }
    : { text: `▼ ${rounded}${suffix}`, cls: 'dash-delta-down' };
}

export function StatCard({
  han,
  label,
  value,
  delta,
  deltaUnit = 'pct'
}: {
  han: string;
  label: string;
  value: string;
  delta: number | null;
  deltaUnit?: DeltaUnit;
}) {
  const d = formatDelta(delta, deltaUnit);
  return (
    <div className="dash-card">
      <div className="dash-cartouche mb-3">
        <span className="han">{han}</span>
        <span className="kicker">{label}</span>
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className={`mt-2 font-mono text-xs ${d.cls}`}>{d.text}</div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite RangeSelector**

Replace the entire contents of `components/dashboard/RangeSelector.tsx`:

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RANGE_KEYS, normalizeRange, type RangeKey } from '@/lib/analytics/range';

const TAB_LABEL: Record<RangeKey, string> = {
  '24h': '24H',
  '7d': '7J',
  '30d': '30J',
  '90d': '90J'
};

export function RangeSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = normalizeRange(params.get('range') ?? undefined);

  function select(key: RangeKey) {
    const next = new URLSearchParams(params.toString());
    next.set('range', key);
    router.replace(`/dashboard?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {RANGE_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="dash-range-tab"
          data-active={current === key}
          onClick={() => select(key)}
        >
          {TAB_LABEL[key]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify types and lint**

Run: `npm run typecheck 2>&1 | grep -E 'StatCard|RangeSelector' || echo "clean"`
Expected: `clean`

Run: `npm run lint`
Expected: pas d'erreur sur ces deux fichiers.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/StatCard.tsx components/dashboard/RangeSelector.tsx
git commit -m "feat(dashboard): point-unit deltas and four-period selector"
```

---

### Task 7: Graphique de fréquence lisible

Réécriture de `components/dashboard/FrequencyChart.tsx`. Le composant actuel dessine les uniques à `uniques / views * 100` de la hauteur de la barre — un **ratio**. Une journée à 2 vues / 2 uniques et une journée à 100 vues / 100 uniques s'affichent identiques, toutes deux pleines. Les deux séries passent sur la même échelle Y.

**Avant d'écrire ce composant, lire le skill `dataviz`** — il fixe les règles de couleur, de graduation et de tooltip du projet.

**Files:**
- Modify: `components/dashboard/FrequencyChart.tsx` (réécriture complète)

**Interfaces:**
- Consumes: `Point` de `@/lib/analytics/series`; `Bucket` de `@/lib/analytics/range`; `niceMax`, `xTicks` de `@/lib/analytics/ticks`.
- Produces: `FrequencyChart({ data, bucket }: { data: Point[]; bucket: Bucket })`

Le tooltip natif `title=""` disparaît au profit d'un tooltip au survol, doublé d'un `<table>` en `sr-only` : un `role="img"` sur trente barres ne dit rien à un lecteur d'écran.

- [ ] **Step 1: Write the implementation**

Replace the entire contents of `components/dashboard/FrequencyChart.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Point } from '@/lib/analytics/series';
import type { Bucket } from '@/lib/analytics/range';
import { niceMax, xTicks } from '@/lib/analytics/ticks';

const LONG_MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

function pointLabel(key: string, bucket: Bucket): string {
  const d = new Date(key);
  const date = `${d.getUTCDate()} ${LONG_MONTHS_FR[d.getUTCMonth()]}`;
  if (bucket === 'hour') return `${date}, ${String(d.getUTCHours()).padStart(2, '0')}h UTC`;
  if (bucket === 'week') return `semaine du ${date}`;
  return date;
}

/**
 * A tooltip centred on the first or last bar hangs half its width outside the panel,
 * where `body { overflow-x: hidden }` truncates it on narrow screens. Anchor those inward.
 */
function edgeClass(index: number, total: number): string {
  if (index <= 1) return ' dash-tooltip-start';
  if (index >= total - 2) return ' dash-tooltip-end';
  return '';
}

export function FrequencyChart({ data, bucket }: { data: Point[]; bucket: Bucket }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const peak = data.reduce((m, p) => Math.max(m, p.views), 0);
  const max = niceMax(peak);
  const ticks = xTicks(data, bucket);
  const tickAt = new Map(ticks.map((t) => [t.index, t.label]));

  return (
    <section className="dash-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <div className="dash-cartouche">
          <span className="han">頻</span>
          <span className="kicker">Fréquence · vues &amp; uniques</span>
        </div>
        <div className="dash-legend">
          <span>
            <span
              className="dash-legend-swatch"
              style={{ background: 'var(--color-gold)' }}
            />
            Vues
          </span>
          <span>
            <span
              className="dash-legend-swatch"
              style={{ background: 'var(--color-gold-bright)' }}
            />
            Uniques
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative h-48 w-10 shrink-0">
          {[1, 0.5, 0].map((f) => (
            <span
              key={f}
              className="dash-axis-label absolute right-0 -translate-y-1/2"
              style={{ top: `${(1 - f) * 100}%` }}
            >
              {Math.round(max * f)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-48">
            {[1, 0.5, 0].map((f) => (
              <div key={f} className="dash-chart-grid" style={{ top: `${(1 - f) * 100}%` }} />
            ))}

            <div className="absolute inset-0 flex items-end gap-[3px]">
              {data.map((p, i) => {
                const viewsPct = (p.views / max) * 100;
                const uniquesPct = (p.uniques / max) * 100;
                return (
                  <div
                    key={p.key}
                    className="flex-1 h-full flex items-end relative"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  >
                    {hovered === i && (
                      <div className={`dash-tooltip${edgeClass(i, data.length)}`}>
                        <div style={{ color: 'var(--color-gold-bright)' }}>
                          {pointLabel(p.key, bucket)}
                          {p.partial ? ' · en cours' : ''}
                        </div>
                        <div>
                          {p.views} vues · {p.uniques} uniques
                        </div>
                      </div>
                    )}
                    <motion.div
                      className={`dash-bar w-full${p.partial ? ' dash-bar-partial' : ''}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${viewsPct}%` }}
                      transition={{ duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }}
                    >
                      {/* Same Y scale as views, so heights compare across buckets. */}
                      <div
                        className="dash-bar-uniques"
                        style={{ height: p.views > 0 ? `${(uniquesPct / viewsPct) * 100}%` : '0%' }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="relative h-5 mt-2">
            {data.map((p, i) =>
              tickAt.has(i) ? (
                <span
                  key={p.key}
                  className="dash-axis-label absolute top-0"
                  style={{ left: `${((i + 0.5) / data.length) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {tickAt.get(i)}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Vues et visiteurs uniques par période</caption>
        <thead>
          <tr>
            <th scope="col">Période</th>
            <th scope="col">Vues</th>
            <th scope="col">Uniques</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.key}>
              <th scope="row">
                {pointLabel(p.key, bucket)}
                {p.partial ? ' (en cours)' : ''}
              </th>
              <td>{p.views}</td>
              <td>{p.uniques}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

Note sur la hauteur des uniques : `.dash-bar-uniques` est positionné en absolu **dans** la barre des vues, donc son `height` est un pourcentage de celle-ci. `(uniquesPct / viewsPct) * 100` ramène la fraction à la même échelle Y absolue. Comme `uniques ≤ views` toujours, le résultat reste dans `[0, 100]`.

- [ ] **Step 2: Verify types and lint**

Run: `npm run typecheck 2>&1 | grep FrequencyChart || echo "clean"`
Expected: `clean`

Run: `npm run lint`
Expected: pas d'erreur sur `FrequencyChart.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/FrequencyChart.tsx
git commit -m "feat(dashboard): axes, legend, tooltip and shared Y scale for uniques"
```

---

### Task 8: Répartition horaire et classements par visiteur

**Files:**
- Create: `components/dashboard/HourlyChart.tsx`
- Modify: `components/dashboard/RankBars.tsx`

**Interfaces:**
- Consumes: `HourPoint`, `RankRow` de `@/lib/analytics/queries`; `niceMax` de `@/lib/analytics/ticks`.
- Produces:
  - `HourlyChart({ data }: { data: HourPoint[] })`
  - `RankBars` props inchangées : `{ title: string; han: string; rows: RankRow[]; emptyLabel?: string }`

`RankBars` doit accepter `rows` avec ou sans `uniques`. Quand `uniques` est présent, la barre se dessine dessus (c'est le critère de tri de `getTopPages`) et les deux nombres s'affichent.

- [ ] **Step 1: Create HourlyChart**

Create `components/dashboard/HourlyChart.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import type { HourPoint } from '@/lib/analytics/queries';
import { niceMax } from '@/lib/analytics/ticks';

export function HourlyChart({ data }: { data: HourPoint[] }) {
  const max = niceMax(data.reduce((m, p) => Math.max(m, p.views), 0));

  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-6">
        <span className="han">時</span>
        <span className="kicker">Heures d&apos;affluence · UTC</span>
      </div>

      <div className="relative h-32 flex items-end gap-[3px]">
        {data.map((p, i) => (
          <div key={p.hour} className="flex-1 h-full flex items-end relative group">
            {/* Edge tooltips anchor inward: centred, they hang outside the panel. */}
            <div
              className={`dash-tooltip hidden group-hover:block${
                i <= 1 ? ' dash-tooltip-start' : i >= data.length - 2 ? ' dash-tooltip-end' : ''
              }`}
            >
              {String(p.hour).padStart(2, '0')}h · {p.views} vues
            </div>
            <motion.div
              className="dash-bar w-full"
              initial={{ height: 0 }}
              animate={{ height: `${(p.views / max) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.65, 0.05, 0.36, 1] }}
            />
          </div>
        ))}
      </div>

      <div className="relative h-5 mt-2">
        {data.map((p) =>
          p.hour % 6 === 0 ? (
            <span
              key={p.hour}
              className="dash-axis-label absolute top-0"
              style={{ left: `${((p.hour + 0.5) / 24) * 100}%`, transform: 'translateX(-50%)' }}
            >
              {String(p.hour).padStart(2, '0')}h
            </span>
          ) : null
        )}
      </div>

      <table className="sr-only">
        <caption>Vues par heure de la journée, en UTC</caption>
        <tbody>
          {data.map((p) => (
            <tr key={p.hour}>
              <th scope="row">{String(p.hour).padStart(2, '0')}h</th>
              <td>{p.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite RankBars**

Replace the entire contents of `components/dashboard/RankBars.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import type { RankRow } from '@/lib/analytics/queries';

/** Bar length tracks whichever metric the row is ranked on. */
function metric(r: RankRow): number {
  return r.uniques ?? r.views;
}

export function RankBars({
  title,
  han,
  rows,
  emptyLabel = 'Aucune donnée'
}: {
  title: string;
  han: string;
  rows: RankRow[];
  emptyLabel?: string;
}) {
  const max = rows.reduce((m, r) => Math.max(m, metric(r)), 0) || 1;
  const hasUniques = rows.some((r) => r.uniques !== undefined);

  return (
    <section className="dash-panel">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div className="dash-cartouche">
          <span className="han">{han}</span>
          <span className="kicker">{title}</span>
        </div>
        {hasUniques && <span className="dash-axis-label">uniques · vues</span>}
      </div>

      {rows.length === 0 ? (
        <p className="font-mono text-xs opacity-50">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="truncate pr-3">{r.label}</span>
                <span className="shrink-0">
                  <span style={{ color: 'var(--color-gold-bright)' }}>{metric(r)}</span>
                  {r.uniques !== undefined && (
                    <span style={{ color: 'rgba(254, 243, 199, 0.45)' }}> · {r.views}</span>
                  )}
                </span>
              </div>
              <div className="dash-rank-track">
                <motion.div
                  className="dash-rank-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric(r) / max) * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.65, 0.05, 0.36, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Verify types and lint**

Run: `npm run typecheck 2>&1 | grep -E 'HourlyChart|RankBars' || echo "clean"`
Expected: `clean`

Run: `npm run lint`
Expected: pas d'erreur sur ces deux fichiers.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/HourlyChart.tsx components/dashboard/RankBars.tsx
git commit -m "feat(dashboard): hourly distribution and visitor-ranked pages"
```

---

### Task 9: Assemblage de la page

**Files:**
- Modify: `app/dashboard/page.tsx` (réécriture complète)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: rien.

`getDailySeries` n'existe plus (c'est `getSeries`), `kpis.deltas.uniques` est devenu `kpis.deltas.uniquesPerDay`, et le graphique a besoin du `bucket` de la période.

- [ ] **Step 1: Write the implementation**

Replace the entire contents of `app/dashboard/page.tsx`:

```tsx
import { requireSession } from '@/lib/analytics/guard';
import { RANGES } from '@/lib/analytics/range';
import {
  normalizeRange,
  getKpis,
  getSeries,
  getTopPages,
  getReferrers,
  getCountries,
  getDevices,
  getLanguages,
  getHourly
} from '@/lib/analytics/queries';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FrequencyChart } from '@/components/dashboard/FrequencyChart';
import { HourlyChart } from '@/components/dashboard/HourlyChart';
import { RankBars } from '@/components/dashboard/RankBars';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireSession();

  const { range: rangeParam } = await searchParams;
  const range = normalizeRange(rangeParam);
  const { bucket } = RANGES[range];

  const [kpis, series, hourly, pages, referrers, countries, devices, languages] = await Promise.all([
    getKpis(range),
    getSeries(range),
    getHourly(range),
    getTopPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range),
    getLanguages(range)
  ]);

  return (
    <DashboardShell>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard han="量" label="Vues" value={String(kpis.views)} delta={kpis.deltas.views} />
        <StatCard
          han="人"
          label="Visiteurs / jour"
          value={String(kpis.uniquesPerDay)}
          delta={kpis.deltas.uniquesPerDay}
        />
        <StatCard han="國" label="Pays" value={String(kpis.countries)} delta={kpis.deltas.countries} />
        <StatCard
          han="機"
          label="Mobile"
          value={`${kpis.mobilePct}%`}
          delta={kpis.deltas.mobilePct}
          deltaUnit="pts"
        />
      </div>

      <div className="mb-6">
        <FrequencyChart data={series} bucket={bucket} />
      </div>

      <div className="mb-6">
        <HourlyChart data={hourly} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RankBars title="Top pages" han="頁" rows={pages} />
        <RankBars title="Provenance" han="源" rows={referrers} emptyLabel="Aucun référent externe" />
        <RankBars title="Pays" han="國" rows={countries} />
        <RankBars title="Langues" han="語" rows={languages} />
        <RankBars title="Appareils" han="機" rows={devices} />
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Verify the whole project**

Run: `npm test`
Expected: PASS — toutes les suites.

Run: `npm run typecheck`
Expected: aucune erreur.

Run: `npm run lint`
Expected: aucune erreur.

Run: `npm run build`
Expected: build réussi.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(dashboard): wire buckets, hourly chart and languages panel"
```

---

### Task 10: Vérification de bout en bout

Rien de tout ce qui précède n'a touché Postgres. Les requêtes de Task 4 n'ont jamais été exécutées : `date_trunc($1, ...)` et `make_interval(hours => $1, ...)` en paramètres liés, `count(distinct ...) FILTER (WHERE ...)`, le format `to_char` — chacun est un pari sur le comportement de Neon tant qu'il n'a pas tourné.

**Files:** aucun (sauf correctif révélé par l'exécution).

- [ ] **Step 1: Lire le skill `verify`, puis lancer l'application**

Le dashboard exige `DATABASE_URL` et `SESSION_SECRET` dans `.env.local`, et une table `events` peuplée (`npm run db:init` la crée).

Run: `npm run dev`

- [ ] **Step 2: Exercer les quatre périodes**

Se connecter sur `/dashboard/login`, puis visiter successivement :

```
/dashboard?range=24h
/dashboard?range=7d
/dashboard?range=30d
/dashboard?range=90d
/dashboard?range=30      # rétrocompat : doit se comporter comme 30d
```

Vérifier pour chacune :
- Le graphique porte des labels sur l'axe X, et ils correspondent à la granularité (heures / jours nommés / dates / mois).
- L'axe Y montre trois valeurs, la plus haute étant un nombre rond.
- La **dernière barre est hachurée** et son tooltip dit « en cours ».
- Le tooltip au survol donne la période, les vues et les uniques.
- La barre claire des uniques ne dépasse jamais la barre dorée des vues.
- Les cartes affichent « Visiteurs / jour » et un delta Mobile en `pts`.
- Les panneaux « Langues » et « Heures d'affluence » sont peuplés.
- « Top pages » affiche deux nombres par ligne (`uniques · vues`).

Aucune erreur SQL dans la console du serveur.

- [ ] **Step 3: Contrôler que la journée jetée est bien récupérée**

La correction des bornes doit faire *monter* légèrement le total des vues sur 30 jours par rapport à l'ancien code, puisque le jour le plus ancien n'est plus tronqué. Vérifier en base que le premier bucket du graphique est bien un jour entier :

```sql
SELECT date_trunc('day', now() AT TIME ZONE 'UTC') - make_interval(days => 29) AS expected_start;
```

La date du premier label de l'axe X doit correspondre à `expected_start`.

- [ ] **Step 4: Commit si un correctif a été nécessaire**

```bash
git add -A
git commit -m "fix(analytics): <ce que l'exécution a révélé>"
```

Si aucun correctif : rien à committer, la branche est prête.

---

## Récapitulatif des fichiers

**Créés :** `lib/analytics/range.ts`, `lib/analytics/range.test.ts`, `lib/analytics/ticks.ts`, `lib/analytics/ticks.test.ts`, `lib/analytics/queries.test.ts`, `components/dashboard/HourlyChart.tsx`

**Modifiés :** `lib/analytics/series.ts`, `lib/analytics/series.test.ts`, `lib/analytics/queries.ts`, `app/globals.css`, `components/dashboard/StatCard.tsx`, `components/dashboard/RangeSelector.tsx`, `components/dashboard/FrequencyChart.tsx`, `components/dashboard/RankBars.tsx`, `app/dashboard/page.tsx`

**Supprimés :** `fillDays` et `DayPoint` (absorbés par `fillBuckets` / `Point`), `RangeDays` (absorbé par `RangeKey`)

## Conséquence au déploiement

La réécriture des fenêtres fait bouger les chiffres : les vues sur 30 jours augmentent légèrement (la journée jetée revient) et les deltas changent de valeur. Correction, pas régression. Aucun événement stocké n'est modifié.
