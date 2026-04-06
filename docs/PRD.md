# PRD — FilmVault : Gestionnaire de Pellicules Argentiques

## 1. Vision & Objectif

**FilmVault** est une application web mobile (PWA) permettant aux photographes argentiques de gérer l'intégralité du cycle de vie de leurs pellicules : du stock au frigo jusqu'à l'archivage après développement, en passant par le chargement dans un appareil et l'envoi au labo.

L'application offre un tableau de bord statistique détaillé pour comprendre ses habitudes de consommation, anticiper les péremptions et garder une trace précise de chaque pellicule.

-----

## 2. Contexte & Problème

### Situation actuelle

- Le suivi du stock se fait **de mémoire**, sans visibilité claire sur les quantités, formats ou dates de péremption.
- Les pellicules en cours et terminées sont suivies dans un **carnet papier**, ce qui limite la recherche, le tri et l'analyse.
- Aucune vue d'ensemble n'existe sur la consommation annuelle, les marques préférées ou le ratio N&B / couleur / diapo.

### Problèmes à résoudre

- **Pas de visibilité sur le stock** : impossible de savoir rapidement combien de Portra 400 en 120 il reste sans ouvrir le frigo.
- **Risque de péremption** : des pellicules expirent sans qu'on s'en rende compte.
- **Perte d'informations** : les réglages de prise de vue (ISO push/pull, dates, notes) sont dispersés ou oubliés.
- **Aucune statistique** : impossible de savoir combien de rolls ont été shootés dans l'année ou combien a été dépensé.

-----

## 3. Utilisateurs Cibles

### V1 — Usage personnel

Un photographe argentique passionné avec un stock conséquent (100+ pellicules), plusieurs boîtiers en parallèle (35mm, moyen format, instant), et le besoin de structurer son suivi.

### V2 — Multi-utilisateurs

Ouverture à d'autres photographes, chacun avec son propre compte, inventaire et appareils. Le modèle économique (gratuit, freemium…) sera défini ultérieurement.

-----

## 4. Périmètre Fonctionnel — V1

### 4.1 Gestion du Stock (Frigo)

- **Ajout d'une pellicule** : formulaire en **saisie libre avec autocomplétion** depuis un catalogue local intégré (~95 films). Le catalogue suggère marque et modèle, et pré-remplit automatiquement l'ISO, le type et le format. L'utilisateur peut ignorer les suggestions et saisir manuellement. Champs :
  - Marque (texte libre avec suggestions, ex : Kodak, Fujifilm, Ilford…)
  - Modèle du film (texte libre avec suggestions, ex : Portra 400, HP5+, Velvia 50…)
  - Format : 35mm (135), moyen format (120), instant (Polaroid, Instax)
  - Type : négatif couleur (C-41), négatif N&B, diapositive (E-6), ECN-2 (films cinéma : CineStill, Vision3…), instant
  - Sensibilité ISO native (numérique libre, auto-rempli depuis le catalogue si match)
  - **Nombre de poses** : champ numérique libre (pas de liste prédéfinie), avec valeurs par défaut selon le format (35mm → 36, 120 → 12, Instant → 10). Le nombre varie selon le format et le contexte :
    - 120 : 4, 6, 8, 10, 12, 15, 16, 24 ou 32 poses selon l'appareil et le dos utilisé
    - 35mm : valeur indicative de la boîte (24, 36…) mais le nombre réel peut être supérieur de 0 à 4 poses si le chargement est bien fait. Les appareils demi-format doublent le nombre de poses (72+).
    - Instant : 8 ou 10 selon le pack
  - Date de péremption (sélecteur mois/année)
  - Quantité (pour créer N pellicules identiques en une seule action)
  - Prix d'achat (optionnel)
  - Notes / commentaires
  - Image du film (optionnel) : photo de la boîte, compressée côté client (max 200 KB en JPEG) et stockée en base64 dans localStorage.
