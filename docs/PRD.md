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

- **Ajout d'une pellicule** : formulaire en **saisie libre** (pas de catalogue pré-rempli en V1). Champs :
  - Marque (texte libre, ex : Kodak, Fujifilm, Ilford…)
  - Modèle du film (texte libre, ex : Portra 400, HP5+, Velvia 50…)
  - Format : 35mm (135), moyen format (120), grand format (4x5, 8x10), instant (Polaroid, Instax)
  - Type : négatif couleur (C-41), négatif N&B, diapositive (E-6), ECN-2 (films cinéma : CineStill, Vision3…), instant
  - Sensibilité ISO native (numérique libre)
  - **Nombre de poses** : champ numérique libre (pas de liste prédéfinie). Le nombre varie selon le format et le contexte :
    - 120 : 4, 6, 8, 10, 12, 15, 16, 24 ou 32 poses selon l'appareil et le dos utilisé
    - 35mm : valeur indicative de la boîte (24, 36…) mais le nombre réel peut être supérieur de 0 à 4 poses si le chargement est bien fait. Les appareils demi-format doublent le nombre de poses (72+).
    - Grand format : 1 pose par feuille
    - Instant : 8 ou 10 selon le pack
  - Date de péremption
  - Quantité
  - Prix d'achat (optionnel)
  - Notes / commentaires
  - Image du film (optionnel) : photo de la boîte associée au modèle. En V2, un **système d'autocomplétion** basé sur un catalogue communautaire pourra accélérer la saisie (voir section 4.7), mais il n'est pas bloquant en V1.
- **Ajout par scan de code-barres** : pré-remplissage automatique des champs reconnus, avec possibilité d'éditer / compléter manuellement (fallback indispensable pour les pellicules sans boîte).
- **Vue du stock** : liste filtrable et triable par marque, format, type, ISO, date de péremption.
- **Alertes de péremption** : indicateur visuel sur les pellicules proches de la date d'expiration ou déjà périmées.
- **Édition et suppression** de pellicules du stock.

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

Chaque pellicule suit un cycle en 5 états :

```
[En stock] → [Chargée dans un appareil] → [Exposée / En attente de dév] → [Développée / Archivée]
                       ↓
              [Partiellement exposée]
              (retirée de l'appareil,
               stockée au frigo)
                       ↓
              Peut être re-chargée → [Chargée] → …
              Ou envoyée au dév  → [Exposée] → …
```

**Transitions et données associées :**

| Transition                      | Action utilisateur                       | Données saisies                                                                                          |
|---------------------------------|------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Stock → Chargée                 | « Charger dans un appareil »             | Appareil (+ dos le cas échéant), date de début, ISO de prise de vue (si push/pull), commentaire          |
| Chargée → Partiellement exposée | « Retirer de l'appareil (non terminée) » | Nombre de poses prises (saisie libre), commentaire. La pellicule retourne dans une zone dédiée du frigo. |
| Partiellement exposée → Chargée | « Re-charger dans un appareil »          | Appareil, date de reprise                                                                                |
| Partiellement exposée → Exposée | « Envoyer au développement »             | Date de fin, commentaire                                                                                 |
| Chargée → Exposée               | « Marquer comme terminée »               | Date de fin, commentaire                                                                                 |
| Exposée → Développée            | « Marquer comme développée »             | Labo utilisé (optionnel), date de développement, commentaire                                             |

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

- **Stock actuel** : nombre de pellicules par marque, par format, par type (N&B / couleur / diapo / instant).
- **Péremption** : liste des pellicules périmées et celles expirant dans les 3, 6, 12 prochains mois.
- **Consommation** : nombre de rolls shootés par mois et par an, avec graphique d'évolution.
- **Répartition** : camembert ou barres de la répartition N&B vs couleur vs diapo vs instant (sur les pellicules shootées).
- **Par appareil** : nombre de rolls passés dans chaque boîtier.
- **Pellicules favorites** : classement des films les plus utilisés.

### 4.5 Mode Hors-Ligne

- L'application doit fonctionner **sans connexion internet** pour les opérations courantes (consultation du stock, ajout, changement d'état).
- Synchronisation automatique lorsque la connexion est rétablie.

### 4.6 Photos & Notes par Pellicule

- Possibilité d'attacher une ou plusieurs photos à chaque pellicule (photo du contexte de shoot, des résultats…).
- Champ de notes libre à chaque étape du cycle de vie.

### 4.7 Catalogue de Films (V2 — Autocomplétion)

> **Repoussé en V2.** En V1, l'ajout de pellicules se fait entièrement en saisie libre (voir 4.1).

Le catalogue est prévu comme un **système d'autocomplétion** pour accélérer la saisie en V2 :

- **Base de données de modèles de films** : marque, nom, format, type, ISO native, image de la boîte. Quand l'utilisateur tape "Port…", le catalogue suggère "Kodak Portra 400 — 135 — C-41".
- **Contribution utilisateur** : lors de l'ajout d'un film inconnu du catalogue, l'utilisateur est invité à compléter la fiche. Ces fiches alimentent le catalogue pour les ajouts futurs.
- **Catalogue communautaire** : quand l'app sera ouverte à d'autres utilisateurs, le catalogue sera partagé.
- **Non bloquant** : l'autocomplétion est une aide, pas une obligation. L'utilisateur peut toujours saisir un film en texte libre sans passer par le catalogue.

