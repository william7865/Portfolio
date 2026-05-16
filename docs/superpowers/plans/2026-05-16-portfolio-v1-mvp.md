# Portfolio MATCH POINT — V1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate William Lin's portfolio from Create React App to Next.js 15 with the "MATCH POINT" design — the visitor's cursor becomes a shuttlecock, the layout is a real badminton court, a score climbs 0→21 during the visit, with a dual mode (Pro by default, Arcade unlockable via Konami code).

**Architecture:** Next.js 15 App Router + TypeScript strict + Tailwind CSS v4. Three route groups: `(court)` for the main pro/arcade-shared layout with cursor + scoreboard, `(arcade)` for arcade-only routes (gated by unlock state in `localStorage`), `(admin)` reserved for V1.2. Bilingual via `next-intl` (`/fr`, `/en`). Content stored as MDX (case studies) + JSON (skills, cv). State for score/achievements/arcade mode is client-side only (localStorage + Context). Real shuttlecock physics via Framer Motion springs. Sounds lazy-loaded via Howler. Email via Resend. Deploy on Vercel.

**Tech Stack:** Next.js 15, React 19, TypeScript 5 strict, Tailwind CSS v4, Framer Motion 11, Howler.js 2, `@next/mdx` + remark/rehype, `next-intl` 3, React Hook Form 7 + Zod 3, Resend, `@vercel/og`, Vitest, Playwright. Build target ES2022.

**Source spec:** `docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md` — read it first if any decision feels under-specified.

**Branch strategy:** Work on a dedicated branch `feat/match-point-v1` off `master`. The current CRA portfolio (last commit `7233501`) stays on `master` and remains deployed on GitHub Pages until V1 is shipped on Vercel. When V1 ships, merge `feat/match-point-v1` → `master` and switch DNS.

---

## File structure (end state of V1)

