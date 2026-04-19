# Recipes — modifications courantes

Guides pas-à-pas pour les extensions récurrentes. Toutes ces recettes supposent que les docs voisines (`docs/data-model.md`, `docs/persistence.md`, `docs/ui-system.md`, `docs/i18n.md`) sont familières.

## 1. Ajouter un champ à `Film`

Exemple : ajouter `tags: string[]` pour tagger les pellicules.

1. **Type** — `src/types.ts` :
   ```ts
   export interface Film {
     …
     tags?: string[];
   }
   ```
2. **Migration** — `src/utils/migrations.ts` :
   ```ts
   export const CURRENT_VERSION = 18;   // était 17

   function migrateV17toV18(data: Record<string, unknown>): Record<string, unknown> {
     // tags est optionnel, aucun traitement nécessaire
     return { ...data, version: 18 };
   }

   const migrations: Record<number, MigrationFn> = {
     …
     17: migrateV17toV18,
   };
   ```
   Si le champ est **obligatoire**, backfiller explicitement :
   ```ts
   const films = (data.films as Record<string, unknown>[]) || [];
   return { ...data, films: films.map((f) => ({ ...f, tags: f.tags ?? [] })), version: 18 };
   ```
3. **Factory** — `src/utils/film-factory.ts` : initialiser le nouveau champ dans `createNewFilm()`.
4. **UI d'édition** — `AddFilmDialog.tsx` et `src/screens/film-detail/EditModal.tsx` : ajouter le contrôle.
5. **Affichage** — ajouter dans `FilmInfoSection.tsx` et/ou `FilmRow.tsx` selon visibilité.
6. **i18n** — ajouter les libellés dans `addFilm.*` et `filmDetail.*` (FR + EN).
7. **Historique de migrations** — mettre à jour le tableau dans `docs/persistence.md`.

## 2. Ajouter un écran

Exemple : écran `timeline` global.

1. **Fichier** `src/screens/TimelineScreen.tsx` avec interface `TimelineScreenProps` et export named `TimelineScreen`.
2. **Union** — `src/types.ts` : `type ScreenName = … | "timeline";`.
3. **Routing** — `src/App.tsx`, fonction `renderScreen()` : ajouter le `case "timeline": return <TimelineScreen …/>;`.
4. **Navigation** — `src/components/TabBar.tsx` et `AppHeader.tsx` : ajouter l'entrée (icône Lucide, libellé i18n).
5. **i18n** — `nav.timeline` dans `fr.ts` et `en.ts`, plus les libellés spécifiques à l'écran.
6. **Lazy loading optionnel** — pour un écran lourd (ex. Map), envelopper avec `React.lazy` + `Suspense` comme `MapScreen` dans `App.tsx:26`.
7. **Doc** — mettre à jour `docs/screens.md` et `docs/architecture.md` (arborescence).

## 3. Ajouter un composant UI

Exemple : nouvelle primitive `progress-bar` dans `src/components/ui/`.

1. Créer `src/components/ui/progress-bar.tsx` :
   ```tsx
   import { cn } from "@/lib/utils";

   interface ProgressBarProps {
     value: number;            // 0 à 1
     className?: string;
   }

   export function ProgressBar({ value, className }: ProgressBarProps) {
     return (
       <div className={cn("h-1 w-full bg-border rounded-full overflow-hidden", className)}>
         <div
           className="h-full bg-accent transition-[width]"
           style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }}
         />
       </div>
     );
   }
   ```
2. Si plusieurs variantes stylistiques : utiliser `cva` et exporter `progressBarVariants` (cf. `button.tsx`).
3. Pour un wrapper Radix (select, dialog…), suivre le pattern de `dialog.tsx`/`select.tsx`.
4. Ne pas exporter un `default`.

## 4. Ajouter une action dans `film.history`

Exemple : action `lost` (pellicule perdue).

1. **Type** — `src/types.ts` : `type HistoryAction = … | "lost";`.
2. **UI** — écrire la mutation :
   ```ts
   const updatedFilm: Film = {
     ...film,
     state: "exposed",  // ou autre état terminal si pertinent
     history: [...film.history, { date: today(), action: "", actionCode: "lost" }],
   };
   updateData({ ...data, films: data.films.map((f) => f.id === film.id ? updatedFilm : f) });
   ```
3. **Timeline** — `src/components/Timeline.tsx` : ajouter le rendu du nouvel `actionCode` (icône + libellé).
4. **i18n** — `timeline.lost` dans `fr.ts` et `en.ts`.
5. **Migration v6→v7 (historique)** : pas nécessaire si la nouvelle action n'existe que pour les nouveaux enregistrements. Si on veut détecter l'action dans des exports historiques texte libre, enrichir `parseHistoryAction` (attention : cela ne s'applique qu'aux imports de données <v7).

