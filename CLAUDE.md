# FilmVault

PWA de gestion de pellicules argentiques avec un thème "chambre noire".

## Stack

- **Framework** : React 19 + TypeScript 6 (strict) + Vite 8
- **Styling** : Tailwind CSS 4 avec `@theme` (variables custom dans `src/index.css`)
- **UI** : Composants dans `src/components/ui/` utilisant `cn()` de `@/lib/utils`
- **Icones** : Lucide React
- **Linting/Formatting** : Biome (tabs, double quotes, semicolons, line width 120)
- **Persistence** : localStorage avec migrations versionnées
- **Deploiement** : GitHub Pages (CI via `.github/workflows/deploy.yml`)

## Commandes

```bash
npm run dev       # Serveur de dev Vite
npm run build     # Type-check (tsc --noEmit) + build Vite
npm run lint      # Biome check
npm run format    # Biome check --write
```

## Architecture

```
src/
  components/ui/   # Composants UI de base (Button, Card, Input, Select, Badge, Sheet, Switch...)
  components/      # Composants metier (FilmRow, StatCard, TabBar, Timeline, Toast...)
  screens/         # Ecrans complets (Dashboard, Stock, AddFilm, FilmDetail, Cameras, Stats, Settings)
  constants/       # Theme (couleurs, fonts), catalogue de films
  utils/           # Helpers, storage, migrations, hooks custom
  types.ts         # Types et interfaces partagees
  lib/utils.ts     # Utilitaire cn() (clsx + tailwind-merge)
```

## Conventions

- **Imports** : utiliser l'alias `@/*` (ex: `import { Button } from "@/components/ui/button"`)
- **Composants** : named exports, functional components, interfaces pour les props
- **Fichiers** : PascalCase pour les composants (`FilmRow.tsx`), kebab-case pour les utilitaires (`film-helpers.ts`)
- **Langue** : UI et labels en francais, code (variables, fonctions, types) en anglais
- **Types** : definir les interfaces props au-dessus du composant, utiliser `type` pour les unions simples
- **Design tokens** : utiliser les variables Tailwind custom (`text-text-primary`, `bg-surface`, `text-accent`...) definies dans `index.css` et `constants/theme.ts`

## Documentation technique

Documentation detaillee dans `docs/` — a consulter avant toute modification non triviale :

- [`docs/architecture.md`](docs/architecture.md) — flux applicatif, gestion d'etat, cycle de demarrage, routing
- [`docs/data-model.md`](docs/data-model.md) — types partages, cycle de vie des films, `HistoryEntry`, invariants
- [`docs/persistence.md`](docs/persistence.md) — localStorage, pipeline de migrations, procedure d'ajout
- [`docs/cloud-sync.md`](docs/cloud-sync.md) — Supabase, recovery codes, RPCs, strategie de merge, photos
- [`docs/ui-system.md`](docs/ui-system.md) — design tokens Tailwind 4, `T`, composants UI, conventions
- [`docs/screens.md`](docs/screens.md) — inventaire des 8 ecrans et de leurs props
- [`docs/i18n.md`](docs/i18n.md) — namespaces FR/EN, pluralisation, ajout d'une traduction
- [`docs/recipes.md`](docs/recipes.md) — guides pas-a-pas pour les extensions recurrentes

Les regles courtes dans `.claude/rules/` restent la source pour le style de code au jour le jour ; `docs/` sert de reference detaillee.