```
portfolio/
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx                      # html/body, fonts, lang attr
│   │   ├── (court)/
│   │   │   ├── layout.tsx                  # CourtBackground + ShuttleCursor + Scoreboard + Footer
│   │   │   ├── page.tsx                    # home : 5 sections
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx                # listing
│   │   │   │   └── [slug]/page.tsx         # case study renderer
│   │   │   ├── now/page.tsx                # markdown rendering
│   │   │   └── skills/page.tsx             # full-page skill court
│   │   └── (arcade)/
│   │       ├── arcade/page.tsx             # hub (locked redirect)
│   │       └── arcade/achievements/page.tsx
│   ├── api/
│   │   └── contact/route.ts                # Resend POST handler
│   ├── globals.css                         # tokens + tailwind + base
│   ├── opengraph-image.tsx                 # default OG
│   ├── sitemap.ts                          # static sitemap
│   ├── robots.ts
│   └── not-found.tsx                       # 404 page
├── components/
│   ├── cursor/
│   │   ├── ShuttleCursor.tsx
│   │   └── shuttle-trail.ts                # particle pool
│   ├── court/
│   │   ├── CourtBackground.tsx             # SVG terrain
│   │   └── court-zones.ts                  # zone coord helpers
│   ├── scoreboard/
│   │   ├── Scoreboard.tsx                  # sticky top-right
│   │   └── MatchPointScene.tsx             # 21-celebration overlay
│   ├── sections/
│   │   ├── Service.tsx                     # hero
│   │   ├── Rallye.tsx                      # about + skill court mini
│   │   ├── Smashes.tsx                     # projects preview
│   │   ├── DropShot.tsx                    # now preview
│   │   └── MatchPoint.tsx                  # contact form
│   ├── skill-court/
│   │   ├── SkillCourt.tsx
│   │   ├── SkillPanel.tsx                  # side panel on hover
│   │   └── skill-positions.ts              # x/y per category
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── CaseStudyLayout.tsx             # MDX wrapper
│   ├── arcade/
│   │   ├── ArcadeProvider.tsx              # context : unlocked state
│   │   ├── ArcadeToggle.tsx                # visible button in footer
│   │   └── ArcadeHUD.tsx                   # overlay (V1 = minimal)
│   ├── achievements/
│   │   ├── ToastHost.tsx                   # bottom-right portal
│   │   ├── AchievementsProvider.tsx
│   │   └── registry.ts                     # the 10 V1 achievements
│   ├── i18n/
│   │   └── LangSwitch.tsx
│   ├── contact/
│   │   └── ContactForm.tsx
│   ├── seo/
│   │   └── JsonLd.tsx
│   ├── nav/
│   │   ├── Nav.tsx                         # top brand + nav
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       └── SkipLink.tsx
├── content/
│   ├── projects/
│   │   ├── matchfit.mdx
│   │   ├── ecommerce.mdx
│   │   └── restaurant.mdx
│   ├── now/
│   │   └── 2026-05.mdx
│   └── data/
│       ├── skills.json
│       └── cv.json
├── lib/
│   ├── score.ts                            # event bus + reducer
│   ├── physics.ts                          # shuttle math helpers
│   ├── konami.ts                           # detector
│   ├── achievements.ts                     # rules engine
│   ├── storage.ts                          # localStorage typed wrapper
│   ├── i18n.ts                             # next-intl config
│   ├── reduced-motion.ts                   # SSR-safe matchMedia hook
│   └── mdx.ts                              # MDX loader helpers
├── messages/
│   ├── fr.json
│   └── en.json
├── public/
│   ├── fonts/                              # Migra, NeueMontreal, JBM (.woff2)
│   ├── images/
│   │   ├── projects/                       # matchfit.png, ecommerce.png, restaurant.png
│   │   └── profile.jpg
│   └── CV.pdf                              # carried over for now
├── tests/
│   ├── unit/
│   │   ├── score.test.ts
│   │   ├── physics.test.ts
│   │   ├── konami.test.ts
│   │   └── achievements.test.ts
│   └── e2e/
│       ├── konami-unlock.spec.ts
│       └── score-progression.spec.ts
├── .env.example
├── .env.local                              # NOT committed
├── .eslintrc.json
├── .gitignore                              # add .next/, .env.local/, etc.
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Phase 0 — Branch & cleanup

### Task 1: Create dev branch and remove CRA scaffolding

**Files:**
- Delete: `package.json` (CRA), `package-lock.json`, `src/`, `public/index.html`, `public/manifest.json`, `public/robots.txt`, `public/favicon.ico`, `public/CV.pdf` (we'll move it back), `README.md`
- Preserve: `docs/`, `.gitignore`, `.git/`, `src/images/*` (move to temp)

- [ ] **Step 1: Create branch**

Run: `git checkout -b feat/match-point-v1`
Expected: `Switched to a new branch 'feat/match-point-v1'`

- [ ] **Step 2: Preserve assets to /tmp**

Run:
```bash
mkdir -p /tmp/portfolio-assets
cp src/images/* /tmp/portfolio-assets/
cp public/CV.pdf /tmp/portfolio-assets/
```
Expected: files copied.

- [ ] **Step 3: Remove CRA scaffolding**

Run:
```bash
rm -rf src/ node_modules/ build/
rm -f package.json package-lock.json README.md
rm -f public/index.html public/manifest.json public/robots.txt public/favicon.ico public/CV.pdf
```
Expected: only `docs/`, `public/` (empty), `.git/`, `.gitignore`, `.superpowers/` remain.

- [ ] **Step 4: Verify**

Run: `ls -la`
Expected: no `src`, no `package.json`, no `node_modules`. `docs/`, `.gitignore`, `.git/` still present.

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove CRA scaffolding before Next.js migration"
```

---

## Phase 1 — Next.js skeleton

### Task 2: Initialize Next.js 15 project in-place

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Init package.json**

Write `package.json`:
```json
{
  "name": "portfolio-match-point",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: `node_modules` created, lockfile generated, zero vulnerabilities ideally.

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true
  }
};
export default nextConfig;
```

- [ ] **Step 5: Write minimal app/layout.tsx and app/page.tsx**

`app/layout.tsx`:
```tsx
import './globals.css';

export const metadata = {
  title: 'William Lin',
  description: 'Portfolio'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Page() {
  return <main>Portfolio MATCH POINT — placeholder</main>;
}
```

`app/globals.css`:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }
```

- [ ] **Step 6: Verify dev server runs**

Run: `npm run dev`
Expected: `Local: http://localhost:3000`. Visit it → see "Portfolio MATCH POINT — placeholder". Stop with Ctrl+C.

- [ ] **Step 7: Update .gitignore**

Append to `.gitignore`:
```
# Next.js
.next/
out/
next-env.d.ts

# Env
.env*.local

# Testing
test-results/
playwright-report/
playwright/.cache/
coverage/

# IDE
.vscode/
.idea/
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 + TypeScript strict project"
```

---

### Task 3: Add Tailwind CSS v4

**Files:**
- Create: `postcss.config.mjs`, `tailwind.config.ts`
- Modify: `app/globals.css`, `package.json`

- [ ] **Step 1: Install Tailwind v4**

Run: `npm install -D tailwindcss@next @tailwindcss/postcss@next postcss`
Expected: packages added.

- [ ] **Step 2: Create postcss.config.mjs**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

- [ ] **Step 3: Create tailwind.config.ts (tokens scaffold)**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'hall-floor': '#F2EEE2',
        'ink': '#0F1419',
        'shuttle': '#F4D04A',
        'court-line': '#B7472A',
        'net-green': '#5C7A6B',
        'muted': '#8A8576',
        'lol-blue': '#1C8CE8',
        'penta-magenta': '#9B30A8'
      },
      fontFamily: {
        display: ['var(--font-migra)', 'serif'],
        sans: ['var(--font-montreal)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbm)', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
export default config;
```

- [ ] **Step 4: Rewrite app/globals.css to include Tailwind**

```css
@import 'tailwindcss';

@theme {
  --color-hall-floor: #F2EEE2;
  --color-ink: #0F1419;
  --color-shuttle: #F4D04A;
  --color-court-line: #B7472A;
  --color-net-green: #5C7A6B;
  --color-muted: #8A8576;
  --color-lol-blue: #1C8CE8;
  --color-penta-magenta: #9B30A8;
}

@layer base {
  html { color-scheme: light; }
  body {
    background-color: var(--color-hall-floor);
    color: var(--color-ink);
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--color-shuttle); color: var(--color-ink); }
  :focus-visible {
    outline: 3px solid var(--color-shuttle);
    outline-offset: 3px;
    border-radius: 2px;
  }
}
```

- [ ] **Step 5: Verify Tailwind compiles**

Modify `app/page.tsx` to `return <main className="p-10 text-court-line">Portfolio MATCH POINT — placeholder</main>;`

Run: `npm run dev` → check the text is rust-colored. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind v4 with MATCH POINT color tokens"
```

---

### Task 4: Add fonts via next/font/local

**Files:**
- Create: `public/fonts/` with the .woff2 files
- Modify: `app/layout.tsx`

> **Manual prerequisite:** download Migra (Pangram Pangram), PP Neue Montreal (Pangram Pangram free), JetBrains Mono Variable. Place `.woff2` files in `public/fonts/`. Names to use: `Migra-Italic.woff2`, `NeueMontreal-Regular.woff2`, `NeueMontreal-Medium.woff2`, `JetBrainsMonoVar.woff2`.

- [ ] **Step 1: Confirm font files exist**

Run: `ls public/fonts/`
Expected: at least 4 `.woff2` files listed above.

- [ ] **Step 2: Modify app/layout.tsx**

```tsx
import './globals.css';
import localFont from 'next/font/local';

const migra = localFont({
  src: '../public/fonts/Migra-Italic.woff2',
  variable: '--font-migra',
  display: 'swap'
});
const montreal = localFont({
  src: [
    { path: '../public/fonts/NeueMontreal-Regular.woff2', weight: '400' },
    { path: '../public/fonts/NeueMontreal-Medium.woff2', weight: '500' }
  ],
  variable: '--font-montreal',
  display: 'swap'
});
const jbm = localFont({
  src: '../public/fonts/JetBrainsMonoVar.woff2',
  variable: '--font-jbm',
  display: 'swap'
});

export const metadata = {
  title: 'William Lin · Match Point',
  description: 'Portfolio · Développeur Full Stack · Disponible en alternance'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${migra.variable} ${montreal.variable} ${jbm.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Test fonts by modifying page**

`app/page.tsx`:
```tsx
export default function Page() {
  return (
    <main className="p-10 space-y-6">
      <h1 className="font-display italic text-6xl">Match Point.</h1>
      <p className="font-sans text-lg">Body in PP Neue Montreal.</p>
      <code className="font-mono">SET 1 · 14—09</code>
    </main>
  );
}
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev` → confirm Migra italic display, NeueMontreal body, JBM monospace. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Migra, PP Neue Montreal, JetBrains Mono via next/font/local"
```

---

### Task 5: Restore static assets

**Files:**
- Create: `public/CV.pdf`, `public/images/profile.jpg`, `public/images/projects/{matchfit,ecommerce,restaurant}.png`, `public/favicon.ico`

- [ ] **Step 1: Copy assets back**

Run:
```bash
mkdir -p public/images/projects
cp /tmp/portfolio-assets/CV.pdf public/
cp /tmp/portfolio-assets/profil.jpg public/images/profile.jpg
cp /tmp/portfolio-assets/matchfit.png public/images/projects/
cp /tmp/portfolio-assets/ecommerce.png public/images/projects/
cp /tmp/portfolio-assets/restaurant.png public/images/projects/
```

- [ ] **Step 2: Generate favicon (16/32) from shuttle motif**

For V1: copy the existing favicon if available, otherwise leave default. A custom shuttle favicon comes in V1.1 polish.

Run: `cp /tmp/portfolio-assets/favicon.ico public/ 2>/dev/null || echo "skip favicon for now"`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: restore static assets (CV, profile, project images)"
```

---

## Phase 2 — Testing infrastructure

### Task 6: Set up Vitest

**Files:**
- Create: `vitest.config.ts`, `tests/unit/.gitkeep`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Write vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './') }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

- [ ] **Step 3: Write tests/setup.ts**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// Mock matchMedia (jsdom doesn't provide it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});
```

- [ ] **Step 4: Sanity test**

Create `tests/unit/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('sanity', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: set up Vitest + Testing Library"
```

---

### Task 7: Set up Playwright

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/.gitkeep`
- Modify: `package.json`, `.gitignore`

- [ ] **Step 1: Install**

Run: `npm install -D @playwright/test && npx playwright install --with-deps chromium`

- [ ] **Step 2: Write playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
```

- [ ] **Step 3: Sanity e2e test**

Create `tests/e2e/sanity.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Match Point.')).toBeVisible();
});
```

- [ ] **Step 4: Run**

Run: `npm run e2e`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: set up Playwright with sanity e2e"
```

---

## Phase 3 — Pure logic (TDD)

### Task 8: Implement lib/storage.ts (typed localStorage wrapper)

**Files:**
- Create: `lib/storage.ts`, `tests/unit/storage.test.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns default when key missing', () => {
    expect(storage.get('mp.score', 0)).toBe(0);
  });

  it('persists and reads number', () => {
    storage.set('mp.score', 14);
    expect(storage.get('mp.score', 0)).toBe(14);
  });

  it('persists and reads complex object', () => {
    storage.set('mp.achievements', { firstBlood: true });
    expect(storage.get('mp.achievements', {})).toEqual({ firstBlood: true });
  });

  it('returns default on JSON corruption', () => {
    localStorage.setItem('mp.score', '{invalid');
    expect(storage.get('mp.score', 7)).toBe(7);
  });

  it('is SSR-safe (no window)', () => {
    const original = global.window;
    // @ts-expect-error
    delete global.window;
    expect(storage.get('mp.score', 99)).toBe(99);
    global.window = original;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- storage`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement lib/storage.ts**

```ts
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }
};
```

- [ ] **Step 4: Run test**

Run: `npm test -- storage`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add SSR-safe typed localStorage wrapper"
```

---

### Task 9: Implement lib/score.ts (event bus + reducer + persistence)

**Files:**
- Create: `lib/score.ts`, `tests/unit/score.test.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/score.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createScoreState, applyEvent, type ScoreEvent } from '@/lib/score';

describe('score', () => {
  beforeEach(() => localStorage.clear());

  it('starts at 0 with empty event log', () => {
    const s = createScoreState();
    expect(s.points).toBe(0);
    expect(s.events).toEqual([]);
  });

  it('adds 1 point per unique event type/key', () => {
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

  it('contact_send is worth 2 points (smash décisif)', () => {
    let s = createScoreState();
    s = applyEvent(s, { type: 'contact_send' });
    expect(s.points).toBe(2);
  });

  it('caps at 21 (match point)', () => {
    let s = createScoreState();
    const events: ScoreEvent[] = Array.from({ length: 30 }, (_, i) => ({
      type: 'section_read', id: `s${i}`
    }));
    for (const e of events) s = applyEvent(s, e);
    expect(s.points).toBe(21);
    expect(s.matchPoint).toBe(true);
  });

  it('matchPoint flag only true once reached 21', () => {
    let s = createScoreState();
    s = applyEvent(s, { type: 'section_read', id: 'x' });
    expect(s.matchPoint).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (fails)**

Run: `npm test -- score`
Expected: FAIL.

- [ ] **Step 3: Implement lib/score.ts**

```ts
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
  events: string[]; // serialized dedupe keys
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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- score`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): implement score reducer with dedup and 21-point cap"
```

---

### Task 10: Implement lib/konami.ts (key sequence detector)

**Files:**
- Create: `lib/konami.ts`, `tests/unit/konami.test.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/konami.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { createKonamiDetector } from '@/lib/konami';

describe('konami', () => {
  const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  it('triggers callback when full sequence typed', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('ignores wrong keys mid-sequence and resets', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    d.push('ArrowUp');
    d.push('ArrowUp');
    d.push('x');
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('case-insensitive on letters', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    const upper = SEQUENCE.map(k => k.length === 1 ? k.toUpperCase() : k);
    for (const k of upper) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('only triggers once unless reset()', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    for (const k of SEQUENCE) d.push(k);
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
    d.reset();
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run (fails)**

Run: `npm test -- konami`
Expected: FAIL.

- [ ] **Step 3: Implement lib/konami.ts**

```ts
const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export function createKonamiDetector(onComplete: () => void) {
  let index = 0;
  let triggered = false;

  return {
    push(key: string) {
      if (triggered) return;
      const normalized = key.length === 1 ? key.toLowerCase() : key;
      if (normalized === SEQUENCE[index]) {
        index++;
        if (index === SEQUENCE.length) {
          triggered = true;
          onComplete();
        }
      } else {
        index = normalized === SEQUENCE[0] ? 1 : 0;
      }
    },
    reset() {
      index = 0;
      triggered = false;
    }
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- konami`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): implement Konami code detector with reset"
```

---

### Task 11: Implement lib/physics.ts (shuttle decay easing)

**Files:**
- Create: `lib/physics.ts`, `tests/unit/physics.test.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/physics.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { shuttleEase, distance } from '@/lib/physics';

describe('physics', () => {
  it('shuttleEase(0) = 0', () => expect(shuttleEase(0)).toBe(0));
  it('shuttleEase(1) = 1', () => expect(shuttleEase(1)).toBe(1));
  it('shuttleEase mid is below linear (sharp decel)', () => {
    // Real shuttles decelerate fast → progress > 0.5 at t = 0.5
    expect(shuttleEase(0.5)).toBeGreaterThan(0.5);
  });
  it('distance is euclidean', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
```

- [ ] **Step 2: Run (fails)**

Run: `npm test -- physics`
Expected: FAIL.

- [ ] **Step 3: Implement lib/physics.ts**

```ts
export type Point = { x: number; y: number };

// Approximates a shuttlecock's deceleration : fast initial progress, sharp drop-off.
// Custom curve : 1 - (1 - t)^3 (cubic ease-out, close to real shuttle profile)
export function shuttleEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}

export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

- [ ] **Step 4: Run**

Run: `npm test -- physics`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): shuttleEase curve + euclidean distance"
```

---

### Task 12: Implement lib/achievements.ts (rules engine)

**Files:**
- Create: `lib/achievements.ts`, `tests/unit/achievements.test.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/achievements.test.ts`:
```ts
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
  it('registry has the V1 essentials', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(ids).toContain('first_blood');
    expect(ids).toContain('double_kill');
    expect(ids).toContain('triple_kill');
    expect(ids).toContain('quadrakill');
    expect(ids).toContain('pentakill');
    expect(ids).toContain('konami_master');
    expect(ids).toContain('set_won');
    expect(ids).toContain('polyglot');
    expect(ids).toContain('speedrunner');
    expect(ids).toContain('match_point_sent');
  });

  it('first_blood unlocks at 1 case study', () => {
    const ctx = baseCtx();
    ctx.caseStudiesOpened.add('matchfit');
    const unlocked = evaluateAchievements(ctx, new Set());
    expect(unlocked.has('first_blood')).toBe(true);
  });

  it('pentakill requires exactly 5 case studies', () => {
    const ctx = baseCtx();
    ['a','b','c','d'].forEach(s => ctx.caseStudiesOpened.add(s));
    expect(evaluateAchievements(ctx, new Set()).has('pentakill')).toBe(false);
    ctx.caseStudiesOpened.add('e');
    expect(evaluateAchievements(ctx, new Set()).has('pentakill')).toBe(true);
  });

  it('konami_master only after unlock', () => {
    const ctx = baseCtx();
    expect(evaluateAchievements(ctx, new Set()).has('konami_master')).toBe(false);
    ctx.konamiUnlocked = true;
    expect(evaluateAchievements(ctx, new Set()).has('konami_master')).toBe(true);
  });

  it('already-unlocked are not re-unlocked', () => {
    const ctx = baseCtx();
    ctx.caseStudiesOpened.add('matchfit');
    const already = new Set(['first_blood']);
    expect(evaluateAchievements(ctx, already).has('first_blood')).toBe(false);
  });
});
```

- [ ] **Step 2: Run (fails)**

Run: `npm test -- achievements`
Expected: FAIL.

- [ ] **Step 3: Implement lib/achievements.ts**

```ts
export type EvalContext = {
  caseStudiesOpened: Set<string>;
  konamiUnlocked: boolean;
  eggsFound: Set<string>;
  langSwitched: boolean;
  scoreReached21: boolean;
  sectionsVisitedInOneMinute: number;
};

export type Achievement = {
  id: string;
  category: 'case_studies' | 'exploration' | 'form';
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  visibleIn: 'always' | 'arcade';
  condition: (ctx: EvalContext) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', category: 'case_studies',
    title: { fr: 'First Blood', en: 'First Blood' },
    description: { fr: 'Premier case study lu', en: 'First case study opened' },
    visibleIn: 'arcade',
    condition: c => c.caseStudiesOpened.size >= 1 },
  { id: 'double_kill', category: 'case_studies',
    title: { fr: 'Double Kill', en: 'Double Kill' },
    description: { fr: 'Deux case studies lus', en: 'Two case studies' },
    visibleIn: 'arcade',
    condition: c => c.caseStudiesOpened.size >= 2 },
  { id: 'triple_kill', category: 'case_studies',
    title: { fr: 'Triple Kill', en: 'Triple Kill' },
    description: { fr: 'Trois case studies lus', en: 'Three case studies' },
    visibleIn: 'arcade',
    condition: c => c.caseStudiesOpened.size >= 3 },
  { id: 'quadrakill', category: 'case_studies',
    title: { fr: 'Quadrakill', en: 'Quadrakill' },
    description: { fr: 'Quatre case studies lus', en: 'Four case studies' },
    visibleIn: 'arcade',
    condition: c => c.caseStudiesOpened.size >= 4 },
  { id: 'pentakill', category: 'case_studies',
    title: { fr: 'Pentakill', en: 'Pentakill' },
    description: { fr: 'Cinq case studies lus', en: 'Five case studies' },
    visibleIn: 'arcade',
    condition: c => c.caseStudiesOpened.size >= 5 },
  { id: 'konami_master', category: 'exploration',
    title: { fr: 'Konami Master', en: 'Konami Master' },
    description: { fr: 'Code Konami complet', en: 'Konami code entered' },
    visibleIn: 'arcade',
    condition: c => c.konamiUnlocked },
  { id: 'set_won', category: 'exploration',
    title: { fr: 'Set Won', en: 'Set Won' },
    description: { fr: 'Score atteint 21', en: 'Score reached 21' },
    visibleIn: 'arcade',
    condition: c => c.scoreReached21 },
  { id: 'polyglot', category: 'exploration',
    title: { fr: 'Polyglot', en: 'Polyglot' },
    description: { fr: 'Tu as switché FR ⇄ EN', en: 'You switched FR ⇄ EN' },
    visibleIn: 'arcade',
    condition: c => c.langSwitched },
  { id: 'speedrunner', category: 'exploration',
    title: { fr: 'Speedrunner', en: 'Speedrunner' },
    description: { fr: 'Toutes sections en moins d\'1 min', en: 'All sections under 1 min' },
    visibleIn: 'arcade',
    condition: c => c.sectionsVisitedInOneMinute >= 5 },
  { id: 'match_point_sent', category: 'form',
    title: { fr: 'Match Point !', en: 'Match Point!' },
    description: { fr: 'Formulaire envoyé', en: 'Contact form sent' },
    visibleIn: 'always',
    condition: c => c.eggsFound.has('form_submitted') }
];

export function evaluateAchievements(ctx: EvalContext, already: Set<string>): Set<string> {
  const newly = new Set<string>();
  for (const a of ACHIEVEMENTS) {
    if (already.has(a.id)) continue;
    if (a.condition(ctx)) newly.add(a.id);
  }
  return newly;
}
```

> **Note** — `match_point_sent` triggers via the `form_submitted` egg flag. Form submission code sets it (see Task 33). Pragmatic for V1.

- [ ] **Step 4: Run tests**

Run: `npm test -- achievements`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): achievements registry + evaluation engine (V1 essentials)"
```

---

### Task 13: Implement lib/reduced-motion.ts (SSR-safe hook)

**Files:**
- Create: `lib/reduced-motion.ts`, `tests/unit/reduced-motion.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/unit/reduced-motion.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReducedMotion } from '@/lib/reduced-motion';

function Probe() {
  const reduced = useReducedMotion();
  return <span data-testid="probe">{String(reduced)}</span>;
}

describe('useReducedMotion', () => {
  it('returns false by default (jsdom matchMedia mock returns matches:false)', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe').textContent).toBe('false');
  });
});
```

- [ ] **Step 2: Run (fails)**

Run: `npm test -- reduced-motion`
Expected: FAIL.

- [ ] **Step 3: Implement lib/reduced-motion.ts**

```ts
'use client';
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run**

Run: `npm test -- reduced-motion`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): SSR-safe useReducedMotion hook"
```

---

## Phase 4 — i18n routing scaffold

### Task 14: Add next-intl + restructure to /[lang] routing

**Files:**
- Create: `messages/fr.json`, `messages/en.json`, `lib/i18n.ts`, `middleware.ts`, `app/[lang]/layout.tsx`, `app/[lang]/page.tsx`
- Delete: `app/layout.tsx`, `app/page.tsx` (moved into [lang])
- Modify: `next.config.mjs`

- [ ] **Step 1: Install next-intl**

Run: `npm install next-intl`

- [ ] **Step 2: Write messages/fr.json**

```json
{
  "nav": { "home": "Accueil", "projects": "Projets", "now": "Now", "skills": "Compétences", "contact": "Contact" },
  "service": {
    "title": "William Lin",
    "tagline": "Développeur Full Stack. Disponible en alternance — septembre 2026.",
    "cta": "Contactez-moi"
  },
  "rallye": { "title": "Rallye", "subtitle": "À propos" },
  "smashes": { "title": "Smashes", "subtitle": "Projets" },
  "drop": { "title": "Drop shot", "subtitle": "Entraînement du moment" },
  "matchpoint": { "title": "Match Point", "subtitle": "Discutons ensemble" },
  "score": { "label": "SET 1", "ariaLive": "Score : {points} sur 21" },
  "lang": { "switch": "EN" }
}
```

- [ ] **Step 3: Write messages/en.json**

```json
{
  "nav": { "home": "Home", "projects": "Projects", "now": "Now", "skills": "Skills", "contact": "Contact" },
  "service": {
    "title": "William Lin",
    "tagline": "Full Stack developer. Available for apprenticeship — September 2026.",
    "cta": "Get in touch"
  },
  "rallye": { "title": "Rally", "subtitle": "About" },
  "smashes": { "title": "Smashes", "subtitle": "Projects" },
  "drop": { "title": "Drop shot", "subtitle": "What I'm working on now" },
  "matchpoint": { "title": "Match Point", "subtitle": "Let's talk" },
  "score": { "label": "SET 1", "ariaLive": "Score: {points} out of 21" },
  "lang": { "switch": "FR" }
}
```

- [ ] **Step 4: Create lib/i18n.ts**

```ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (!requested || !locales.includes(requested as Locale)) notFound();
  return {
    locale: requested,
    messages: (await import(`../messages/${requested}.json`)).default
  };
});
```

- [ ] **Step 5: Create middleware.ts**

```ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

- [ ] **Step 6: Modify next.config.mjs**

```js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { typedRoutes: true }
};
export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Move app/layout.tsx + app/page.tsx into [lang]/**

Run:
```bash
mkdir -p app/[lang]
git mv app/layout.tsx app/[lang]/layout.tsx
git mv app/page.tsx app/[lang]/page.tsx
```

- [ ] **Step 8: Update app/[lang]/layout.tsx**

```tsx
import '../globals.css';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

const migra = localFont({ src: '../../public/fonts/Migra-Italic.woff2', variable: '--font-migra', display: 'swap' });
const montreal = localFont({
  src: [
    { path: '../../public/fonts/NeueMontreal-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/NeueMontreal-Medium.woff2', weight: '500' }
  ],
  variable: '--font-montreal', display: 'swap'
});
const jbm = localFont({ src: '../../public/fonts/JetBrainsMonoVar.woff2', variable: '--font-jbm', display: 'swap' });

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export const metadata = {
  title: 'William Lin · Match Point',
  description: 'Portfolio · Développeur Full Stack · Disponible en alternance'
};

export default async function LangLayout({
  children,
  params
}: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={lang} className={`${migra.variable} ${montreal.variable} ${jbm.variable}`}>
      <body className="font-sans bg-hall-floor text-ink">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Add a root redirect**

Create `app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
export default function Root() { redirect('/fr'); }
```

Hmm, actually — middleware handles this. Skip this step if middleware redirects properly. Verify:

Run: `npm run dev` → open `http://localhost:3000` → expect redirect to `http://localhost:3000/fr`.

- [ ] **Step 10: Update sanity e2e (path changed)**

Modify `tests/e2e/sanity.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home loads at /fr', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.getByText('Match Point.')).toBeVisible();
});
```

Run: `npm run e2e`
Expected: 1 passed.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(i18n): restructure to /[lang] with next-intl (FR default, EN)"
```

---

## Phase 5 — Court, cursor, scoreboard

### Task 15: CourtBackground SVG component

**Files:**
- Create: `components/court/court-zones.ts`, `components/court/CourtBackground.tsx`

- [ ] **Step 1: Write components/court/court-zones.ts**

```ts
// Real badminton singles court : 13.40 m × 6.10 m (length × width)
// Rendered top-down. Viewbox uses these proportions.
export const COURT = {
  vbWidth: 1340,   // length (we render court rotated 90deg so length = horizontal)
  vbHeight: 610,
  net: 670,
  shortServiceLine: 198, // 1.98 m from net
  backServiceDoubles: 76 // from back boundary, doubles long-service line
};

export type ZoneName = 'service' | 'rallye' | 'smashes' | 'drop' | 'matchpoint';

export const ZONES: Record<ZoneName, { x: number; y: number; w: number; h: number; label: string }> = {
  service:    { x: 0,    y: 0,   w: 670,  h: 305, label: 'Service'    },
  rallye:     { x: 0,    y: 305, w: 670,  h: 305, label: 'Rallye'     },
  smashes:    { x: 670,  y: 0,   w: 670,  h: 200, label: 'Smashes'    },
  drop:       { x: 670,  y: 200, w: 670,  h: 200, label: 'Drop shot'  },
  matchpoint: { x: 670,  y: 400, w: 670,  h: 210, label: 'Match Point'}
};
```

- [ ] **Step 2: Write components/court/CourtBackground.tsx**

```tsx
import { COURT } from './court-zones';

export function CourtBackground({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg
      viewBox={`0 0 ${COURT.vbWidth} ${COURT.vbHeight}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ opacity }}
    >
      {/* outer rect */}
      <rect x="2" y="2" width={COURT.vbWidth - 4} height={COURT.vbHeight - 4}
            fill="none" stroke="var(--color-court-line)" strokeWidth="3" />
      {/* net */}
      <line x1={COURT.net} y1="0" x2={COURT.net} y2={COURT.vbHeight}
            stroke="var(--color-net-green)" strokeWidth="4" strokeDasharray="6 8" />
      {/* short service lines */}
      <line x1={COURT.net - COURT.shortServiceLine} y1="0"
            x2={COURT.net - COURT.shortServiceLine} y2={COURT.vbHeight}
            stroke="var(--color-court-line)" strokeWidth="2" />
      <line x1={COURT.net + COURT.shortServiceLine} y1="0"
            x2={COURT.net + COURT.shortServiceLine} y2={COURT.vbHeight}
            stroke="var(--color-court-line)" strokeWidth="2" />
      {/* center service lines */}
      <line x1="2" y1={COURT.vbHeight / 2} x2={COURT.net - COURT.shortServiceLine} y2={COURT.vbHeight / 2}
            stroke="var(--color-court-line)" strokeWidth="2" />
      <line x1={COURT.net + COURT.shortServiceLine} y1={COURT.vbHeight / 2}
            x2={COURT.vbWidth - 2} y2={COURT.vbHeight / 2}
            stroke="var(--color-court-line)" strokeWidth="2" />
      {/* doubles back service lines */}
      <line x1="2" y1={COURT.backServiceDoubles} x2={COURT.vbWidth - 2} y2={COURT.backServiceDoubles}
            stroke="var(--color-court-line)" strokeWidth="1.5" strokeDasharray="6 6" />
      <line x1="2" y1={COURT.vbHeight - COURT.backServiceDoubles}
            x2={COURT.vbWidth - 2} y2={COURT.vbHeight - COURT.backServiceDoubles}
            stroke="var(--color-court-line)" strokeWidth="1.5" strokeDasharray="6 6" />
    </svg>
  );
}
```

- [ ] **Step 3: Add to home page**

Modify `app/[lang]/page.tsx`:
```tsx
import { CourtBackground } from '@/components/court/CourtBackground';

