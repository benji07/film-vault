# Persistence & migrations

Couche localStorage + pipeline de versioning. Source de vérité : `src/utils/storage.ts` et `src/utils/migrations.ts`.

## localStorage

Clés utilisées :

| Clé | Contenu | Producteur |
| --- | --- | --- |
| `filmvault-data` | `AppData` sérialisé JSON | `saveData()` |
| `filmvault-test` | Sonde d'accès (crée/supprime) | `checkStorage()` |
| `filmvault-locale` | `"fr"` \| `"en"` | i18next `languageChanged` |
| `filmvault-recovery-code` | Code de recovery cloud | `src/utils/sync.ts` |
| `filmvault-last-modified` | ISO timestamp dernière modif locale | `setLastModified()` |
| `filmvault-last-sync` | ISO timestamp dernier sync cloud réussi | `setLastSync()` |

## API `src/utils/storage.ts`

| Fonction | Rôle |
| --- | --- |
| `checkStorage(): Promise<boolean>` | Teste l'accès localStorage, met à jour le flag interne. À appeler une fois au démarrage. |
| `isStorageAvailable(): boolean` | Lit le flag après `checkStorage`. |
| `loadData(): Promise<AppData \| null>` | Lit `filmvault-data`, valide, applique migrations si `< CURRENT_VERSION`, normalise, retourne. |
| `saveData(data): Promise<boolean>` | Écrit `filmvault-data` puis `setLastModified()`. |
| `getInitialData(): AppData` | `AppData` vide : `{ films:[], cameras:[], backs:[], lenses:[], version: CURRENT_VERSION }`. |
| `exportData(data)` | Déclenche le téléchargement d'un fichier `filmvault-backup-YYYY-MM-DD.json`. |
| `parseImportFile(file, t?): Promise<ImportResult \| ImportError>` | Parse un JSON importé, valide, refuse si `version > CURRENT_VERSION`, migre sinon. |

### Pipeline `loadData`

```
raw = localStorage.getItem("filmvault-data")
  └─▶ JSON.parse → validateAppData → ❌ null
                                    └─▶ if version < CURRENT_VERSION:
                                          applyMigrations → réécriture localStorage → return
                                        else:
                                          normalizeAppData → return
```

`validateAppData` accepte strictement les structures où `films` et `cameras` sont des tableaux, `backs`/`lenses`/`version` optionnels selon la version. Si `version >= 13`, `lenses` doit être un tableau.

`normalizeAppData` comble les valeurs manquantes pour les données plus anciennes : `backs ??= []`, `lenses ??= []`.

## Migrations : `src/utils/migrations.ts`

Constante `CURRENT_VERSION = 17`. L'objet `migrations: Record<number, MigrationFn>` associe chaque version source à une fonction `(data) => newData`.

Fonction publique :

```ts
applyMigrations(data: Record<string, unknown>): AppData
```

Applique séquentiellement `migrations[v]` tant que `version < CURRENT_VERSION`, force `current.version = CURRENT_VERSION` en sortie, et cast vers `AppData`. Lève si une version intermédiaire n'a pas de fonction enregistrée.

### Historique

| De → À | Fonction | Objet |
| --- | --- | --- |
| 1 → 2 | `migrateV1toV2` | Scinde `camera.name` en `{ brand, model, nickname:"", serial:"" }`. |
| 2 → 3 | `migrateV2toV3` | Bump sans transformation. |
| 3 → 4 | `migrateV3toV4` | Tronque `film.expDate` à `YYYY-MM`. |
| 4 → 5 | `migrateV4toV5` | Initialise `film.scanRef` à `null`. |
| 5 → 6 | `migrateV5toV6` | Ajoute `nickname` et `serial` par défaut aux `camera.backs[]`. |
| 6 → 7 | `migrateV6toV7` | Parse les `history[].action` bilingues (FR/EN) pour renseigner `actionCode` + `params`. |
| 7 → 8 | `migrateV7toV8` | Bump. |
| 8 → 9 | `migrateV8toV9` | Bump. |
| 9 → 10 | `migrateV9toV10` | Extrait `camera.backs[]` dans `data.backs[]` racine, propage `format` et `compatibleCameraIds: [cam.id]`. |
| 10 → 11 | `migrateV10toV11` | Remplace `format`/`type` `"Instant"` par `"Instax Mini"` / `"Couleur"` sur films, caméras et dos. |
| 11 → 12 | `migrateV11toV12` | Champs optionnels d'exposition sur `Camera`. Pas de transformation. |
| 12 → 13 | `migrateV12toV13` | Ajoute `lenses: []` racine, `lensId` optionnel sur `Film`/`ShotNote`. |
| 13 → 14 | `migrateV13toV14` | Calcule `lens.isZoom = fMax > fMin` à partir des focales existantes. |
| 14 → 15 | `migrateV14toV15` | Champs optionnels `devCost`, `scanCost`, `devScanPackage` sur `Film`. Pas de transformation. |
| 15 → 16 | `migrateV15toV16` | Bump (schéma cloud normalisé côté Supabase). |
| 16 → 17 | `migrateV16toV17` | Ajoute `soldAt` optionnel sur `Camera`, `Back`, `Lens`. Pas de transformation. |

## Ajouter une migration

À faire à chaque changement structurel (ajout/suppression de champ obligatoire, renommage, normalisation de valeurs, extraction de tableau…).

1. **Incrémenter** la constante dans `src/utils/migrations.ts` :
   ```ts
   export const CURRENT_VERSION = 18;
   ```
2. **Écrire** la fonction :
   ```ts
   function migrateV17toV18(data: Record<string, unknown>): Record<string, unknown> {
     // Transformations sur data.films / data.cameras / data.backs / data.lenses
     return { ...data, version: 18 };
   }
   ```
   - Toujours retourner un nouvel objet avec `version` incrémenté.
   - Typer les structures intermédiaires via des interfaces locales (`V17Film` ex.) si nécessaire pour documenter le schéma source.
   - Les champs purement optionnels (présent ou `undefined`) peuvent n'avoir qu'un bump sans transformation.
3. **Enregistrer** dans l'objet `migrations` :
   ```ts
   const migrations: Record<number, MigrationFn> = {
     …
     17: migrateV17toV18,
   };
   ```
4. **Mettre à jour** `validateAppData` / `normalizeAppData` si le nouveau champ impose une invariance.
5. **Adapter** `createNewFilm`/`getInitialData` pour produire directement des objets compatibles v18.
6. **Mettre à jour** ce fichier (tableau historique).

## Import/export

`exportData(data)` sérialise `AppData` tel quel dans un fichier JSON. `parseImportFile(file)` :

- lit le texte, `JSON.parse`
- refuse si `validateAppData` échoue (message i18n `storage.invalidData`)
- refuse si `version > CURRENT_VERSION` (`storage.newerVersion`)
- applique migrations puis normalise si `version < CURRENT_VERSION`
- retourne `{ success: true, data }` ou `{ success: false, error }`

L'UI d'import se trouve dans `SettingsScreen`.

## Invariants

- Aucune fonction du projet ne doit lire/écrire `filmvault-data` en dehors de `src/utils/storage.ts`.
- Toute mutation passe par `updateData` (voir `docs/architecture.md`).
- Les migrations sont **pures** (aucun accès réseau, localStorage, DOM).
- Une migration est **idempotente en sortie** : un deuxième appel sur un objet déjà migré produit le même résultat (utile pour `pullFromCloud` qui ré-applique les migrations).
