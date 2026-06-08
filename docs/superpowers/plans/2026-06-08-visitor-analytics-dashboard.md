# Tableau de bord d'analytique des visiteurs — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page privée `/dashboard` montrant vues, visiteurs uniques, pages populaires, référents, pays et appareils, alimentée par un suivi sans cookie écrit dans Neon Postgres, le tout dans le style Tang impérial.

**Architecture:** Un beacon client (site public uniquement) poste chaque vue à `/api/collect`, qui calcule un hash visiteur anonyme à rotation quotidienne et insère une ligne dans la table `events`. Le dashboard, hors de l'arbre `[lang]` et protégé par un cookie de session HMAC, lit Postgres via des requêtes agrégées et rend des graphes maison SVG/CSS.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@neondatabase/serverless`, `zod` (déjà présent), `framer-motion` (déjà présent), `vitest` (ajouté), Web Crypto / `node:crypto`.

**Référence spec :** `docs/superpowers/specs/2026-06-08-visitor-analytics-dashboard-design.md`

**Conventions du repo (à respecter) :** routes API en `NextResponse`/`Request` avec garde sur les env vars puis validation `zod` (voir `app/api/contact/route.ts`) ; alias d'import `@/` ; tokens de style dans `app/globals.css`.

---

## Task 1 : Mise en place (dépendances, vitest, schéma DB, client, env)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/analytics/schema.sql`
- Create: `lib/analytics/db.ts`
- Create: `scripts/init-db.mjs`
- Modify: `.env.example`

- [ ] **Step 1 : Installer les dépendances**

```bash
npm install @neondatabase/serverless
npm install -D vitest
```

- [ ] **Step 2 : Ajouter les scripts npm**

Dans `package.json`, ajouter à `"scripts"` :

```json
    "test": "vitest run",
    "db:init": "node scripts/init-db.mjs"
```

- [ ] **Step 3 : Configurer Vitest**

Créer `vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts']
  }
});
```

- [ ] **Step 4 : Écrire le schéma SQL**

Créer `lib/analytics/schema.sql` :

```sql
CREATE TABLE IF NOT EXISTS events (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
  visitor_hash  TEXT        NOT NULL,
  path          TEXT        NOT NULL,
  lang          TEXT,
  referrer_host TEXT,
  country       TEXT,
  device        TEXT        NOT NULL
);

CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
CREATE INDEX IF NOT EXISTS events_ts_visitor_idx ON events (ts, visitor_hash);
```

- [ ] **Step 5 : Écrire le client Neon**

Créer `lib/analytics/db.ts` :

```ts
import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

/** Lazily-created Neon SQL tag. Throws if DATABASE_URL is missing. */
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  if (!_sql) _sql = neon(url);
  return _sql;
}
```

- [ ] **Step 6 : Écrire le script d'initialisation**

Créer `scripts/init-db.mjs` :

```js
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(url);
const ddl = readFileSync(new URL('../lib/analytics/schema.sql', import.meta.url), 'utf8');
const statements = ddl.split(';').map((s) => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`DB initialized (${statements.length} statements).`);
```

- [ ] **Step 7 : Documenter les variables d'environnement**

Ajouter à `.env.example` :

```
# Analytics dashboard
DATABASE_URL=postgres://user:pass@host/db?sslmode=require   # Neon pooled connection string
DASHBOARD_PASSWORD=change-me                                # mot de passe du dashboard
SESSION_SECRET=long-random-string                           # signe le cookie de session + sale le hash visiteur
```

- [ ] **Step 8 : Vérifier que le projet compile encore**

Run: `npm run typecheck`
Expected: PASS (aucune erreur ; les nouveaux fichiers sont valides).

- [ ] **Step 9 : Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/analytics/schema.sql lib/analytics/db.ts scripts/init-db.mjs .env.example
git commit -m "chore(analytics): setup deps, vitest, Neon client and DB schema"
```

---

## Task 2 : Hash visiteur anonyme (TDD)

**Files:**
- Create: `lib/analytics/hash.ts`
- Test: `lib/analytics/hash.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/analytics/hash.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { dailySalt, visitorHash } from './hash';

const SECRET = 'test-secret';
const DAY1 = new Date('2026-06-08T10:00:00Z');
const DAY2 = new Date('2026-06-09T10:00:00Z');

describe('dailySalt', () => {
  it('is stable within the same UTC day', () => {
    const a = dailySalt(SECRET, new Date('2026-06-08T01:00:00Z'));
    const b = dailySalt(SECRET, new Date('2026-06-08T23:00:00Z'));
    expect(a).toBe(b);
  });

  it('rotates across days', () => {
    expect(dailySalt(SECRET, DAY1)).not.toBe(dailySalt(SECRET, DAY2));
  });
});

