# UI system

Design tokens, Tailwind 4, composants UI réutilisables. Source de vérité : `src/index.css`, `src/constants/theme.ts`, `src/components/ui/`.

## Tailwind 4 via `@theme`

Configuration déclarative dans `src/index.css` (il n'y a **pas** de `tailwind.config.js` — tout passe par Vite via `@tailwindcss/vite`).

Les tokens sont définis dans un bloc `@theme { … }` et générés automatiquement par Tailwind en tant qu'utilitaires (`bg-bg`, `text-text-primary`, etc.).

### Couleurs (dark — défaut)

| Variable CSS | Valeur | Usage |
| --- | --- | --- |
| `--color-bg` | `#0d0d0d` | Fond principal |
| `--color-surface` | `#1a1a1a` | Surfaces surélevées |
| `--color-surface-alt` | `#242424` | Surfaces alternatives |
| `--color-card` | `#1e1e1e` | Cartes |
| `--color-card-hover` | `#252525` | Hover carte |
| `--color-border` | `#2a2a2a` | Bordure standard |
| `--color-border-light` | `#333333` | Bordure claire |
| `--color-text-primary` | `#e8e4df` | Texte principal |
| `--color-text-sec` | `#a09a92` | Texte secondaire |
| `--color-text-muted` | `#827d75` | Texte discret |
| `--color-accent` | `#c4392d` | Rouge safelight (CTA) |
| `--color-accent-hover` | `#d44435` | Hover accent |
| `--color-accent-soft` | `rgba(196,57,45,0.12)` | Accent translucide |
| `--color-orange` | `#e07940` | Scanned |
| `--color-amber` | `#d4a858` | Couleur/Partial |
| `--color-green` | `#4a8c5c` | Loaded |
| `--color-blue` | `#5b7fa5` | Stock/Diapo |

Chaque couleur avec variante `-soft` pour badges/backgrounds translucides.

### Thème light (« Chambre claire »)

Activé via `html.light` : un override complet de toutes les variables dans `src/index.css`. Géré par `ThemeProvider` (`src/components/ThemeProvider.tsx`).

### Typographies

| Variable | Famille |
| --- | --- |
| `--font-display` | `Instrument Serif`, italique pour titres |
| `--font-body` | `DM Sans`, corps UI |
| `--font-mono` | `DM Mono`, chiffres et stats |

Utilitaires Tailwind : `font-display`, `font-body`, `font-mono`. Les fonts sont chargées depuis Google Fonts via `@import` en tête de `index.css` et cachées par Workbox.

### Rayon et spacing

- `--radius: 14px` (utilisé via `rounded-[14px]` — le thème shadcn/ui expose aussi `rounded-md/lg`).
- Classes utilisées régulièrement : `rounded-[10px]`, `rounded-[14px]`, `min-h-[44px]` (cibles tactiles), `px-4.5`, `py-2.5`.

### Animations

Keyframes et utilitaires custom définis dans `src/index.css` :

- `animate-fade-in`, `animate-spin`
- `animate-screen-enter`, `animate-screen-forward`, `animate-screen-back`
- `animate-stagger-item`, `animate-slide-up`
- `animate-backdrop-fade-in`
- `animate-toast-enter`, `animate-toast-exit`
- `animate-timeline-pulse`
- `animate-tour-tooltip-enter`, `animate-banner-enter`

## Objet `T` : design tokens côté JS

Pour les styles dynamiques où Tailwind ne peut pas être utilisé (ex. `style={{ color: T.accent }}`), `src/constants/theme.ts` expose :

```ts
export const T = {
  bg, surface, surfaceAlt, card, cardHover,
  border, borderLight,
  text, textSec, textMuted,
  accent, accentHover, accentSoft,
  orange, orangeSoft, amber, amberSoft, green, greenSoft, blue, blueSoft,
} as const;
```

Chaque valeur est `"var(--color-…)"`. Helpers :

- `alpha(cssVar, opacity)` — retourne `color-mix(in srgb, ${cssVar} ${opacity*100}%, transparent)` pour moduler la transparence d'une variable CSS dynamiquement.
- `FILM_TYPE_COLORS: Record<FilmType, string>` — mapping Couleur→amber, N&B→textSec, Diapo→blue, ECN-2→accent.
- `FONT = { display, body, mono }` — pour `style={{ fontFamily: FONT.display }}`.

**Règle** : privilégier les classes Tailwind (`bg-accent`, `text-text-primary`) ; réserver `T` aux cas où la valeur est interpolée en JS (props de lib tierce, animations avec Motion, SVG…).

## Utilitaire `cn()`

`src/lib/utils.ts` :

```ts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Combine `clsx` (gestion conditionnelle) et `tailwind-merge` (déduplication/écrasement des classes Tailwind conflictuelles).

**À utiliser systématiquement** dans chaque composant pour merger `className` (passé par le parent) avec les classes internes :

```tsx
<div className={cn("p-4 bg-card", className)}>…</div>
```

## Composants UI (`src/components/ui/`)

17 primitives. Tous acceptent `className` et exportent en named export.

| Fichier | Rôle | Particularité |
| --- | --- | --- |
| `button.tsx` | Bouton standard | CVA variants `default` \| `outline` \| `ghost` \| `destructive`, tailles `default` \| `sm` \| `icon` \| `icon-sm`, `asChild` via Radix `Slot` |
| `dialog.tsx` | Dialog modal | Wrap `@radix-ui/react-dialog` : `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogCloseButton` |
| `select.tsx` | Select | Wrap `@radix-ui/react-select` : `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| `switch.tsx` | Toggle | Wrap `@radix-ui/react-switch` |
| `input.tsx`, `textarea.tsx` | Champs | Wrappers stylisés des éléments natifs |
| `badge.tsx` | Badge | Variantes via CVA |
| `chip.tsx` | Chip sélectionnable | Bouton avec state `active` |
| `card.tsx` | Carte | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` |
| `alert.tsx` | Alerte | Variante `default` / `destructive` |
| `form-field.tsx` | Wrapper label + champ | Layout flex, gère l'id d'association |
| `list-button.tsx` | Item de liste cliquable | Gère state `selected` |
| `autocomplete-input.tsx` | Input + suggestions | Couple avec `useFilmSuggestions` |
| `month-year-picker.tsx` | Picker `YYYY-MM` | Pour `Film.expDate` |
| `collapsible-section.tsx` | Section repliable | Avec icône, titre, compteur |
| `confirm-dialog.tsx` | Confirmation | Wrap `Dialog`, variante `destructive` |
| `photo-img.tsx` | `<img>` résolvant les chemins Storage | Utilise `resolvePhotoSrc` |

### Conventions de composant

1. **Interface props nommée** `{ComponentName}Props`, déclarée au-dessus du composant.
2. **Named export** uniquement (pas de `export default`).
3. **`className` toujours accepté** et mergé via `cn()`.
4. **CVA** pour les variants stylistiques (cf. `button.tsx`).
5. **Radix** pour toute primitive nécessitant de l'accessibilité (dialog, select, switch, popover, slot).
6. **Tailwind tokens custom prioritaires** sur les couleurs hex. Pour un style dynamique, `T` depuis `@/constants/theme`.

Exemple minimal (règle `.claude/rules/components.md`) :

```tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  label: string;
  active?: boolean;
}

