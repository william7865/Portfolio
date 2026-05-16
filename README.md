# Portfolio William Lin — MATCH POINT

> The cursor is a shuttlecock. The portfolio is a court. A match plays out as you visit.

## Concept

A complete rebuild of William Lin's portfolio with a singular design direction inspired by **badminton** (EFREI Bad club, casual player) and **video games** (Minecraft, League of Legends).

- **Pro mode (default)** — sober, editorial, recruiter-friendly
- **Arcade mode (unlockable)** — HUD overlay, achievements, easter eggs
- **Unlock** — Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) or "switch to arcade mode" button in footer

A live scoreboard climbs `0 → 21` as you explore. Reaching 21 triggers the **Match Point** celebration.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Framer Motion · next-intl · MDX · Resend · Vitest · Playwright.

## Dev

```bash
npm install
cp .env.example .env.local   # fill in Resend keys
npm run dev                  # http://localhost:3000 → redirects to /fr
npm run build
npm run lint
npm run typecheck
npm test                     # vitest
npm run e2e                  # playwright (run `npx playwright install` first)
```

## Deploy

Vercel. Set env vars:

- `RESEND_API_KEY` (https://resend.com)
- `CONTACT_TO_EMAIL` (default: `linwilliam14@gmail.com`)
- `CONTACT_FROM_EMAIL` (default: `onboarding@resend.dev`)
- `NEXT_PUBLIC_BASE_URL` (default: `https://williamlin.dev`)

After merging `feat/match-point-v1` → `master`, Production deploys to https://williamlin.dev.

## Design spec & plan

- Spec: [`docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md`](docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md)
- Plan: [`docs/superpowers/plans/2026-05-16-portfolio-v1-mvp.md`](docs/superpowers/plans/2026-05-16-portfolio-v1-mvp.md)

## Easter egg

Try the Konami code on the homepage. 🕹️
