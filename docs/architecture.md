# Architecture

Vue d'ensemble du flux applicatif de FilmVault. Compléter avec `docs/data-model.md` pour les types et `docs/persistence.md` pour la couche de stockage.

## Stack technique

| Couche | Outil | Version |
| --- | --- | --- |
| Framework | React | 19.2 |
| Langage | TypeScript (strict) | 6.0 |
| Build | Vite | 8.0 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | 4.2 |
| UI primitives | Radix UI (`@radix-ui/react-*`) | 1.x / 2.x |
| Icônes | Lucide React | 1.7 |
| i18n | i18next + react-i18next | 26 / 17 |
| Cartes | `maplibre-gl` + `react-map-gl` | 5 / 8 |
| Cloud (optionnel) | `@supabase/supabase-js` | 2.101 |
| PWA | `vite-plugin-pwa` (Workbox) | 1.2 |
| Lint/Format | Biome | 2.4 |
| Tests E2E | Playwright | 1.59 |

Scripts NPM : `npm run dev | build | preview | lint | format | test | test:ui`.

## Point d'entrée

- `src/main.tsx` : monte React en `StrictMode`, charge `src/utils/i18n.ts` puis rend `<App />`.
- `src/App.tsx` : expose `FilmVaultInner` qui concentre tout l'état applicatif, enveloppé par `ThemeProvider`, `ToastProvider` et `TourProvider`.

## Gestion d'état

Le projet n'utilise ni Redux, ni Zustand, ni Context global pour les données. Le composant `FilmVaultInner` (`src/App.tsx`) détient :

- `data: AppData | null` — état principal persisté (`useState`)
- `dataRef: useRef<AppData | null>` — miroir pour closures stables (listeners `online`)
- `loading`, `screen`, `selectedFilm`, `stockStateFilter`, `mapFilterFilmId`, `autoOpenShotNote`, `showAddFilm`, `persistent`, `syncing`, `recoveryCode` — UI/session state

La fonction `updateData(newData)` (`src/App.tsx:44`) est l'unique point de mutation :

```ts
setData(newData);
dataRef.current = newData;
if (isStorageAvailable()) await saveData(newData);
const code = getRecoveryCode();
if (code && isSupabaseConfigured) pushToCloud(code, newData).catch(() => {});
```

Conséquence : **toute modification passe par `updateData`** — jamais de `setData` direct, jamais de mutation en place. Voir `docs/persistence.md` pour le pipeline save/sync.

## Propagation du state

`AppContent` (dans `src/App.tsx`) est le relais qui distribue `data`, `updateData` et les setters vers les écrans :

```
FilmVaultInner
  └── AppContent (data, updateData, screen, setSelectedFilm, ...)
        ├── TabBar (navigation)
        ├── AppHeader
        └── renderScreen() switch
              ├── DashboardScreen
              ├── StockScreen        (data, updateData, setSelectedFilm, ...)
              ├── FilmDetailScreen   (data, updateData, selectedFilm, ...)
              ├── EquipmentScreen
              ├── StatsScreen
              ├── SettingsScreen
              ├── MapScreen          (lazy)
              └── LegalScreen
```

Le prop drilling est assumé et explicite. Les callbacks (`onAddFilm`, `onUpdateFilm`, `onDeleteFilm`…) remontent jusqu'à `updateData`.

## Routing

Pas de React Router. `screen: ScreenName` (type défini dans `src/types.ts`) est une union :

```
"home" | "stock" | "filmDetail" | "cameras" | "stats" | "settings" | "legal" | "map"
```

Un `switch` dans `renderScreen()` (`src/App.tsx`) choisit l'écran. `MapScreen` est chargé en lazy via `React.lazy` + `Suspense` pour isoler la bundle Leaflet/MapLibre.

## Cycle de démarrage

`useEffect` de `FilmVaultInner` (`src/App.tsx:81`) :

1. `ensureAnonSession()` si `isSupabaseConfigured && navigator.onLine`
2. `checkStorage()` → active `isStorageAvailable`
3. `loadData()` → lit localStorage, applique migrations si `version < CURRENT_VERSION`, normalise
4. Si pas de données locales valides → `getInitialData()` (AppData vide, `version = CURRENT_VERSION`)
5. Si `getRecoveryCode()` et Supabase configuré → `syncData(code, appData)` (compare timestamps local/cloud, conserve le plus récent)
6. `refreshCatalogs()` en arrière-plan (catalogues films/caméras Supabase)
7. `setLoading(false)`

Un listener `window.addEventListener("online")` déclenche `triggerSync()` pour resynchroniser dès retour en ligne.

## Providers

- **ThemeProvider** (`src/components/ThemeProvider.tsx`) : ajoute/retire la classe `html.light` selon la préférence stockée.
- **ToastProvider** (`src/components/Toast.tsx`) : hook `useToast()` qui expose `toast(msg, "success" | "error")`.
- **TourProvider** (`src/tour/TourProvider.tsx`) : onboarding optionnel piloté par `hasCompletedTour()` et les étapes de `src/tour/tour-steps.ts`.

## Arborescence `src/`

```
src/
├── main.tsx, App.tsx, index.css, types.ts
├── lib/
│   └── utils.ts                  # cn()
├── components/
│   ├── ui/                       # 17 primitives (voir docs/ui-system.md)
│   ├── equipment/                # CamerasTab, LensesTab, BacksTab
│   ├── map/                      # MapFilterBar, ClusterSheet, NoteSheet, NoteMarker
│   └── *.tsx                     # 24 composants métier
├── screens/                      # 9 écrans (voir docs/screens.md)
│   └── film-detail/              # Sous-composants de FilmDetailScreen
├── constants/                    # theme.ts, films.ts, photography.ts, film-catalog.ts
├── utils/                        # storage, migrations, sync, helpers, hooks
├── locales/                      # fr.ts, en.ts
└── tour/                         # Onboarding
```

## PWA & déploiement

- `vite.config.ts` configure `VitePWA` avec `registerType: "prompt"`, manifest `My Film Vault`, icons 192/512, caching Google Fonts via Workbox `CacheFirst`.
- `PwaUpdateBanner` (`src/components/PwaUpdateBanner.tsx`) exploite `virtual:pwa-register/react` pour proposer la mise à jour.
- `base: "./"` dans `vite.config.ts` pour compatibilité GitHub Pages.
- CI : `.github/workflows/deploy.yml` (jobs `migrate` Supabase → `build` → `deploy` Pages). Env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` injectées au build.

## Conventions transverses

- Alias `@/*` → `src/*` (défini dans `vite.config.ts` et `tsconfig.json`). **Jamais d'imports relatifs `../`**.
- Named exports uniquement (pas de `export default`, sauf `i18n.ts`).
- Interfaces props nommées `{ComponentName}Props`, déclarées au-dessus du composant.
- Tout texte utilisateur passe par `t()` (voir `docs/i18n.md`).
- Tout changement de schéma `AppData` impose une migration (voir `docs/persistence.md`).