-----

## 5. Exigences Techniques

| Élément          | V1 (usage perso)                                      | V2 (multi-utilisateurs)                                     |
|------------------|-------------------------------------------------------|-------------------------------------------------------------|
| Type d'app       | PWA (Progressive Web App)                             | idem                                                        |
| Plateformes      | iOS Safari + Android Chrome (responsive mobile-first) | idem                                                        |
| Persistance      | **localStorage** (aucune dépendance serveur)          | Migration vers **Supabase** (PostgreSQL + auth + storage)   |
| Hors-ligne       | Natif (localStorage = local par défaut)               | Service Worker + IndexedDB + sync Supabase                  |
| Authentification | Aucune (usage mono-utilisateur)                       | Email + mot de passe via Supabase Auth (OAuth Google/Apple) |
| Stockage photos  | localStorage (base64, limité)                         | Supabase Storage (1 Go tier gratuit)                        |
| Scan code-barres | API caméra du navigateur (QuaggaJS ou ZXing)          | idem                                                        |
| Hébergement      | À définir (Vercel, Netlify, Cloudflare Pages…)        | idem                                                        |

-----

## 6. Fonctionnalités Suggérées (Backlog / V2+)

Voici des fonctionnalités additionnelles à envisager pour les versions futures :

1. **Base de données de films partagée** : un catalogue communautaire des pellicules existantes (marque, ISO, format, process) pour accélérer la saisie — l'utilisateur cherche "Portra" et sélectionne au lieu de tout taper.
1. **Notifications de péremption** : push notifications X jours avant l'expiration d'une pellicule.
1. **Suivi des dépenses** : coût total du stock, dépense mensuelle/annuelle, prix moyen par roll, coût par format.
1. **Export des données** : CSV ou PDF pour backup ou partage.
1. **Lien vers les scans** : associer un lien ou des fichiers de scan à une pellicule développée, pour boucler le workflow.
1. **Suivi par pose (frame log)** : noter les infos par image (sujet, ouverture, vitesse, filtre…) — utile pour le grand format à terme.
1. **Wishlist** : liste de pellicules à acheter, avec alerte de prix ou de disponibilité.
1. **Historique d'un appareil** : timeline de toutes les pellicules passées dans un boîtier donné.
1. **Étiquettes / tags personnalisés** : taguer les pellicules par projet, voyage, thème…
1. **Mode sombre** : indispensable pour une app photo.
1. **Widget mobile** : aperçu rapide du stock ou de la pellicule en cours sans ouvrir l'app.
1. **Partage social** : partager ses stats ou une pellicule développée sur les réseaux.
1. **Import initial en masse** : import CSV pour saisir un stock de 100+ pellicules sans les entrer une par une.
1. **Rappel de chargement** : notification si une pellicule est dans l'état "chargée" depuis très longtemps (pellicule oubliée dans un appareil).
1. **Multi-langue** : français et anglais pour l'ouverture à la communauté.

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

- Le grand format est mentionné comme potentiel futur besoin. Les pellicules 4x5 ou 8x10 sont des **feuilles individuelles**, pas des rouleaux. → Le concept de "roll" ne s'applique pas. Prévoir une unité adaptée (feuille / sheet).

### 7.9 Stockage des photos

- Si chaque pellicule peut avoir plusieurs photos attachées, le stockage peut croître rapidement (100+ pellicules × N photos). → Compression côté client, limites de taille, et stratégie de stockage cloud à définir.

### 7.10 Scan code-barres sur navigateur

- La qualité du scan code-barres via le navigateur (WebRTC + caméra) est variable selon les appareils et navigateurs, surtout sur iOS Safari. → Tester la compatibilité et toujours proposer la saisie manuelle comme alternative fiable.

-----

## 8. Priorisation (MoSCoW)

### Must Have (V1)

- Ajout / édition / suppression de pellicules (manuel)
- Cycle de vie en 4 états avec transitions
- Gestion des appareils (dont dos interchangeables)
- Réglages par pellicule chargée (dates, ISO, commentaire)
- Tableau de bord statistiques de base
- PWA installable + mode hors-ligne
- Responsive mobile-first

### Should Have (V1 si possible)

- Scan code-barres
- Photos/notes par pellicule
- Alertes visuelles de péremption
- Filtres et tri avancés sur le stock

### Could Have (V2)

- Multi-utilisateurs avec comptes
- Notifications push de péremption
- Export CSV/PDF
- Import en masse
- Base de données de films partagée
- Tags / projets

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
1. **Budget stockage photos** : très limité en V1 (localStorage, photos en base64). Supabase Storage en V2.

### Encore ouvertes

1. Le **modèle économique** en V2 (gratuit, freemium, payant…) reste à définir.

-----

*Document rédigé le 28 mars 2026 — Mis à jour le 4 avril 2026 (retours prototypage) — Version 1.1*
