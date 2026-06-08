# Tableau de bord d'analytique des visiteurs — Design

> Date : 2026-06-08
> Statut : validé en brainstorming, en attente de revue de la spec

## 1. Objectif

Donner au propriétaire du portfolio une page privée `/dashboard` qui montre **qui vient sur le
site et à quelle fréquence** : vues, visiteurs uniques, pages populaires, provenance (référents),
répartition géographique et par appareil. L'ensemble doit être **intégré au site** (pas un service
tiers), **respectueux de la vie privée** (sans cookie, conforme RGPD sans bannière) et **premium
dans le style Tang impérial** existant.

## 2. Hors périmètre (YAGNI)

- Pas de suivi individuel d'un visiteur dans le temps (le hash tourne chaque jour — voir §6).
- Pas d'A/B testing, d'entonnoirs de conversion, de heatmaps, de sessions/durée.
- Pas d'authentification multi-utilisateurs (un seul propriétaire, un seul mot de passe).
- Pas d'export CSV, d'alertes, ni d'e-mails de rapport (extensions futures possibles).
- Pas de ville/coordonnées GPS — on s'arrête au **pays**.

## 3. Architecture d'ensemble

Deux sous-systèmes indépendants, reliés uniquement par la table `events` :

```
  SITE PUBLIC (app/[lang]/**)                  DASHBOARD PRIVÉ (app/dashboard/**)
  ┌────────────────────────┐                   ┌────────────────────────────────┐
  │ <AnalyticsBeacon/>      │                   │ login → cookie de session HMAC │
  │  envoie {path,lang,ref} │                   │ page server-rendered           │
  └───────────┬────────────┘                   │  requêtes SQL agrégées          │
              │ POST /api/collect               │  graphes maison (SVG/CSS)      │
              ▼                                  └───────────────┬────────────────┘
  ┌────────────────────────┐                                    │ SELECT … GROUP BY
  │ /api/collect (route)    │       Neon Postgres                │
  │  hash visiteur + géo    │      ┌──────────────┐              │
  │  INSERT events          │─────▶│  events      │◀─────────────┘
  └────────────────────────┘      └──────────────┘
```

**Séparation clé** : le beacon vit **uniquement** dans `app/[lang]/layout.tsx` (le site public).
`/dashboard` est **hors** de l'arbre `[lang]` et ne contient pas de beacon → les visites du
propriétaire ne sont jamais comptabilisées.

## 4. Modèle de données

Une ligne par page vue. Table unique, dénormalisée pour des agrégations simples.

```sql
-- lib/analytics/schema.sql
CREATE TABLE IF NOT EXISTS events (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
  visitor_hash  TEXT        NOT NULL,         -- hash anonyme, rotation quotidienne
  path          TEXT        NOT NULL,         -- ex: '/fr', '/en/master-scroll'
  lang          TEXT,                         -- 'fr' | 'en' | NULL
  referrer_host TEXT,                         -- host seul, NULL si direct/interne
  country       TEXT,                         -- code ISO ex 'FR', NULL si inconnu
  device        TEXT        NOT NULL          -- 'mobile' | 'tablet' | 'desktop'
);

CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
CREATE INDEX IF NOT EXISTS events_ts_visitor_idx ON events (ts, visitor_hash);
```

Initialisation : exécuter `schema.sql` **une fois** via l'éditeur SQL de Neon, ou
`npm run db:init` (script `scripts/init-db.mjs` qui lit `DATABASE_URL` et joue le fichier).

## 5. Pipeline de collecte

### 5.1 `components/system/AnalyticsBeacon.tsx` (client)

- Composant client monté dans `app/[lang]/layout.tsx`.
- Au montage **et** à chaque changement de `usePathname()`, envoie une vue.
- Payload : `{ path, lang, referrer: document.referrer }`.
- Transport : `navigator.sendBeacon('/api/collect', blob)` avec repli `fetch(..., {keepalive:true})`.
- N'envoie rien si `navigator.doNotTrack === '1'` (respect supplémentaire).
- Aucune dépendance, aucun cookie, aucun `localStorage`.

### 5.2 `app/api/collect/route.ts` (POST, runtime Node)

