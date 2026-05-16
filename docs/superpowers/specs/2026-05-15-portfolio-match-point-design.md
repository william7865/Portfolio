---
title: Portfolio William Lin — refonte « MATCH POINT »
date: 2026-05-15
author: William Lin
status: validated
---

# Portfolio William Lin — refonte « MATCH POINT »

> Le curseur **est** un volant. Le portfolio est un terrain. Un match se joue pendant que tu visites.

Ce document décrit la refonte complète du portfolio personnel de William Lin (étudiant
Bachelor Développement Web à l'EFREI, 2023-2026, recherche d'alternance Full Stack).
Il remplace l'actuel portfolio (Create React App + AOS + react-scroll) par une nouvelle
direction artistique singulière, ancrée dans deux passions personnelles —
**badminton** (club bad de l'EFREI, joueur loisir) et **jeux vidéo**
(Minecraft & League of Legends).

L'objectif est explicite : ne **pas** ressembler à un portfolio développeur générique
généré par une IA. Avoir une vraie valeur ajoutée pour le visiteur, et une signature
mémorable pour le candidat.

---

## 1 · Vision & concept

### Concept central : MATCH POINT

Le portfolio est un **terrain de badminton vu du dessus** (proportions réelles 13.40 m × 6.10 m).
Chaque section occupe une **zone du court** nommée par un geste de badminton :

| Zone du court        | Section du portfolio                  |
| -------------------- | ------------------------------------- |
| Service              | Hero — accroche                       |
| Rallye               | À propos + skill court                |
| Smashes              | Projets & case studies                |
| Drop shot            | Now page + GitHub live                |
| Match point          | Contact                               |

Le **curseur du visiteur est un volant** qui suit physiquement la souris (décélération
sharp typique d'un vrai volant). Un **scoreboard live** en haut à droite (`SET 1 · X — Y`)
**monte de 0 à 21** pendant la visite : chaque interaction clé donne +1 point. Atteindre 21
déclenche un moment de célébration ("MATCH POINT" en grand, confetti de plumes jaunes,
applause optionnel).

### Hybride deux modes (décision structurante)

Pour résoudre la tension audience-pro / personnalité-fun, le portfolio a **deux modes**
qui présentent le même contenu avec un habillage différent :

- **Mode Pro** (par défaut) — sobre, éditorial, recruteur-friendly. Le concept badminton
  reste discret (court en filigrane, scoreboard, curseur volant). Aucun cliché "gamer".
- **Mode Arcade** (déblocable) — overlay HUD inspiré jeux vidéo, achievements visibles,
  sons, easter eggs, raccourcis clavier visibles, mini-jeu accessible.

Le mode est persisté en `localStorage`. **Le contenu reste lisible et identique dans les
deux modes** — seul l'habillage change.

---

## 2 · Direction artistique

### Palette

Une palette éditoriale ancrée dans la réalité d'un gymnase de badminton :

| Token              | Hex        | Usage                                            |
| ------------------ | ---------- | ------------------------------------------------ |
| `--hall-floor`     | `#F2EEE2`  | Fond principal (sol crème de gymnase)            |
| `--ink`            | `#0F1419`  | Texte (jamais noir pur, plus chaud)              |
| `--shuttle`        | `#F4D04A`  | Volant, accents, focus ring                      |
| `--court-line`     | `#B7472A`  | Lignes du court, badges, CTA primaire            |
| `--net-green`      | `#5C7A6B`  | Filet, séparateurs, secondary                    |
| `--muted`          | `#8A8576`  | Texte secondaire, métadonnées                    |
| `--lol-blue`       | `#1C8CE8`  | Mode arcade uniquement — HUD, raccourcis         |
| `--penta-magenta`  | `#9B30A8`  | Mode arcade uniquement — Pentakill, étoiles tier |

### Typographie

| Rôle      | Police                        | Source                       | Justification                            |
| --------- | ----------------------------- | ---------------------------- | ---------------------------------------- |
| Display   | **Migra**                     | Pangram Pangram (free)       | Italique éditorial distinctif (≠ Inter)  |
| Body      | **PP Neue Montreal**          | Pangram Pangram (free)       | Lecture confort, géométrique sobre       |
| Mono      | **JetBrains Mono Variable**   | JetBrains (free)             | Score, frame data, refs code, easter eggs|

Toutes les fonts sont chargées via `next/font/local` (zéro FOUT, RGPD-friendly).

### Grille « court »

La grille de la home est un **SVG du terrain de badminton** dessiné aux proportions
réelles. Sur les pages internes, le court devient un **liseré minimaliste** dans la marge.
La grille de page (1280px desktop) s'aligne sur les zones du court (long du court,
travers, ligne de service, etc.).

### Principes de motion

- Toutes les transitions s'inspirent de la **physique du volant** : accélération sharp
  initiale puis décélération exponentielle (cubic-bezier custom proche de la chute libre
  d'un volant — drag aérodynamique).
- Le curseur-volant utilise un **ressort amorti** (Framer Motion `spring`) avec stiffness
  modéré et damping élevé.
- `prefers-reduced-motion: reduce` désactive : curseur custom, particules, transitions
  longues, parallaxes. Garde : focus visible, scroll smooth optionnel.

---

## 3 · Sitemap & routing

```
/[lang]                         → bilingue : /fr (default) ou /en
  /                             → home (court complet · 5 sections)
  /projects                     → liste des smashes
  /projects/matchfit            → case study · Replay Analysis
  /projects/ecommerce           → case study · Replay Analysis
  /projects/restaurant          → case study · Replay Analysis
  /now                          → drop shot — entraînement du moment
  /skills                       → court de compétences (interactif)
  /cv                           → CV adaptatif (?role=hr|lead|client)
  /cv/print                     → version PDF auto-générée (A4)

  /arcade                       → hub mode arcade (visible si unlock)
  /arcade/play                  → mini-jeu badminton vs IA William
  /arcade/achievements          → liste des achievements débloqués

  /admin                        → dashboard analytics (auth GitHub OAuth)

/api/github                     → proxy GitHub API (cache 10min)
/api/contact                    → soumission formulaire (Resend)
/api/track                      → événements analytics (Umami)
```

Bilingue via **next-intl**, default `fr`, `en` disponible. Le switch FR/EN est lui-même
un événement +1 dans le score (et débloque l'achievement *Polyglot*).

---

## 4 · Mécaniques d'interaction (Mode Pro)

### Curseur-volant

- Suit la position du curseur natif avec un ressort amorti (Framer Motion).
- Composant : `<ShuttleCursor>` rendu fixed top-level dans `(court)/layout.tsx`.
- Composé : un cercle jaune `--shuttle` + 3 traits noirs simulant les plumes, échelle
  ~16px.
- Sur `pointermove` rapide : générer un trail de **4-5 plumes fade-out** sur ~600ms
  (pool d'éléments réutilisé, pas de garbage collection).
- Sur `click` : animation "smash" — snap rapide (50ms) vers la position cible + son
  thwack (si sons activés).
- Sur `pointerover` d'un élément interactif (a, button, input) : micro-flutter
  (rotation ±5°, échelle 1.1).
- Désactivé sur :
  - Tactile (`(pointer: coarse)`) — paradigme différent.
  - `prefers-reduced-motion: reduce` — retour curseur natif.
- Le curseur natif reste visible sous le volant (pour l'accessibilité et la précision).

### Scoreboard 0 → 21

- Composant : `<Scoreboard>` sticky top-right avec format `SET 1 · X — Y`.
- Géré via un **event bus** (`lib/score.ts`) — n'importe quel composant peut émettre
  `score.event('section_read', { id: 'projects' })`.
- Règles d'incrément (chaque event ne donne +1 qu'une fois par session) :
  - Section lue (intersection observer ≥ 70% pendant 2s)
  - Project card cliqué
  - Case study ouvert (entrée `/projects/[slug]`)
  - Skill court : skill survolée + panel ouvert
  - Toggle FR ⇄ EN
  - Now page visitée
  - Easter egg trouvé
  - Form contact rempli (1 point) puis envoyé (smash décisif, +2 jusqu'à plafond 21)
- À 21 : transition vers une scène "MATCH POINT" — confetti SVG de plumes, mot
  "MATCH POINT" en Migra italique géant, applause optionnel, achievement *Set Won*.
- Persisté en `localStorage` (clé `mp.score`). Au retour, reprendre où on en était sans
  reset, sauf si l'utilisateur a déjà fait *Set Won* — alors on recommence un nouveau
  set.

### Sons

- Wrapper `<SoundManager>` autour de **Howler.js**, lazy-load au premier toggle ON.
- Toggle 🔊 visible en footer / coin bas-droit, **default OFF** (jamais de son sans
  consentement — règle UX critique).
- Sons : `swoosh.mp3` (mouvement rapide curseur), `thwack.mp3` (click smash),
  `step.mp3` (transitions section, très subtil), `applause.mp3` (match point),
  `penta.mp3` (achievement Pentakill, voix LoL).
- Tous les sons en `.webm` avec fallback `.mp3`, < 30 KB chacun.

### Transitions sections

- Smooth scroll natif (CSS `scroll-behavior: smooth`).
- À l'entrée d'une section dans le viewport : la **ligne du court** correspondante
  s'illumine brièvement (transition `--court-line` → `--shuttle` 400ms then back).

---

## 5 · Skill court interactif

Page : `/skills` (et version compacte intégrée dans la home, zone Rallye).

Les 19 compétences actuelles sont disposées sur le terrain selon leur catégorie :

- **Backcourt gauche** — Frontend (HTML, CSS, JS, TS, React, Vue)
- **Backcourt droit** — Backend (.NET, C#, Node, PHP, Symfony, Python)
- **Midcourt** — Database (MariaDB, MongoDB, MySQL, PostgreSQL)
- **Forecourt** — Tools (Docker, Git, Figma)

Source de données : `content/skills.json`. Schéma :

```json
{
  "name": "React.js",
  "category": "Frontend",
  "level": 4,                              // 1-5 auto-évalué
  "lastUsed": "2025-11-30",
  "icon": "FaReact",
  "color": "#61DAFB",
  "proofs": [
    { "type": "project", "ref": "matchfit", "label": "MatchFit · UI complète" },
    { "type": "commit", "url": "https://github.com/...", "label": "Refacto hooks" }
  ]
}
```

**Interactions :**

- Hover : panel latéral apparaît avec niveau (étoiles), date du dernier usage, et
  liens vers les preuves (commits, projets).
- Click : la techno se "smashe" vers la zone projet correspondante (animation court).
- Filtre rapide en haut : *Tout · Front · Back · DB · Tools*.

---

## 6 · Case studies — Replay Analysis

Chaque projet a sa page : `/projects/[slug]`. Format : MDX (`content/projects/*.mdx`).

**Frontmatter standard :**

```yaml
---
title: "MatchFit — Application Web de Coaching"
year: 2024
role: "Full Stack"
tags: [Vue.js, JavaScript, PHP, PostgreSQL, Docker, GitHub Actions]
hero: "/images/projects/matchfit-hero.jpg"
repo: "https://github.com/william7865/MatchFit"
demo: null
duration: "3 mois"
team: "4 personnes"
my_role_detail: "Lead front + intégration CI"
tier: 4                # ★★★★ — pour mode arcade
---
```

**Structure de contenu (les 5 actes du replay) :**

1. **Le contexte** — situation, brief, équipe, contraintes
2. **Le scouting** — analyse du problème, options techniques considérées
3. **La stratégie** — décisions techniques majeures + trade-offs assumés
4. **Le rallye** — moments-clés du dev (ce qui a été dur, ce qui a surpris)
5. **Le score final** — ce que ça a donné (métriques si possible) + ce que j'ai appris

Composants MDX disponibles : `<TradeOff>`, `<Metric>`, `<CodeSnippet>`, `<Diagram>`,
`<Quote>`, `<Aside>` (notes en marge type design doc).

En mode arcade : ajout d'un **bandeau « Frame data »** en tête de page —
tags techniques affichés en notation move (`React.jab`, `PHP.heavy`, `Docker.special`).

**Drafting** : pour V1, William rédige les contenus à partir de templates. Pour les
projets pré-remplis (MatchFit, E-Commerce, Restaurant), draft initial généré à partir
des repos GitHub que William valide/réécrit avec sa voix.

---

## 7 · Now page

Page : `/now`. Contenu MDX simple (`content/now/YYYY-MM.mdx`), versionné par mois pour
historique.

Structure :

- **Sur quoi je bosse** — projets en cours, alternance/stage en cours
- **Ce que j'apprends** — techs en exploration, livres, formations
- **Mes cibles court terme** — objectifs sur 3-6 mois
- **Dernière mise à jour** — date affichée bien en évidence (signal de fraîcheur)

Concept popularisé par Derek Sivers (nownownow.com). Référence subtile au "drop shot" :
geste précis et minimal qui marque le terrain.

---

## 8 · CV adaptatif & version PDF

### `/cv` — version interactive adaptative

Source unique : `content/cv.json`. Le visiteur sélectionne son rôle au top de page
(persisté en URL `?role=hr|lead|client`), et le contenu se ré-organise :

- **Rôle = RH** — soft skills mises en avant, parcours scolaire détaillé,
  disponibilité visible, motivations, langues.
- **Rôle = Lead Tech** — projets techniques détaillés, stack maîtrisée, archi,
  liens GitHub, *commits récents* (via /api/github), pratiques (tests, CI, code review).
- **Rôle = Client** — résultats business, exemples cas d'usage, capacité à comprendre
  un brief, références client (Arcsolu).

En mode arcade, ce sélecteur devient un **« Champion select »** (référence LoL) — trois
"champions" cliquables avec un splash art simplifié.

### `/cv/print` — version PDF A4

- Layout dédié, `@media print` optimisé.
- Génération côté client via `window.print()` (pas de runtime PDF lourd).
- Lit `content/cv.json` (même source).
- Watermark discret « GG WP » en bas pour les visiteurs en mode arcade (easter egg).
- Bouton « Télécharger PDF » ailleurs sur le site déclenche `print` en mode `pdf`.

**Conséquence cruciale** : plus jamais de désync entre le site et le PDF du CV.
Le `cv.json` est la seule source de vérité.

---

## 9 · Mode Arcade

### Trois chemins d'unlock

1. **Konami code** — `↑ ↑ ↓ ↓ ← → ← → B A` détecté par `lib/konami.ts` (listener global
   `keydown` désabonné si `prefers-reduced-motion` ou si déjà unlock).
   → achievement *Konami Master*.
2. **5 easter eggs trouvés** — voir catalogue ci-dessous.
   → achievement *Egg Hunter*.
3. **Toggle visible** — texte « switch to arcade mode 🕹️ » en footer.

L'état est persisté `localStorage.mp.arcadeUnlocked = true`. Le toggle Pro/Arcade reste
ensuite accessible librement.

### Différences visuelles

Le mode arcade **ajoute** des éléments, ne **remplace** pas le contenu :

- **HUD overlay** : ID matchup, étoiles tier, raccourcis clavier visibles.
- **Tags techniques** affichés en notation move (`React.jab`, `Docker.special`).
- **Achievements toast** visibles bottom-right.
- **Trail curseur** plus prononcé (jaune + magenta).
- **Headers** : léger glitch sur hover (RGB shift 1px, durée 100ms).
- **Routes `/arcade/*`** accessibles depuis la nav.

Le contenu textuel **ne change pas**. La lisibilité reste l'objectif n°1.

---

## 10 · Achievements

Système de règles centralisé dans `lib/achievements.ts`. Chaque achievement :

```ts
{
  id: "first_blood",
  category: "case_studies",
  title: { fr: "First Blood", en: "First Blood" },
  description: { fr: "Premier case study lu", en: "First case study read" },
  icon: "drop",
  condition: (events) => events.some(e => e.type === "case_study_opened"),
  visibleIn: ["arcade"],          // ou "always" pour visibles en pro
  voice: null                      // ou "/sounds/penta.mp3" pour Pentakill
}
```

**Catalogue complet (24 achievements) :**

| Catégorie         | ID                  | Déclencheur                                  |
| ----------------- | ------------------- | -------------------------------------------- |
| Case studies      | first_blood         | 1 case study ouvert                          |
| Case studies      | double_kill         | 2 case studies                               |
| Case studies      | triple_kill         | 3 case studies                               |
| Case studies      | quadrakill          | 4 case studies                               |
| Case studies      | **pentakill**       | 5 case studies — voix synth + magenta        |
| Exploration       | konami_master       | Code complet tapé                            |
| Exploration       | egg_hunter          | 5 easter eggs trouvés                        |
| Exploration       | speedrunner         | Toutes sections visitées en < 60s            |
| Exploration       | polyglot            | Toggle FR ⇄ EN                              |
| Exploration       | set_won             | Score atteint 21                             |
| Exploration       | marathon            | > 5min sur le site                           |
| Minecraft         | give_command        | `/give` tapé                                 |
| Minecraft         | voxel_mode          | Mini-jeu lancé en mode voxel                |
| Minecraft         | diamond_pickaxe     | Click rapide 64× sur un element              |
| Minecraft         | creeper_404         | Page 404 visitée                             |
| Bad / EFREI       | smash_feather       | 10× clicks rapides sur une plume             |
| Bad / EFREI       | efrei_alumni        | "EFREI" tapé n'importe où                   |
| Bad / EFREI       | gg_wp               | CV print déclenché                           |
| Bad / LoL         | baron_steal         | Route `/baron` visitée (cachée)              |
| Mini-jeu          | first_rally         | 1 rally gagné contre WL.AI                   |
| Mini-jeu          | ace                 | Service ace dans mini-jeu                    |
| Mini-jeu          | comeback            | Gagner après être mené 0-10                  |
| Form              | match_point_sent    | Form contact envoyé                          |
| Meta              | platinum            | Tous les autres débloqués                    |

**Affichage :**

- En mode Pro : aucun toast affiché, le compteur est masqué (le visiteur ne sait pas
  qu'il y a un système).
- En mode Arcade : toast bottom-right discret (3s, dismissible), liste complète
  consultable sur `/arcade/achievements`.
- Voix LoL "Pentakill!" jouée uniquement si sons activés ET mode arcade.

---

## 11 · Easter eggs catalogue

Cinq eggs principaux (déclencheurs du *Egg Hunter*) :

1. **Smash de plume** — cliquer 10× rapidement sur une plume du trail curseur.
   Effet : explosion de plumes, achievement, son optionnel.
2. **Commande `/give`** — taper `/give` n'importe où sur le site.
   Effet : XP orb Minecraft animé (SVG), toast "+1 XP William", son crafting optionnel.
3. **Click sur le score** — cliquer 5× sur le scoreboard.
   Effet : score affiche `999` brièvement + achievement.
4. **Mention EFREI** — taper "EFREI" lettre par lettre.
   Effet : mascotte EFREI apparaît un instant en bas, achievement *EFREI Alumni*.
5. **Route cachée `/baron`** — entrer manuellement l'URL.
   Effet : page secrète avec un "buff Baron" (overlay coloré 60s), achievement
   *Baron Steal*.

Et un easter egg console (non compté) :

- **ASCII art volant** logué dans la console au chargement, avec un message
  "Tu inspectes le DOM ? On est faits pour s'entendre. → linwilliam14@gmail.com".

---

## 12 · Mini-jeu badminton

Page : `/arcade/play` (lazy chunk, ne charge pas sur les autres pages).

### Game design

- Vue 2D de côté, terrain stylisé avec net au centre.
- Player gauche = visiteur (raquette `--ink`).
- Player droite = "WL.AI" (raquette `--court-line`).
- Volant simulé avec gravité + drag aérodynamique simplifiés.
- Score 21 points, rally scoring (comme un vrai match).
- IA adaptative : démarre ~60% précision, monte progressivement.

### Contrôles

| Plateforme | Move          | Swing            | Voxel toggle  |
| ---------- | ------------- | ---------------- | ------------- |
| Desktop    | ← / →         | Espace           | M             |
| Mobile     | Tap zones G/D | Tap raquette     | Toggle écran  |

### Tech

- **Canvas 2D** + `requestAnimationFrame`. Pas de moteur (PIXI overkill ici).
- Component : `<BadmintonGame />` lazy importé.
- État du jeu en `useReducer` local.
- Best score sauvegardé `localStorage.mp.minigame.bestScore`.
- **Mode voxel** : les raquettes deviennent pixelisées (style Minecraft), le terrain
  garde son look. Toggle accessible en jeu (touche M).
- **Score partageable** : à la fin, URL `/arcade/play?score=21-19&time=2:34` avec OG
  image générée via `@vercel/og` pour partage Twitter/LinkedIn.

---

## 13 · Architecture technique

### Stack

| Couche         | Choix                                  | Raison                                     |
| -------------- | -------------------------------------- | ------------------------------------------ |
| Framework      | **Next.js 15** (App Router)            | SSG + i18n + file routing                  |
| Language       | TypeScript strict                      | Fiabilité, signal pro                      |
| Styling        | Tailwind CSS v4 + CSS variables        | Vitesse, palette centralisée               |
| Animations     | Framer Motion + Motion One             | Cursor physics, transitions                |
| Sons           | Howler.js (lazy)                       | Wrapper léger, toggle clean                |
| MDX            | `@next/mdx` + remark/rehype            | Case studies markdown enrichi              |
| i18n           | next-intl                              | FR/EN, plurals, dates                      |
| Forms          | React Hook Form + Zod                  | Validation contact                         |
| Email          | Resend                                 | Free tier, simple                          |
| Auth           | next-auth (admin uniquement)           | GitHub OAuth pour /admin                   |
| Analytics      | Umami self-hosted (sur Vercel)         | RGPD, dashboard custom                     |
| Mini-jeu       | Canvas API + RAF                       | Pas de moteur lourd                        |
| Tests          | Vitest + Playwright                    | Unit + e2e                                 |
| Deploy         | Vercel + domaine williamlin.dev        | CDN edge, preview branches                 |
| Fonts          | next/font local                        | Migra, NeueMontreal, JetBrains Mono        |

### Structure de dossiers

```
portfolio/
├── app/
│   ├── [lang]/
│   │   ├── (court)/                    # layout avec cursor + scoreboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx     # case study MDX
│   │   │   ├── now/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   └── cv/
│   │   │       ├── page.tsx
│   │   │       └── print/page.tsx
│   │   ├── (arcade)/
│   │   │   ├── arcade/page.tsx
│   │   │   ├── arcade/play/page.tsx
│   │   │   └── arcade/achievements/page.tsx
│   │   └── (admin)/
│   │       └── admin/page.tsx
│   ├── api/
│   │   ├── github/route.ts
│   │   ├── contact/route.ts
│   │   └── track/route.ts
│   └── globals.css
├── components/
│   ├── cursor/ShuttleCursor.tsx
│   ├── court/CourtBackground.tsx
│   ├── scoreboard/Scoreboard.tsx
│   ├── skill-court/SkillCourt.tsx
│   ├── achievements/{ToastHost,registry,useAchievements}.tsx
│   ├── arcade/{ArcadeProvider,ArcadeHUD,ArcadeToggle}.tsx
│   ├── sound/SoundManager.tsx
│   └── minigame/BadmintonGame.tsx
├── content/
│   ├── projects/*.mdx
│   ├── now/*.mdx
│   ├── skills.json
│   └── cv.json
├── lib/
│   ├── achievements.ts
│   ├── score.ts
│   ├── konami.ts
│   ├── physics.ts
│   ├── i18n.ts
│   └── github.ts
├── messages/{fr,en}.json
└── public/
    ├── sounds/
    ├── fonts/
    └── images/
```

### Sources uniques de vérité

- `content/cv.json` → site (about), `/cv` adaptive, `/cv/print` PDF
- `content/skills.json` → skill court, mentions about, frame data des projets
- `content/projects/*.mdx` → case studies (frontmatter + corps)
- `lib/achievements.ts` (registry) → toasts, page achievements, conditions

Aucune duplication. Modifier une compétence = éditer `skills.json`. Ajouter un
achievement = 1 entrée dans le registry.

---

## 14 · Performance & accessibilité — exigences chiffrées

### Performance

- Lighthouse Performance ≥ **95** (mobile, throttled 3G)
- LCP **< 1.8s** · CLS **< 0.05** · INP **< 200ms**
- Bundle JS initial gzip **< 100 KB**
- Mini-jeu, sons, MDX = **lazy chunks** (séparés du bundle initial)
- Images en `next/image` avec AVIF + WebP fallback
- Fonts en `next/font/local` (zéro FOUT, préchargées)
- ISR sur `/api/github` (revalidate 600s)
- SSG pour toutes les pages marketing (home, projects, now, cv, skills)

### Accessibilité (WCAG AA)

- Contrastes vérifiés (palette validée AAA pour ink/floor)
- Skip-to-content link en première position du DOM
- Focus visible custom : anneau jaune `--shuttle` 3px avec offset
- `prefers-reduced-motion: reduce` :
  - Curseur natif (pas de ShuttleCursor)
  - Pas de particules ni trail
  - Transitions raccourcies à 50ms
  - Smooth scroll désactivé
- Navigation clavier : Tab, Shift+Tab, Esc (ferme menus), Enter (active liens),
  Arrow keys dans skill court
- ARIA :
  - `<Scoreboard>` a `role="status"` + `aria-live="polite"` (annonces score discrètes)
  - Toast achievement a `role="status"` + `aria-live="polite"`
  - Toggle sons a `aria-pressed`
- `lang` attribute sur `<html>` et changements via switch FR/EN
- Mode arcade reste accessible (HUD a un `role="complementary"`)
- Images : `alt` complet sur toutes (jamais alt vide sauf décor pur)

---

## 15 · Roadmap V1 / V1.1 / V1.2

### V1.0 — MVP « ambitieux mais finissable » (~3-4 semaines)

À la fin de cette phase, **le portfolio est déployable et impressionnant**. William peut
postuler avec.

- Migration Next.js 15 + TypeScript strict + Tailwind v4
- Direction artistique complète (palette, typo, court grid SVG)
- `<ShuttleCursor>` + physique de base
- `<Scoreboard>` + event bus + 8 règles d'incrément essentielles
- Home avec 5 sections (Service / Rallye / Smashes / Drop / Match Point)
- Liste `/projects` + 3 case studies MDX (drafts validés ensemble)
- `<SkillCourt>` interactif (render `skills.json`)
- Now page (1ère version)
- Bilingue FR / EN (next-intl)
- Mode arcade unlock (Konami + toggle visible)
- 10 achievements essentiels (First Blood → Pentakill, Konami Master, Set Won, Polyglot, Speedrunner)
- Form contact (Resend) + validation Zod
- A11y AA + reduced-motion respecté
- Deploy Vercel + domaine williamlin.dev (à acheter, ~12€/an)
- SEO : sitemap, robots, OG images via `@vercel/og`

### V1.1 — Polish & easter eggs (~1-2 semaines)

- 5 easter eggs scattered (smash plume 10×, /give Minecraft, click score 5×, mention EFREI, route /baron)
- Achievements V2 (Pentakill voice synth, Egg Hunter, Marathon, Diamond pickaxe, Creeper 404)
- GitHub live panel (« échauffement ») dans la zone Drop shot
- Sound design complet (raquette, pas, applause, Penta voice, XP orb)
- `/cv` adaptive (HR / Lead Tech / Client) + URL persisté
- `/cv/print` layout A4 print-CSS optimisé + watermark GG WP
- Animations transitions sections (court line glow)
- Toast achievements polish (anim entrée + son)

### V1.2 — Mini-jeu & analytics (~2 semaines)

- Mini-jeu badminton (Canvas, IA William adaptative, physique)
- Mode voxel Minecraft toggle
- Score mini-jeu partageable (URL + OG image générée)
- `/admin` dashboard analytics Umami (auth GitHub OAuth)
- Suite Playwright e2e (konami flow, achievements, score, mini-jeu)
- Tests vitest unit (physics, score logic, achievements rules)
- Champion select animé pour `/cv` adaptive (mode arcade)
- Backdoor `/baron` (easter egg ultime LoL)

**Total estimé** : ~7-8 semaines à temps partiel étudiant. V1 seule = portfolio
production-ready et déjà très au-dessus de la moyenne.

---

## 16 · Hors scope (explicitement)

Pour rester focus, **ne sont pas dans ce projet** :

- Blog complet avec moteur de recherche, tags, archives — la `/now` page suffit pour V1
- Système de commentaires sur les case studies
- Newsletter / email subscription
- Multi-utilisateurs / rôles autres que admin
- Internationalisation au-delà de FR / EN
- Mobile app native ou PWA installable (peut venir en V2 si valeur claire)
- Mini-jeu multijoueur en réseau (mini-jeu reste solo vs IA)
- Génération PDF côté serveur (on reste sur `window.print()` pour la simplicité)
- A/B testing infrastructure
- Storybook (les composants sont assez peu nombreux et le portfolio se documente lui-même)

---

## 17 · Questions ouvertes / décisions à confirmer

À régler au moment de l'implémentation, sans bloquer le démarrage :

1. **Domaine** — confirmation `williamlin.dev` (ou `william-lin.dev`, `wlin.dev`) ?
   À acheter avant la V1 finale (~12€/an Cloudflare ou Vercel).
2. **Photo / vidéo de match** — si William a une vraie photo de lui en match au club
   EFREI, on l'utilise dans la zone Service (très puissant). Sinon : on fait sans, le
   curseur volant suffit à porter le concept.
3. **Voix Pentakill** — extrait officiel LoL ou TTS générée custom ? L'extrait officiel
   est plus reconnaissable mais soulève une question droits (usage non-commercial OK
   pour portfolio probablement).
4. **Resend free tier** — 100 emails/mois suffit largement pour un portfolio. Si dépassé
   plus tard, alternative SES ou Postmark.
5. **Umami** — self-hosted sur la même Vercel ou hosted (free tier 10K events/mois) ?
   Hosted plus simple pour V1.

---

## 18 · Critères de succès du projet

Le portfolio est un succès si :

- ✅ Un recruteur RH le visite en mode pro et le trouve professionnel et lisible.
- ✅ Un Lead Tech le visite, voit Next.js 15 + TS strict + perf 95+ + a11y AA et se dit
  « ce candidat sait coder en 2026 ».
- ✅ Un dev curieux découvre le mode arcade, joue au mini-jeu, partage le lien.
- ✅ William reçoit au moins une demande d'alternance qui mentionne explicitement le
  portfolio comme déclencheur.
- ✅ Lighthouse mobile ≥ 95, Core Web Vitals tous verts.
- ✅ Le code est suffisamment clean pour servir lui-même de "preuve technique"
  (un Lead Tech qui clone le repo doit être impressionné par l'organisation).

---

*Spec validé conjointement avec William le 2026-05-15. Prêt pour passage en
plan d'implémentation détaillé.*
