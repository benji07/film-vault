# Modèle de données

Référence des types partagés. Source de vérité : `src/types.ts`. Tout changement de schéma doit être accompagné d'une migration (voir `docs/persistence.md`).

## Structure racine : `AppData`

```ts
interface AppData {
  films: Film[];
  cameras: Camera[];
  backs: Back[];
  lenses: Lens[];
  version: number;   // CURRENT_VERSION courante = 17
}
```

Persisté en localStorage sous la clé `filmvault-data` (voir `docs/persistence.md`).

## Unions et énumérations

### `FilmFormat`
```
"35mm" | "120"
| "Instax Mini" | "Instax Square" | "Instax Wide"
| "Polaroid SX-70" | "Polaroid 600" | "Polaroid I-Type" | "Polaroid Go"
```

Helper `isInstantFormat(format)` (`src/types.ts:25`) détecte les formats instantanés via la constante `INSTANT_FORMATS`.

### `FilmType`
```
"Couleur" | "N&B" | "Diapo" | "ECN-2"
```

Couleurs associées dans `FILM_TYPE_COLORS` (`src/constants/theme.ts`).

### `FilmState`
```
"stock" | "loaded" | "partial" | "exposed" | "developed" | "scanned"
```

Configuration (label i18n, couleur, icône Lucide) fournie par `getStates(t)` dans `src/constants/films.ts`.

### `HistoryAction`
```
"added" | "loaded" | "reloaded" | "removed_partial"
| "exposed" | "sent_dev" | "developed" | "scanned"
| "modified" | "duplicated"
```

### `StopIncrement`
```
"1" | "1/2" | "1/3"
```
Incrément des crans de vitesse/ouverture pour une `Camera` ou `Lens`.

## `Film`

Le type central. Champs par catégorie (voir `src/types.ts:67`) :

**Identité**
- `id: string` — UUID généré par `uid()` (`src/utils/helpers.ts`)
- `brand?`, `model?`, `customName?`
- `iso?: number`, `type?: string` (FilmType), `format?: string` (FilmFormat)

**Stock**
- `state: FilmState` (obligatoire)
- `quantity?: number`, `price?: number | null`, `expDate?: string | null` (`YYYY-MM`)
- `comment?`, `storageLocation?`
- `addedDate: string` (`YYYY-MM-DD`, obligatoire)

**Utilisation**
- `shootIso?: number | null` — ISO réel d'exposition (peut différer de `iso`)
- `cameraId?: string | null`, `backId?: string | null`, `lensId?: string | null`
- `lens?: string | null` — texte libre (legacy avant `lensId`)
- `startDate?: string | null`, `endDate?: string | null`
- `posesShot?: number | null`, `posesTotal?: number | null`

**Développement**
- `lab?: string | null`, `labRef?: string | null`, `devDate?: string | null`
- `devCost?: number | null`, `scanCost?: number | null`, `devScanPackage?: boolean`
- `scanRef?: string | null`

**Journalisation**
- `history: HistoryEntry[]` — obligatoire, démarre avec `{ actionCode: "added" }`
- `shotNotes?: ShotNote[]` — notes par vue

### Poses par défaut

Créés par `createNewFilm()` (`src/utils/film-factory.ts`) via la table `DEFAULT_POSES` :

| Format | Poses |
| --- | --- |
| `35mm` | 36 |
| `120` | 12 |
| `Instax Mini/Square/Wide` | 10 |
| `Polaroid SX-70/600/I-Type/Go` | 8 |

## Cycle de vie des pellicules

```
stock ──loaded──▶ loaded ──removed_partial──▶ partial ──loaded──▶ loaded …
                   │                           │
                   └──exposed──▶ exposed ◀─────┘
                                   │
                                   ├──sent_dev──▶ (pas de nouvel état, ajoute entrée history)
                                   │
                                   └──developed──▶ developed ──scanned──▶ scanned
```

**Règle** : chaque transition pousse une entrée dans `film.history` avec l'`actionCode` correspondant. C'est la seule source de vérité pour tracer l'historique.

## `HistoryEntry`

```ts
interface HistoryEntry {
  date: string;                    // "YYYY-MM-DD"
  action: string;                  // Texte libre, deprecated depuis v7 (peut être "")
  actionCode?: HistoryAction;      // Préféré
  params?: Record<string, string | number | null | undefined>;
  photos?: string[];               // Data URL ou chemins Storage Supabase
}
```