1. Lit le corps `{ path, lang, referrer }`.
2. Lit les en-têtes de requête :
   - IP : `x-forwarded-for` (premier segment).
   - User-Agent : `user-agent`.
   - Géo Vercel : `x-vercel-ip-country` (→ `country`).
3. Calcule `visitor_hash` (voir §6).
4. Dérive `device` depuis le user-agent (regex simple, voir §6).
5. Normalise `referrer_host` : extrait le host ; si égal au host du site → `NULL` (navigation
   interne) ; si référent vide → `NULL` (accès direct).
6. `INSERT INTO events (...)`.
7. Répond `204 No Content`. Toute erreur est avalée silencieusement (l'analytique ne doit jamais
   casser le site) mais loggée côté serveur.

## 6. Modèle de vie privée (sans cookie)

- **Hash visiteur** :
  `visitor_hash = sha256(ip + '|' + userAgent + '|' + dailySalt).slice(0, 16)`
  où `dailySalt = sha256(SESSION_SECRET + '|' + 'YYYY-MM-DD')`.
  L'IP n'est **jamais** stockée ni loggée en clair ; seul le hash tronqué est persisté.
- **Rotation quotidienne** : le sel change chaque jour → impossible de relier un visiteur d'un jour
  à l'autre. Conséquence assumée : un visiteur récurrent compte comme unique **chaque jour**. C'est
  le compromis standard du « cookieless » (style Plausible) — idéal pour les uniques/jour et la
  fréquence, sans suivi individuel persistant.
- **Détection appareil** (`lib/analytics/device.ts`) : regex sur l'UA →
  `/Mobi|Android.*Mobile|iPhone/` → `mobile` ; `/iPad|Tablet|Android(?!.*Mobile)/` → `tablet` ;
  sinon `desktop`. Pas de librairie.
- **Référent** : host uniquement, jamais l'URL complète ni les query-params.
- **Pas de bannière de consentement nécessaire** : aucune donnée personnelle conservée, pas de
  traceur persistant.

Toute la logique sensible est dans des fonctions pures et testables :
`lib/analytics/hash.ts`, `lib/analytics/device.ts`, `lib/analytics/referrer.ts`.

## 7. Authentification du dashboard

Mot de passe unique en variable d'environnement, session signée par HMAC (Web Crypto, sans
dépendance).

- **`app/dashboard/login/page.tsx`** : formulaire minimal (un champ mot de passe), stylé parchemin
  Tang. Poste vers `/api/dashboard/login`.
- **`app/api/dashboard/login/route.ts`** : compare au `DASHBOARD_PASSWORD` (comparaison à temps
  constant). Si OK, pose le cookie `dash_session` (`httpOnly`, `secure`, `sameSite=lax`,
  `maxAge` 7 j). Sinon `401`.
- **Jeton** (`lib/analytics/session.ts`) :
  `token = expiry + '.' + hmacSha256(SESSION_SECRET, String(expiry))`.
  Vérification : recalcule le HMAC (comparaison à temps constant) **et** contrôle l'expiration.
- **Garde** : `lib/analytics/session.ts#requireSession()` lit le cookie via `cookies()` ; invalide
  ou absent → `redirect('/dashboard/login')`. Appelée en tête de chaque page protégée.
  `/dashboard/login` n'est **pas** gardée.
- **`app/api/dashboard/logout/route.ts`** : efface le cookie, redirige vers le login.

## 8. Couche de données du dashboard

`lib/analytics/queries.ts` — fonctions async prenant un `rangeDays` (7 | 30 | 90) et renvoyant des
objets typés. Toutes filtrent `WHERE ts >= now() - (rangeDays || ' days')::interval`.

- `getKpis(range)` → `{ views, uniques, countries, mobilePct }` **et** les mêmes valeurs pour la
  période précédente (pour le delta) via un second filtre `[2*range, range[`.
- `getDailySeries(range)` → `[{ day, views, uniques }]` (`GROUP BY date_trunc('day', ts)`,
  jours manquants comblés à 0 côté JS).
- `getTopPages(range, limit=8)` → `[{ path, views }]`.
- `getReferrers(range, limit=8)` → `[{ host, views }]` (`WHERE referrer_host IS NOT NULL`).
- `getCountries(range, limit=8)` → `[{ country, views }]`.
- `getDevices(range)` → `[{ device, views }]`.