## 5. Ajouter une migration

Voir `docs/persistence.md` section « Ajouter une migration ». Résumé :

1. Incrémenter `CURRENT_VERSION`.
2. Écrire `migrateVXtoVY` (pure, idempotente, retourne `{ ...data, version: Y }`).
3. Enregistrer dans l'objet `migrations`.
4. Mettre à jour `validateAppData`/`normalizeAppData` si nécessaire.
5. Adapter `createNewFilm`/`getInitialData` pour produire du v`Y` directement.
6. Documenter dans `docs/persistence.md`.

## 6. Ajouter un format ou type de film

Exemple : format `"110"` (sous-miniature).

1. **Type** — `src/types.ts` : ajouter à l'union `FilmFormat`. Ajouter à `INSTANT_FORMATS` si format instantané (sinon ne pas toucher).
2. **Poses par défaut** — `src/utils/film-factory.ts`, table `DEFAULT_POSES` : ajouter `"110": 24`.
3. **Catalogue** — `src/constants/film-catalog.ts` : ajouter les entrées `FilmCatalogEntry` correspondantes si un ou plusieurs films de ce format existent commercialement.
4. **Couleurs** — si nouveau `FilmType`, mettre à jour `FILM_TYPE_COLORS` dans `src/constants/theme.ts` et `getStates(t)` si nécessaire (`src/constants/films.ts`).
5. **i18n** — `filmFormats.*` dans `fr.ts` et `en.ts`.
6. **Migration** — si des données existantes doivent être converties (renommage, fusion…), écrire une migration.
7. Vérifier que les écrans `AddFilmDialog`, `StockFilterDialog` et `StatsScreen` affichent correctement la nouvelle valeur (ils itèrent sur des helpers qui récupèrent la liste depuis `useFilmSuggestions`).

## 7. Ajouter une traduction

Voir `docs/i18n.md`. Résumé :

1. Identifier le namespace approprié.
2. Ajouter la clé dans `src/locales/fr.ts` **et** `src/locales/en.ts`.
3. Utiliser les suffixes i18next (`_one`, `_other`) pour la pluralisation, `{{var}}` pour l'interpolation.
4. Consommer via `t("namespace.key")` ou `t("namespace.key", { count, var })`.

## 8. Ajouter un utilitaire / hook

- **Utilitaire pur** : `src/utils/{nom-kebab}.ts`, named export.
- **Hook** : préfixer par `use-`, placer dans `src/utils/` (ex : `src/utils/use-stock-filters.ts`). Un hook retourne en général un objet avec les valeurs + setters.
- **Ne pas dupliquer** un helper existant : vérifier `src/utils/helpers.ts` (`uid`, `today`, `fmtDate`, `fmtPrice`), `src/utils/film-helpers.ts`, `src/utils/camera-helpers.ts`, `src/utils/lens-helpers.ts`, `src/utils/expiration.ts` d'abord.

## 9. Modifier le design system

- **Nouvelle couleur** : ajouter `--color-xxx` et `--color-xxx-soft` dans `src/index.css` (blocs `@theme` + `html.light`). Ajouter la même clé dans l'objet `T` (`src/constants/theme.ts`). Les classes Tailwind `bg-xxx`, `text-xxx`, etc. sont générées automatiquement par Tailwind 4.
- **Nouvelle typographie** : ajouter `--font-xxx` dans `@theme`, charger la font via `@import` Google Fonts en tête de `src/index.css`, ajouter l'entrée dans `FONT` (`src/constants/theme.ts`).
- **Nouvelle animation** : définir `@keyframes` + utilitaire `.animate-xxx` dans `src/index.css`.

## 10. Lancer et vérifier

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Dev server Vite (localhost:5173) |
| `npm run build` | `tsc --noEmit` puis `vite build` (doit passer sans erreur) |
| `npm run lint` | Biome check (code + CSS, avec tailwindDirectives) |
| `npm run format` | Biome fix (tabs, quotes, semicolons, ordre des imports) |
| `npm run test` | Playwright E2E (configuré pour Chromium + Pixel 5) |
| `npm run test:ui` | Playwright en mode UI |

**Avant tout commit** : `npm run format && npm run lint && npm run build`.

## 11. Rappels universels

- Une seule fonction pour muter `AppData` : `updateData` (via `setData` dans les props d'écran).
- Aucun import relatif (`../`) : toujours `@/…`.
- Named exports uniquement (exception : `src/utils/i18n.ts` qui exporte l'instance i18next par défaut).
- Toute valeur utilisateur est internationalisée.
- Tout changement de forme de `AppData` impose une migration.
