# Dashboard analytics — précision des données et lisibilité du graphique

Date : 2026-07-09
Branche : `feat/visitor-analytics`

## Problème

Le dashboard livré par les commits `c7f7631` → `9646450` affiche des chiffres exacts sur des
fenêtres inexactes, et un graphique sans repères.

1. **Le graphique n'a aucun axe.** Ni labels de jours, ni échelle verticale, ni légende. Le seul
   repère est l'attribut `title` HTML au survol.

2. **La barre des uniques masque celle des vues.** `FrequencyChart` la dessine en pleine largeur
   (`left: 0; right: 0`), recouvrant le dégradé des vues. Les deux séries ne se lisent pas
   simultanément.

   *Correction du 2026-07-09, après relecture :* la version initiale de cette spec affirmait ici
   que la hauteur des uniques était « un ratio déguisé en quantité ». C'est faux. La barre est un
   enfant absolument positionné de celle des vues, donc sa hauteur `uniques / views * 100` se
   résout contre un parent haut de `views / max` : le rendu valait déjà `uniques / max`, sur
   l'échelle partagée. Seule la largeur pleine posait problème. La formule est conservée telle
   quelle dans le nouveau composant, pour exactement cette raison.

3. **Les fenêtres sont glissantes, donc les buckets des bords sont partiels.** `ts >= now() -
   make_interval(days => 30)` démarre à l'heure courante il y a 30 jours. Le bucket le plus ancien
   est tronqué ; pire, `fillDays` construit ses clés depuis `today - 29`, donc la ligne SQL du jour
   `today - 30` est calculée puis silencieusement jetée.

4. **Les deltas KPI comparent une fenêtre partielle à une fenêtre complète.** La période courante
   contient le bucket en cours (incomplet), la période précédente est entière. Les deltas penchent
   mécaniquement vers le bas.

5. **La carte « Uniques / jour » ne compte pas des uniques par jour.** `visitorHash` est salé par
   `dailySalt()`, qui dérive du secret et de la date UTC. Le hash d'un visiteur change à minuit UTC.
   Donc `count(distinct visitor_hash)` sur 30 jours vaut la *somme des uniques journaliers* : un
   visiteur venu 10 jours compte pour 10.

6. **Le delta de la carte « Mobile » est un pourcentage de pourcentage.** `pctDelta(50, 40)` affiche
   « +25 % » là où le sens est « +10 points ».

7. **`date_trunc('day', ts)` suit le fuseau de la session Postgres**, alors que le sel et `fillDays`
   raisonnent en UTC. Ça fonctionne aujourd'hui parce que Neon est en UTC — par coïncidence.

8. **La colonne `lang` est collectée à chaque événement et affichée nulle part.**

## Hors périmètre

**« Nouveaux vs revenants » est impossible et le restera.** Le sel tournant est ce qui rend le
tracking anonyme sans bandeau de consentement. Relier deux visites de jours différents exigerait un
sel figé, donc un identifiant persistant, donc le régime du consentement RGPD. Refusé.

**« Vues par visiteur » est écarté.** Ce serait une cinquième carte KPI affichant le quotient de
deux cartes déjà voisines sur la même ligne.

**Aucun changement de schéma SQL.** `lang` et `visitor_hash` existent déjà.

## Design

### 1. Couche de périodes — `lib/analytics/range.ts` (nouveau)

`normalizeRange` renvoie aujourd'hui `7 | 30 | 90`, nombre qui sert à la fois de durée et de nombre
de barres. Ça ne tient plus dès qu'un bucket n'est plus un jour.

```ts
export type RangeKey = '24h' | '7d' | '30d' | '90d';
export type Bucket = 'hour' | 'day' | 'week';

export interface RangeSpec {
  bucket: Bucket;
  count: number;   // nombre de buckets affichés
}

// '24h' → hour × 24   |  '7d'  → day × 7
// '30d' → day  × 30   |  '90d' → week × 13
```

`normalizeRange(value?: string): RangeKey` — défaut `'30d'`. Rétrocompatibilité : `'7' → '7d'`,
`'30' → '30d'`, `'90' → '90d'`, pour ne pas casser les liens existants.

`RangeSelector` passe à quatre onglets (`24H` `7J` `30J` `90J`) et écrit `?range=30d`.

### 2. Fenêtres alignées sur les buckets

Le correctif qui débloque tout le reste.

```
window_start = date_trunc(bucket, now() AT TIME ZONE 'UTC') - (count - 1) buckets
window       = [window_start, now())
```

Le premier bucket est entier. Le dernier est la période en cours, donc partiel par nature : on le
**garde** (on veut voir le trafic du jour) mais on le **marque**. `fillBuckets` pose `partial: true`
sur le dernier point ; le composant le rend hachuré et le tooltip dit « en cours ». Une barre basse
qu'on sait incomplète informe ; une barre basse qu'on croit finie ment.

Tous les `date_trunc` sont explicitement en UTC, pour s'aligner sur le sel de `visitorHash`.

**Deltas.** Plutôt qu'une règle de trois sur la fraction de bucket écoulée :