export default function HomePage() {
  return (
    <>
      <CourtBackground />
      <main className="relative min-h-screen p-10">
        <h1 className="font-display italic text-7xl">Match Point.</h1>
      </main>
    </>
  );
}
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev` → visit `/fr` → see the court lines subtly behind the title.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(court): add SVG court background with real badminton proportions"
```

---

### Task 16: ShuttleCursor base component

**Files:**
- Create: `components/cursor/ShuttleCursor.tsx`
- Modify: `app/[lang]/layout.tsx`

- [ ] **Step 1: Install Framer Motion**

Run: `npm install framer-motion`

- [ ] **Step 2: Write components/cursor/ShuttleCursor.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/lib/reduced-motion';

export function ShuttleCursor() {
  const reduced = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (reduced || coarse) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, coarse, x, y]);

  if (reduced || coarse) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy, position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
    >
      <svg width="20" height="20" viewBox="-10 -10 20 20">
        <circle r="6" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="1.2" />
        <line x1="-3" y1="-5" x2="-8" y2="-9" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="-3" y1="0" x2="-9" y2="0" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="-3" y1="5" x2="-8" y2="9" stroke="var(--color-ink)" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
```

- [ ] **Step 3: Mount in layout**

Modify `app/[lang]/layout.tsx` body :
```tsx
<body className="font-sans bg-hall-floor text-ink">
  <ShuttleCursor />
  <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
</body>
```
Add import: `import { ShuttleCursor } from '@/components/cursor/ShuttleCursor';`

- [ ] **Step 4: Verify**

Run: `npm run dev` → visit `/fr` → move mouse, see yellow shuttlecock follow with spring lag. On a phone (or DevTools mobile emulator), no cursor.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(cursor): ShuttleCursor with spring physics, hidden on touch + reduced-motion"
```

---

### Task 17: ShuttleCursor click smash + feather trail

**Files:**
- Modify: `components/cursor/ShuttleCursor.tsx`
- Create: `components/cursor/shuttle-trail.ts`

- [ ] **Step 1: Implement trail particle pool**

Create `components/cursor/shuttle-trail.ts`:
```ts
export type Feather = { id: number; x: number; y: number; born: number };

let nextId = 0;
const MAX_FEATHERS = 12;

export function spawnFeather(list: Feather[], x: number, y: number, now: number): Feather[] {
  const next = [...list, { id: nextId++, x, y, born: now }];
  return next.length > MAX_FEATHERS ? next.slice(-MAX_FEATHERS) : next;
}

export function pruneFeathers(list: Feather[], now: number, lifespanMs = 600): Feather[] {
  return list.filter(f => now - f.born < lifespanMs);
}
```

- [ ] **Step 2: Modify ShuttleCursor.tsx to add trail + click smash**

Update the component to track trail state and a "smashing" flag:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/lib/reduced-motion';
import { spawnFeather, pruneFeathers, type Feather } from './shuttle-trail';

export function ShuttleCursor() {
  const reduced = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const [trail, setTrail] = useState<Feather[]>([]);
  const [smashing, setSmashing] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });
  const lastSpawn = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (reduced || coarse) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const now = performance.now();
      if (now - lastSpawn.current > 40) {
        lastSpawn.current = now;
        setTrail(t => spawnFeather(t, e.clientX, e.clientY, now));
      }
    };
    const onClick = () => {
      setSmashing(true);
      setTimeout(() => setSmashing(false), 120);
    };
    const onTick = () => setTrail(t => pruneFeathers(t, performance.now()));
    const interval = window.setInterval(onTick, 80);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onClick);
      window.clearInterval(interval);
    };
  }, [reduced, coarse, x, y]);

  if (reduced || coarse) return null;

  return (
    <>
      {/* trail */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[9998]">
        {trail.map(f => {
          const age = (performance.now() - f.born) / 600;
          const opacity = Math.max(0, 1 - age);
          return (
            <span key={f.id}
              style={{
                position: 'absolute', left: f.x - 2, top: f.y - 2,
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--color-shuttle)', opacity
              }}
            />
          );
        })}
      </div>
      <motion.div
        aria-hidden="true"
        animate={smashing ? { scale: 1.4, rotate: 25 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.12 }}
        style={{ x: sx, y: sy, position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
      >
        <svg width="20" height="20" viewBox="-10 -10 20 20">
          <circle r="6" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="1.2" />
          <line x1="-3" y1="-5" x2="-8" y2="-9" stroke="var(--color-ink)" strokeWidth="1" />
          <line x1="-3" y1="0" x2="-9" y2="0" stroke="var(--color-ink)" strokeWidth="1" />
          <line x1="-3" y1="5" x2="-8" y2="9" stroke="var(--color-ink)" strokeWidth="1" />
        </svg>
      </motion.div>
    </>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev`, move mouse → trail. Click → smash animation.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(cursor): add feather trail and click-smash animation"
```

---

### Task 18: Score context provider + Scoreboard component

**Files:**
- Create: `components/scoreboard/ScoreProvider.tsx`, `components/scoreboard/Scoreboard.tsx`, `components/scoreboard/useScoreEvent.ts`
- Modify: `app/[lang]/layout.tsx`

- [ ] **Step 1: Write ScoreProvider**

`components/scoreboard/ScoreProvider.tsx`:
```tsx
'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { applyEvent, createScoreState, type ScoreEvent, type ScoreState } from '@/lib/score';
import { storage } from '@/lib/storage';

const KEY = 'mp.score';

type Ctx = { state: ScoreState; emit: (e: ScoreEvent) => void };
const ScoreCtx = createContext<Ctx | null>(null);

function reducer(state: ScoreState, e: ScoreEvent): ScoreState {
  return applyEvent(state, e);
}

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as ScoreState, () =>
    storage.get<ScoreState>(KEY, createScoreState())
  );

  useEffect(() => { storage.set(KEY, state); }, [state]);

  return (
    <ScoreCtx.Provider value={{ state, emit: dispatch }}>
      {children}
    </ScoreCtx.Provider>
  );
}

export function useScore(): Ctx {
  const ctx = useContext(ScoreCtx);
  if (!ctx) throw new Error('useScore must be used inside ScoreProvider');
  return ctx;
}
```

- [ ] **Step 2: Write Scoreboard**

`components/scoreboard/Scoreboard.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { useScore } from './ScoreProvider';

export function Scoreboard() {
  const t = useTranslations('score');
  const { state } = useScore();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('ariaLive', { points: state.points })}
      className="fixed top-4 right-4 z-50 bg-ink text-hall-floor px-3 py-2 font-mono text-xs tracking-widest"
    >
      {t('label')} · {String(state.points).padStart(2, '0')} — 21
    </div>
  );
}
```

- [ ] **Step 3: Write useScoreEvent helper**

`components/scoreboard/useScoreEvent.ts`:
```ts
'use client';
import { useEffect } from 'react';
import { useScore } from './ScoreProvider';
import type { ScoreEvent } from '@/lib/score';

export function useScoreEvent(event: ScoreEvent | null) {
  const { emit } = useScore();
  useEffect(() => {
    if (event) emit(event);
  }, [event, emit]);
}
```

- [ ] **Step 4: Mount in layout**

Modify `app/[lang]/layout.tsx`:
```tsx
import { ScoreProvider } from '@/components/scoreboard/ScoreProvider';
import { Scoreboard } from '@/components/scoreboard/Scoreboard';
// ...
<NextIntlClientProvider messages={messages}>
  <ScoreProvider>
    <Scoreboard />
    {children}
  </ScoreProvider>
</NextIntlClientProvider>
```

- [ ] **Step 5: Test interaction (manual)**

Open browser console at `/fr`, run:
```js
JSON.parse(localStorage.getItem('mp.score'))
```
Expect `{ points: 0, events: [], matchPoint: false }`. Scoreboard shows `SET 1 · 00 — 21`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(scoreboard): add provider + sticky scoreboard wired to lib/score"
```

---

### Task 19: Section read intersection observer

**Files:**
- Create: `components/scoreboard/ScoredSection.tsx`

- [ ] **Step 1: Implement ScoredSection**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { useScore } from './ScoreProvider';

type Props = { id: string; children: React.ReactNode; className?: string };

export function ScoredSection({ id, children, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { emit } = useScore();
  const fired = useRef(false);

  useEffect(() => {
    if (!ref.current || fired.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.intersectionRatio >= 0.7 && !fired.current) {
        // 2s dwell timer
        const t = window.setTimeout(() => {
          if (!fired.current) {
            fired.current = true;
            emit({ type: 'section_read', id });
          }
        }, 2000);
        return () => window.clearTimeout(t);
      }
    }, { threshold: [0.7] });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [id, emit]);

  return <section ref={ref} id={id} className={className}>{children}</section>;
}
```

- [ ] **Step 2: Skip test for now**

Visual section components in Phase 6 will use this. Verification happens then.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(scoreboard): ScoredSection that emits section_read on 70% / 2s dwell"
```

---

### Task 20: MatchPointScene celebration overlay

**Files:**
- Create: `components/scoreboard/MatchPointScene.tsx`
- Modify: `components/scoreboard/Scoreboard.tsx` to trigger

- [ ] **Step 1: Write MatchPointScene**

```tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';

export function MatchPointScene({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Match point celebration"
          className="fixed inset-0 z-[10000] bg-hall-floor/95 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* confetti shuttles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
              animate={{ y: window.innerHeight + 50, rotate: 360 }}
              transition={{ duration: 2 + Math.random(), ease: 'easeIn' }}
              style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%',
                       background: 'var(--color-shuttle)', border: '1px solid var(--color-ink)' }}
            />
          ))}
          <h2 className="font-display italic text-8xl text-ink">Match Point.</h2>
          <button onClick={onClose}
            className="mt-8 font-mono text-xs underline text-ink">
            continuer la visite →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire into Scoreboard**

