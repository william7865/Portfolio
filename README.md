# Portfolio · William Lin

> Un portfolio comme un rouleau Tang. Cinq actes, une porte, une salle des correspondances.

## Concept

Refonte complète dans une direction **Tang impérial cinématique** — vermillon profond, ornement or, voile de soie, poussière dorée en suspension, calligraphie tracée au scroll.

- **Prologue · Hero** — nom et identité, voile de soie, particules dorées
- **Acte I · Works** — scroll horizontal en handscroll, chaque projet un panneau d'encre
- **Acte II · Skills** — calligraphie tracée au scroll, sceau cinabre au hover
- **Acte III · Now** — carnet du moment (MDX mensuel)
- **The Gate** — traversée d'une porte impériale en perspective
- **Acte Final · Correspondance** — salle du trône ornée, parchemin + sceau au submit

**Easter egg** — tape `tang` au clavier, ou clique trois fois sur le sceau du hero, pour déverrouiller un rouleau caché.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Framer Motion · next-intl (FR/EN) · MDX · Resend.

Polices : **Cormorant Garamond** (display) · **Ma Shan Zheng** (hanzi calligraphique) · **Noto Serif SC** · **Inter Tight** · **JetBrains Mono** — toutes via `next/font/google`.

## Dev

```bash
npm install
cp .env.example .env.local   # remplir les clés Resend
npm run dev                  # http://localhost:3000 → redirige vers /fr
npm run build
npm run lint
npm run typecheck
```

## Déploiement

Vercel. Variables d'environnement :

- `RESEND_API_KEY` (https://resend.com)
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `NEXT_PUBLIC_BASE_URL`

## Spec & changements

- Spec actuelle : [`docs/superpowers/specs/2026-05-16-portfolio-imperial-cinematic-design.md`](docs/superpowers/specs/2026-05-16-portfolio-imperial-cinematic-design.md)
- Spec précédente (badminton « match point ») : [`docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md`](docs/superpowers/specs/2026-05-15-portfolio-match-point-design.md) — remplacée.
