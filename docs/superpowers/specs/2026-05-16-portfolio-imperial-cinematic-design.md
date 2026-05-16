# Portfolio — Imperial Cinematic (William Lin)

**Status:** Draft v1 — awaiting user review
**Date:** 2026-05-16
**Replaces:** `2026-05-15-portfolio-match-point-design.md` (badminton "match point" concept dropped entirely)
**Author:** William Lin × Claude

---

## 1. North Star

A portfolio-as-identity site for William Lin, framed as a cinematic Tang-imperial scroll. The visitor does not "buy" a candidate; they enter a designed space that **represents** William through restraint, ornament where it matters, and a strong sense of pace.

The site has no recruiter pitch, no "available for hire" CTA, no "alternance Sept 2026" hook. It is a curated identity surface — what William chooses to show — with a single ornate room at the end where a visitor may write to him if they wish.

**One-line concept:** *Cormorant Garamond meets a Zhang Yimou film: vermillion and gold, silk veil, slow particles, calligraphic act markers between sections.*

**Non-goals (explicit):**

- Not a recruiter funnel. No "hire me" copy.
- Not a job-application landing page. The contact form is correspondence, not CV submission.
- Not folkloric / Chinatown kitsch. Restrained ornament; the Tang palette is the starting point, not the destination.
- Not an AI-template lookalike. No glassmorphism cards, no gradient blob backgrounds, no "Welcome to my portfolio 👋" — anything that reads as a template gets cut.
- Not a SPA wonderland. Built on standard scrolling; the handscroll and gate are accents, not the global mechanic.

---

## 2. Aesthetic direction

**Selected direction:** Tang imperial, **cinematic backbone (B3) + ornate accents (B1) at signature moments**.

- **Backbone (95% of the site):** restrained cinematic atmosphere — gold-on-vermillion gradients, suspended gold dust, silk veil, generous negative space, large display typography.
- **Ornate accents (signature moments only):** multi-layered gold frames, dragon glyphs as garde figures, dougong-style brackets. Used at the Final (Contact / throne room) and around the Gate transition. Never plastered.

### 2.1 Color palette

| Token | Hex | Role |
|---|---|---|
| `--vermillion-deep` | `#2c0306` | Background base, page wash |
| `--vermillion` | `#4a0a0e` | Default surface, blocks |
| `--vermillion-bright` | `#6a0c12` | Highlights, gradient mid |
| `--vermillion-glow` | `#8b1a1f` | Curtains, hover states |
| `--gold` | `#d4af37` | Primary ornament, borders, dragons |
| `--gold-bright` | `#e9c46a` | Display accents, italic emphasis, dust particles |
| `--gold-soft` | `rgba(212,175,55,.28)` | Subtle borders, dividers |
| `--ivory` | `#fef3c7` | Primary text on vermillion |
| `--ivory-mute` | `rgba(254,243,199,.78)` | Body / secondary text |
| `--cinnabar` | `#a4252b` | Seals only (never elsewhere — keep precious) |
| `--ink-dark` | `#1d0205` | Deepest shadow, finale base |

Light scheme: not provided. The site is dark/vermillion-only by design. (`prefers-color-scheme: light` is intentionally ignored.)

### 2.2 Typography

| Use | Family | Weight | Notes |
|---|---|---|---|
| Display (h1, name, lede italic) | Cormorant Garamond | 300, 400, italic 300 | Italic forms in `--gold-bright`. Generous tracking on display sizes (`-1px` to `-1.2px` on 64px+). |
| Hanzi display (large background, act markers, decorative) | Ma Shan Zheng | regular (only weight) | Brush calligraphy, atmospheric. Used at 80–140px on hero, 60–88px on act markers. |
| Hanzi UI (small inline, captions, kickers) | Noto Serif SC | 400, 700 | When CJK glyphs appear inline with body text. |
| Body / paragraphs | Cormorant Garamond | 400 | 14–16px. Keep line-height generous (1.55–1.65). |
| Kicker / label / metadata | Inter Tight | 300, 500 | UPPERCASE, `letter-spacing: .22em–.42em`. |
| Mono accent (act numbers, code metadata) | JetBrains Mono | 400 | `[ 序幕 / 01 ]` style indices, file paths in case studies. |

All faces are free via Google Fonts. Self-hosted via `next/font/google` for performance and to avoid the FOUT on Cormorant italic.

### 2.3 Motifs