- **Vue du stock** : liste filtrable par état (tabs : toutes, stock, chargées, partielles, exposées, développées, scannées) avec recherche textuelle par nom.
- **Alertes de péremption** : indicateur visuel sur les pellicules déjà périmées (rouge) et celles expirant dans les 3 prochains mois (orange).
- **Édition et suppression** de pellicules du stock, avec confirmation avant suppression.

### 4.2 Gestion des Appareils

- **Création d'un appareil** avec :
  - Marque / modèle (ex : Canon A1, Hasselblad 503cx)
  - **Surnom / alias** (optionnel) : nom personnalisé pour identifier facilement un boîtier (ex : "Le petit noir", "A1 de papy"…)
  - **Numéro de série ou référence** (optionnel) : pour différencier deux boîtiers du même modèle (ex : deux Canon A1). Peut être le numéro de série gravé sur le boîtier ou toute référence personnelle.
  - Format accepté (35mm, 120, instant…)
  - **Dos interchangeables** : toggle oui/non, **indépendant du format**. Un Hasselblad 503cx (120) a des dos, mais un Yashica Mat 124G (120) n'en a pas. Un futur boîtier 35mm pourrait en avoir. La gestion des dos n'apparaît que lorsque ce toggle est activé.
  - Photo de l'appareil (optionnel)
- **Édition complète** : tous les champs d'un boîtier sont modifiables après création (nom, alias, format, toggle dos, photo). L'édition est accessible depuis la fiche détail de l'appareil.
- **Suppression** d'un appareil avec confirmation (alerte si une pellicule est chargée).
- **Affichage** : dans toute l'app, un appareil est affiché avec son **alias en priorité** s'il existe, suivi du modèle entre parenthèses (ex : "Le petit noir (Canon A1)"). Si pas d'alias, le modèle + référence sont affichés (ex : "Canon A1 — #1234").
- **Dos interchangeables** : pour les appareils dont le toggle est activé, possibilité de créer, modifier et supprimer des dos. Chaque dos dispose des champs suivants :
  - **Nom / modèle du dos** (ex : A12, A24, C12…)
  - **Surnom / alias** (optionnel, ex : "Dos couleur", "Dos N&B")
  - **Numéro de série ou référence** (optionnel, pour différencier deux dos identiques)
  - **Photo du dos** (optionnel)
  - Suppression individuelle d'un dos avec confirmation (alerte si pellicule chargée).
  - Un même boîtier peut donc avoir **plusieurs pellicules chargées simultanément**.
- **Vue des appareils** : liste de tous les boîtiers avec indicateur de la pellicule chargée (ou des pellicules, dans le cas de dos multiples).

### 4.3 Cycle de Vie d'une Pellicule

Chaque pellicule suit un cycle en 6 états :

```
[En stock] → [Chargée dans un appareil] → [Exposée / En attente de dév] → [Développée] → [Scannée]
                       ↓
              [Partiellement exposée]
              (retirée de l'appareil,
               stockée au frigo)
                       ↓
              Re-chargée → [Chargée] → …
```

**Transitions et données associées :**

| Transition                      | Action utilisateur                       | Données saisies                                                                                          |
|---------------------------------|------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Stock → Chargée                 | « Charger dans un appareil »             | Appareil (+ dos le cas échéant), date de début, ISO de prise de vue (si push/pull), commentaire          |
| Chargée → Partiellement exposée | « Retirer de l'appareil (non terminée) » | Nombre de poses prises (saisie libre), commentaire. La pellicule retourne dans une zone dédiée du frigo. |
| Partiellement exposée → Chargée | « Re-charger dans un appareil »          | Appareil, date de reprise                                                                                |
| Chargée → Exposée               | « Marquer comme terminée »               | Date de fin, commentaire                                                                                 |
| Exposée → Développée            | « Marquer comme développée »             | Labo utilisé (optionnel), date de développement, commentaire                                             |
| Développée → Scannée            | « Marquer comme scannée »                | Référence de scan (optionnel), commentaire                                                               |

**État "Partiellement exposée" — détails :**

