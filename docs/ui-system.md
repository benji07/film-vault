# UI system — direction « Carnet + Kodak Gold vintage »

L'app FilmVault utilise un thème unique inspiré d'un carnet de photographe argentique et des packagings Kodak Gold des années 80. Pas de mode dark, pas de toggle thème : la palette papier crème est la signature identitaire.

Source de vérité : `src/index.css`, `src/constants/theme.ts`, `src/components/ui/`.

## Tokens couleur

Définis dans `src/index.css` via le bloc `@theme` de Tailwind 4 et exposés en JS via `T` dans `src/constants/theme.ts`.

### Surfaces (papier ivoire chaud)
- `--color-paper` (`#f1e8d4`) — fond principal de l'app
- `--color-paper-card` (`#fbf3df`) — surfaces surélevées (cartes)
- `--color-paper-dark` (`#e6dbc1`) — surfaces enfoncées, séparations

### Encres (brun chocolat — le "noir" est volontairement chaud)
- `--color-ink` (`#1f1410`) — texte principal et bordures
- `--color-ink-soft` (`#3a2a1c`) — texte secondaire
- `--color-ink-faded` (`#6b5d44`) — labels, métadonnées en typewriter

### Couleurs Kodak vintage 80s
- `--color-kodak-yellow` (`#e8a818`) — accent principal, fond de packaging "couleur"
- `--color-kodak-yellow-deep` (`#c8861a`) — état "partielle"
- `--color-kodak-gold` (`#a8843a`) — état "développée"
- `--color-kodak-red` (`#b8362a`) — accent rouge, état "chargée"
- `--color-kodak-teal` (`#2d4a32`) — diapositives, état "au labo"

### Washi (rubans décoratifs)
- `--color-washi-1` (`#d4a574`) — ocre
- `--color-washi-2` (`#a8c4a2`) — sauge
- `--color-washi-3` (`#d97a6c`) — corail
- `--color-washi-4` (`#9bb5c8`) — bleu

Les anciens tokens (`--color-bg`, `--color-text-primary`, `--color-accent`, etc.) sont conservés en alias et pointent vers la nouvelle palette. Les écrans qui n'ont pas encore migré vers les classes spécifiques (`bg-paper`, `text-ink`) restent cohérents avec la palette.

## Typographie

Quatre familles chargées via Google Fonts (`display=swap`) :

| Famille | Token Tailwind | Usage |
|---|---|---|
| Caveat (manuscrit) | `font-caveat` | Titres principaux, valeurs de fiche, descriptions caveat |
| Cormorant Garamond (serif) | `font-cormorant` | Sous-titres, noms de pellicules, body par défaut |
| Special Elite (typewriter) | `font-typewriter` | Métadonnées, dates, codes série |
| Archivo / Archivo Black | `font-archivo` / `font-archivo-black` | Labels UI, états, chiffres, typo Kodak |

Les anciennes classes `font-display` / `font-body` / `font-mono` sont conservées en alias.

## Patterns visuels

- **Bande Kodak rouge verticale** — utility `.fv-redstripe`, posée au niveau du `#root` (rendue dans `App.tsx`). 4px collés au bord gauche du viewport, signature présente sur tous les écrans.
- **Ombres dures décalées** — `shadow-[3px_3px_0_var(--color-ink)]` ou `4px 4px` sur les cartes, boutons, badges. Pas de blur, façon impression sérigraphique.
- **Bandeaux rayés** — `repeating-linear-gradient` jaune/noir sur top/bot des packagings.
- **Washi tape** — composant `<WashiTape>` avec mask gradient (`.fv-washi-mask`) pour effet déchiré sur les bords. Légère rotation -2° à +3°.
- **Texture papier** — SVG noise inline en `background-image` sur le `body`, fixé au scroll.
- **Légères rotations** — `-rotate-[0.3deg]` ou `rotate-[0.25deg]` alternées sur les cartes pour casser la rigidité grille.
- **Perforations 35mm** — sur la TabBar, `radial-gradient` qui imite les trous d'entraînement d'une pellicule.

## Composants nouveaux

Tous dans `src/components/ui/` sauf indication :