export function MyComponent({ className, label, active }: MyComponentProps) {
  return (
    <div className={cn("p-3 rounded-[14px] bg-card text-text-primary", active && "bg-accent-soft", className)}>
      {label}
    </div>
  );
}
```

## Composants métier (`src/components/`)

24 composants au premier niveau, plus trois sous-dossiers (`equipment/`, `map/`, pas `ui/`). Liste complète :

```
ActiveFilterChips, ActiveRollCard, AddFilmDialog, AppHeader, BarChart,
EmptyState, EquipmentCard, FilmLifecycleStepper, FilmRow, FilmTypeFormatFields,
InfoLine, PhotoPicker, PhotoViewer, PwaInstallBanner, PwaUpdateBanner,
ShotNotesSection, StatCard, StatChip, StockFilterDialog, TabBar,
ThemeProvider, Timeline, Toast, TodoItem
```

- `equipment/` : `CamerasTab`, `LensesTab`, `BacksTab` — onglets d'`EquipmentScreen`.
- `map/` : `MapFilterBar`, `ClusterSheet`, `NoteSheet`, `NoteMarker` — helpers pour `MapScreen`.

## Icônes

`lucide-react` — import nominatif (`import { Camera, Film } from "lucide-react"`). Props usuelles : `size`, `color`, `className`, `strokeWidth`. Le type `LucideIcon` est exporté depuis `src/types.ts`.

## Toasts

`useToast()` depuis `@/components/Toast` (`src/components/Toast.tsx`) :

```tsx
const { toast } = useToast();
toast("Film ajouté", "success"); // "success" | "error"
```

## Haptiques

`src/utils/haptics.ts` expose `hapticLight()`, `hapticSuccess()`, `hapticWarning()` (utilisent `navigator.vibrate` avec fallback silencieux). À appeler pour feedbacks tactiles sur actions importantes.

## Ce qu'il **ne faut pas** faire

- Pas d'imports `../../…` — toujours `@/…`.
- Pas de couleurs hex en dur dans les composants — utiliser les classes Tailwind ou `T`.
- Pas de `export default`.
- Pas de texte français codé en dur dans un composant — passer par `t()` (voir `docs/i18n.md`).
- Pas de mutations de props/state (utiliser le spread immuable).
- Pas de `style={{ color: "#c4392d" }}` — préférer `className="text-accent"` ou `style={{ color: T.accent }}`.
