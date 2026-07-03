---
name: verify
description: Vérifier un changement FilmVault en pilotant l'app réelle (Vite + Playwright, données seedées dans localStorage).
---

# Vérifier FilmVault

## Lancer l'app

```bash
npm ci                 # si node_modules absent
npm run dev            # Vite sur http://localhost:5173 (laisser tourner en arrière-plan)
```

## Piloter avec Playwright

Écrire un spec dans `e2e/` (le `playwright.config.ts` réutilise le dev server déjà lancé hors CI) :

```bash
npx playwright test e2e/mon-spec.spec.ts --project="Mobile Chrome" --reporter=list
```

- Seeder les données AVANT le boot via `page.addInitScript` sur la clé `localStorage["filmvault-data"]`.
  Réutiliser `createDemoData()` (`src/tour/demo-data.ts`) ou `e2e/fixtures/seed.ts` (couvre les états loaded/partial/exposed/developed/scanned ; ajouter un film avec `actionCode: "sent_dev"` pour la variante « au labo »).
- L'écran de bienvenue peut apparaître : cliquer le bouton `/continuer|locale|sans/i` s'il est visible.
- Locale : `localStorage["filmvault-locale"]` = `"fr"` | `"en"`.

## Pièges

- **Navigateurs** : si le Playwright du repo est plus récent que les navigateurs préinstallés (`Executable doesn't exist at .../chromium_headless_shell-XXXX/...`), créer une structure compatible pointant sur le chromium préinstallé :
  ```bash
  mkdir -p ~/pw-compat/chromium_headless_shell-XXXX/chrome-headless-shell-linux64
  ln -s /opt/pw-browsers/chromium ~/pw-compat/chromium_headless_shell-XXXX/chrome-headless-shell-linux64/chrome-headless-shell
  touch ~/pw-compat/chromium_headless_shell-XXXX/{INSTALLATION_COMPLETE,DEPENDENCIES_VALIDATED}
  PLAYWRIGHT_BROWSERS_PATH=~/pw-compat npx playwright test ...
  ```
- **`addInitScript` persiste à travers les `page.reload()`** : il re-seede les données à chaque navigation. Pour tester un autre jeu de données, ouvrir une nouvelle page (`page.context().newPage()`).
- **Deux `<main>` imbriqués** sur l'accueil : utiliser `page.locator("main").last()`.
- **`toBeVisible()` ignore le clipping `overflow-hidden`** des sections repliées : vérifier plutôt `clientHeight === 0` du panneau (`aria-controls`).
- Les specs `e2e/select-in-dialog.spec.ts` peuvent échouer localement avec le chromium compat (préexistant, passent en CI).

## Captures

`page.screenshot({ path: ..., fullPage: true })` vers le scratchpad, puis les lire/envoyer. `npm run screenshots` régénère les captures officielles de `docs/screenshots/`.