Modify `components/scoreboard/Scoreboard.tsx`:
```tsx
'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useScore } from './ScoreProvider';
import { MatchPointScene } from './MatchPointScene';

export function Scoreboard() {
  const t = useTranslations('score');
  const { state } = useScore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (state.matchPoint) setShow(true);
  }, [state.matchPoint]);

  return (
    <>
      <div role="status" aria-live="polite"
           aria-label={t('ariaLive', { points: state.points })}
           className="fixed top-4 right-4 z-50 bg-ink text-hall-floor px-3 py-2 font-mono text-xs tracking-widest">
        {t('label')} · {String(state.points).padStart(2, '0')} — 21
      </div>
      <MatchPointScene visible={show} onClose={() => setShow(false)} />
    </>
  );
}
```

- [ ] **Step 3: Manual test**

Open DevTools console at `/fr`, force the state:
```js
localStorage.setItem('mp.score', JSON.stringify({ points: 21, events: [], matchPoint: true }));
location.reload();
```
Expect: confetti + "Match Point." overlay. Click "continuer" to dismiss.

Clean up:
```js
localStorage.removeItem('mp.score'); location.reload();
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(scoreboard): MatchPointScene celebration overlay at 21"
```

---

## Phase 6 — Home sections

### Task 21: Service (hero) section

**Files:**
- Create: `components/sections/Service.tsx`
- Modify: `app/[lang]/page.tsx`

- [ ] **Step 1: Write Service.tsx**

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import Image from 'next/image';

export function Service() {
  const t = useTranslations('service');
  return (
    <ScoredSection id="service" className="min-h-[80vh] flex items-center px-6 md:px-16 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
        <div>
          <p className="font-mono text-xs tracking-widest text-court-line uppercase">Service · zone départ</p>
          <h1 className="font-display italic text-6xl md:text-8xl mt-4 leading-none">{t('title')}</h1>
          <p className="font-sans text-lg md:text-xl mt-6 max-w-md leading-relaxed">{t('tagline')}</p>
          <a href="#matchpoint"
             className="inline-block mt-8 px-6 py-3 bg-ink text-hall-floor font-mono text-sm hover:bg-court-line transition-colors">
            {t('cta')} →
          </a>
        </div>
        <div className="relative aspect-square max-w-md mx-auto">
          <Image src="/images/profile.jpg" alt="Portrait de William Lin"
                 fill className="object-cover grayscale-[20%]" priority />
        </div>
      </div>
    </ScoredSection>
  );
}
```

- [ ] **Step 2: Use it on home**

`app/[lang]/page.tsx`:
```tsx
import { CourtBackground } from '@/components/court/CourtBackground';
import { Service } from '@/components/sections/Service';

