# Cloud sync (Supabase)

Synchronisation optionnelle via Supabase, activée quand les variables d'environnement sont présentes. L'application fonctionne parfaitement sans cloud.

## Configuration

Variables d'environnement requises (build Vite) :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Injectées en CI par `.github/workflows/deploy.yml` (étape `build`). Le flag `isSupabaseConfigured` (`src/utils/supabase.ts`) est `true` si les deux sont définies. Le client `supabase` est `null` sinon, et toutes les fonctions cloud retournent prématurément.

## Auth anonyme

`ensureAnonSession()` (`src/utils/supabase.ts:15`) appelé au démarrage par `FilmVaultInner` :

- Si une session existe déjà (persistée par `supabase-js` en localStorage), no-op.
- Sinon, `supabase.auth.signInAnonymously()`.

C'est `auth.uid()` qui identifie l'utilisateur côté Postgres (d'où le suffixe `_v3` des RPCs). Le recovery code est un mécanisme de liaison entre plusieurs sessions anonymes (même utilisateur, plusieurs appareils).

## Recovery codes

Format : `FILM-XXXX-XXXX`. Généré par `generateRecoveryCode()` (`src/utils/sync.ts:12`) à partir d'un alphabet sans ambiguïté (pas de `I`/`O`/`0`/`1`).

API (`src/utils/sync.ts`) :

| Fonction | Rôle |
| --- | --- |
| `generateRecoveryCode()` | Génère un nouveau code. |
| `getRecoveryCode()` | Lit `localStorage["filmvault-recovery-code"]`. |
| `setRecoveryCode(code)` | Persiste localement. |
| `clearRecoveryCode()` | Supprime code + `filmvault-last-sync` + cache URL signées. |
| `activateCloud(code): Promise<string \| null>` | RPC `activate_cloud` : crée un profil lié à la session anon courante. |
| `linkRecoveryCode(code): Promise<string \| null>` | RPC `link_recovery_code` : rattache un code existant (restauration sur un nouvel appareil). |

Flow UI côté `SettingsScreen` :

1. « Activer la sync » → `generateRecoveryCode()` → `activateCloud(code)` → `setRecoveryCode(code)` → `pushToCloud(code, data)`.
2. « Restaurer avec un code » → `setRecoveryCode(code)` → `linkRecoveryCode(code)` → `syncData(code, data)`.

## RPCs Supabase utilisés

| Fonction PG | Appelant | Rôle |
| --- | --- | --- |
| `activate_cloud(p_recovery_code)` | `activateCloud` | Crée `user_profiles` + lie à `auth.uid()`. |
| `link_recovery_code(p_recovery_code)` | `linkRecoveryCode` | Lie un code existant à la session anon courante. |
| `upsert_user_data_v3(p_data, p_version, p_updated_at)` | `pushToCloud` | Upsert `AppData` sérialisé (photos déjà extraites vers Storage). |
| `get_user_data_v3()` | `pullFromCloud`, `syncData` | Retourne `{ data, version, updated_at }`. |
| `get_profile_id()` | `getProfileId` | Retourne l'UUID du profil (racine des chemins Storage). |
| `get_film_catalog()` | `refreshCatalogs` | Catalogue films serveur. |
| `get_camera_catalog()` | `refreshCatalogs` | Catalogue caméras serveur. |

Les migrations SQL vivent côté Supabase (dossier `supabase/` versionné) et sont poussées par le job `migrate` de `.github/workflows/deploy.yml` via `SUPABASE_DB_URL` en secret.

## Pipeline `updateData` → cloud

Lors de chaque mutation :

1. `setData` / `saveData` (localStorage)
2. `pushToCloud(code, newData)` en arrière-plan, **fire-and-forget** (`.catch(() => {})`)
3. Aucun feedback UI sur la réussite : la sync est transparente, `setLastSync()` trace l'horodatage en cas de succès.

## Stratégie de merge : `syncData`

Signature : `syncData(code, localData): Promise<{ data, source: "local" | "cloud" }>` (`src/utils/sync.ts:176`).

1. Appelle `get_user_data_v3`.
2. Si aucune ligne trouvée, tente `linkRecoveryCode(code)` (cas d'un utilisateur v2 non encore lié à auth) puis retry.
3. Si toujours rien → `pushToCloud(code, localData)` puis retourne `{ source: "local" }`.
4. Si ligne trouvée, compare `row.updated_at` (cloud) vs `getLastModified()` (local) :
   - **Cloud plus récent** : valide le payload (`validateAppData`), applique migrations si besoin, `setLastSync()`, retourne `{ source: "cloud" }`. Si le cloud contient encore des photos base64 héritées, relance `pushToCloud` en arrière-plan pour les migrer vers Storage.
   - **Local plus récent ou égal** : `pushToCloud(code, localData)`, retourne `{ source: "local" }`.
5. Toute exception → `{ source: "local" }` (l'app reste utilisable hors ligne).

Le champ `getLastModified()` est remis à jour à chaque `saveData` local ; `setLastSync()` à chaque `pushToCloud`/`syncData` réussi.

## Photos

Deux représentations coexistent pour `Camera.photo`, `Lens.photo`, `Back.photo`, `ShotNote.photo`, `HistoryEntry.photos[]` :

- **Data URL** (`data:image/jpeg;base64,…`) — stockage local, généré via `src/utils/image.ts` (`compressImage`).
- **Chemin Storage** (`{profileId}/…`) — après upload, référence le bucket Supabase.

### `src/utils/photo-sync.ts`

| Fonction | Rôle |
| --- | --- |
| `getProfileId(): Promise<string \| null>` | RPC `get_profile_id`, cache en mémoire. Utilisé comme racine des chemins Storage. |
| `resolvePhotoSrc(ref): string \| null` | Retourne les data URLs telles quelles ; pour les chemins Storage, renvoie une URL signée depuis le cache (TTL 50 min). |
| `isBase64Photo(ref)`, `isStoragePath(ref)` | Discriminateurs. |
| `extractAndUploadPhotos(data): Promise<AppData>` | Itère toutes les photos base64, les upload dans `storage.from("photos")`, remplace les références par des chemins. Appelé par `pushToCloud`. |
| `hasBase64Photos(data): boolean` | Permet à `syncData` de forcer une migration photo → Storage. |
| `clearUrlCache()` | Invalide les URLs signées (changement de profil). |

**Signed URLs** : un hook consommateur (ex. composant `PhotoImg`) appelle une fonction d'hydratation pour pré-charger les URLs signées manquantes. Les URLs sont valides 60 min côté Supabase ; le cache expire à 50 min pour une marge de sécurité.

## Catalogues (Supabase)

`src/utils/catalog.ts` fournit des catalogues films/caméras **en lecture** partagés entre utilisateurs :

- `refreshCatalogs()` : RPCs `get_film_catalog` + `get_camera_catalog`, merge incrémental avec horodatages serveur, cache en mémoire + localStorage.
- `getFilmCatalog()` / `getCameraCatalog()` : lecture synchrone avec fallback sur `FILM_CATALOG` hardcodé (`src/constants/film-catalog.ts`) si le cache est vide.

Utilisés par `useFilmSuggestions` (autocomplete `AddFilmDialog`) et les onglets d'équipement.

## Schéma table `user_data` (résumé)

Colonnes utiles (gérées côté Postgres, pas directement accédées depuis le client) :

| Colonne | Type | Usage |
| --- | --- | --- |
| `auth_uid` | UUID | `auth.uid()` de la session. Clé de lookup pour les RPCs v3. |
| `recovery_code` | TEXT | Clé de liaison multi-device. |
| `data` | JSONB | `AppData` sérialisé. |
| `version` | INTEGER | Version schéma au moment du push. |
| `updated_at` | TIMESTAMPTZ | Comparé à `getLastModified()`. |

Le client ne fait jamais de SELECT direct : tout passe par les RPCs déclarées ci-dessus.

## Points d'attention

- **Ne jamais awaiter `pushToCloud` dans un chemin UI critique** : fire-and-forget obligatoire pour ne pas bloquer le flux `updateData`.
- **Respecter l'ordre migration** : un `pullFromCloud` sur un `AppData` d'une version inférieure ré-applique les migrations — les migrations doivent donc rester pures et tolérantes aux données partiellement manquantes.
- **Ne pas stocker de PII** : le schéma est pensé pour des données de collection (films, appareils), pas pour de l'identifiant personnel.
- **Hors ligne** : `navigator.onLine` est testé avant chaque appel réseau. Le listener `online` relance `triggerSync`.