- **Gold dust particles** — small (2–4px) bright dots with `box-shadow` glow, drifting upward; on hero and finale only.
- **Silk veil** — vertical band of vertical pinstripes with soft gold gradient, blurred edges; ambient on hero, used as transition curtain.
- **Seal (印)** — square cinnabar block, ivory border, hanzi character inside, rotated `-4°` to `-8°`. Used as: identity stamp in hero (small), submit confirmation in Final (large), project tag chip in Works (small).
- **Dragon glyph (龍)** — character used as decorative garde figure (mirrored pairs flanking ornate frames). Only in the Final's throne room; never elsewhere.
- **Gold roller** — the handscroll cap: vertical strip with vermillion gradient + thin gold border. Marks the start and end of the Works section.
- **Multi-layered frame** — Tang temple ornament: 2px gold + 3px vermillion gap + 5px gold. Used as containers in the Final, around the gate, and around the hero's identity card.

### 2.4 Spacing & grid

Tailwind v4 default scale. Section vertical rhythm:

- Section padding (desktop): `py-32` (128px)
- Section padding (mobile): `py-20` (80px)
- Curtain transition height (desktop): `min-h-screen` with act marker centered
- Max content width: `max-w-6xl` (72rem) for editorial sections; full-bleed for handscroll and curtains

Grid is 12-col, but the site rarely uses it — most sections are vertically stacked editorial blocks with manually composed asymmetry.

---

## 3. Information architecture

The site is structured as **a play in five acts**. Each act is separated by a **curtain transition** (full-screen, silk pinstripes rising, giant act marker hanzi center-screen).

```
Prologue · Hero
    │
    └─ curtain rises, "Acte I"
       │
Acte I · Works  ←─── HANDSCROLL (horizontal scroll mechanic)
    │
    └─ curtain rises, "Acte II"
       │
Acte II · Skills · The Path
    │
    └─ curtain rises, "Acte III"
       │
Acte III · Now · Travel Journal
    │
    └─ curtain rises, "Acte Final"
       │
The Gate · Perspective Threshold  ←─── 3D-ish gate transition
    │
    └─ enters the throne room
       │
Acte Final · Correspondance
```

### 3.1 Routes

- `/` → redirects to `/{lang}` based on `Accept-Language` (defaults to `fr`)
- `/{lang}` → single-page narrative (all acts on one page, scroll-driven)
- `/{lang}/works/{slug}` → project case study (linked from Acte I cards)
- `/{lang}/cv` → not a page; just a download link to `/CV.pdf`
- `/{lang}/master-scroll` → easter-egg-only route (no nav link; only reachable via easter egg trigger)
- `/api/contact` → form submission (Resend)

Removed routes from previous design:

- `/arcade/*` (entire arcade hub)
- `/arcade/achievements`

### 3.2 Languages

FR (default) + EN. `next-intl` preserved. All copy is bilingual; hanzi decorative content is identical in both locales.

---

## 4. Section specs

### 4.1 Prologue · Hero

**Goal:** Establish identity and mood instantly.

**Composition:**