export default function HomePage() {
  return (
    <>
      <CourtBackground />
      <main className="relative">
        <Service />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify**

`npm run dev` → `/fr` → hero displays with portrait + CTA. After 2s in viewport, score becomes 1.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(sections): add Service hero section"
```

---

### Task 22: skills.json data + SkillCourt component

**Files:**
- Create: `content/data/skills.json`, `components/skill-court/skill-positions.ts`, `components/skill-court/SkillCourt.tsx`, `components/skill-court/SkillPanel.tsx`

- [ ] **Step 1: Write content/data/skills.json**

```json
[
  { "name": "HTML", "category": "Frontend", "level": 5, "lastUsed": "2026-04", "icon": "html", "color": "#E34F26",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · structure SPA" }] },
  { "name": "CSS", "category": "Frontend", "level": 5, "lastUsed": "2026-04", "icon": "css", "color": "#1572B6",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · responsive" }] },
  { "name": "JavaScript", "category": "Frontend", "level": 4, "lastUsed": "2026-05", "icon": "js", "color": "#F7DF1E",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · logique métier" }] },
  { "name": "TypeScript", "category": "Frontend", "level": 3, "lastUsed": "2026-05", "icon": "ts", "color": "#3178C6",
    "proofs": [{ "type": "project", "ref": "this-portfolio", "label": "Ce portfolio (TS strict)" }] },
  { "name": "React", "category": "Frontend", "level": 4, "lastUsed": "2026-05", "icon": "react", "color": "#61DAFB",
    "proofs": [{ "type": "project", "ref": "restaurant", "label": "Restaurant SPA" },
               { "type": "project", "ref": "this-portfolio", "label": "Ce portfolio (Next.js)" }] },
  { "name": "Vue.js", "category": "Frontend", "level": 4, "lastUsed": "2025-12", "icon": "vue", "color": "#4FC08D",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · UI complète" }] },
  { "name": ".NET", "category": "Backend", "level": 3, "lastUsed": "2025-10", "icon": "dotnet", "color": "#512BD4",
    "proofs": [{ "type": "course", "ref": "efrei-s4", "label": "Cours EFREI" }] },
  { "name": "C#", "category": "Backend", "level": 3, "lastUsed": "2025-10", "icon": "csharp", "color": "#239120",
    "proofs": [{ "type": "course", "ref": "efrei-s4", "label": "Cours EFREI" }] },
  { "name": "Node.js", "category": "Backend", "level": 3, "lastUsed": "2026-02", "icon": "node", "color": "#339933",
    "proofs": [{ "type": "project", "ref": "ecommerce", "label": "E-commerce · API" }] },
  { "name": "PHP", "category": "Backend", "level": 4, "lastUsed": "2025-11", "icon": "php", "color": "#777BB4",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · backend" },
               { "type": "project", "ref": "ecommerce", "label": "E-commerce" }] },
  { "name": "Symfony", "category": "Backend", "level": 3, "lastUsed": "2025-09", "icon": "symfony", "color": "#000000",
    "proofs": [{ "type": "course", "ref": "efrei-s5", "label": "Cours EFREI" }] },
  { "name": "Python", "category": "Backend", "level": 3, "lastUsed": "2026-01", "icon": "python", "color": "#3776AB",
    "proofs": [{ "type": "course", "ref": "efrei-s4", "label": "Cours EFREI" }] },
  { "name": "MariaDB", "category": "Database", "level": 3, "lastUsed": "2025-10", "icon": "mariadb", "color": "#003545",
    "proofs": [{ "type": "course", "ref": "efrei-s4", "label": "Cours EFREI" }] },
  { "name": "MongoDB", "category": "Database", "level": 3, "lastUsed": "2025-11", "icon": "mongodb", "color": "#47A248",
    "proofs": [{ "type": "course", "ref": "efrei-s5", "label": "Cours EFREI" }] },
  { "name": "MySQL", "category": "Database", "level": 4, "lastUsed": "2025-11", "icon": "mysql", "color": "#4479A1",
    "proofs": [{ "type": "project", "ref": "ecommerce", "label": "E-commerce · schéma + requêtes" }] },
  { "name": "PostgreSQL", "category": "Database", "level": 4, "lastUsed": "2025-12", "icon": "postgres", "color": "#336791",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · DB principale" }] },
  { "name": "Docker", "category": "Tools", "level": 3, "lastUsed": "2025-12", "icon": "docker", "color": "#2496ED",
    "proofs": [{ "type": "project", "ref": "matchfit", "label": "MatchFit · dev env" }] },
  { "name": "Git", "category": "Tools", "level": 4, "lastUsed": "2026-05", "icon": "git", "color": "#181717",
    "proofs": [{ "type": "project", "ref": "this-portfolio", "label": "Ce portfolio" }] },
  { "name": "Figma", "category": "Tools", "level": 3, "lastUsed": "2025-12", "icon": "figma", "color": "#F24E1E",
    "proofs": [{ "type": "project", "ref": "restaurant", "label": "Restaurant · design" }] }
]
```

- [ ] **Step 2: Position helper**

`components/skill-court/skill-positions.ts`:
```ts
// Court is rendered horizontally : x = length, y = width.
// Zones (vbWidth=1340, vbHeight=610):
//  Backcourt left  = 0 to 200 (Frontend)
//  Backcourt right = 1140 to 1340 (Backend)
//  Midcourt        = 472 to 868 (Database)
//  Forecourt       = 538 to 802 vertically centred (Tools)

const slotsForCount = (count: number, start: number, end: number, y: number) => {
  const step = (end - start) / (count + 1);
  return Array.from({ length: count }, (_, i) => ({ x: start + step * (i + 1), y }));
};

export function getPositions(category: 'Frontend' | 'Backend' | 'Database' | 'Tools', count: number) {
  switch (category) {
    case 'Frontend': return slotsForCount(count, 50, 600, 100);
    case 'Backend':  return slotsForCount(count, 740, 1290, 100);
    case 'Database': return slotsForCount(count, 472, 868, 305);
    case 'Tools':    return slotsForCount(count, 538, 802, 510);
  }
}
```

- [ ] **Step 3: SkillCourt component**

`components/skill-court/SkillCourt.tsx`:
```tsx
'use client';
import { useState } from 'react';
import skillsData from '@/content/data/skills.json';
import { getPositions } from './skill-positions';
import { COURT } from '@/components/court/court-zones';
import { useScore } from '@/components/scoreboard/ScoreProvider';
import { SkillPanel } from './SkillPanel';

type Skill = typeof skillsData[number];
const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools'] as const;

export function SkillCourt() {
  const [active, setActive] = useState<Skill | null>(null);
  const { emit } = useScore();

  const byCategory: Record<string, Skill[]> = {};
  for (const c of CATEGORIES) byCategory[c] = skillsData.filter(s => s.category === c);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${COURT.vbWidth} ${COURT.vbHeight}`} className="w-full h-auto">
        <rect x="0" y="0" width={COURT.vbWidth} height={COURT.vbHeight} fill="none"
              stroke="var(--color-court-line)" strokeWidth="3" />
        <line x1={COURT.net} y1="0" x2={COURT.net} y2={COURT.vbHeight}
              stroke="var(--color-net-green)" strokeWidth="4" strokeDasharray="6 8" />
        {CATEGORIES.map(cat => {
          const list = byCategory[cat]!;
          const positions = getPositions(cat, list.length);
          return list.map((s, i) => {
            const p = positions[i]!;
            return (
              <g key={s.name} transform={`translate(${p.x},${p.y})`}
                 onMouseEnter={() => { setActive(s); emit({ type: 'skill_inspect', name: s.name }); }}
                 onMouseLeave={() => setActive(null)}
                 style={{ cursor: 'pointer' }}>
                <circle r="34" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="2" />
                <text textAnchor="middle" dy="5" fontFamily="var(--font-jbm)" fontSize="14" fill="var(--color-ink)">
                  {s.name.slice(0, 4)}
                </text>
              </g>
            );
          });
        })}
      </svg>
      <SkillPanel skill={active} />
    </div>
  );
}
```

- [ ] **Step 4: SkillPanel**

`components/skill-court/SkillPanel.tsx`:
```tsx
type Skill = {
  name: string; level: number; lastUsed: string;
  proofs: { type: string; ref: string; label: string }[];
};

export function SkillPanel({ skill }: { skill: Skill | null }) {
  if (!skill) return null;
  return (
    <div className="absolute top-2 right-2 max-w-xs bg-ink text-hall-floor p-4 font-mono text-xs space-y-2"
         role="status" aria-live="polite">
      <div className="font-display italic text-2xl not-italic">{skill.name}</div>
      <div>Niveau · {'★'.repeat(skill.level)}{'☆'.repeat(5 - skill.level)}</div>
      <div>Dernière utilisation · {skill.lastUsed}</div>
      <div className="pt-2 border-t border-hall-floor/20">
        Preuves :
        <ul className="list-disc list-inside">
          {skill.proofs.map(p => <li key={p.label}>{p.label}</li>)}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

We need to render this somewhere. We will use it in Rallye section in next task. For now, just import in a placeholder. Skip visual verification here.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(skill-court): interactive skill court with skills.json + side panel"
```

---

### Task 23: Rallye section (about + skill court mini)

**Files:**
- Create: `content/data/cv.json`, `components/sections/Rallye.tsx`
- Modify: `app/[lang]/page.tsx`

- [ ] **Step 1: Write content/data/cv.json**

```json
{
  "name": "William Lin",
  "headline": { "fr": "Développeur Full Stack en devenir", "en": "Full Stack developer in the making" },
  "availability": { "fr": "Alternance · Septembre 2026", "en": "Apprenticeship · September 2026" },
  "school": "EFREI · Bachelor Développement Web & Application (2023-2026)",
  "club": "EFREI Bad · joueur loisir",
  "email": "linwilliam14@gmail.com",
  "links": {
    "github": "https://github.com/william7865",
    "linkedin": "https://www.linkedin.com/in/william-lin-623165295/"
  },
  "about": {
    "fr": [
      "Étudiant en Bachelor Développement Web à l'EFREI (2023-2026). Mon cap : devenir Développeur Full Stack et maîtriser autant le front que le back.",
      "Orienté code, bonnes pratiques et qualité logicielle. Curieux et rigoureux, j'aime résoudre des problèmes concrets et progresser en continu.",
      "Hors écran : badminton à l'asso EFREI (loisir), Minecraft et League of Legends."
    ],
    "en": [
      "Bachelor Web Development student at EFREI (2023-2026). My goal: become a Full Stack developer comfortable both on the front and the back.",
      "Code-oriented, focused on good practices and software quality. Curious and rigorous, I like solving real problems and improving continuously.",
      "Off-screen: badminton at EFREI's club (casual), Minecraft, and League of Legends."
    ]
  }
}
```

- [ ] **Step 2: Add about translation keys**

Extend `messages/fr.json` and `en.json` under `rallye`:
```json
"rallye": { "title": "Rallye", "subtitle": "À propos", "cvButton": "Voir mon CV", "contactButton": "Me contacter" }
```
(EN: `"subtitle": "About me", "cvButton": "View my CV", "contactButton": "Get in touch"`).

- [ ] **Step 3: Write Rallye.tsx**

```tsx
'use client';
import { useTranslations, useLocale } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { SkillCourt } from '@/components/skill-court/SkillCourt';
import cv from '@/content/data/cv.json';

export function Rallye() {
  const t = useTranslations('rallye');
  const locale = useLocale() as 'fr' | 'en';
  const about = cv.about[locale];

  return (
    <ScoredSection id="rallye" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Rallye · {t('subtitle')}</p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        <div className="space-y-4 text-lg leading-relaxed">
          {about.map(p => <p key={p.slice(0, 20)}>{p}</p>)}
          <div className="flex gap-3 pt-4">
            <a href="/CV.pdf" target="_blank" rel="noopener"
               className="px-5 py-2 bg-ink text-hall-floor font-mono text-xs hover:bg-court-line">
              {t('cvButton')} →
            </a>
            <a href={`mailto:${cv.email}`}
               className="px-5 py-2 border border-ink font-mono text-xs hover:bg-ink hover:text-hall-floor">
              {t('contactButton')} →
            </a>
          </div>
        </div>
        <div>
          <SkillCourt />
        </div>
      </div>
    </ScoredSection>
  );
}
```

- [ ] **Step 4: Add to home**

```tsx
import { Rallye } from '@/components/sections/Rallye';
// in HomePage:
<Service />
<Rallye />
```

- [ ] **Step 5: Verify**

Run dev, scroll to about, hover a skill node → side panel appears, score increments.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sections): Rallye (about) section with embedded SkillCourt"
```

---

### Task 24: Smashes (projects preview) section + ProjectCard

**Files:**
- Create: `content/data/projects.json`, `components/projects/ProjectCard.tsx`, `components/sections/Smashes.tsx`
- Modify: `app/[lang]/page.tsx`, `messages/{fr,en}.json`

- [ ] **Step 1: Add translation keys**

`fr.json` `smashes`: `{ "title": "Smashes", "subtitle": "Projets", "viewCase": "Replay analysis", "code": "Code" }`
`en.json` `smashes`: `{ "title": "Smashes", "subtitle": "Projects", "viewCase": "Replay analysis", "code": "Code" }`

- [ ] **Step 2: Write content/data/projects.json**

```json
[
  {
    "slug": "matchfit",
    "title": "MatchFit",
    "tagline": { "fr": "Application web de coaching sportif", "en": "Sport coaching web app" },
    "year": 2024,
    "role": "Full Stack",
    "tags": ["Vue.js", "PHP", "PostgreSQL", "Docker", "GitHub Actions"],
    "image": "/images/projects/matchfit.png",
    "repo": "https://github.com/william7865/MatchFit",
    "demo": null,
    "tier": 4
  },
  {
    "slug": "ecommerce",
    "title": "Site E-Commerce",
    "tagline": { "fr": "Catalogue produits + admin sécurisé", "en": "Product catalog + secure admin" },
    "year": 2024,
    "role": "Back/Front",
    "tags": ["PHP", "MySQL"],
    "image": "/images/projects/ecommerce.png",
    "repo": "https://github.com/william7865/E_commerce",
    "demo": null,
    "tier": 3
  },
  {
    "slug": "restaurant",
    "title": "Restaurant SPA",
    "tagline": { "fr": "Template multilingue pour clients Arcsolu", "en": "Multilingual template for Arcsolu clients" },
    "year": 2024,
    "role": "Front",
    "tags": ["React.js", "Figma", "i18n"],
    "image": "/images/projects/restaurant.png",
    "repo": null,
    "demo": null,
    "tier": 3
  }
]
```

- [ ] **Step 3: ProjectCard**

`components/projects/ProjectCard.tsx`:
```tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useScore } from '@/components/scoreboard/ScoreProvider';

type Project = {
  slug: string; title: string;
  tagline: { fr: string; en: string };
  year: number; role: string; tags: string[];
  image: string; repo: string | null;
};

export function ProjectCard({ project }: { project: Project }) {
  const locale = useLocale() as 'fr' | 'en';
  const t = useTranslations('smashes');
  const { emit } = useScore();

  return (
    <article className="border border-ink/15 bg-hall-floor hover:bg-ink/[.02] transition-colors">
      <Link href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }} prefetch
            onClick={() => emit({ type: 'project_click', id: project.slug })}>
        <div className="relative aspect-[16/10] bg-muted/10">
          <Image src={project.image} alt={`${project.title} — capture d'écran`} fill className="object-cover" />
        </div>
      </Link>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="font-display italic text-2xl">{project.title}</h3>
          <span className="font-mono text-xs text-muted">{project.year} · {project.role}</span>
        </div>
        <p className="text-sm leading-relaxed">{project.tagline[locale]}</p>
        <div className="flex flex-wrap gap-1">
          {project.tags.map(tag => (
            <span key={tag} className="font-mono text-[10px] px-2 py-0.5 border border-ink/30">{tag}</span>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Link href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
                onClick={() => emit({ type: 'project_click', id: project.slug })}
                className="font-mono text-xs text-court-line hover:underline">
            → {t('viewCase')}
          </Link>
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener"
               className="font-mono text-xs text-muted hover:text-ink hover:underline">
              → {t('code')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Smashes section**

`components/sections/Smashes.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { ProjectCard } from '@/components/projects/ProjectCard';
import projects from '@/content/data/projects.json';

export function Smashes() {
  const t = useTranslations('smashes');
  return (
    <ScoredSection id="smashes" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Smashes · {t('subtitle')}</p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </ScoredSection>
  );
}
```

- [ ] **Step 5: Add to home**

```tsx
import { Smashes } from '@/components/sections/Smashes';
// in HomePage:
<Service /><Rallye /><Smashes />
```

- [ ] **Step 6: Verify**

Dev server → 3 cards visible. Click card → expect 404 (case study route not built yet). That's fine.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(sections): Smashes with project cards (links 404 until Task 28)"
```

---

### Task 25: DropShot section (now teaser)

**Files:**
- Create: `components/sections/DropShot.tsx`
- Modify: `app/[lang]/page.tsx`, `messages/{fr,en}.json`

- [ ] **Step 1: Add translation keys**

`fr.json` `drop`: `{ "title": "Drop shot", "subtitle": "Entraînement du moment", "cta": "Voir la page complète" }`
`en.json` `drop`: `{ "title": "Drop shot", "subtitle": "Current focus", "cta": "See the full page" }`

- [ ] **Step 2: Write DropShot.tsx**

```tsx
'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';

export function DropShot() {
  const t = useTranslations('drop');
  return (
    <ScoredSection id="drop" className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Drop shot · {t('subtitle')}</p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        {/* Teaser pulled from the most recent now-page MDX (V1.1 will wire this dynamically) */}
        Refonte de ce portfolio en Next.js 15. Lecture en cours : <em>Tidy First?</em> (Kent Beck).
        Côté terrain : sessions du jeudi soir avec l'asso EFREI.
      </p>
      <Link href="/now" className="inline-block mt-6 font-mono text-xs text-court-line hover:underline">
        → {t('cta')}
      </Link>
    </ScoredSection>
  );
}
```

> **Note** : the dynamic teaser pulled from latest `content/now/*.mdx` is a V1.1 polish (see roadmap). V1 ships the static excerpt above.

- [ ] **Step 3: Add to home**

```tsx
import { DropShot } from '@/components/sections/DropShot';
// in HomePage:
<Service /><Rallye /><Smashes /><DropShot />
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(sections): DropShot teaser linking to /now"
```

---

### Task 26: MatchPoint section + ContactForm component (UI only, API in Task 33)

**Files:**
- Create: `components/contact/ContactForm.tsx`, `components/sections/MatchPoint.tsx`
- Modify: `app/[lang]/page.tsx`, `messages/{fr,en}.json`

- [ ] **Step 1: Install React Hook Form + Zod**

Run: `npm install react-hook-form zod @hookform/resolvers`

- [ ] **Step 2: Add translation keys**

`fr.json` `matchpoint`:
```json
"matchpoint": {
  "title": "Match Point",
  "subtitle": "Discutons ensemble",
  "lead": "Je cherche une alternance Full Stack démarrant septembre 2026. Si mon profil vous parle, le formulaire ci-dessous arrive directement dans ma boîte.",
  "name": "Votre nom",
  "email": "Votre email",
  "message": "Votre message",
  "send": "Smash décisif →",
  "sending": "Envoi en cours…",
  "success": "Reçu — je réponds sous 48h.",
  "error": "Échec d'envoi. Réessayez ou écrivez-moi : linwilliam14@gmail.com",
  "validation": {
    "name": "Indiquez votre nom (2 caractères min)",
    "email": "Email invalide",
    "message": "Un peu plus long, please (20 caractères min)"
  }
}
```
Mirror in `en.json` with appropriate translations.

- [ ] **Step 3: Write ContactForm.tsx**

```tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useScore } from '@/components/scoreboard/ScoreProvider';

const schema = (msg: { name: string; email: string; message: string }) => z.object({
  name: z.string().min(2, msg.name),
  email: z.string().email(msg.email),
  message: z.string().min(20, msg.message)
});

type FormData = z.infer<ReturnType<typeof schema>>;

export function ContactForm() {
  const t = useTranslations('matchpoint');
  const { emit } = useScore();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema({
      name: t('validation.name'),
      email: t('validation.email'),
      message: t('validation.message')
    }))
  });

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    emit({ type: 'contact_fill' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
      emit({ type: 'contact_send' });
      // Achievement bridge: set the egg flag used by match_point_sent rule
      const raw = localStorage.getItem('mp.eggs');
      const eggs: string[] = raw ? JSON.parse(raw) : [];
      if (!eggs.includes('form_submitted')) {
        localStorage.setItem('mp.eggs', JSON.stringify([...eggs, 'form_submitted']));
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <p className="font-mono text-sm text-court-line" role="status">{t('success')}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('name')}</span>
        <input {...register('name')} type="text" autoComplete="name"
               className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court-line outline-none" />
        {errors.name && <span className="text-xs text-court-line">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('email')}</span>
        <input {...register('email')} type="email" autoComplete="email"
               className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court-line outline-none" />
        {errors.email && <span className="text-xs text-court-line">{errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">{t('message')}</span>
        <textarea {...register('message')} rows={5}
                  className="w-full mt-1 px-3 py-2 bg-transparent border border-ink/30 focus:border-court-line outline-none" />
        {errors.message && <span className="text-xs text-court-line">{errors.message.message}</span>}
      </label>
      <button type="submit" disabled={status === 'sending'}
              className="px-6 py-3 bg-ink text-hall-floor font-mono text-sm hover:bg-court-line disabled:opacity-50">
        {status === 'sending' ? t('sending') : t('send')}
      </button>
      {status === 'error' && <p className="text-xs text-court-line" role="alert">{t('error')}</p>}
    </form>
  );
}
```

- [ ] **Step 4: MatchPoint section**

`components/sections/MatchPoint.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { ContactForm } from '@/components/contact/ContactForm';

export function MatchPoint() {
  const t = useTranslations('matchpoint');
  return (
    <ScoredSection id="matchpoint" className="px-6 md:px-16 py-24 max-w-4xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Match Point · {t('subtitle')}</p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <p className="mt-6 text-lg leading-relaxed max-w-2xl">{t('lead')}</p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </ScoredSection>
  );
}
```

- [ ] **Step 5: Add to home**

```tsx
import { MatchPoint } from '@/components/sections/MatchPoint';
// in HomePage:
<Service /><Rallye /><Smashes /><DropShot /><MatchPoint />
```

- [ ] **Step 6: Verify**

Visit `/fr` → contact form renders, validation errors show on invalid submit. Submit will fail (404 on /api/contact) until Task 33. That's expected.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(sections): MatchPoint section with validated contact form (API in Task 33)"
```

---

## Phase 7 — Sub-pages

### Task 27: Add MDX support + project case study route

**Files:**
- Create: `content/projects/matchfit.mdx`, `content/projects/ecommerce.mdx`, `content/projects/restaurant.mdx`, `lib/mdx.ts`, `app/[lang]/(court)/projects/page.tsx`, `app/[lang]/(court)/projects/[slug]/page.tsx`
- Modify: `next.config.mjs`

> **Note on route group migration**: From Task 27 onwards, pages live under `app/[lang]/(court)/...`. We need to move existing files first.

- [ ] **Step 1: Install MDX deps**

Run: `npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter`

- [ ] **Step 2: Move pages into (court) route group**

Run:
```bash
mkdir -p app/[lang]/(court)
git mv app/[lang]/page.tsx app/[lang]/(court)/page.tsx
```

- [ ] **Step 3: Create (court) layout (carries CourtBackground)**

Create `app/[lang]/(court)/layout.tsx`:
```tsx
import { CourtBackground } from '@/components/court/CourtBackground';

export default function CourtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CourtBackground />
      <main className="relative">{children}</main>
    </>
  );
}
```

And remove the `<CourtBackground />` import/usage from `app/[lang]/(court)/page.tsx` since the layout owns it.

- [ ] **Step 4: Write content/projects/matchfit.mdx (template + real content)**

```mdx
---
title: "MatchFit — Plateforme coachs / élèves"
year: 2024
role: "Full Stack"
duration: "3 mois"
team: "4 personnes"
my_role_detail: "Lead front Vue.js + intégration CI"
tags: [Vue.js, PHP, PostgreSQL, Docker, GitHub Actions]
hero: "/images/projects/matchfit.png"
repo: "https://github.com/william7865/MatchFit"
demo: null
tier: 4
---

## Le contexte

Projet d'équipe (4 personnes, 3 mois) à l'EFREI. Brief : construire une plateforme
de mise en relation entre coachs sportifs et élèves, avec authentification, profils,
recherche par sport, et notation.

## Le scouting

Trois options techniques sur la table :

- **Stack monolithique PHP** — rapide à mettre en route, équipe à l'aise.
- **Vue + API REST PHP** — séparation propre, on apprend la SPA.
- **Full Node + React** — trop éloigné des cours en parallèle, risque de blocage.

Choix : **Vue 3 + PHP custom + PostgreSQL**. Compromis : moderne sans s'éloigner
des compétences solides de l'équipe.

## La stratégie

Décisions clés et trade-offs assumés :

- **Docker dès le jour 1** pour aligner les environnements de dev (4 machines, 2 OS).
  Coût : 1 jour de setup. Bénéfice : zéro bug "ça marche chez moi".
- **GitHub Actions CI** — lint + tests à chaque push. Coût : 2h. Bénéfice : on
  bloque les régressions avant la branche `main`.
- **Pas de framework PHP** — Slim était envisagé puis écarté pour rester au plus
  proche du PHP "pur" enseigné en cours.

## Le rallye

Trois moments-clés du dev :

1. **L'auth** — première implémentation naïve avec sessions. Refonte vers JWT
   après revue de code (sécurité + scalabilité).
2. **La recherche par sport** — index PostgreSQL sur `(sport, ville)` après benchmark
   qui montrait 800ms sur 10k profils. Passé à 40ms.
3. **Le CI cassé en pleine deadline** — Docker compose dépréciait `version: '3'`.
   Fix en 30 min, leçon : pin tes versions.

## Le score final

- **Fonctionnel** : auth, profils coach/élève, recherche, avis, notation, responsive.
- **Tech** : Docker dev env, CI verte, 0 issue critique en démo.
- **Ce que j'ai appris** : la valeur d'un environnement reproductible, l'art du
  trade-off explicite, et que les bons index changent tout.
```

- [ ] **Step 5: Write content/projects/ecommerce.mdx**

```mdx
---
title: "Site E-Commerce — catalogue + admin"
year: 2024
role: "Back/Front"
duration: "2 mois"
team: "Solo"
my_role_detail: "Tout"
tags: [PHP, MySQL]
hero: "/images/projects/ecommerce.png"
repo: "https://github.com/william7865/E_commerce"
demo: null
tier: 3
---

## Le contexte

Projet école — boutique en ligne basique : catalogue produits, panier, espace admin
sécurisé. Contrainte : pas de framework, PHP "pur" + MySQL.

## Le scouting

Pas de stack à choisir (imposée). La vraie question : **comment organiser le code
sans framework** pour rester maintenable ? Trois approches considérées : tout en
procédural (rapide mais ingérable à 50+ fichiers), MVC artisanal (juste milieu),
ou copier la structure d'un mini-framework (overhead pour pas grand-chose).

Choix : **MVC artisanal léger**. Un seul front controller, des controllers
fichiers, des vues séparées, un dossier `models/`.

## La stratégie

- **Requêtes SQL préparées partout** — aucune concaténation. Réflexe sécurité.
- **Sessions PHP standard pour le panier** — KISS, pas de localStorage.
- **Admin séparé par route et middleware** — `auth.php` requis avant tout
  `admin_*.php`.
- **Pagination côté SQL** (`LIMIT/OFFSET`) avant côté PHP pour ne pas charger
  10k lignes en mémoire.

## Le rallye

- Le panier persistant a fallu réfléchir : session pour anon, DB pour connectés,
  fusion à la connexion.
- Premier vrai bug d'injection détecté en revue (encore une concaténation oubliée).
  Refacto complet pour passer à PDO préparé partout.

## Le score final

- Catalogue complet, CRUD admin, panier, pagination, requêtes préparées.
- **Ce que j'ai appris** : un MVC fait main est très formateur. Pas une fois un
  framework et la lumière a faite sur ce qu'ils automatisent.
```

- [ ] **Step 6: Write content/projects/restaurant.mdx**

```mdx
---
title: "Restaurant SPA — template multilingue Arcsolu"
year: 2024
role: "Front"
duration: "5 semaines"
team: "Solo (sur brief client)"
my_role_detail: "Design Figma + dev React"
tags: [React.js, Figma, i18n]
hero: "/images/projects/restaurant.png"
repo: null
demo: null
tier: 3
---

## Le contexte

Mission via Arcsolu (agence) : un template SPA réutilisable pour leurs clients
restaurateurs. Doit être personnalisable (couleurs, contenu, langue) sans
redev complet à chaque déploiement.

## Le scouting

- **Site statique multi-pages** — SEO fort mais lourd à personnaliser par client.
- **SPA React avec config JSON** — un seul build, chaque client a son `config.json`.
- **WordPress** — rejeté, demande de l'hébergement spécifique.

Choix : **SPA React + fichier de config par client**. Permet de livrer un client
en quelques heures sans toucher au code.

## La stratégie

- **Design Figma en amont** — composants, palette, mobile/desktop. Validé avant
  une ligne de code.
- **i18n via JSON par langue** — 9 langues prévues, structure cohérente
  `messages/{fr,en,es,…}.json`.
- **Sections en data-driven** — chaque section lit le `config.json`,
  un client = un fichier.

## Le rallye

- Trouver le bon découpage des composants pour qu'ils restent re-stylisables sans
  ré-écriture (props de couleurs, slots).
- Le système i18n a demandé plusieurs passes : pas trop verbeux pour les clients
  qui éditent en CMS, assez structuré pour les pluriels et formats date.

## Le score final

- Template multilingue prêt, ré-utilisable.
- **Ce que j'ai appris** : un projet "template" est en réalité un projet "produit"
  miniature — il faut penser API et docs, pas juste UI.
```

> William will reread and adjust these drafts during/after V1 — they're a starting point so the page renders with real substance.

- [ ] **Step 7: Write lib/mdx.ts**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const projectsDir = path.join(process.cwd(), 'content/projects');

export async function getProjectSlugs(): Promise<string[]> {
  const files = await fs.readdir(projectsDir);
  return files.filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''));
}

export async function readProjectMdx(slug: string) {
  const raw = await fs.readFile(path.join(projectsDir, `${slug}.mdx`), 'utf8');
  const { data, content } = matter(raw);
  return { frontmatter: data as Record<string, unknown>, content };
}
```

- [ ] **Step 8: Configure MDX in next.config.mjs**

```js
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');
const withMDX = createMDX({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: { typedRoutes: true }
};
export default withNextIntl(withMDX(nextConfig));
```

- [ ] **Step 9: Build listing page**

`app/[lang]/(court)/projects/page.tsx`:
```tsx
import { ProjectCard } from '@/components/projects/ProjectCard';
import projects from '@/content/data/projects.json';

export default function ProjectsListPage() {
  return (
    <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Smashes</p>
      <h1 className="font-display italic text-6xl mt-2">Projets</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Build case study renderer**

`app/[lang]/(court)/projects/[slug]/page.tsx`:
```tsx
import { compileMDX } from 'next-mdx-remote/rsc';
import { readProjectMdx, getProjectSlugs } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return locales.flatMap(lang => slugs.map(slug => ({ lang, slug })));
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { frontmatter, content } = await readProjectMdx(slug);
    const { content: rendered } = await compileMDX({ source: content });
    return (
      <article className="px-6 md:px-16 py-24 max-w-3xl mx-auto prose-like">
        <p className="font-mono text-xs tracking-widest text-court-line uppercase">Replay analysis</p>
        <h1 className="font-display italic text-5xl md:text-6xl mt-2">{String(frontmatter.title ?? slug)}</h1>
        <div className="mt-2 font-mono text-xs text-muted">
          {String(frontmatter.year)} · {String(frontmatter.role)} · {String(frontmatter.duration ?? '')}
        </div>
        <div className="mt-10 space-y-6 leading-relaxed text-base">{rendered}</div>
      </article>
    );
  } catch {
    notFound();
  }
}
```

Install: `npm install next-mdx-remote`

- [ ] **Step 11: Add basic prose styles**

Add to `app/globals.css`:
```css
.prose-like h2 { font-family: var(--font-migra); font-style: italic; font-size: 2rem; margin-top: 2rem; }
.prose-like h2 + p { margin-top: 0.75rem; }
.prose-like ul, .prose-like ol { padding-left: 1.5rem; }
.prose-like li { margin-top: 0.4rem; }
.prose-like em { color: var(--color-court-line); font-style: italic; }
.prose-like strong { color: var(--color-ink); }
```

- [ ] **Step 12: Add case_study_open score event**

Modify `app/[lang]/(court)/projects/[slug]/page.tsx` to add a client component that emits the event on mount. Create `components/projects/CaseStudyTracker.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function CaseStudyTracker({ slug }: { slug: string }) {
  const { emit } = useScore();
  useEffect(() => { emit({ type: 'case_study_open', slug }); }, [slug, emit]);
  return null;
}
```

Use in the case study page:
```tsx
import { CaseStudyTracker } from '@/components/projects/CaseStudyTracker';
// ... inside <article>:
<CaseStudyTracker slug={slug} />
```

- [ ] **Step 13: Verify**

`npm run dev` → `/fr/projects` shows list. Click MatchFit → case study renders. Score increments.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat(projects): MDX case studies + listing + dynamic routes per slug"
```

---

### Task 28: /now page (renders single MDX)

**Files:**
- Create: `content/now/2026-05.mdx`, `app/[lang]/(court)/now/page.tsx`

- [ ] **Step 1: Write content/now/2026-05.mdx**

```mdx
---
date: 2026-05-15
---

## Sur quoi je bosse

Refonte complète de ce portfolio en Next.js 15 + TypeScript strict. Concept "MATCH POINT" :
le curseur est un volant, les sections sont des zones du court, un score monte
pendant ta visite.

## Ce que j'apprends

- **Next.js 15 App Router** en profondeur (server components, route groups, parallel routes).
- **next-intl** pour le bilingue propre.
- **Tidy First?** (Kent Beck) — petites passes de propreté avant gros refactors.

## Mes cibles court terme

- Décrocher mon **alternance Full Stack** pour septembre 2026.
- Ship la V1 de ce portfolio avant fin juin.
- Premier mini-jeu en Canvas (V1.2).

---

*Dernière mise à jour : 15 mai 2026.*
```

- [ ] **Step 2: Build the page**

`app/[lang]/(court)/now/page.tsx`:
```tsx
import { compileMDX } from 'next-mdx-remote/rsc';
import fs from 'node:fs/promises';
import path from 'node:path';

async function readLatestNow() {
  const dir = path.join(process.cwd(), 'content/now');
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.mdx')).sort().reverse();
  if (files.length === 0) return null;
  const raw = await fs.readFile(path.join(dir, files[0]!), 'utf8');
  return raw;
}

export default async function NowPage() {
  const raw = await readLatestNow();
  if (!raw) return <p>Aucune entrée now.</p>;
  const { content } = await compileMDX({ source: raw });
  return (
    <section className="px-6 md:px-16 py-24 max-w-2xl mx-auto prose-like">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Drop shot</p>
      <h1 className="font-display italic text-6xl mt-2">Now</h1>
      <div className="mt-10 space-y-6 leading-relaxed">{content}</div>
    </section>
  );
}
```

- [ ] **Step 3: Score event on visit**

Add a tracker component (similar to CaseStudyTracker) for `now_visit`. Create `components/now/NowTracker.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function NowTracker() {
  const { emit } = useScore();
  useEffect(() => { emit({ type: 'now_visit' }); }, [emit]);
  return null;
}
```

Use it in `now/page.tsx`:
```tsx
import { NowTracker } from '@/components/now/NowTracker';
// inside section:
<NowTracker />
```

- [ ] **Step 4: Verify**

`/fr/now` → page renders MDX content, score increments by 1.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(now): /now page renders latest MDX entry + score tracker"
```

---

### Task 29: /skills full page

**Files:**
- Create: `app/[lang]/(court)/skills/page.tsx`

- [ ] **Step 1: Build the page**

```tsx
import { SkillCourt } from '@/components/skill-court/SkillCourt';

export default function SkillsPage() {
  return (
    <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Court de compétences</p>
      <h1 className="font-display italic text-6xl mt-2">Skills</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Hover une compétence pour voir le niveau, la dernière utilisation, et les preuves.
      </p>
      <div className="mt-12">
        <SkillCourt />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

`/fr/skills` → full-page court with all skills, panel works.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(skills): full /skills page with SkillCourt"
```

---

## Phase 8 — Nav, lang switch, footer

### Task 30: Nav + Footer + LangSwitch

**Files:**
- Create: `components/nav/Nav.tsx`, `components/nav/Footer.tsx`, `components/i18n/LangSwitch.tsx`, `components/ui/SkipLink.tsx`
- Modify: `app/[lang]/(court)/layout.tsx`

- [ ] **Step 1: SkipLink**

`components/ui/SkipLink.tsx`:
```tsx
export function SkipLink() {
  return (
    <a href="#main"
       className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-ink focus:text-hall-floor focus:px-4 focus:py-2 focus:font-mono focus:text-xs">
      Passer au contenu
    </a>
  );
}
```

- [ ] **Step 2: LangSwitch**

`components/i18n/LangSwitch.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useScore } from '@/components/scoreboard/ScoreProvider';

export function LangSwitch() {
  const locale = useLocale();
  const t = useTranslations('lang');
  const pathname = usePathname();
  const { emit } = useScore();
  const other = locale === 'fr' ? 'en' : 'fr';
  const otherPath = pathname.replace(/^\/(fr|en)/, `/${other}`);

  return (
    <Link href={otherPath as any} prefetch
          onClick={() => emit({ type: 'lang_switch' })}
          className="font-mono text-xs uppercase tracking-widest hover:text-court-line"
          aria-label={`Switch language to ${other.toUpperCase()}`}>
      {t('switch')}
    </Link>
  );
}
```

- [ ] **Step 3: Nav**

`components/nav/Nav.tsx`:
```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitch } from '@/components/i18n/LangSwitch';

export function Nav() {
  const t = useTranslations('nav');
  return (
    <nav aria-label="Primary" className="sticky top-0 z-40 bg-hall-floor/85 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="font-display italic text-xl tracking-tight">William Lin</Link>
        <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          <li><Link href="/" className="hover:text-court-line">{t('home')}</Link></li>
          <li><Link href="/projects" className="hover:text-court-line">{t('projects')}</Link></li>
          <li><Link href="/now" className="hover:text-court-line">{t('now')}</Link></li>
          <li><Link href="/skills" className="hover:text-court-line">{t('skills')}</Link></li>
          <li><LangSwitch /></li>
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Footer**

`components/nav/Footer.tsx`:
```tsx
import Link from 'next/link';

export function Footer({ arcadeToggle }: { arcadeToggle?: React.ReactNode }) {
  return (
    <footer className="border-t border-ink/10 mt-24 px-6 py-10 font-mono text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-6">
        <div className="text-muted">
          © {new Date().getFullYear()} William Lin · Built with Next.js · Deployed on Vercel
        </div>
        <div className="flex gap-4">
          <a href="https://github.com/william7865" target="_blank" rel="noopener" className="hover:text-court-line">GitHub</a>
          <a href="https://www.linkedin.com/in/william-lin-623165295/" target="_blank" rel="noopener" className="hover:text-court-line">LinkedIn</a>
          <a href="mailto:linwilliam14@gmail.com" className="hover:text-court-line">Email</a>
          {arcadeToggle}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Mount Nav + Footer + SkipLink in (court) layout**

```tsx
import { CourtBackground } from '@/components/court/CourtBackground';
import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/nav/Footer';
import { SkipLink } from '@/components/ui/SkipLink';

export default function CourtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <CourtBackground />
      <Nav />
      <main id="main" className="relative">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Verify**

Nav visible on every page. Click EN → URL changes to `/en/...`, content translates, score gets *Polyglot* after eval.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(nav): top Nav with LangSwitch + Footer + SkipLink"
```

---

## Phase 9 — Arcade mode

### Task 31: ArcadeProvider + ArcadeToggle + Konami wiring

**Files:**
- Create: `components/arcade/ArcadeProvider.tsx`, `components/arcade/ArcadeToggle.tsx`
- Modify: `components/nav/Footer.tsx` (already accepts `arcadeToggle` prop), `app/[lang]/(court)/layout.tsx`

- [ ] **Step 1: Write ArcadeProvider**

```tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { createKonamiDetector } from '@/lib/konami';

const KEY = 'mp.arcadeUnlocked';

type Ctx = {
  unlocked: boolean;
  mode: 'pro' | 'arcade';
  toggleMode: () => void;
  unlock: () => void;
};

const ArcadeCtx = createContext<Ctx | null>(null);

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => storage.get<boolean>(KEY, false));
  const [mode, setMode] = useState<'pro' | 'arcade'>(() =>
    storage.get<boolean>(KEY, false) ? 'arcade' : 'pro'
  );

  useEffect(() => { storage.set(KEY, unlocked); }, [unlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detector = createKonamiDetector(() => {
      setUnlocked(true);
      setMode('arcade');
    });
    const onKey = (e: KeyboardEvent) => detector.push(e.key);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleMode = () => setMode(m => (m === 'pro' ? 'arcade' : 'pro'));
  const unlock = () => { setUnlocked(true); setMode('arcade'); };

  return (
    <ArcadeCtx.Provider value={{ unlocked, mode, toggleMode, unlock }}>
      {children}
    </ArcadeCtx.Provider>
  );
}

export function useArcade(): Ctx {
  const ctx = useContext(ArcadeCtx);
  if (!ctx) throw new Error('useArcade outside provider');
  return ctx;
}
```

- [ ] **Step 2: ArcadeToggle**

```tsx
'use client';
import { useArcade } from './ArcadeProvider';

export function ArcadeToggle() {
  const { unlocked, mode, toggleMode, unlock } = useArcade();
  if (!unlocked) {
    return (
      <button onClick={unlock} className="hover:text-court-line text-muted">
        switch to arcade mode <span aria-hidden>🕹️</span>
      </button>
    );
  }
  return (
    <button onClick={toggleMode} className="hover:text-court-line" aria-pressed={mode === 'arcade'}>
      mode: <strong>{mode}</strong> · click to switch
    </button>
  );
}
```

- [ ] **Step 3: Mount ArcadeProvider above the tree**

Modify `app/[lang]/layout.tsx`:
```tsx
import { ArcadeProvider } from '@/components/arcade/ArcadeProvider';
// inside body:
<NextIntlClientProvider messages={messages}>
  <ScoreProvider>
    <ArcadeProvider>
      <Scoreboard />
      {children}
    </ArcadeProvider>
  </ScoreProvider>
</NextIntlClientProvider>
```

- [ ] **Step 4: Inject toggle into Footer**

Modify `app/[lang]/(court)/layout.tsx`:
```tsx
import { ArcadeToggle } from '@/components/arcade/ArcadeToggle';
// ...
<Footer arcadeToggle={<ArcadeToggle />} />
```

- [ ] **Step 5: Add data attribute on body for CSS theming**

In a small client component `components/arcade/ArcadeBodyClass.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { useArcade } from './ArcadeProvider';

export function ArcadeBodyClass() {
  const { mode } = useArcade();
  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);
  return null;
}
```

Mount inside `[lang]/layout.tsx`:
```tsx
<ArcadeProvider>
  <ArcadeBodyClass />
  ...
</ArcadeProvider>
```

- [ ] **Step 6: Add minimal arcade CSS**

In `app/globals.css`:
```css
body[data-mode="arcade"] .arcade-only { display: block; }
body[data-mode="pro"] .arcade-only { display: none; }
body[data-mode="arcade"] h1, body[data-mode="arcade"] h2 {
  text-shadow: 1px 0 0 var(--color-lol-blue), -1px 0 0 var(--color-penta-magenta);
}
```

- [ ] **Step 7: Manual test**

Type Konami code on `/fr` → footer toggle changes from "switch to arcade" to "mode: arcade · click to switch". Headers get RGB shift. Refresh → persists.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(arcade): ArcadeProvider + Konami unlock + toggle + body[data-mode] theming"
```

---

### Task 32: Achievements provider + toast host

**Files:**
- Create: `components/achievements/AchievementsProvider.tsx`, `components/achievements/ToastHost.tsx`
- Modify: `app/[lang]/layout.tsx`

- [ ] **Step 1: Write AchievementsProvider**

```tsx
'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ACHIEVEMENTS, evaluateAchievements, type EvalContext } from '@/lib/achievements';
import { storage } from '@/lib/storage';
import { useScore } from '@/components/scoreboard/ScoreProvider';
import { useArcade } from '@/components/arcade/ArcadeProvider';
import { useLocale } from 'next-intl';

const KEY_UNLOCKED = 'mp.achievements';
const KEY_EGGS = 'mp.eggs';

type Ctx = {
  unlocked: Set<string>;
  toasts: { id: string; title: string; description: string }[];
  dismiss: (id: string) => void;
};

const AchCtx = createContext<Ctx | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { state } = useScore();
  const { unlocked: arcadeUnlocked } = useArcade();
  const locale = useLocale() as 'fr' | 'en';
  const [unlocked, setUnlocked] = useState(() =>
    new Set<string>(storage.get<string[]>(KEY_UNLOCKED, []))
  );
  const [toasts, setToasts] = useState<Ctx['toasts']>([]);
  const [langSwitched, setLangSwitched] = useState(false);

  useEffect(() => { storage.set(KEY_UNLOCKED, [...unlocked]); }, [unlocked]);

  // Detect lang switch (locale change after mount)
  useEffect(() => {
    const initial = storage.get<string>('mp.lastLang', '');
    if (initial && initial !== locale) setLangSwitched(true);
    storage.set('mp.lastLang', locale);
  }, [locale]);

  useEffect(() => {
    const caseStudies = new Set<string>(
      state.events.filter(e => e.startsWith('case_study_open:')).map(e => e.split(':')[1]!)
    );
    const sectionsSeen = state.events.filter(e => e.startsWith('section_read:')).length;
    const ctx: EvalContext = {
      caseStudiesOpened: caseStudies,
      konamiUnlocked: arcadeUnlocked,
      eggsFound: new Set<string>(storage.get<string[]>(KEY_EGGS, [])),
      langSwitched,
      scoreReached21: state.matchPoint,
      sectionsVisitedInOneMinute: sectionsSeen
    };
    const newly = evaluateAchievements(ctx, unlocked);
    if (newly.size === 0) return;
    setUnlocked(prev => new Set([...prev, ...newly]));
    setToasts(prev => [
      ...prev,
      ...[...newly].map(id => {
        const def = ACHIEVEMENTS.find(a => a.id === id)!;
        return { id, title: def.title[locale], description: def.description[locale] };
      })
    ]);
  }, [state, arcadeUnlocked, langSwitched, locale, unlocked]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return <AchCtx.Provider value={{ unlocked, toasts, dismiss }}>{children}</AchCtx.Provider>;
}

export function useAchievements(): Ctx {
  const ctx = useContext(AchCtx);
  if (!ctx) throw new Error('useAchievements outside provider');
  return ctx;
}
```

- [ ] **Step 2: ToastHost**

```tsx
'use client';
import { useEffect } from 'react';
import { useAchievements } from './AchievementsProvider';
import { useArcade } from '@/components/arcade/ArcadeProvider';

export function ToastHost() {
  const { toasts, dismiss } = useAchievements();
  const { mode } = useArcade();

  // Always render dismiss timer; only display in arcade mode (per V1 spec)
  useEffect(() => {
    const timers = toasts.map(t => window.setTimeout(() => dismiss(t.id), 4000));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismiss]);

  if (mode !== 'arcade') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
             role="status" aria-live="polite"
             className="bg-ink text-hall-floor font-mono text-xs px-4 py-3 border-l-2 border-shuttle pointer-events-auto">
          <div className="text-shuttle">🏆 {t.title}</div>
          <div className="text-hall-floor/80 mt-0.5">{t.description}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Mount in layout**

```tsx
import { AchievementsProvider } from '@/components/achievements/AchievementsProvider';
import { ToastHost } from '@/components/achievements/ToastHost';
// inside ArcadeProvider :
<AchievementsProvider>
  <Scoreboard />
  <ToastHost />
  {children}
</AchievementsProvider>
```

> Note: ArcadeProvider must wrap AchievementsProvider (which needs useArcade).

- [ ] **Step 4: Manual test**

`/fr`, type Konami → toast "🏆 Konami Master" appears bottom-right (only in arcade mode). Browse a case study → "First Blood" toast.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(achievements): provider + toast host wired to score + arcade state"
```

---

### Task 33: Contact API route with Resend

**Files:**
- Create: `app/api/contact/route.ts`, `.env.example`
- Modify: `.gitignore` (already has env)

- [ ] **Step 1: Install Resend**

Run: `npm install resend`

- [ ] **Step 2: Write .env.example**

```
# Resend (https://resend.com — create API key, free 100/mo)
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=linwilliam14@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

Tell William to copy to `.env.local` and fill in his real Resend key.

- [ ] **Step 3: Write the route**

`app/api/contact/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(20).max(5000)
});

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';
  if (!apiKey || !to) {
    return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
  }
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 400 });
  }
  const { name, email, message } = parsed.data;
  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio] Nouveau match point — ${name}`,
      text: `De : ${name} <${email}>\n\n${message}`
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'send-failed' }, { status: 502 });
  }
}
```

- [ ] **Step 4: Local smoke test**

Set `.env.local` with a real Resend test key. Submit the form on `/fr` → check Resend dashboard for sent email. Or:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"a@b.co","message":"Hello world hello world hello"}'
```

Expected: `{"ok":true}`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(api): /api/contact with Resend + Zod validation"
```

---

## Phase 10 — Arcade routes + 404

### Task 34: /arcade hub and /arcade/achievements page

**Files:**
- Create: `app/[lang]/(arcade)/arcade/page.tsx`, `app/[lang]/(arcade)/arcade/achievements/page.tsx`, `app/[lang]/(arcade)/layout.tsx`

- [ ] **Step 1: Arcade layout**

`app/[lang]/(arcade)/layout.tsx`:
```tsx
'use client';
import { useArcade } from '@/components/arcade/ArcadeProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/nav/Footer';
import { ArcadeToggle } from '@/components/arcade/ArcadeToggle';

export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
  const { unlocked } = useArcade();
  const router = useRouter();

  useEffect(() => {
    if (!unlocked) router.replace('/');
  }, [unlocked, router]);

  if (!unlocked) return null;

  return (
    <>
      <Nav />
      <main id="main" className="relative">{children}</main>
      <Footer arcadeToggle={<ArcadeToggle />} />
    </>
  );
}
```

- [ ] **Step 2: Arcade hub page**

`app/[lang]/(arcade)/arcade/page.tsx`:
```tsx
import Link from 'next/link';

export default function ArcadeHubPage() {
  return (
    <section className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Arcade Mode</p>
      <h1 className="font-display italic text-6xl mt-2">Welcome, summoner.</h1>
      <ul className="mt-12 font-mono text-sm space-y-3">
        <li>→ <Link href="/arcade/achievements" className="hover:text-court-line underline">Achievements</Link></li>
        <li className="text-muted">→ Mini-jeu badminton <span className="text-xs">(V1.2 — coming soon)</span></li>
        <li className="text-muted">→ CV adaptatif "Champion Select" <span className="text-xs">(V1.1)</span></li>
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Achievements page**

`app/[lang]/(arcade)/arcade/achievements/page.tsx`:
```tsx
'use client';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useAchievements } from '@/components/achievements/AchievementsProvider';
import { useLocale } from 'next-intl';

export default function AchievementsPage() {
  const { unlocked } = useAchievements();
  const locale = useLocale() as 'fr' | 'en';
  return (
    <section className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Arcade</p>
      <h1 className="font-display italic text-6xl mt-2">Achievements</h1>
      <ul className="mt-10 space-y-3">
        {ACHIEVEMENTS.map(a => {
          const got = unlocked.has(a.id);
          return (
            <li key={a.id}
                className={`flex justify-between items-center border-b border-ink/10 pb-3 ${got ? '' : 'opacity-40'}`}>
              <div>
                <div className="font-display italic text-2xl">{a.title[locale]}</div>
                <div className="font-mono text-xs text-muted">{a.description[locale]}</div>
              </div>
              <span className="font-mono text-xs">{got ? '✓ unlocked' : '·····'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Test**

`/fr/arcade` redirects to `/fr` if not unlocked. After Konami unlock, `/fr/arcade` shows hub. `/fr/arcade/achievements` shows the full registry.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(arcade): /arcade hub + /arcade/achievements page (route group with unlock gate)"
```

---

### Task 35: Custom 404 page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Write the 404**

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-hall-floor">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">Out</p>
      <h1 className="font-display italic text-7xl mt-4">404.</h1>
      <p className="mt-4 text-lg max-w-md">
        Le volant est tombé hors du court. Pas de point, on revient au service.
      </p>
      <Link href="/" className="mt-8 px-6 py-3 bg-ink text-hall-floor font-mono text-xs">
        ← Retour au court
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Visit `/fr/anything-broken` → custom 404 shows.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(404): on-brand not-found page"
```

---

## Phase 11 — SEO

### Task 36: Sitemap, robots, OG image

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`

- [ ] **Step 1: Install OG dep**

Run: `npm install @vercel/og` (already bundled in Next.js 15 actually — skip if `next/og` works)

- [ ] **Step 2: Sitemap**

`app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import projects from '@/content/data/projects.json';

const BASE = 'https://williamlin.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ['fr', 'en'];
  const staticPaths = ['', '/projects', '/now', '/skills'];
  const projectPaths = projects.flatMap(p => langs.map(l => `/${l}/projects/${p.slug}`));
  const main = langs.flatMap(l => staticPaths.map(p => `/${l}${p}`));
  return [...main, ...projectPaths].map(url => ({
    url: `${BASE}${url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: url.endsWith('/') ? 1 : 0.7
  }));
}
```

- [ ] **Step 3: Robots**

`app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://williamlin.dev/sitemap.xml'
  };
}
```

- [ ] **Step 4: OG image**

`app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'William Lin · Match Point';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{
        background: '#F2EEE2', color: '#0F1419', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', padding: 80, fontFamily: 'serif'
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: 18, color: '#B7472A', letterSpacing: 4 }}>
          WILLIAM LIN · PORTFOLIO
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 140, marginTop: 60, lineHeight: 1 }}>
          Match Point.
        </div>
        <div style={{ fontSize: 28, marginTop: 40, maxWidth: 800 }}>
          Développeur Full Stack. Disponible en alternance — septembre 2026.
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
                      fontFamily: 'monospace', fontSize: 16, color: '#8A8576' }}>
          <span>williamlin.dev</span>
          <span>SET 1 · 21 — 19</span>
        </div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 5: Verify**

`npm run dev` → visit `/sitemap.xml`, `/robots.txt`, `/opengraph-image` (Next handles routing). All return content.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(seo): sitemap, robots, OG image"
```

---

## Phase 12 — e2e tests for critical flows

### Task 37: Playwright e2e — score progression + konami unlock

**Files:**
- Create: `tests/e2e/score-progression.spec.ts`, `tests/e2e/konami-unlock.spec.ts`

- [ ] **Step 1: Write tests/e2e/score-progression.spec.ts**

```ts
import { test, expect } from '@playwright/test';

test('score increments as visitor explores', async ({ page }) => {
  await page.goto('/fr');
  // initial
  await expect(page.getByRole('status').first()).toContainText('SET 1 · 00');
  // Wait for service section dwell (2s)
  await page.waitForTimeout(2500);
  await expect(page.getByRole('status').first()).toContainText('SET 1 · 01');
  // Switch lang triggers +1
  await page.getByRole('link', { name: /EN/i }).click();
  await page.waitForURL(/\/en/);
  await expect(page.getByRole('status').first()).toContainText('SET 1 · 02');
});
```

- [ ] **Step 2: Write tests/e2e/konami-unlock.spec.ts**

```ts
import { test, expect } from '@playwright/test';

const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

test('konami code unlocks arcade mode', async ({ page }) => {
  await page.goto('/fr');
  for (const key of SEQUENCE) await page.keyboard.press(key);
  // Footer toggle now shows "mode: arcade"
  await expect(page.getByRole('button', { name: /mode/i })).toContainText('arcade');
  // /arcade now accessible
  await page.goto('/fr/arcade');
  await expect(page.getByText('Welcome, summoner.')).toBeVisible();
});
```

- [ ] **Step 3: Run**

Run: `npm run e2e`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(e2e): score progression + konami unlock flows"
```

---

## Phase 13 — Quality gates & deploy

### Task 38: ESLint + Prettier + final lint pass

**Files:**
- Create: `.eslintrc.json`, `.prettierrc`
- Modify: `package.json`

- [ ] **Step 1: Install**

Run: `npm install -D eslint eslint-config-next prettier eslint-config-prettier`

- [ ] **Step 2: .eslintrc.json**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "prettier"]
}
```

- [ ] **Step 3: .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100
}
```

- [ ] **Step 4: Run lint + typecheck + tests**

```bash
npm run lint
npm run typecheck
npm test
```

Fix any reported issues inline. Expected at the end: all green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add ESLint, Prettier, pass lint/typecheck/tests"
```

---

### Task 39: README + deploy to Vercel

**Files:**
- Create: `README.md`
- External: Vercel project + DNS

- [ ] **Step 1: Write README**

`README.md`:
```markdown
# Portfolio William Lin — MATCH POINT

> The cursor is a shuttlecock. The portfolio is a court. A match plays out as you visit.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Framer Motion · next-intl · MDX · Resend · Vitest · Playwright.

## Dev
\`\`\`bash
npm install
cp .env.example .env.local   # fill in Resend keys
npm run dev                  # http://localhost:3000 → redirects to /fr
npm run lint
npm run typecheck
npm test
npm run e2e
\`\`\`

## Build
\`\`\`bash
npm run build && npm start
\`\`\`

## Deploy
Vercel. Branch \`feat/match-point-v1\` deploys as preview. After merge to \`master\`, Production deploys to https://williamlin.dev.

## Design spec
See [\`docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md\`](docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md).

## Easter egg
Try the Konami code on the homepage. 🕹️
```

- [ ] **Step 2: Set up Vercel project**

Manual steps (William does these):
1. Go to https://vercel.com/new → import GitHub repo `william7865/Portfolio`.
2. Set branch to `feat/match-point-v1` for preview deploy.
3. Add env vars : `RESEND_API_KEY`, `CONTACT_TO_EMAIL=linwilliam14@gmail.com`, `CONTACT_FROM_EMAIL=onboarding@resend.dev`.
4. Deploy. Get the preview URL.

- [ ] **Step 3: Verify preview deploy**

Visit the preview URL → home loads, score works, Konami unlocks arcade, form submission round-trips email.

- [ ] **Step 4: Buy & configure domain (William)**

Manual: purchase `williamlin.dev` (Cloudflare or Vercel). In Vercel → Project Settings → Domains → add `williamlin.dev`. Configure DNS as instructed. Wait for SSL.

- [ ] **Step 5: Merge to master**

After validation:
```bash
git checkout master
git merge --no-ff feat/match-point-v1 -m "feat: ship MATCH POINT portfolio V1"
git push origin master
```

Vercel deploys production. Switch DNS over from GitHub Pages.

- [ ] **Step 6: Commit README**

(do this before step 5, on the feature branch)
```bash
git add -A
git commit -m "docs: README with stack, dev commands, deploy notes"
```

---

## Self-review

**Spec coverage:**
- ✅ Migration Next.js 15 + TS strict + Tailwind v4 → Tasks 2, 3
- ✅ DA (palette, typo, court grid) → Tasks 3, 4, 15
- ✅ ShuttleCursor + physique → Tasks 16, 17
- ✅ Scoreboard 0→21 + event bus → Tasks 9, 18, 19, 20
- ✅ Home avec 5 sections → Tasks 21, 23, 24, 25, 26
- ✅ Liste /projects + 3 case studies MDX → Task 27
- ✅ SkillCourt interactif → Tasks 22, 29
- ✅ Now page → Task 28
- ✅ Bilingue FR/EN → Tasks 14, 30 (LangSwitch)
- ✅ Mode arcade unlock (Konami + toggle) → Tasks 10, 31
- ✅ 10 achievements essentiels → Tasks 12, 32, 34
- ✅ Form contact (Resend) + Zod → Tasks 26, 33
- ✅ A11y AA + reduced-motion → Tasks 13, 16 (reduced-motion respect), 30 (SkipLink), aria-live on Scoreboard/ToastHost
- ✅ Deploy Vercel + domaine → Task 39
- ✅ SEO (sitemap, robots, OG) → Task 36
- ✅ Tests (Vitest unit + Playwright e2e) → Tasks 6, 7, 8-13, 37

**Placeholder scan:** No "TBD"/"TODO"/"implement later" in implementation code. The intentional notes about V1.1/V1.2 deferrals are explicit and out-of-scope.

**Type consistency check:**
- `ScoreEvent` discriminated union used consistently across `lib/score.ts`, `ScoreProvider`, `useScoreEvent`, all section components, `ContactForm`, `CaseStudyTracker`, `NowTracker`, `LangSwitch`, `SkillCourt`, `ProjectCard`.
- `Achievement.condition` signature `(ctx: EvalContext) => boolean` consistent throughout.
- `Locale` type `'fr' | 'en'` consistent (lib/i18n, cv.json typing, etc.).
- `useScore` returns `{ state, emit }` everywhere it's used.
- Filenames consistent (`ScoreProvider.tsx`, `AchievementsProvider.tsx`, `ArcadeProvider.tsx` — same suffix pattern).

**Gaps noted for V1.1/V1.2 (intentional, per roadmap):**
- 5 easter eggs (smash plume, /give Minecraft, etc.) → V1.1
- Pentakill voice synthesis sound → V1.1
- GitHub live panel → V1.1
- /cv adaptive + /cv/print → V1.1
- Mini-jeu badminton → V1.2
- /admin analytics → V1.2

V1 is shippable and impressive on its own.
