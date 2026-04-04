---
description: Regles pour la creation et modification de composants React
globs: src/components/**/*.tsx, src/screens/**/*.tsx
---

# Composants

- Utiliser `cn()` de `@/lib/utils` pour combiner les classes Tailwind
- Toujours accepter `className` en prop pour permettre la personnalisation
- Named exports uniquement (pas de `export default`)
- Definir les props avec une `interface` nommee `{ComponentName}Props`
- Les composants UI de base vont dans `src/components/ui/`, les composants metier dans `src/components/`
- Les ecrans complets vont dans `src/screens/` avec le suffixe `Screen` (ex: `StockScreen.tsx`)
- Utiliser les design tokens Tailwind custom (`bg-surface`, `text-text-primary`, `border-border`...) plutot que des couleurs en dur
- Pour les styles dynamiques necessitant des valeurs JS, importer `T` depuis `@/constants/theme`