describe('visitorHash', () => {
  it('is deterministic for the same inputs', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('1.2.3.4', 'UA', salt)).toBe(visitorHash('1.2.3.4', 'UA', salt));
  });

  it('differs across days for the same visitor', () => {
    expect(visitorHash('1.2.3.4', 'UA', dailySalt(SECRET, DAY1))).not.toBe(
      visitorHash('1.2.3.4', 'UA', dailySalt(SECRET, DAY2))
    );
  });

  it('never leaks the raw IP', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('203.0.113.5', 'UA', salt)).not.toContain('203.0.113.5');
  });

  it('returns a 16-char hex string', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('1.2.3.4', 'UA', salt)).toMatch(/^[0-9a-f]{16}$/);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run: `npx vitest run lib/analytics/hash.test.ts`
Expected: FAIL — `Failed to resolve import "./hash"`.

- [ ] **Step 3 : Implémenter le minimum**

Créer `lib/analytics/hash.ts` :

```ts
import { createHash } from 'node:crypto';

/** Salt that changes every UTC day, derived from the server secret. */
export function dailySalt(secret: string, date: Date): string {
  const day = date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return createHash('sha256').update(`${secret}|${day}`).digest('hex');
}

/** Anonymous, daily-rotating visitor id. The raw IP is never stored. */
export function visitorHash(ip: string, userAgent: string, salt: string): string {
  return createHash('sha256')
    .update(`${ip}|${userAgent}|${salt}`)
    .digest('hex')
    .slice(0, 16);
}
```

- [ ] **Step 4 : Lancer le test pour vérifier le succès**

Run: `npx vitest run lib/analytics/hash.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5 : Commit**

```bash
git add lib/analytics/hash.ts lib/analytics/hash.test.ts
git commit -m "feat(analytics): anonymous daily-rotating visitor hash"
```

---

## Task 3 : Détection d'appareil (TDD)

**Files:**
- Create: `lib/analytics/device.ts`
- Test: `lib/analytics/device.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/analytics/device.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { parseDevice } from './device';