Driver : `@neondatabase/serverless` (tag `sql`), requêtes paramétrées. La page dashboard est en
`export const dynamic = 'force-dynamic'` (stats toujours fraîches, jamais mises en cache).

## 9. Interface du dashboard — langage visuel premium

Réutilise strictement les tokens de `app/globals.css` (vermillon, or, ivoire, polices). Nouvelles
classes regroupées sous un bloc `DASHBOARD` dans `globals.css`. Animations via `framer-motion`
(déjà présent), toutes neutralisées sous `prefers-reduced-motion`.

### 9.1 `app/dashboard/page.tsx` (server)

Lit `searchParams.range` (défaut 30), appelle `requireSession()`, lance les requêtes en parallèle
(`Promise.all`), passe les données aux composants. Fond : halo radial + `gold-dust` comme le site.

### 9.2 `components/dashboard/DashboardShell.tsx`

En-tête façon cartouche de stèle : titre hanzi (ex `観客` / « le public ») + label latin mono
(`VISITORS · LIVE`), horloge/Plage active, bouton **Déconnexion** discret en or.

### 9.3 `components/dashboard/StatCard.tsx` (× 4)

Mini-**stèle** ciselée (bordures or, inlay, `inset` shadow comme `.stele`) :
- petit cartouche hanzi en haut (ex 量 vues, 人 uniques, 國 pays, 機 mobile %),
- grand chiffre en `font-display` (Cormorant),
- label en `.kicker`,
- **delta** vs période précédente : `▲ +12 %` en or-vif si hausse, `▼` en ivoire atténué si baisse,
  `—` si stable.

### 9.4 `components/dashboard/FrequencyChart.tsx`

Graphe à barres SVG, une barre par jour :
- remplissage en dégradé vertical `gold-deep → gold` (cf. `::-webkit-scrollbar-thumb`),
- **uniques** en surbrillance `gold-bright` superposée à l'intérieur de la barre des vues,
- halo `drop-shadow` doré léger,
- axe minimal en `font-mono` (or atténué), graduations discrètes,
- animation : les barres croissent de 0 à leur hauteur, **décalées** (`stagger`) au montage,
- survol : tooltip cartouche (jour, vues, uniques).

### 9.5 `components/dashboard/RankBars.tsx` (réutilisable)

Liste de barres de proportion horizontales (label + valeur à droite, barre or proportionnelle au
max). Sert pour **Top pages**, **Référents**, **Pays**, **Appareils**. Animation de largeur au
montage. Drapeau emoji optionnel pour les pays.

### 9.6 `components/dashboard/RangeSelector.tsx` (client)

Trois onglets **7 / 30 / 90 jours** façon petits sceaux/cartouches ; l'actif est en cinabre/ivoire,
les autres en contour or. Met à jour `?range=` via `next/navigation` (`router.replace`, scroll
préservé).

### 9.7 Disposition

```
┌──────────────────────────────────────────────────────────┐
│  観客 VISITORS · LIVE                 [7] [30] [90]  ⏻      │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ Vues     │ Uniques  │ Pays     │ Mobile %                  │  ← 4 StatCards
├──────────┴──────────┴──────────┴──────────────────────────┤
│  FRÉQUENCE — barres vues/uniques par jour                  │  ← FrequencyChart
├───────────────────────────────┬────────────────────────────┤
│  TOP PAGES (RankBars)         │  PROVENANCE (RankBars)      │
├───────────────────────────────┼────────────────────────────┤
│  PAYS (RankBars)              │  APPAREILS (RankBars)       │
└───────────────────────────────┴────────────────────────────┘
```

Responsive : colonnes empilées en mobile, grille 2–4 colonnes au-delà.

## 10. Définitions des métriques (honnêteté)

- **Vues** = `count(*)` des events sur la période.
- **Visiteurs uniques** = `count(distinct visitor_hash)` sur la période. À cause de la rotation
  quotidienne du hash, sur une période > 1 jour ce nombre **additionne** les uniques quotidiens
  (un revenant compte plusieurs fois). Affiché tel quel ; libellé « visiteurs uniques (par jour
  cumulés) » avec une infobulle explicative.
