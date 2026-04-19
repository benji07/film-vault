---
description: Regles pour la gestion des donnees et du state
globs: src/utils/**/*.ts, src/types.ts
---

# Modele de donnees

- Les types partages sont dans `src/types.ts` (Film, Camera, AppData, etc.)
- Le state applicatif est de type `AppData` : `{ films: Film[], cameras: Camera[], version: number }`
- La persistence utilise localStorage via `src/utils/storage.ts`
- Les changements de schema doivent passer par une migration dans `src/utils/migrations.ts` et incrementer le numero de version
- Les films suivent un cycle d'etats : stock -> loaded -> partial -> exposed -> developed
- Chaque changement d'etat doit etre enregistre dans `film.history`

Reference detaillee : `docs/data-model.md` (types complets, invariants) et `docs/persistence.md` (pipeline de migrations, procedure d'ajout).