- Vermillion gradient background.
- Silk veil (animated vertical band of gold pinstripes) running down the center, blurred.
- Gold dust particles drifting upward (10–14 particles, GPU-friendly CSS animation).
- Large background hanzi (decorative, "forest" character — William's surname Lin = 林 — as outline only, `rgba(212,175,55,.45)`, 140px+, positioned upper-right).
- Kicker top-left (Inter Tight, uppercase, gold): `序幕 · PROLOGUE`
- Name display (Cormorant Garamond): "William *Lin*" — surname in italic gold-bright.
- One-line lede (Cormorant Garamond regular, italic optional): no recruiter copy. Either a short factual line ("Développeur Full Stack — Paris") or a poetic line ("Le code comme calligraphie : précis, intentionnel, lisible") — final wording locked with William.
- Small identity seal in the corner — clickable for easter egg (see §7).
- Subtle scroll cue at the bottom: a vertical gold hairline that draws downward in a loop, plus tiny mono label `↓ 第一幕`.

**No CTA buttons.** No "contact me", no "download CV". The CV download lives in the footer; the contact form lives at the end of the journey.

### 4.2 Acte I · Works — The Handscroll

**Goal:** Display projects as panels of a Tang handscroll.

**Mechanic — desktop:**

- The user enters the section by scrolling. As soon as the section is in view, the page scroll is hijacked: vertical scroll moves the handscroll **horizontally** through the panels.
- Implementation: a horizontal flex container of fixed-width panels (~80vw each), translated via Framer Motion `useScroll` tied to a tall outer wrapper. The wrapper's height ≈ `(N panels × 100vh)`. As the user scrolls, the inner X translates from `0` to `-((N-1) × panel_width)`.
- Sticky positioning keeps the handscroll visible while the outer wrapper scrolls through its full height.
- Once all panels have passed, the page resumes natural vertical scroll into the curtain transition.

**Mechanic — mobile (<768px):**

- Scroll hijack disabled. Panels stack vertically.
- Gold rollers become horizontal bars at the top and bottom of the stack.

**Panel composition:**

- Paper texture background (ivory-warm gradient with inset shadow).
- Hanzi character (single, large, ink-black) representing the project's spirit (chosen per project — content TBD).
- Small Latin caption underneath the hanzi (uppercase, mono).
- Project name (Cormorant Garamond display).
- One-paragraph project description.
- Stack tags rendered as **small seals** (cinnabar block, hanzi or Latin abbreviation, rotated).
- A "Replay" link to `/works/{slug}` for the case study.

**Caps:**

- A `gold-roller` element at the leftmost and rightmost positions; visually anchors the scroll.

### 4.3 Acte II · Skills — The Path

**Goal:** Showcase technical skills as calligraphy strokes.

**Composition:**

- A single long vertical column.
- Each skill is rendered as a large SVG calligraphy stroke that draws itself when scrolled into view (`stroke-dasharray` reveal triggered by `IntersectionObserver`).
- Skill name in Cormorant Garamond + Latin (e.g., "React") next to the calligraphy.
- Hover (desktop) or tap (mobile) on a skill drops a small cinnabar **seal** indicating proof — a project link, a date, a metric.
- Skill density shown via stroke weight (thicker stroke = more years of practice). The exact mapping locked with William once content is provided.

### 4.4 Acte III · Now — Travel Journal

**Goal:** A monthly journal page in Tang style.

**Composition:**

- Vertical scroll, narrower column (`max-w-2xl`).
- A "journal page" with a slight paper-warm tint on top of vermillion (subtle, doesn't break the dark mood).
- Date header in mono and hanzi (e.g., `2026 · 五月 · MAI`).
- Body rendered from MDX (`/content/now/{YYYY-MM}.mdx`), preserving the existing system.
- Inline ink-illustrations optional (SVGs imported in MDX).
- One small seal at the bottom marking the entry.

### 4.5 The Gate — Perspective Threshold

**Goal:** Cinematic transition to the finale. The visitor crosses a Tang gate.

**Composition:**

- Single full-screen panel.
- An ornate gate frame is anchored center-screen with CSS `perspective` and a slight rotateX. As the user scrolls, the gate scales up and the camera (the user's viewport) appears to pass through.
- Inside the arch: a single hanzi `入` (enter) in gold-bright, with bloom.
- A faint cloud of additional gold dust thickens during the transition.
- Implementation: framer-motion `useScroll` driving `scale`, `rotateX`, and gate `opacity` on a sticky wrapper. No Three.js — pure CSS 3D transforms + framer-motion.

### 4.6 Acte Final · Correspondance

**Goal:** The most ornate room. A poetic invitation to write to William.

**Composition:**

- Full multi-layered frame (Tang temple ornament — gold + vermillion gap + gold).
- Two small dragon glyphs (龍) flank the title, mirrored — the only place dragons appear.
- Title: Cormorant Garamond display — *"Correspondance"* (FR) / *"Correspondence"* (EN), with hanzi subtitle (`書信` letter).
- A short paragraph: tone is "leave a word", not "apply".
- A form rendered as a parchment scroll (inset paper texture, slight curl at top/bottom):
  - Name field (mandatory)
  - Email field (mandatory)
  - Message field (mandatory)
- Submit button: Cormorant Garamond italic, label e.g. *"Sceller et envoyer"* / *"Seal and send"*.
- **On submit:** the parchment "rolls down", a large cinnabar seal stamps the form with a satisfying tactile motion (rotate spring + slight bounce), then a thank-you in Cormorant italic appears.
- Implementation: existing `/api/contact` Resend route preserved; only the front-end form UI is reworked.
- Footer at the very bottom:
  - Small CV.pdf download link (just text: "Curriculum vitae · PDF" — subtle)
  - Email, GitHub, LinkedIn (small icons or text)
  - © William Lin · year · "Built with Next.js"
  - Locale toggle FR/EN

---

## 5. Motion system

Four signatures (validated in live demo on 2026-05-16):

| # | Signature | Trigger | Implementation |
|---|---|---|---|
| 1 | **Ink-gold cursor trail** | Mouse move | Native cursor preserved. On `mousemove` (throttled, ~60fps), spawn a small gold dot at the position with a 900ms fade animation. Pure DOM + CSS keyframes. Pointer events: none on the dots. Disabled if `prefers-reduced-motion`. |
| 2 | **Gold dust drift** | Section in view (hero + finale only) | 10–14 absolutely positioned dots with randomized animation-delay, animation-duration. CSS keyframes from bottom to top with X jitter. Pauses when section out of viewport (`content-visibility`). Frozen if `prefers-reduced-motion`. |
| 3 | **Calligraphy stroke reveal** | `IntersectionObserver` on section / element | SVG paths with `stroke-dasharray` + `stroke-dashoffset`. Triggered once when the element enters viewport, animating offset from full to 0 over 1.5–2.5s. Used on: act markers, large hanzi backgrounds, skill strokes, hero scroll cue. Skipped (instant final state) if `prefers-reduced-motion`. |
| 4 | **Seal stamp on hover/focus** | `:hover` and `:focus-visible` on CTAs, links, project cards, submit | Absolutely positioned seal element, transformed from `scale(0) rotate(-8deg)` to `scale(1) rotate(-8deg)` with `cubic-bezier(.34, 1.56, .64, 1)` (spring overshoot), opacity fade. Persists on submit confirmation. Disabled (no animation, just visible at full state) if `prefers-reduced-motion`. |

**Curtain transition between acts:**

- Sticky full-screen container with gold pinstripes background.
- On entering the curtain's scroll range, the giant act-marker hanzi (e.g., `第一幕`) animates: stroke reveal + gentle scale-in from 0.92 to 1.0 + opacity fade-in.
- On exiting, hanzi fades; the next section begins.
- Spring physics via framer-motion `motion.div` with `useScroll` + `useTransform`.

**Handscroll-specific motion:**

- Scroll-linked X translation, with mild easing on inertia (avoid jank if user scrolls a wheel that fires in fast bursts).
- Indicator: a thin gold line at the bottom of the viewport showing handscroll progress.

**Page transitions** (between `/` and `/works/{slug}`):

- `app/template.tsx` provides a curtain-fall + lift animation when navigating to a work case study.
- Back to `/` lifts the curtain in reverse.

---

## 6. Audio system

**Selected:** SFX click only. Default ON. Mute toggle in the top-right corner.

- **Click SFX** — a soft drum tick on primary CTAs (submit button). A subtle paper-tap on secondary actions (project card click, link clicks).
- **Easter-egg sting** — a single distant gong on master-scroll unlock (one-shot, not a loop). Plays only if SFX is ON.
- **No ambient loops.** No guqin. No autoplay on page load.
- **Mute toggle** — a small icon top-right (a tiny bell crossed out / sounded). State persisted in `localStorage`.
- **Implementation:** static `.mp3`/`.ogg` files under `/public/audio/`, loaded lazily via a custom `useSound` hook (HTMLAudioElement, not Howler — keep it light).
- **Volume capped at ~30%** by default; never aggressive.

---

## 7. Easter egg — The Master Scroll

**Goal:** A hidden room that rewards exploration with personal/cultural references.

**Triggers (any of):**

1. Typing the sequence `t-a-n-g` on the keyboard at any point on the site.
2. Clicking the small identity seal in the hero **three times** within 2 seconds.

**Effect on trigger:**

- A satisfying audio cue (a distant gong, optional only if SFX is ON).
- The page fades out and the user is routed to `/{lang}/master-scroll` with a fade-in.

**Contents of `/master-scroll`:**

- A long vertical handscroll (paper texture, gold rollers top/bottom).
- A poem (chosen by William, possibly a Tang poem he likes — to lock with content).
- A large calligraphic rendering of William's name `林威廉` — SVG-stroked with the calligraphy reveal signature.
- A personal note in Cormorant Garamond italic (1–2 paragraphs William's own voice).
- A signature seal at the bottom.
- A small "← return" link to go back to the main site.

**Discoverability:**

- The trigger is intentionally not advertised. The site is fully complete without it.
- A subtle hint: the hero identity seal has a faint pulse animation on hover (the seal stamp signature already does this), implicitly inviting interaction.

**Implementation:**

- Global key listener (`useEffect` in a client-side `EasterEggProvider`) — buffers last 4 keystrokes, checks for `tang`.
- Seal click counter with a 2-second reset timer.
- On trigger: store `master-scroll-unlocked: true` in `localStorage` (so the master scroll link appears in the footer for future visits).

---

## 8. Internationalization

- `next-intl` preserved as-is.
- `messages/fr.json` and `messages/en.json` rewritten from scratch.
- Hanzi decorative content is **not** keyed by locale — it appears identically in FR and EN.
- Project case studies (`content/projects/*.mdx`) authored in FR by default; EN variant `{slug}.en.mdx` optional per project.
- The Now journal (`content/now/{YYYY-MM}.mdx`) authored in FR by default; EN variant optional.
- Locale toggle in the footer (small text `FR / EN`).

---

## 9. Technical stack

**Preserved from current build:**

- Next.js 15 (App Router) · React 19 · TypeScript strict mode
- Tailwind v4 (PostCSS pipeline already configured)
- Framer Motion 12
- next-intl 4
- MDX (`@next/mdx`, `next-mdx-remote`)
- Resend (transactional email for the contact form)
- Vitest (unit) + Playwright (e2e)
- ESLint + Prettier

**Added:**

- `next/font/google` for self-hosted Cormorant Garamond, Ma Shan Zheng, Noto Serif SC, Inter Tight, JetBrains Mono.
- A small custom `useSound` hook (no library).
- No new heavy dependencies. No Three.js. No GSAP (Framer Motion covers everything specified).

**Removed:**

- All arcade-related components, routes, providers, context, achievements page.
- `KonamiUnlock`, `ArcadeToggle`, `AchievementsProvider`, `ToastHost`, `ArcadeProvider`, scoreboard, court, skill-court (the badminton "court" metaphor entirely).
- Hooks, types, and content keys related to badminton ("rallye", "smashes", "drop", "matchpoint", "score").

---

## 10. Accessibility

- **Reduced motion** (`prefers-reduced-motion: reduce`):
  - Cursor trail: disabled.
  - Dust drift: frozen at a static state.
  - Stroke reveal: instant final state.
  - Seal stamp: visible at full state, no animation.
  - Handscroll: falls back to native vertical scroll with panels stacked.
  - Gate transition: simple fade-in/out, no scale/perspective.
- **Color contrast:** all body text on vermillion meets WCAG AA. Gold-bright on vermillion-deep meets AA. Hanzi decorative text falls below AA but is duplicated by Latin text in all functional contexts.
- **Focus states:** every interactive element has a visible gold outline (2px solid `--gold`, offset 4px).
- **Keyboard navigation:** the easter egg key listener does not interfere with native focus. The handscroll scroll-hijack respects keyboard PgUp/PgDn (they advance one panel).
- **Skip link** at the top of the page (preserved).
- **Aria-live region** for form submission feedback (preserved).
- **Alt text** on all SVG calligraphy / decorative hanzi: empty `aria-hidden="true"` for decoration; descriptive for content-bearing strokes.

---

## 11. Testing

- **Unit (Vitest):**
  - i18n message resolution (FR/EN).
  - Easter egg key buffer logic.
  - Seal click counter timer.
  - Sound preference persistence.
- **E2E (Playwright):**
  - Full scroll-through of all acts on desktop and mobile viewports.
  - Handscroll: confirm horizontal scroll behavior on desktop, vertical stack on mobile.
  - Contact form submit (mocked Resend).
  - Easter egg: type `tang`, confirm `/master-scroll` reachable.
  - Locale switch: FR ↔ EN.
  - `prefers-reduced-motion`: confirm static fallbacks.

---

## 12. Content owned by William (delivered later)

- Identity seal hanzi (default: `林` for Lin; alternative: William's chosen kanji).
- Hero lede (one short line; factual or poetic, William's choice).
- Project list (3+ projects, each with: name, pitch, role, stack, hanzi character, link or repo, optional metric).
- Skill list (each: name, hanzi or Latin label, density level, optional proof link).
- Now journal entries (monthly MDX).
- CV.pdf (already on disk; replace as needed).
- Master scroll poem + personal note + name calligraphy preference.

The site can be built and launched with placeholder content; William replaces it field by field.

---

## 13. Out of scope (v1)

- No blog system beyond the Now monthly journal.
- No analytics integration (can be added later if requested).
- No CMS — content is filesystem-based (MDX + JSON).
- No multi-author / team features.
- No social card customization per route (a single OG image suffices).

---

## 14. Open questions

- **Project case studies:** layout for `/works/{slug}` is described at a high level (curtain transition + paper-textured case study page) but the internal layout per project depends on the content William provides. The case study template will be designed once at least one full project's content is available.
- **CV embed vs download:** spec assumes download-only (`/CV.pdf`). If William prefers an inline embedded viewer, that's a v1.1 extension.
- **Audio assets:** the two SFX files (drum tick + paper tap) need to be sourced or recorded. Spec assumes royalty-free or commissioned.
- **Easter egg poem:** William to choose the Tang poem (or accept a curated default).

---

*End of spec.*