Paramètres attendus par `actionCode` :

| `actionCode` | `params` |
| --- | --- |
| `added` | — |
| `loaded` | `{ camera: string }` — nom affiché de l'appareil |
| `reloaded` | `{ camera: string }` |
| `removed_partial` | `{ posesShot: number, posesTotal: number }` |
| `exposed` | — |
| `sent_dev` | — |
| `developed` | `{ lab: string \| null }` |
| `scanned` | `{ ref: string \| null }` |
| `modified` | — |
| `duplicated` | `{ name: string }` — nom du film source |

Le champ `action` (texte libre) reste présent pour rétrocompatibilité : la migration v6→v7 parse les anciens textes bilingues et renseigne `actionCode` + `params`. Depuis v7, `action` peut rester vide.

## `ShotNote`

Notes par vue, géolocalisées, attachées à `Film.shotNotes` :

```ts
interface ShotNote {
  id: string;
  frameNumber?: number | null;
  aperture?: string | null;      // Issu de APERTURES (src/constants/photography.ts)
  shutterSpeed?: string | null;  // Issu de SHUTTER_SPEEDS
  lens?: string | null;          // Texte libre (fallback si pas de lensId)
  lensId?: string | null;        // Référence à Lens.id
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  date?: string | null;
  photo?: string | null;
}
```

## `Camera`

```ts
interface Camera {
  id: string;
  brand: string; model: string; nickname: string; serial: string;
  format: string;                       // FilmFormat
  hasInterchangeableBack: boolean;
  photo?: string;                       // Data URL ou path Storage
  mount?: string | null;                // "M42", "EF", "F", ...
  shutterSpeedMin?: string | null;
  shutterSpeedMax?: string | null;
  shutterSpeedStops?: StopIncrement | null;
  apertureStops?: StopIncrement | null;
  soldAt?: string | null;               // Date de revente
}
```

Helper d'affichage : `cameraDisplayName(cam)` dans `src/utils/camera-helpers.ts`.

## `Back`

Dos interchangeable (un boîtier de film séparé du corps de la caméra) :

```ts
interface Back {
  id: string;
  name: string;
  nickname?: string; ref?: string; serial?: string; photo?: string;
  format: string;
  compatibleCameraIds: string[];        // IDs de Camera compatibles
  soldAt?: string | null;
}
```

Extrait de `Camera.backs[]` par la migration v9→v10. Helper `backDisplayName(back)` dans `src/utils/camera-helpers.ts`.

## `Lens`

```ts
interface Lens {
  id: string;
  brand: string; model: string; nickname?: string; serial?: string; photo?: string;
  mount?: string;
  isZoom?: boolean;                     // Calculé v13→v14
  focalLengthMin?: number | null;
  focalLengthMax?: number | null;
  maxApertureAtMin?: string | null;
  maxApertureAtMax?: string | null;
  apertureMin?: string | null;
  apertureMax?: string | null;
  apertureStops?: StopIncrement | null;
  shutterSpeedMin?: string | null;
  shutterSpeedMax?: string | null;
  shutterSpeedStops?: StopIncrement | null;
  soldAt?: string | null;
}
```

Helpers : `lensDisplayName()`, `lensFocalLabel()`, `lensApertureLabel()` dans `src/utils/lens-helpers.ts`.

## Types UI

```ts
type ScreenName = "home" | "stock" | "filmDetail" | "cameras"
                | "stats" | "settings" | "legal" | "map";

interface StateConfig {
  label: string;
  color: string;
  icon: ComponentType<{ size?; color?; className?; strokeWidth? }>;
}

type LucideIcon = StateConfig["icon"];
```

## Invariants

- `film.id`, `camera.id`, `back.id`, `lens.id` sont **stables** : toute référence (`cameraId`, `compatibleCameraIds`, `lensId`) doit rester cohérente lors d'une suppression → nettoyer les références orphelines ou refuser la suppression.
- `film.state` et `film.history` sont cohérents : la dernière entrée significative doit correspondre à l'état courant.
- Immutabilité : toute mise à jour crée de nouveaux objets (`{ ...film, state: "exposed" }`), jamais de mutation en place avant `updateData`.
- `version` doit toujours valoir `CURRENT_VERSION` après `loadData`/`parseImportFile`/`getInitialData`.