- Concerne principalement les pellicules **35mm**, mais peut aussi s'appliquer à d'autres formats si besoin.
- La pellicule est physiquement retirée de l'appareil et replacée au frigo, dans un espace distinct du stock vierge.
- L'app affiche clairement le **nombre de poses prises** (ex : 18/36) et l'**ISO de prise de vue** pour ne pas oublier les réglages lors du rechargement. Le nombre total de poses est celui renseigné à l'ajout (champ libre, car le nombre réel peut dépasser l'indication de la boîte).
- Lors du rechargement, l'utilisateur doit avancer le film jusqu'à la pose suivante (l'app affiche un rappel avec le numéro de pose à atteindre).

**Données associées à une pellicule chargée / exposée :**

- Date de début de shoot
- Date de fin de shoot
- ISO réel de prise de vue (pour gérer le push/pull, ex : Portra 400 poussée à 800)
- Commentaire libre
- Photos / notes visuelles (optionnel)

### 4.4 Tableau de Bord & Statistiques

**Dashboard (écran d'accueil) :**

- **Stat cards** : nombre de pellicules en stock, chargées, exposées, développées.
- **Alertes péremption** : liste des pellicules périmées et de celles expirant dans les 3 prochains mois (filtré sur le stock uniquement), triées par date d'expiration.
- **Pellicules partielles** : indicateur si des pellicules sont dans l'état "partiellement exposée".
- **Films chargés** : liste des pellicules actuellement dans un appareil.

**Statistiques (écran dédié) :**

- **Consommation** : graphique en barres horizontales des rolls shootés par mois (12 derniers mois glissants), avec total annuel.
- **Répartition par type** : barres de la répartition couleur / N&B / diapo / ECN-2 / instant.
- **Répartition par marque** : barres des marques les plus utilisées.
- **Répartition par format** : barres 35mm / 120 / instant.
- **Par appareil** : nombre de rolls passés dans chaque boîtier.
- **Pellicules favorites** : classement des 5 films les plus utilisés.

### 4.5 Mode Hors-Ligne

- L'application fonctionne **sans connexion internet** pour toutes les opérations (consultation du stock, ajout, changement d'état).
- En V1, la persistance est 100% locale (localStorage), donc le mode hors-ligne est natif.

### 4.6 Photos & Notes par Pellicule

- Possibilité d'attacher une ou plusieurs photos à chaque pellicule (photo du contexte de shoot, des résultats…), avec compression côté client (max 200 KB par image en JPEG).
- Visionneuse plein écran avec navigation par swipe et clavier.
- Champ de notes libre à chaque étape du cycle de vie.
- Indicateur d'utilisation du stockage localStorage avec alerte au-delà de 80%.

### 4.7 Catalogue de Films (Autocomplétion)

Un **catalogue local de ~95 films courants** est intégré dans l'application, couvrant les marques principales : Kodak, Fujifilm, Ilford, Foma, Lomography, CineStill, Rollei, ORWO, Polaroid, Instax.

- **Autocomplétion** : lors de l'ajout d'une pellicule, le champ marque propose des suggestions depuis le catalogue + le stock existant de l'utilisateur. Le champ modèle filtre ensuite les modèles correspondant à la marque sélectionnée.
- **Pré-remplissage** : la sélection d'un film du catalogue remplit automatiquement l'ISO, le type et le format.
- **Non bloquant** : l'autocomplétion est une aide, pas une obligation. L'utilisateur peut toujours saisir un film en texte libre sans passer par le catalogue.
- **Extensible** : le catalogue peut être enrichi facilement via le fichier `constants/film-catalog.ts`.

> **V2** : un catalogue communautaire partagé entre utilisateurs est envisagé, avec contribution utilisateur lors de l'ajout d'un film inconnu du catalogue.

-----

## 5. Exigences Techniques

| Élément          | V1 (usage perso)                                                        | V2 (multi-utilisateurs)                                     |
|------------------|-------------------------------------------------------------------------|-------------------------------------------------------------|
| Type d'app       | PWA (Progressive Web App)                                               | idem                                                        |
| Plateformes      | iOS Safari + Android Chrome (responsive mobile-first)                   | idem                                                        |
| Framework        | React 19 + TypeScript 6 (strict) + Vite 8                              | idem                                                        |
| Styling          | Tailwind CSS 4 avec thème custom darkroom                               | idem                                                        |
| Persistance      | **localStorage** avec migrations versionnées (v1→v6)                    | Migration vers **Supabase** (PostgreSQL + auth + storage)   |
| Hors-ligne       | Natif (localStorage = local par défaut)                                 | Service Worker + IndexedDB + sync Supabase                  |
| Authentification | Aucune (usage mono-utilisateur)                                         | Email + mot de passe via Supabase Auth (OAuth Google/Apple) |
| Stockage photos  | localStorage (base64, compression client max 200 KB JPEG)               | Supabase Storage (1 Go tier gratuit)                        |
| Scan code-barres | Non implémenté en V1                                                    | API caméra du navigateur (QuaggaJS ou ZXing)                |
| Hébergement      | **GitHub Pages** (CI/CD via GitHub Actions)                             | idem ou migration Vercel/Cloudflare                         |
| Navigation       | Bottom tab bar (mobile) + sidebar (desktop, > 768px)                    | idem                                                        |

-----

## 6. Fonctionnalités Suggérées (Backlog / V2+)

Voici des fonctionnalités additionnelles à envisager pour les versions futures :

1. **Catalogue communautaire** : un catalogue partagé entre utilisateurs, enrichi par contributions. En V1, un catalogue local de ~95 films est déjà intégré.
1. **Notifications de péremption** : push notifications X jours avant l'expiration d'une pellicule.
1. **Suivi des dépenses** : coût total du stock, dépense mensuelle/annuelle, prix moyen par roll, coût par format.
1. **Export CSV/PDF** : export des données en CSV ou PDF pour backup ou partage. L'export JSON est disponible en V1.
1. **Lien vers les scans** : associer un lien ou des fichiers de scan à une pellicule développée, pour boucler le workflow.
1. **Suivi par pose (frame log)** : noter les infos par image (sujet, ouverture, vitesse, filtre…) — utile pour le grand format à terme.
1. **Wishlist** : liste de pellicules à acheter, avec alerte de prix ou de disponibilité.
1. **Historique d'un appareil** : timeline de toutes les pellicules passées dans un boîtier donné.
1. **Étiquettes / tags personnalisés** : taguer les pellicules par projet, voyage, thème…
1. ~~**Mode sombre**~~ : **fait en V1** — le thème "chambre noire" (darkroom) est le thème par défaut de l'application.
1. **Widget mobile** : aperçu rapide du stock ou de la pellicule en cours sans ouvrir l'app.
1. **Partage social** : partager ses stats ou une pellicule développée sur les réseaux.
1. **Import en masse CSV** : import CSV pour saisir un stock de 100+ pellicules sans les entrer une par une. L'import JSON est disponible en V1.
1. **Rappel de chargement** : notification si une pellicule est dans l'état "chargée" depuis très longtemps (pellicule oubliée dans un appareil).
1. **Multi-langue** : français et anglais pour l'ouverture à la communauté.
1. **Scan code-barres** : pré-remplissage automatique des champs par scan du code-barres de la boîte (QuaggaJS ou ZXing). Fallback saisie manuelle indispensable.
1. **Filtres et tri avancés** : bottom-sheet de filtres (marque, format, type, plage ISO) + tri configurable (nom, date, expiration, prix, ISO) sur la vue stock.
1. **Alertes péremption granulaires** : 4 niveaux d'alerte (expiré, < 3 mois, < 6 mois, < 12 mois) avec couleurs différenciées + graphique péremption dans les stats.
1. **Support grand format** : formats 4x5, 8x10 (feuilles individuelles au lieu de rouleaux).

-----

## 7. Cas Limites & Points d'Attention

### 7.1 Données incomplètes

- **Pellicules sans boîte / périmées** : l'utilisateur possède des pellicules sans emballage, donc sans date de péremption, sans code-barres, parfois sans certitude sur l'ISO ou le type exact. → Tous les champs doivent être optionnels sauf le nom du film, et un état "périmée/inconnue" doit être gérable.
- **Pellicules en vrac** : des lots achetés d'occasion sans info complète. Prévoir un mode de saisie minimaliste.

### 7.2 Appareils à dos interchangeables

- **Clarification** : les dos interchangeables ne sont pas liés au format mais au boîtier. Un appareil moyen format peut ne pas avoir de dos (Yashica Mat 124G), et un futur boîtier 35mm pourrait en avoir. La gestion se fait via un **toggle oui/non par boîtier**.
- Le Hasselblad 503cx (et autres) peut avoir **0, 1, 2 ou plusieurs pellicules chargées en même temps** dans des dos différents. → Le modèle de données lie la pellicule au **dos**, pas directement au boîtier.
- Les dos sont des sous-éléments fixes d'un boîtier (pas transférables entre boîtiers en V1).

### 7.3 Push / Pull et ISO

- Une Portra 400 peut être shootée à ISO 200 (pull) ou 800 (push). L'ISO de prise de vue ≠ l'ISO native. → Deux champs distincts : ISO native (propriété du film) et ISO de prise de vue (propriété de la session de shoot).
- Certains photographes changent d'ISO en cours de pellicule (rare mais possible). → Le champ ISO de prise de vue accepte-t-il plusieurs valeurs ou reste-t-il unique par session ?

### 7.4 Gestion des quantités

- L'utilisateur peut acheter un pack de 5 Portra 400. → Doit-on créer 5 entrées individuelles (pour suivre chacune indépendamment dans le cycle de vie) ou une seule entrée avec quantité = 5 qui se décrémente ? **Recommandation** : entrées individuelles pour le suivi du cycle de vie, mais avec un mode "ajout en lot" pour créer N pellicules identiques en une seule action.

### 7.5 Pellicules partiellement exposées

- **Traité dans la section 4.3** : un état "Partiellement exposée" a été ajouté au cycle de vie, limité au 35mm. La pellicule est retirée de l'appareil, replacée au frigo avec le nombre de poses prises, et peut être rechargée ultérieurement ou envoyée au développement.
- **Point d'attention restant** : lors du rechargement, le photographe doit avancer manuellement le film pour ne pas superposer les poses. L'app doit afficher un rappel clair du numéro de pose à atteindre.

### 7.6 Conflit hors-ligne

- Si l'app est utilisée sur plusieurs appareils (téléphone + tablette + desktop), des conflits de synchronisation peuvent survenir. → Stratégie de résolution (last-write-wins, merge, alerte utilisateur).

### 7.7 Migration du carnet existant

- L'utilisateur a un historique dans un carnet papier. → Prévoir un moyen d'importer ou saisir rapidement des pellicules déjà exposées/développées avec leurs dates, sans passer par tout le cycle de vie.

### 7.8 Pellicules au format inhabituel

- Le grand format (4x5, 8x10) n'est pas supporté en V1. Les pellicules grand format sont des **feuilles individuelles**, pas des rouleaux. → Le concept de "roll" ne s'applique pas. Prévoir une unité adaptée (feuille / sheet) en V2.

### 7.9 Stockage des photos

- Les photos sont compressées côté client à max 200 KB en JPEG avant stockage en base64 dans localStorage. Un indicateur d'utilisation du stockage est affiché, avec alerte au-delà de 80% de la limite localStorage (~5 Mo).

### 7.10 Scan code-barres sur navigateur

- Non implémenté en V1. La qualité du scan code-barres via le navigateur (WebRTC + caméra) est variable selon les appareils et navigateurs, surtout sur iOS Safari. → Tester la compatibilité et toujours proposer la saisie manuelle comme alternative fiable.

-----

## 8. Priorisation (MoSCoW)

### Must Have (V1) — tous implémentés

- Ajout / édition / suppression de pellicules (manuel + autocomplétion catalogue local)
- Cycle de vie en **6 états** avec transitions (stock → loaded → partial → exposed → developed → scanned)
- Gestion des appareils (dont dos interchangeables avec surnom, série, photo)
- Réglages par pellicule chargée (dates, ISO push/pull, commentaire)
- Tableau de bord avec stat cards + alertes péremption
- Statistiques : consommation mensuelle, répartition type/marque/format, top films, stats par appareil
- Photos/notes par pellicule (compression 200 KB, visionneuse plein écran)
- Import/Export JSON
- PWA installable + mode hors-ligne
- Responsive mobile-first (tab bar mobile + sidebar desktop)
- Thème darkroom (mode sombre)
- Confirmation avant suppression (pellicule et appareil)

### Should Have (V1 si possible)

- ~~Scan code-barres~~ → déplacé en Could Have (V2)
- ~~Photos/notes par pellicule~~ → **implémenté** (voir Must Have)
- Alertes visuelles de péremption : **partiellement implémenté** (expiré + < 3 mois). Niveaux 6 mois et 12 mois restent à faire.
- Filtres et tri avancés sur le stock : **partiellement implémenté** (tabs par état + recherche texte). Filtres avancés (marque, format, type, ISO) + tri configurable restent à faire.

### Could Have (V2)

- Multi-utilisateurs avec comptes
- Notifications push de péremption
- Export CSV/PDF (export JSON disponible en V1)
- Import en masse CSV (import JSON disponible en V1)
- Catalogue communautaire partagé (catalogue local disponible en V1)
- Tags / projets
- Scan code-barres
- Alertes péremption granulaires (4 niveaux)
- Filtres et tri avancés (bottom-sheet)
- Support grand format (4x5, 8x10)

### Won't Have (pour l'instant)

- Suivi par pose
- Marketplace / achat-vente
- Intégration labo (envoi automatique)
- Réseau social intégré

-----

## 9. Métriques de Succès

- **Adoption** : l'intégralité du stock est saisie dans l'app dans le premier mois.
- **Usage quotidien** : l'app remplace le carnet — chaque pellicule chargée ou terminée est mise à jour dans l'app.
- **Réduction des pertes** : zéro pellicule expirée par oubli après 6 mois d'utilisation.
- **Satisfaction** : quand l'app sera ouverte aux autres, objectif de rétention à 30 jours > 60%.

-----

## 10. Questions Ouvertes

### Résolues

1. **Dos interchangeables** : modélisés comme des **sous-éléments fixes** d'un appareil (pas transférables entre boîtiers). Toggle oui/non par boîtier, indépendant du format.
1. **Conflits de sync hors-ligne** : non applicable en V1 (localStorage, mono-utilisateur). À définir en V2 avec Supabase.
1. **Backend V1** : **localStorage** retenu pour la V1 (zéro dépendance serveur). Migration vers **Supabase** prévue en V2 pour le multi-utilisateurs.
1. **Budget stockage photos** : compression côté client à 200 KB max en JPEG, stockées en base64 dans localStorage. Indicateur d'utilisation du stockage intégré. Supabase Storage en V2.
1. **Hébergement V1** : **GitHub Pages** retenu, déploiement automatisé via GitHub Actions (`.github/workflows/deploy.yml`).
1. **Autocomplétion V1** : un catalogue local de ~95 films courants est intégré dès la V1. Le catalogue communautaire/partagé reste prévu pour V2.
1. **Cycle de vie** : 6 états retenus (stock, loaded, partial, exposed, developed, scanned) au lieu des 5 initialement prévus — l'état "scanned" a été ajouté pour marquer les pellicules numérisées.

### Encore ouvertes

1. Le **modèle économique** en V2 (gratuit, freemium, payant…) reste à définir.

-----

*Document rédigé le 28 mars 2026 — Mis à jour le 5 avril 2026 (mise à jour post-implémentation V1) — Version 1.2*