- **`<FilmLabel>`** — étiquette de pellicule façon packaging Kodak. Props : `iso`, `format`, `variant` (`color | bw | slide | tungsten`), `size` (`sm | md`), `typeLabel?`. Mapping variant : `color=yellow / bw=paper / slide=teal / tungsten=red`.
- **`<FilmPackagingHeader>`** — bandeau d'en-tête réutilisable (FilmDetail + AddFilm preview). Bandes rayées, code marque (KodakBadge), ISO en très grand, bandeau de format/EXP, frise barcode jaune.
- **`<PageHeader>`** — header sticky standard à 2 niveaux : titre Caveat 28px + badge compteur Archivo Black rouge collé, slot droit (`right`), slot enfants pour ligne contextuelle (chips, tabs, switch).
- **`<KodakBadge>`** — petit badge rectangulaire `bg-ink text-kodak-yellow` Archivo Black. Pour les codes (formats, REF, EXP, marques abrégées).
- **`<WashiTape>`** — ruban décoratif. Props : `color` (`w1..w4` ou `yellow`), `rotate`, `width`. Position via className (top/left/right) ou style.
- **`<CarnetFilmCard>`** (dans `src/components/`) — carte pellicule du Carnet : FilmLabel à gauche, métadonnées à droite avec description Caveat contextuelle selon état + barre de progression hachurée.

## Composants refondus (API préservée)

- **`<Button>`** — variants `default`/`primary` (rouge brique), `secondary`/`outline` (papier crème), `kodak` (jaune doré), `ghost`. Bordure 2px ink, ombre dure 3px, pas de radius. Texte Archivo Black uppercase.
- **`<Card>`** — fond paperCard, bordure 2px ink, ombre dure 3px, pas de radius.
- **`<Chip>`** — bordure 1.5px ink, ombre dure 2px, fond transparent ou jaune Kodak actif, micro-translate sur actif.
- **`<Input>` / `<Textarea>`** — bordure 1.5px ink, ombre dure 2px, focus jaune Kodak. Police Cormorant pour la valeur saisie.
- **`<Badge>`** — étiquette rectangulaire bordure 1.5px, variants `default` (yellow), `ink`, `red`, `teal`, `gold`, `outline`. Archivo uppercase.
- **`<Dialog>`** — overlay `bg-ink/55 backdrop-blur-sm`, content papier bordure 2px ink ombre dure 5px, titre Caveat 26px.
- **`<Select>` / `<AutocompleteInput>` / `<TagInput>`** — bordure ink + ombre dure + popovers paperCard, items Cormorant.
- **`<Switch>`** — rocker rectangulaire (pas de radius), checked rouge Kodak, unchecked paper-dark.
- **`<TabBar>`** — fond ink, top border 4px jaune, perforations 35mm. 5 onglets (carnet, stock, carte, boîtiers, stats). L'onglet actif a un carré jaune sur l'icône.
- **`<FloatingActionMenu>`** — FAB carré 64×64 ombre dure + soft drop. Speed-dial 4 actions (`shot`, `roll`, `camera`, `lens` — plus `back` quand on est sur l'onglet dos). Priorité contextuelle calculée dans `App.tsx` selon `screen`. L'action principale est plus grande (56×56) avec son label en couleur saturée.
- **`<FilmLifecycleStepper>`** — 6 étapes (Stock → Chargée → Exposée → Labo → Dévelop. → Scannée). Le passage par le labo est détecté via `actionCode === "sent_dev"` dans l'historique pour ne pas modifier le modèle.
- **`<StatCard>`** — panneau ink avec top stripe coloré, ombre dure colorée, big number Archivo Black tabular-nums.
- **`<BarChart>`** — barres ink hachurées remplies en jaune/coloré, valeurs Archivo Black.
- **`<Toast>`** — notifications rectangulaires Archivo Black uppercase, palette ink/teal/yellow/red selon `type`.
- **`<EmptyState>`** — icône dans un panneau papier bordure ink légèrement tournée + titre Caveat + sous-titre Cormorant italic.

## Sémantique

- **Carnet (Dashboard)** = écran du présent. Affiche uniquement les pellicules en mouvement (`loaded`, `partial`, `exposed`, `developed`). Filtres workflow (axe unique) : Toutes / Chargées / À développer / À scanner. Stats strip 3 colonnes (chargées · à développer · à scanner).
- **Stock** = 2 onglets (Stock + Archive). L'onglet "Active" a été retiré, le Carnet le remplace. Le stock proprement dit (`state=stock`) et l'archive (`state=scanned`).
- **FilmState** : `stock | loaded | partial | exposed | developed | scanned`. L'état "au labo" n'est pas un FilmState distinct — il se déduit de `state=exposed` + `actionCode=sent_dev` dans l'historique.
- **Big stats (StatsScreen)** : 4 métriques fiables et actionnables (rolls collectés / à développer / en stock / marques essayées). Aucune métrique ne dépend de la saisie de chaque vue.