```
span      = now() - window_start
précédent = [window_start - span, window_start)
```

Deux fenêtres exactement de même durée. Biais nul, aucun cas particulier.

### 3. `lib/analytics/series.ts`

`fillDays(rows, rangeDays, today)` devient :

```ts
export interface Point {
  key: string;      // ISO du début de bucket
  views: number;
  uniques: number;
  partial?: boolean;
}

export function fillBuckets(
  rows: Point[],
  opts: { bucket: Bucket; count: number; now: Date }
): Point[];
```

Un point par bucket, ordre croissant, trous à zéro, `partial: true` sur le dernier. Tout en UTC.

`pctDelta` est conservé tel quel. Ajout :

```ts
/** Écart en points de pourcentage. Pour comparer deux pourcentages. */
export function pointDelta(cur: number, prev: number): number;
```

### 4. Graphique — `components/dashboard/FrequencyChart.tsx`

- **Axe Y** : trois graduations (0, moitié, max) ; le max est arrondi au « nice number »
  supérieur (1, 2 ou 5 × 10ⁿ).
- **Axe X** : ticks adaptatifs selon le bucket.
  - `hour` (24h) → toutes les 6 h : `00h 06h 12h 18h`
  - `day` (7d) → les 7 jours nommés : `lun mar mer jeu ven sam dim`
  - `day` (30d) → tous les 7 jours, datés : `1 jui  8 jui  15 jui  22 jui`
  - `week` (90d) → les débuts de mois : `avr  mai  juin  juil`
- **Légende** vues / uniques.
- **Les deux séries deviennent lisibles ensemble** : la barre des uniques est encartée de 22 % de
  chaque côté au lieu d'occuper toute la largeur, et les deux partagent le même maximum arrondi
  (`niceMax`). Comme `uniques ≤ views` toujours, l'encart se lit comme un rapport partie-tout.
  La hauteur, elle, était déjà correcte (voir la correction au §2 des problèmes).
- **Tooltip** au survol (date + vues + uniques + « en cours » le cas échéant), doublé d'un
  `<table>` en `sr-only`. Un `role="img"` sur 30 barres ne dit rien à un lecteur d'écran.

La sélection des ticks est une **fonction pure** placée dans `lib/analytics/ticks.ts` — c'est de la
logique, elle se teste sans DOM.

### 5. Nouveaux panneaux

| Fonction | Panneau | Han |
|---|---|---|
| `getLanguages(range)` | `RankBars` « Langues » | 語 |
| `getHourly(range)` | `HourlyChart` (0–23 h, cumulé sur la période) | 時 |

`getTopPages` gagne un `count(distinct visitor_hash) AS uniques`. Le classement se **trie sur les
visiteurs**, les deux nombres s'affichent. Une page rechargée vingt fois cesse de trôner en tête.
`RankRow` devient `{ label, views, uniques? }` ; `RankBars` dessine la barre sur `uniques` quand la
colonne est présente, sur `views` sinon.

### 6. Cartes KPI — `components/dashboard/StatCard.tsx`

| Carte | Avant | Après |
|---|---|---|
| Vues | inchangée | inchangée |
| Uniques / jour | somme des uniques journaliers | **moyenne** des uniques journaliers |
| Pays | inchangée | inchangée |
| Mobile | delta en `%` | delta en **points** (`+10 pts`) |

`StatCard` prend `deltaUnit: 'pct' | 'pts'` (défaut `'pct'`).

### 7. Limites assumées, documentées dans le code

Les deux découlent du sel tournant et ne seront pas maquillées :

- Les uniques d'un bucket **hebdomadaire** (90d) sont la somme des uniques de ses 7 jours, pas les
  uniques de la semaine.
- Sur **24h**, un visiteur à cheval sur minuit UTC compte double.

C'est le prix de l'anonymat sans bandeau de consentement.

## Tests

Vitest, déjà en place. Toutes les fonctions visées sont pures — aucune ne touche la base.

- `fillBuckets` : les trois granularités, comptage exact, ordre croissant, trous à zéro,
  `partial` sur le dernier point uniquement, clés en UTC.
- `pointDelta` : écart signé, zéros.
- `normalizeRange` : les quatre clés, la rétrocompat `'30' → '30d'`, le défaut sur entrée invalide.
- `ticks` : les quatre stratégies de labels.

## Fichiers touchés

Nouveaux : `lib/analytics/range.ts`, `lib/analytics/ticks.ts`, `components/dashboard/HourlyChart.tsx`
(+ leurs tests).

Modifiés : `lib/analytics/series.ts`, `lib/analytics/queries.ts`, `lib/analytics/series.test.ts`,
`components/dashboard/FrequencyChart.tsx`, `RankBars.tsx`, `StatCard.tsx`, `RangeSelector.tsx`,
`app/dashboard/page.tsx`, `app/globals.css`.

## Conséquence au déploiement

La réécriture des fenêtres (§2) fait bouger les chiffres affichés : les vues sur 30 jours augmentent
légèrement (on récupère la journée jetée) et les deltas changent de valeur. C'est une correction, pas
une régression. Aucun événement stocké n'est modifié.