describe('parseDevice', () => {
  it('detects an iPhone as mobile', () => {
    expect(parseDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit Mobile')).toBe('mobile');
  });

  it('detects an Android phone as mobile', () => {
    expect(parseDevice('Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit Chrome Mobile Safari')).toBe('mobile');
  });

  it('detects an iPad as tablet', () => {
    expect(parseDevice('Mozilla/5.0 (iPad; CPU OS 17_0) AppleWebKit Safari')).toBe('tablet');
  });

  it('detects an Android tablet (no "Mobile") as tablet', () => {
    expect(parseDevice('Mozilla/5.0 (Linux; Android 14; Tab) AppleWebKit Chrome Safari')).toBe('tablet');
  });

  it('detects a desktop UA as desktop', () => {
    expect(parseDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit Chrome Safari')).toBe('desktop');
  });

  it('falls back to desktop for an empty UA', () => {
    expect(parseDevice('')).toBe('desktop');
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run: `npx vitest run lib/analytics/device.test.ts`
Expected: FAIL — `Failed to resolve import "./device"`.

- [ ] **Step 3 : Implémenter le minimum**

Créer `lib/analytics/device.ts` :

```ts
export type Device = 'mobile' | 'tablet' | 'desktop';

/** Coarse device class from a User-Agent string. Tablet is tested before mobile. */
export function parseDevice(ua: string): Device {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
}
```

- [ ] **Step 4 : Lancer le test pour vérifier le succès**

Run: `npx vitest run lib/analytics/device.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5 : Commit**

```bash
git add lib/analytics/device.ts lib/analytics/device.test.ts
git commit -m "feat(analytics): user-agent device classification"
```

---

## Task 4 : Normalisation du référent (TDD)

**Files:**
- Create: `lib/analytics/referrer.ts`
- Test: `lib/analytics/referrer.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/analytics/referrer.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { referrerHost } from './referrer';

describe('referrerHost', () => {
  it('extracts the host only (drops path and query)', () => {
    expect(referrerHost('https://www.google.com/search?q=x', 'williamlin.dev')).toBe('www.google.com');
  });

  it('returns null for an internal referrer (own host)', () => {
    expect(referrerHost('https://williamlin.dev/fr', 'williamlin.dev')).toBeNull();
  });

  it('returns null for an empty referrer', () => {
    expect(referrerHost('', 'williamlin.dev')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(referrerHost(null, 'williamlin.dev')).toBeNull();
    expect(referrerHost(undefined, 'williamlin.dev')).toBeNull();
  });

  it('returns null for a malformed URL', () => {
    expect(referrerHost('not a url', 'williamlin.dev')).toBeNull();
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run: `npx vitest run lib/analytics/referrer.test.ts`
Expected: FAIL — `Failed to resolve import "./referrer"`.

- [ ] **Step 3 : Implémenter le minimum**

Créer `lib/analytics/referrer.ts` :

```ts
/** Host-only referrer. Returns null for direct, internal, empty or malformed referrers. */
export function referrerHost(
  referrer: string | null | undefined,
  ownHost: string
): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname;
    if (!host || host === ownHost) return null;
    return host;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4 : Lancer le test pour vérifier le succès**

Run: `npx vitest run lib/analytics/referrer.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5 : Commit**

```bash
git add lib/analytics/referrer.ts lib/analytics/referrer.test.ts
git commit -m "feat(analytics): host-only referrer normalization"
```

---

## Task 5 : Session signée HMAC (TDD)

**Files:**
- Create: `lib/analytics/session.ts`
- Test: `lib/analytics/session.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/analytics/session.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { createSession, verifySession, safeEqual } from './session';

const SECRET = 'test-secret';
const NOW = 1_700_000_000_000;

describe('session token', () => {
  it('round-trips a freshly created token', () => {
    const token = createSession(SECRET, NOW);
    expect(verifySession(SECRET, token, NOW)).toBe(true);
  });

  it('rejects a tampered token', () => {
    const token = createSession(SECRET, NOW);
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(verifySession(SECRET, tampered, NOW)).toBe(false);
  });

  it('rejects an expired token', () => {
    const token = createSession(SECRET, NOW);
    const eightDaysLater = NOW + 8 * 24 * 60 * 60 * 1000;
    expect(verifySession(SECRET, token, eightDaysLater)).toBe(false);
  });

  it('rejects a token signed with another secret', () => {
    const token = createSession('other-secret', NOW);
    expect(verifySession(SECRET, token, NOW)).toBe(false);
  });

  it('rejects undefined / malformed tokens', () => {
    expect(verifySession(SECRET, undefined, NOW)).toBe(false);
    expect(verifySession(SECRET, 'garbage', NOW)).toBe(false);
  });
});

describe('safeEqual', () => {
  it('is true for equal strings and false otherwise', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run: `npx vitest run lib/analytics/session.test.ts`
Expected: FAIL — `Failed to resolve import "./session"`.

- [ ] **Step 3 : Implémenter le minimum**

Créer `lib/analytics/session.ts` :

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Constant-time string equality. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function sign(secret: string, expiry: number): string {
  const mac = createHmac('sha256', secret).update(String(expiry)).digest('hex');
  return `${expiry}.${mac}`;
}

/** Build a session token valid for SESSION_TTL_MS from `now`. */
export function createSession(secret: string, now: number): string {
  return sign(secret, now + SESSION_TTL_MS);
}

/** Validate signature (constant time) and expiry. */
export function verifySession(secret: string, token: string | undefined, now: number): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const expiry = Number(token.slice(0, dot));
  if (!Number.isFinite(expiry) || expiry < now) return false;
  return safeEqual(token, sign(secret, expiry));
}
```

- [ ] **Step 4 : Lancer le test pour vérifier le succès**

Run: `npx vitest run lib/analytics/session.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5 : Commit**

```bash
git add lib/analytics/session.ts lib/analytics/session.test.ts
git commit -m "feat(analytics): HMAC-signed dashboard session tokens"
```

---

## Task 6 : Comblage des séries et delta (TDD)

**Files:**
- Create: `lib/analytics/series.ts`
- Test: `lib/analytics/series.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/analytics/series.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { fillDays, pctDelta, type DayPoint } from './series';

const TODAY = new Date('2026-06-08T12:00:00Z');

describe('fillDays', () => {
  it('returns exactly rangeDays points in ascending order', () => {
    const out = fillDays([], 7, TODAY);
    expect(out).toHaveLength(7);
    expect(out[0].day).toBe('2026-06-02');
    expect(out[6].day).toBe('2026-06-08');
  });

  it('fills missing days with zeros and keeps existing rows', () => {
    const rows: DayPoint[] = [{ day: '2026-06-08', views: 5, uniques: 3 }];
    const out = fillDays(rows, 3, TODAY);
    expect(out).toEqual([
      { day: '2026-06-06', views: 0, uniques: 0 },
      { day: '2026-06-07', views: 0, uniques: 0 },
      { day: '2026-06-08', views: 5, uniques: 3 }
    ]);
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
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run: `npx vitest run lib/analytics/series.test.ts`
Expected: FAIL — `Failed to resolve import "./series"`.

- [ ] **Step 3 : Implémenter le minimum**

Créer `lib/analytics/series.ts` :

```ts
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
```

- [ ] **Step 4 : Lancer le test pour vérifier le succès**

Run: `npx vitest run lib/analytics/series.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5 : Commit**

```bash
git add lib/analytics/series.ts lib/analytics/series.test.ts
git commit -m "feat(analytics): day-series gap fill and percentage delta"
```

---

## Task 7 : Couche de requêtes agrégées

**Files:**
- Create: `lib/analytics/queries.ts`

> Pas de test unitaire ici : ces fonctions dépendent de Postgres et sont validées par la
> vérification manuelle de la Task 14. Elles restent fines et délèguent toute la logique aux
> modules purs déjà testés.

- [ ] **Step 1 : Définir le type de plage**

Créer `lib/analytics/queries.ts` avec, en tête :

```ts
import { getSql } from './db';
import { fillDays, pctDelta, type DayPoint } from './series';

export type RangeDays = 7 | 30 | 90;

export function normalizeRange(value: string | undefined): RangeDays {
  const n = Number(value);
  return n === 7 || n === 90 ? n : 30;
}
```

- [ ] **Step 2 : KPIs avec delta vs période précédente**

Ajouter à `lib/analytics/queries.ts` :

```ts
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

export async function getKpis(range: RangeDays): Promise<Kpis> {
  const sql = getSql();

  const [cur] = (await sql`
    SELECT count(*)::int AS views,
           count(distinct visitor_hash)::int AS uniques,
           count(distinct country)::int AS countries,
           coalesce(avg((device = 'mobile')::int), 0)::float AS mobile_ratio
    FROM events
    WHERE ts >= now() - make_interval(days => ${range})
  `) as KpiRow[];

  const [prev] = (await sql`
    SELECT count(*)::int AS views,
           count(distinct visitor_hash)::int AS uniques,
           count(distinct country)::int AS countries,
           coalesce(avg((device = 'mobile')::int), 0)::float AS mobile_ratio
    FROM events
    WHERE ts >= now() - make_interval(days => ${range * 2})
      AND ts <  now() - make_interval(days => ${range})
  `) as KpiRow[];

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
```

- [ ] **Step 3 : Série quotidienne**

Ajouter à `lib/analytics/queries.ts` :

```ts
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
```

- [ ] **Step 4 : Classements (pages, référents, pays, appareils)**

Ajouter à `lib/analytics/queries.ts` :

```ts
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
```

- [ ] **Step 5 : Vérifier la compilation**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add lib/analytics/queries.ts
git commit -m "feat(analytics): aggregated dashboard queries"
```

---

## Task 8 : Route de collecte `/api/collect`

**Files:**
- Create: `app/api/collect/route.ts`

- [ ] **Step 1 : Écrire la route**

Créer `app/api/collect/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql } from '@/lib/analytics/db';
import { dailySalt, visitorHash } from '@/lib/analytics/hash';
import { parseDevice } from '@/lib/analytics/device';
import { referrerHost } from '@/lib/analytics/referrer';

export const runtime = 'nodejs';

const schema = z.object({
  path: z.string().min(1).max(512),
  lang: z.string().max(8).nullish(),
  referrer: z.string().max(2048).nullish()
});

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !process.env.DATABASE_URL) return noContent();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noContent();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return noContent();

  try {
    const h = req.headers;
    const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    const ua = h.get('user-agent') ?? '';
    const country = h.get('x-vercel-ip-country') || null;
    const ownHost = h.get('host') ?? '';

    const hash = visitorHash(ip, ua, dailySalt(secret, new Date()));
    const device = parseDevice(ua);
    const refHost = referrerHost(parsed.data.referrer ?? null, ownHost);
    const lang = parsed.data.lang ?? null;

    const sql = getSql();
    await sql`
      INSERT INTO events (visitor_hash, path, lang, referrer_host, country, device)
      VALUES (${hash}, ${parsed.data.path}, ${lang}, ${refHost}, ${country}, ${device})
    `;
  } catch (err) {
    console.error('[collect] insert failed', err);
  }

  return noContent();
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3 : Commit**

```bash
git add app/api/collect/route.ts
git commit -m "feat(analytics): /api/collect ingestion route"
```

---

## Task 9 : Beacon client + montage + middleware + robots

**Files:**
- Create: `components/system/AnalyticsBeacon.tsx`
- Modify: `app/[lang]/layout.tsx`
- Modify: `middleware.ts`
- Modify: `app/robots.ts`

- [ ] **Step 1 : Écrire le composant beacon**

Créer `components/system/AnalyticsBeacon.tsx` :

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Fires one anonymous page-view to /api/collect on mount and on each route change. */
export function AnalyticsBeacon({ lang }: { lang: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

    const payload = JSON.stringify({
      path: pathname,
      lang,
      referrer: document.referrer || null
    });

    try {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon?.('/api/collect', blob)) return;
    } catch {
      // fall through to fetch
    }

    fetch('/api/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }, [pathname, lang]);

  return null;
}
```

- [ ] **Step 2 : Monter le beacon dans le layout localisé**

Dans `app/[lang]/layout.tsx`, ajouter l'import après les autres imports `@/components/system/*` :

```tsx
import { AnalyticsBeacon } from '@/components/system/AnalyticsBeacon';
```

Puis, à l'intérieur de `<EasterEggProvider>`, juste après `<SkipLink />`, ajouter :

```tsx
          <AnalyticsBeacon lang={lang} />
```

- [ ] **Step 3 : Exclure `/dashboard` du middleware i18n**

Dans `middleware.ts`, remplacer la ligne du `matcher` par :

```ts
    '/((?!api|_next|_vercel|dashboard|icon|apple-icon|opengraph-image|robots|sitemap|.*\\..*).*)'
```

- [ ] **Step 4 : Interdire `/dashboard` aux crawlers**

Dans `app/robots.ts`, remplacer le tableau `rules` par :

```ts
    rules: [{ userAgent: '*', allow: '/', disallow: '/dashboard' }],
```

- [ ] **Step 5 : Vérifier compilation + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add components/system/AnalyticsBeacon.tsx app/\[lang\]/layout.tsx middleware.ts app/robots.ts
git commit -m "feat(analytics): client beacon, route exclusion and robots disallow"
```

---

## Task 10 : Authentification du dashboard (garde + routes + page de login)

**Files:**
- Create: `lib/analytics/guard.ts`
- Create: `app/api/dashboard/login/route.ts`
- Create: `app/api/dashboard/logout/route.ts`
- Create: `app/dashboard/login/page.tsx`

- [ ] **Step 1 : Écrire la garde de session (server-only)**

Créer `lib/analytics/guard.ts` :

```ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from './session';

export const SESSION_COOKIE = 'dash_session';

/** Redirects to the login page unless a valid session cookie is present. */
export async function requireSession(): Promise<void> {
  const secret = process.env.SESSION_SECRET ?? '';
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!verifySession(secret, token, Date.now())) {
    redirect('/dashboard/login');
  }
}
```

- [ ] **Step 2 : Écrire la route de login**

Créer `app/api/dashboard/login/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, safeEqual } from '@/lib/analytics/session';
import { SESSION_COOKIE } from '@/lib/analytics/guard';

export const runtime = 'nodejs';

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) {
    return NextResponse.json({ error: 'not-configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success || !safeEqual(parsed.data.password, password)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(secret, Date.now()), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
  return res;
}
```

- [ ] **Step 3 : Écrire la route de logout**

Créer `app/api/dashboard/logout/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/analytics/guard';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/dashboard/login', req.url));
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
```

- [ ] **Step 4 : Écrire la page de login**

Créer `app/dashboard/login/page.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch('/api/dashboard/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (res.ok) router.replace('/dashboard');
    else setError(true);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <form onSubmit={onSubmit} className="parchment w-full max-w-sm px-8 py-10">
        <p className="kicker mb-6" style={{ color: 'rgba(74,10,14,0.7)' }}>
          ACCÈS · 觀客
        </p>
        <label htmlFor="dash-pw">Mot de passe</label>
        <input
          id="dash-pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-cinnabar)' }}>
            Mot de passe incorrect.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full font-mono text-xs tracking-[0.24em] uppercase py-3 disabled:opacity-50"
          style={{
            background: 'var(--color-vermillion)',
            color: 'var(--color-ivory)',
            border: '1px solid var(--color-gold)'
          }}
        >
          {loading ? '…' : 'Entrer'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5 : Vérifier compilation + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add lib/analytics/guard.ts app/api/dashboard/login/route.ts app/api/dashboard/logout/route.ts app/dashboard/login/page.tsx
git commit -m "feat(dashboard): password login, logout and session guard"
```

---

## Task 11 : Styles du dashboard (bloc Tang dans globals.css)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1 : Ajouter le bloc DASHBOARD**

À la fin de `app/globals.css` (avant le bloc `REDUCED MOTION`, ou juste après `MISC`), ajouter :

```css
/* ============================================================
 * DASHBOARD — chiseled cards, gold bars (Tang)
 * ============================================================ */
.dash-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.dash-card {
  position: relative;
  padding: 20px 22px 18px;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(212, 175, 55, 0.08), transparent 60%),
    linear-gradient(180deg, #2c0306 0%, #1d0205 100%);
  border-top: 2px solid var(--color-gold);
  border-bottom: 2px solid var(--color-gold);
  border-left: 1px solid rgba(212, 175, 55, 0.45);
  border-right: 1px solid rgba(212, 175, 55, 0.45);
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.6), 0 8px 28px rgba(0, 0, 0, 0.4);
}

.dash-cartouche {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
}
.dash-cartouche .han {
  font-family: var(--font-display-hanzi);
  color: var(--color-gold-bright);
  font-size: 1.1rem;
  line-height: 1;
}

.dash-stat-value {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
  color: var(--color-ivory);
}

.dash-delta-up { color: var(--color-gold-bright); }
.dash-delta-down { color: rgba(254, 243, 199, 0.55); }
.dash-delta-flat { color: rgba(254, 243, 199, 0.4); }

.dash-panel {
  position: relative;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid rgba(212, 175, 55, 0.45);
  background:
    radial-gradient(80% 60% at 50% 0%, rgba(212, 175, 55, 0.05), transparent 60%),
    var(--color-vermillion);
}

/* vertical bars (frequency) */
.dash-bar {
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-deep) 100%);
  border-radius: 1px 1px 0 0;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.35);
  position: relative;
}
.dash-bar-uniques {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-gold-bright);
  box-shadow: 0 0 10px rgba(233, 196, 106, 0.6);
}

/* horizontal proportion bars (rankings) */
.dash-rank-track {
  height: 8px;
  background: rgba(212, 175, 55, 0.12);
  border-radius: 1px;
  overflow: hidden;
}
.dash-rank-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-gold-deep), var(--color-gold));
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

/* range tabs */
.dash-range-tab {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 6px 14px;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  background: transparent;
  cursor: pointer;
}
.dash-range-tab[data-active='true'] {
  background: var(--color-cinnabar);
  color: var(--color-ivory);
  border-color: var(--color-cinnabar);
}
```

- [ ] **Step 2 : Vérifier que le site démarre toujours**

Run: `npm run build`
Expected: build OK (les classes CSS sont valides).

- [ ] **Step 3 : Commit**

```bash
git add app/globals.css
git commit -m "feat(dashboard): Tang-styled card, chart and tab CSS"
```

---

## Task 12 : Composants du dashboard

**Files:**
- Create: `components/dashboard/StatCard.tsx`
- Create: `components/dashboard/RankBars.tsx`
- Create: `components/dashboard/RangeSelector.tsx`
- Create: `components/dashboard/FrequencyChart.tsx`
- Create: `components/dashboard/DashboardShell.tsx`

- [ ] **Step 1 : StatCard**

Créer `components/dashboard/StatCard.tsx` :

```tsx
function formatDelta(delta: number | null): { text: string; cls: string } {
  if (delta === null) return { text: 'nouveau', cls: 'dash-delta-up' };
  if (Math.abs(delta) < 0.5) return { text: '—', cls: 'dash-delta-flat' };
  const rounded = Math.round(delta);
  return delta > 0
    ? { text: `▲ +${rounded}%`, cls: 'dash-delta-up' }
    : { text: `▼ ${rounded}%`, cls: 'dash-delta-down' };
}

export function StatCard({
  han,
  label,
  value,
  delta
}: {
  han: string;
  label: string;
  value: string;
  delta: number | null;
}) {
  const d = formatDelta(delta);
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

- [ ] **Step 2 : RankBars**

Créer `components/dashboard/RankBars.tsx` :

```tsx
'use client';

import { motion } from 'framer-motion';
import type { RankRow } from '@/lib/analytics/queries';

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
  const max = rows.reduce((m, r) => Math.max(m, r.views), 0) || 1;
  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-5">
        <span className="han">{han}</span>
        <span className="kicker">{title}</span>
      </div>
      {rows.length === 0 ? (
        <p className="font-mono text-xs opacity-50">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="truncate pr-3">{r.label}</span>
                <span style={{ color: 'var(--color-gold-bright)' }}>{r.views}</span>
              </div>
              <div className="dash-rank-track">
                <motion.div
                  className="dash-rank-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.views / max) * 100}%` }}
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

- [ ] **Step 3 : RangeSelector**

Créer `components/dashboard/RangeSelector.tsx` :

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const RANGES = [7, 30, 90] as const;

export function RangeSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = Number(params.get('range')) || 30;

  function select(days: number) {
    const next = new URLSearchParams(params.toString());
    next.set('range', String(days));
    router.replace(`/dashboard?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {RANGES.map((d) => (
        <button
          key={d}
          type="button"
          className="dash-range-tab"
          data-active={current === d}
          onClick={() => select(d)}
        >
          {d}J
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4 : FrequencyChart**

Créer `components/dashboard/FrequencyChart.tsx` :

```tsx
'use client';

import { motion } from 'framer-motion';
import type { DayPoint } from '@/lib/analytics/series';

export function FrequencyChart({ data }: { data: DayPoint[] }) {
  const max = data.reduce((m, p) => Math.max(m, p.views), 0) || 1;

  return (
    <section className="dash-panel">
      <div className="dash-cartouche mb-6">
        <span className="han">頻</span>
        <span className="kicker">Fréquence · vues &amp; uniques / jour</span>
      </div>
      <div className="flex items-end gap-[3px] h-48" role="img" aria-label="Vues par jour">
        {data.map((p) => {
          const viewsPct = (p.views / max) * 100;
          const uniquesPct = p.views > 0 ? (p.uniques / p.views) * 100 : 0;
          return (
            <div
              key={p.day}
              className="flex-1 h-full flex items-end group relative"
              title={`${p.day} · ${p.views} vues · ${p.uniques} uniques`}
            >
              <motion.div
                className="dash-bar w-full"
                initial={{ height: 0 }}
                animate={{ height: `${viewsPct}%` }}
                transition={{ duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }}
              >
                <div className="dash-bar-uniques" style={{ height: `${uniquesPct}%` }} />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 5 : DashboardShell**

Créer `components/dashboard/DashboardShell.tsx` :

```tsx
import type { ReactNode } from 'react';
import { RangeSelector } from './RangeSelector';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="dash-wrap">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="dash-cartouche">
          <span className="han" style={{ fontSize: '1.6rem' }}>
            觀客
          </span>
          <span className="kicker-mono">VISITORS · LIVE</span>
        </div>
        <div className="flex items-center gap-5">
          <RangeSelector />
          <form action="/api/dashboard/logout" method="post">
            <button
              type="submit"
              className="font-mono text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
              style={{ color: 'var(--color-gold)' }}
            >
              ⏻ Sortir
            </button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}
```

- [ ] **Step 6 : Vérifier compilation + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 7 : Commit**

```bash
git add components/dashboard/
git commit -m "feat(dashboard): stat cards, rank bars, frequency chart, shell"
```

---

## Task 13 : Page dashboard + layout (assemblage)

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1 : Layout du dashboard (noindex)**

Créer `app/dashboard/layout.tsx` :

```tsx
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard · 觀客',
  robots: { index: false, follow: false }
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2 : Page dashboard**

Créer `app/dashboard/page.tsx` :

```tsx
import { requireSession } from '@/lib/analytics/guard';
import {
  normalizeRange,
  getKpis,
  getDailySeries,
  getTopPages,
  getReferrers,
  getCountries,
  getDevices
} from '@/lib/analytics/queries';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FrequencyChart } from '@/components/dashboard/FrequencyChart';
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

  const [kpis, series, pages, referrers, countries, devices] = await Promise.all([
    getKpis(range),
    getDailySeries(range),
    getTopPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range)
  ]);

  return (
    <DashboardShell>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard han="量" label="Vues" value={String(kpis.views)} delta={kpis.deltas.views} />
        <StatCard han="人" label="Uniques / jour" value={String(kpis.uniques)} delta={kpis.deltas.uniques} />
        <StatCard han="國" label="Pays" value={String(kpis.countries)} delta={kpis.deltas.countries} />
        <StatCard han="機" label="Mobile" value={`${kpis.mobilePct}%`} delta={kpis.deltas.mobilePct} />
      </div>

      <div className="mb-6">
        <FrequencyChart data={series} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RankBars title="Top pages" han="頁" rows={pages} />
        <RankBars title="Provenance" han="源" rows={referrers} emptyLabel="Aucun référent externe" />
        <RankBars title="Pays" han="國" rows={countries} />
        <RankBars title="Appareils" han="機" rows={devices} />
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 3 : Vérifier compilation + lint + build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: PASS. Le build ne doit PAS exiger `DATABASE_URL` car la page est `force-dynamic` (pas de pré-rendu statique).

- [ ] **Step 4 : Commit**

```bash
git add app/dashboard/layout.tsx app/dashboard/page.tsx
git commit -m "feat(dashboard): assemble live dashboard page"
```

---

## Task 14 : Vérification manuelle de bout en bout

**Files:** aucune (vérification).

- [ ] **Step 1 : Préparer la base**

Créer une base Neon de test, remplir `.env.local` avec `DATABASE_URL`, `DASHBOARD_PASSWORD`,
`SESSION_SECRET`, puis initialiser le schéma :

Run: `npm run db:init`
Expected: `DB initialized (3 statements).`

- [ ] **Step 2 : Lancer le site**

Run: `npm run dev`
Puis ouvrir `http://localhost:3000/fr`, naviguer (hero, master-scroll), recharger 2-3 fois.

- [ ] **Step 3 : Vérifier l'ingestion**

Dans l'éditeur SQL de Neon : `SELECT count(*), max(ts) FROM events;`
Expected: count > 0, `ts` récent. Vérifier qu'aucune colonne ne contient d'IP en clair
(`SELECT * FROM events LIMIT 5;` → `visitor_hash` est un hex de 16 caractères).

- [ ] **Step 4 : Tester la garde et le login**

Ouvrir `http://localhost:3000/dashboard` → doit rediriger vers `/dashboard/login`.
Saisir un mauvais mot de passe → message d'erreur. Saisir le bon → redirection vers le dashboard
avec les chiffres affichés.

- [ ] **Step 5 : Tester les plages et la déconnexion**

Cliquer 7J / 30J / 90J → les chiffres et le graphe se mettent à jour. Cliquer « Sortir » →
retour au login ; re-ouvrir `/dashboard` → redirige vers login (cookie effacé).

- [ ] **Step 6 : Confirmer que le dashboard ne s'auto-track pas**

`SELECT path, count(*) FROM events GROUP BY path;`
Expected: aucune ligne avec un `path` commençant par `/dashboard`.

- [ ] **Step 7 : Lancer toute la suite de tests**

Run: `npm run test`
Expected: tous les tests unitaires PASS (hash, device, referrer, session, series).

---

## Task 15 : Documentation finale

**Files:**
- Modify: `README.md`

- [ ] **Step 1 : Documenter le dashboard et les variables**

Dans `README.md`, section « Déploiement », ajouter aux variables d'environnement :

```
- `DATABASE_URL` (Neon — chaîne de connexion *pooled*)
- `DASHBOARD_PASSWORD` (mot de passe du tableau de bord `/dashboard`)
- `SESSION_SECRET` (signature du cookie de session + sel du hash visiteur)
```

Et ajouter une sous-section :

```markdown
### Analytique des visiteurs

Suivi sans cookie (hash anonyme à rotation quotidienne, RGPD sans bannière). Initialiser la base
une fois avec `npm run db:init`, puis consulter les statistiques sur `/dashboard` (protégé par
`DASHBOARD_PASSWORD`). Spec : `docs/superpowers/specs/2026-06-08-visitor-analytics-dashboard-design.md`.
```

- [ ] **Step 2 : Commit**

```bash
git add README.md
git commit -m "docs: document visitor analytics dashboard and env vars"
```

---

## Auto-revue (couverture vs spec)

- §3 Architecture (séparation collecte/dashboard) → Tasks 8, 9, 13. ✔
- §4 Modèle de données (table `events`, index) → Task 1. ✔
- §5 Pipeline de collecte (beacon + route) → Tasks 8, 9. ✔
- §6 Vie privée (hash quotidien, device, referrer, doNotTrack) → Tasks 2, 3, 4, 9. ✔
- §7 Authentification (login/logout/garde, HMAC, cookie) → Tasks 5, 10. ✔
- §8 Couche de données (6 requêtes, force-dynamic) → Tasks 7, 13. ✔
- §9 UI premium (shell, 4 cartes, frequency, rank bars, range) → Tasks 11, 12, 13. ✔
- §10 Définitions métriques (uniques cumulés, delta) → Tasks 6, 7, 12. ✔
- §11 Routage & middleware (hors `[lang]`, exclusion, robots) → Tasks 9, 13. ✔
- §12 Env vars → Tasks 1, 15. ✔
- §13 Dépendances (`@neondatabase/serverless`, `vitest`, pas de chart lib) → Task 1. ✔
- §14 Tests (logique pure) → Tasks 2-6 ; vérif manuelle → Task 14. ✔
- §15 Manifeste des fichiers → couvert par l'ensemble des tasks. ✔

Cohérence des types : `RankRow {label, views}` (queries.ts) consommé tel quel par `RankBars` ;
`DayPoint {day, views, uniques}` (series.ts) produit par `getDailySeries` et consommé par
`FrequencyChart` ; `RangeDays` normalisé par `normalizeRange` et passé à toutes les requêtes ;
`SESSION_COOKIE` défini dans `guard.ts` et réutilisé par les routes login/logout. ✔
