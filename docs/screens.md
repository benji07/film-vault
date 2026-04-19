# Écrans

Les 8 écrans principaux de FilmVault. Source de vérité : `src/screens/`. Navigation contrôlée par `ScreenName` (`src/types.ts`).

Pour le routing et la propagation du state, voir `docs/architecture.md`.

## `DashboardScreen` — `home`

`src/screens/DashboardScreen.tsx`

Accueil : pellicules actives (chargées/partielles), équipement chargé, stats rapides, section « À faire » (dev/scan).

**Props**
```ts
{ data, setScreen, setSelectedFilm, onAddFilm, setAutoOpenShotNote?, onNavigateToStock }
```

**Composants exploités** : `ActiveRollCard`, `EquipmentCard`, `StatCard`, `StatChip`, `TodoItem`, `EmptyState`.

## `StockScreen` — `stock`

`src/screens/StockScreen.tsx`

Inventaire filtrable/triable. Utilise le hook `useStockFilters(films, initialStateFilter)` (`src/utils/use-stock-filters.ts`) pour gérer recherche, filtres (`format`, `type`, `brands[]`, `isoValues[]`) et tri (`SortOption`). Regroupe par date d'ajout via `groupFilms`.

**Props**
```ts
{ data, setScreen, setSelectedFilm, onAddFilm, initialStateFilter? }
```

**Composants exploités** : `FilmRow`, `StockFilterDialog`, `ActiveFilterChips`, `EmptyState`.

## `FilmDetailScreen` — `filmDetail`

`src/screens/FilmDetailScreen.tsx`

Détail d'une pellicule identifiée par `filmId`. Affiche le cycle de vie (`FilmLifecycleStepper`), les infos, l'historique (`Timeline`), les `ShotNotes` (`ShotNotesSection`).

**Props**
```ts
{ data, setData, setScreen, setSelectedFilm, filmId,
  onNavigateToMap?, autoOpenShotNote?, setAutoOpenShotNote? }
```

**Sous-composants** (`src/screens/film-detail/`) :

- `FilmInfoSection.tsx` — infos éditables (brand, iso, format, expDate, storage)
- `FloatingActionBar.tsx` — actions flottantes contextuelles (Load, Expose, Develop, Scan)
- `TransitionModals.tsx` — modals pour transitions `loaded` → `exposed` / `partial`
- `DevScanModals.tsx` — modals pour `developed` / `scanned` (lab, ref, coût, dev/scan package)
- `EditModal.tsx` — édition globale du film
- `types.ts` — types locaux (`ActionType`, `EditData`…)

Chaque transition d'état pousse une `HistoryEntry` avec le bon `actionCode` et `params` (voir `docs/data-model.md`).

## `EquipmentScreen` — `cameras`

`src/screens/EquipmentScreen.tsx`

Gestion des caméras, objectifs et dos. Trois onglets via un state local `activeTab: EquipmentTab`.

**Props**
```ts
{ data, setData }
```

**Sous-composants** (`src/components/equipment/`) :

- `CamerasTab.tsx` — liste + formulaire add/edit, photo via `PhotoPicker`
- `LensesTab.tsx` — idem pour `Lens`
- `BacksTab.tsx` — idem pour `Back`, gère la compatibilité `compatibleCameraIds`

## `StatsScreen` — `stats`

`src/screens/StatsScreen.tsx`

Statistiques agrégées à partir des `films` : répartition par `type`, `brand`, `format`, par caméra, par objectif (via `lensDisplayName`). Utilise `BarChart`.

**Props**
```ts
{ data }
```

## `SettingsScreen` — `settings`

`src/screens/SettingsScreen.tsx`

Réglages : langue (fr/en), thème (dark/light), sync cloud (activation + code de récupération + sync manuelle), import/export (`exportData`, `parseImportFile`), accès aux mentions légales.

**Props**
```ts
{ data, setData, syncing, recoveryCode, onRecoveryCodeChange, onSyncNow, persistent, setScreen }
```

**Points d'intégration** : voir `docs/cloud-sync.md` pour le détail des flows (activation, restauration).

## `MapScreen` — `map`

`src/screens/MapScreen.tsx` (chargé en `React.lazy` dans `App.tsx`)

Carte MapLibre GL centralisant les `ShotNote` avec `latitude`/`longitude`. Clusters par niveau de zoom (`clusterNotes` dans `src/utils/map-helpers.ts`). Filtre par film (`filterFilmId`) et par type (`filterType: FilmType`).

**Props**
```ts
{ data, setScreen, setSelectedFilm, filterFilmId, onClearFilter }
```

**Sous-composants** (`src/components/map/`) : `MapFilterBar`, `ClusterSheet`, `NoteSheet`, `NoteMarker`.

## `LegalScreen` — `legal`

`src/screens/LegalScreen.tsx`

Mentions légales statiques, accessible depuis `SettingsScreen`.

**Props**
```ts
{ onBack }
```

## Conventions

- Un écran vit dans `src/screens/{Name}Screen.tsx`.
- Suffixe `Screen` **obligatoire** dans le nom de fichier et le nom de composant.
- Props interface `{Name}ScreenProps` déclarée au-dessus.
- Pour toute mutation de `data`, appeler `setData(newData)` — c'est la prop héritée de `updateData` (voir `docs/architecture.md`).
- Utiliser `useTranslation()` pour tout texte UI.
- Headers/layout communs gérés par `AppHeader` (mobile) et `TabBar` (mobile & desktop). Les écrans ne redéfinissent pas le chrome de navigation.