- **Pays / Mobile %** = distincts / proportion sur la période.
- **Delta** = variation relative vs la période immédiatement précédente de même longueur.

## 11. Routage & middleware

- Nouvelle arbo **hors `[lang]`** : `app/dashboard/page.tsx`, `app/dashboard/login/page.tsx`,
  `app/dashboard/layout.tsx` (coque minimale, pas de `NextIntlClientProvider`).
- **`middleware.ts`** : ajouter `dashboard` à la négation du `matcher` pour empêcher next-intl de
  rediriger `/dashboard` → `/fr/dashboard` :
  `'/((?!api|_next|_vercel|dashboard|icon|apple-icon|opengraph-image|robots|sitemap|.*\\..*).*)'`.
- `/api/collect`, `/api/dashboard/*` sont déjà couverts par l'exclusion `api`.
- `app/robots.ts` : interdire `/dashboard` aux crawlers.

## 12. Variables d'environnement (à ajouter à `.env.example`)

```
DATABASE_URL=postgres://...        # Neon (pooled connection string)
DASHBOARD_PASSWORD=...             # mot de passe du dashboard
SESSION_SECRET=...                 # secret HMAC (cookie de session + sel de hash)
```

`SESSION_SECRET` sert à la fois à signer le cookie et à saler le hash visiteur. Documenté dans le
README (section déploiement).

## 13. Dépendances

- **Ajout** : `@neondatabase/serverless` (driver HTTP, edge-compatible, léger).
- **Ajout (dev)** : `vitest` — le projet n'a actuellement aucun harnais de test ; on l'ajoute pour
  couvrir la logique pure sensible (hash, device, referrer, session, comblage de séries). Script
  `"test": "vitest run"`.
- **Aucune** librairie de graphes (graphes maison SVG/CSS). `framer-motion` déjà présent.

## 14. Stratégie de test

Tests unitaires Vitest sur la **logique pure** (pas d'I/O) :
- `hash.ts` : déterminisme (mêmes entrées → même hash), rotation (sel différent un autre jour),
  absence de l'IP en clair dans la sortie.
- `device.ts` : iPhone→mobile, iPad→tablet, desktop UA→desktop, UA vide→desktop.
- `referrer.ts` : host extrait, host propre→null, vide→null, URL malformée→null.
- `session.ts` : sign/verify aller-retour OK, jeton trafiqué rejeté, jeton expiré rejeté.
- `series.ts` : comblage des jours manquants à 0, bornes de période correctes.

Vérification manuelle (documentée) : lancer en local avec une `DATABASE_URL` Neon de test →
charger le site → vérifier l'`INSERT` → se connecter au dashboard → voir les chiffres → tester les
trois plages → déconnexion. Les routes `/api/collect` et la garde de session sont validées ainsi.

## 15. Manifeste des fichiers

**Nouveaux**
- `lib/analytics/schema.sql`
- `lib/analytics/db.ts` (client Neon)
- `lib/analytics/hash.ts`, `device.ts`, `referrer.ts`, `session.ts`, `series.ts`
- `lib/analytics/queries.ts`
- `components/system/AnalyticsBeacon.tsx`
- `app/api/collect/route.ts`
- `app/api/dashboard/login/route.ts`, `app/api/dashboard/logout/route.ts`
- `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`, `app/dashboard/login/page.tsx`
- `components/dashboard/DashboardShell.tsx`, `StatCard.tsx`, `FrequencyChart.tsx`,
  `RankBars.tsx`, `RangeSelector.tsx`
- `scripts/init-db.mjs`
- tests : `lib/analytics/*.test.ts`

**Modifiés**
- `app/[lang]/layout.tsx` (monter `<AnalyticsBeacon/>`)
- `middleware.ts` (exclure `dashboard`)
- `app/robots.ts` (disallow `/dashboard`)
- `app/globals.css` (bloc `DASHBOARD`)
- `.env.example`, `README.md`, `package.json` (deps + script test)

## 16. Extensions futures (non implémentées)

- Export CSV, rapport e-mail hebdomadaire via Resend (déjà branché pour le contact).
- Filtre par langue, par appareil.
- Rétention : purge automatique des events > N mois (cron Vercel).
