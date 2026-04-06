# FilmVault — Guide Utilisateur

> Ce document décrit le fonctionnement de l'application FilmVault, écran par écran.
> Il sert de base pour une page "Comment ça marche" ou un centre d'aide.

---

## Table des matières

1. [Installation](#1-installation)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Gestion du stock](#3-gestion-du-stock)
4. [Ajouter une pellicule](#4-ajouter-une-pellicule)
5. [Cycle de vie d'une pellicule](#5-cycle-de-vie-dune-pellicule)
6. [Fiche détail d'une pellicule](#6-fiche-détail-dune-pellicule)
7. [Notes de prise de vue](#7-notes-de-prise-de-vue)
8. [Gestion des appareils](#8-gestion-des-appareils)
9. [Dos interchangeables](#9-dos-interchangeables)
10. [Statistiques](#10-statistiques)
11. [Paramètres](#11-paramètres)
12. [Import et export de données](#12-import-et-export-de-données)
13. [Sauvegarde cloud](#13-sauvegarde-cloud)

---

## 1. Installation

FilmVault est une **Progressive Web App (PWA)**. Aucun téléchargement depuis un store n'est nécessaire.

### Sur Android (Chrome)

1. Ouvrez FilmVault dans Chrome.
2. Un bandeau "Installer FilmVault" apparaît automatiquement. Appuyez dessus.
3. Sinon : menu ⋮ → "Ajouter à l'écran d'accueil".
4. L'app s'ouvre désormais en plein écran comme une app native.

### Sur iOS (Safari)

1. Ouvrez FilmVault dans Safari (obligatoire — ne fonctionne pas depuis Chrome iOS).
2. Appuyez sur le bouton **Partager** (carré avec flèche vers le haut).
3. Choisissez **"Sur l'écran d'accueil"**.
4. Confirmez en appuyant sur **"Ajouter"**.

### Sur desktop

Ouvrez l'app dans Chrome ou Edge. Un bouton d'installation apparaît dans la barre d'adresse.

> **Hors connexion** : une fois installée, l'app fonctionne intégralement sans internet. Vos données sont stockées localement.

---

## 2. Tableau de bord

L'écran d'accueil affiche un résumé de votre activité :

### Cartes de statistiques

Quatre cartes en haut de l'écran indiquent :

- **En stock** — Nombre de pellicules prêtes à être utilisées
- **Chargées** — Nombre de pellicules actuellement dans un appareil
- **Exposées** — Nombre de pellicules terminées, en attente de développement
- **Développées** — Nombre de pellicules développées

### Alertes de péremption

Si des pellicules de votre stock approchent de leur date d'expiration (dans les 3 mois) ou sont déjà périmées, une section d'alerte les liste avec un code couleur :

- **Rouge** — Pellicule périmée
- **Orange** — Pellicule expirant dans les 3 prochains mois

### Pellicules partielles

Un indicateur apparaît si des pellicules 35mm sont dans l'état "partiellement exposée" (retirées d'un appareil en cours de route).

### Films chargés

La liste des pellicules actuellement dans un appareil, avec le nom du film, l'appareil et l'ISO de prise de vue.

---

## 3. Gestion du stock

L'écran **Stock** affiche toutes vos pellicules, quelle que soit leur étape dans le cycle de vie.

### Filtrage par état

Des onglets permettent de filtrer :

| Onglet | Contenu |
|---|---|
| **Toutes** | L'intégralité de vos pellicules |
| **Stock** | Pellicules non utilisées, dans le frigo |
| **Chargées** | Pellicules actuellement dans un appareil |
| **Partielles** | Pellicules retirées en cours de route |
| **Exposées** | Pellicules terminées, en attente de développement |
| **Développées** | Pellicules sorties du labo |
| **Scannées** | Pellicules numérisées |

### Recherche

Le champ de recherche filtre par nom de pellicule (marque + modèle + ISO). La recherche est insensible à la casse.

### Ajouter une pellicule

Le bouton **+** en bas de l'écran ouvre le formulaire d'ajout.

---

## 4. Ajouter une pellicule

### Autocomplétion

En saisissant la **marque**, des suggestions apparaissent depuis :

- Le catalogue intégré (~95 films référencés)
- Les pellicules que vous avez déjà ajoutées

En sélectionnant ensuite le **modèle**, les champs ISO, type et format sont pré-remplis automatiquement. Vous pouvez toujours modifier ces valeurs ou saisir un film en texte libre.

### Champs du formulaire

| Champ | Description | Obligatoire |
|---|---|---|
| **Marque** | Fabricant (Kodak, Ilford, Fujifilm…) | Non |
| **Modèle** | Nom du film (Portra 400, HP5+…) | Non |
| **Format** | 35mm, 120 ou Instant | Oui |
| **Type** | Couleur, N&B, Diapo, ECN-2, Instant | Oui |
| **ISO** | Sensibilité native (ex : 400) | Non |
| **Nombre de poses** | Par défaut : 36 (35mm), 12 (120), 10 (instant) — modifiable | Non |
| **Date de péremption** | Mois / Année | Non |
| **Quantité** | Nombre d'exemplaires à créer (défaut : 1) | Non |
| **Prix** | Prix d'achat unitaire | Non |
| **Notes** | Commentaire libre | Non |
| **Photo** | Photo de la boîte | Non |

> **Ajout en lot** : si vous entrez une quantité de 5, l'app crée 5 pellicules individuelles identiques. Chacune suivra ensuite son propre cycle de vie indépendamment.

---

## 5. Cycle de vie d'une pellicule

Chaque pellicule suit un parcours en **6 états** :

```
En stock ──→ Chargée ──→ Exposée ──→ Développée ──→ Scannée
                │
                ▼
           Partielle
           (retirée du boîtier)
                │
                └──→ Rechargée dans un appareil ──→ Chargée ──→ …
```

### Transitions détaillées

#### En stock → Chargée

Action : **"Charger dans un appareil"**

Informations demandées :
- Appareil (et dos, si applicable) — seuls les appareils du même format sont proposés
- Date de début de prise de vue
- ISO de prise de vue — pré-rempli avec l'ISO native, modifiable si push/pull (ex : Portra 400 shootée à 800)
- Commentaire (optionnel)
- Photos (optionnel, jusqu'à 3)

#### Chargée → Exposée

Action : **"Marquer comme terminée"**

La pellicule est entièrement exposée. Informations :
- Date de fin
- Commentaire

#### Chargée → Partielle

Action : **"Retirer de l'appareil (non terminée)"**

Spécifique au 35mm principalement. La pellicule est retirée avant d'avoir été entièrement exposée. Informations :
- Nombre de poses prises (ex : 18 sur 36)
- Commentaire

L'app conserve l'ISO de prise de vue et le nombre de poses pour le rechargement futur.

#### Partielle → Chargée (rechargement)

Action : **"Recharger dans un appareil"**

L'app affiche un rappel du numéro de pose à atteindre avant de recommencer à photographier. Informations :
- Appareil (et dos)
- Date de reprise

#### Exposée → Développée

Action : **"Marquer comme développée"**

Informations :
- Nom du labo (optionnel)
- Date de développement
- Commentaire

#### Développée → Scannée

Action : **"Marquer comme scannée"**

Informations :
- Référence de scan (optionnel)
- Commentaire

### Historique

Chaque transition est enregistrée avec une date et les détails associés. L'historique complet est affiché sous forme de **timeline visuelle** sur la fiche détail de la pellicule, avec icônes, dates et photos associées.

---

## 6. Fiche détail d'une pellicule

La fiche détail affiche toutes les informations d'une pellicule :

### Informations générales

- Nom complet (marque + modèle)
- Format, type, ISO native
- Date de péremption (avec indicateur si périmée ou bientôt périmée)
- État actuel avec badge coloré

### Informations de prise de vue (si chargée ou au-delà)

- Appareil et dos utilisé
- ISO de prise de vue
- Dates de début et fin
- Nombre de poses prises / total

### Informations post-production (si développée ou scannée)

- Nom du labo
- Date de développement
- Référence de scan

### Actions disponibles

Les boutons d'action changent selon l'état actuel :

| État | Actions possibles |
|---|---|
| En stock | Charger dans un appareil, Modifier, Dupliquer, Supprimer |
| Chargée | Marquer terminée, Retirer (partielle), Modifier, Dupliquer, Supprimer |
| Partielle | Recharger dans un appareil, Modifier, Dupliquer, Supprimer |
| Exposée | Marquer développée, Modifier, Dupliquer, Supprimer |
| Développée | Marquer scannée, Modifier, Dupliquer, Supprimer |
| Scannée | Modifier, Dupliquer, Supprimer |

> **Dupliquer** : crée une copie de la pellicule dans l'état "en stock", utile pour ajouter rapidement le même film.

### Timeline

L'historique complet est affiché chronologiquement avec :
- Icône spécifique à chaque action
- Date et heure
- Détails de la transition (appareil, labo…)
- Photos associées (cliquables pour agrandir)

---

## 7. Notes de prise de vue

Pour les pellicules chargées ou au-delà, vous pouvez enregistrer des notes par pose (frame).

### Champs par note

| Champ | Description |
|---|---|
| **N° de vue** | Numéro de la pose sur la pellicule |
| **Ouverture** | Ex : f/2.8 |
| **Vitesse** | Ex : 1/125 |
| **Objectif** | Ex : 50mm f/1.4 |
| **Lieu** | Lieu de la prise de vue |
| **Date** | Date de la prise de vue |
| **Photo** | Photo de contexte |
| **Notes** | Commentaire libre |

Les notes sont triées par numéro de vue et affichées sur la fiche détail de la pellicule.

> **Cas d'usage** : notez les réglages de chaque photo pendant le shoot, puis comparez avec les scans reçus pour progresser.

---

## 8. Gestion des appareils

L'écran **Appareils** liste tous vos boîtiers.

### Créer un appareil

| Champ | Description | Obligatoire |
|---|---|---|
| **Marque** | Fabricant (Canon, Hasselblad, Nikon…) | Oui |
| **Modèle** | Nom du boîtier (A1, 503cx, FM2…) | Oui |
| **Surnom** | Alias personnel (ex : "Le petit noir") | Non |
| **N° de série** | Pour différencier deux boîtiers identiques | Non |
| **Format** | 35mm, 120 ou Instant | Oui |
| **Dos interchangeables** | Activer si le boîtier accepte des dos (ex : Hasselblad) | Non |
| **Photo** | Photo du boîtier | Non |

### Affichage

Un appareil s'affiche avec :
- Son **surnom** en priorité s'il existe, suivi du modèle entre parenthèses — ex : *Le petit noir (Canon A1)*
- Sinon : marque + modèle — ex : *Canon A1*
- Un badge indiquant le nombre de pellicules actuellement chargées
- Un badge pour les dos interchangeables

### Compatibilité format

Lors du chargement d'une pellicule, seuls les appareils du même format sont proposés. Vous ne pouvez pas charger une pellicule 120 dans un appareil 35mm.

---

## 9. Dos interchangeables

Pour les appareils à dos interchangeables (Hasselblad, Mamiya RB67, Bronica…), vous pouvez gérer plusieurs dos par boîtier.

### Créer un dos

| Champ | Description |
|---|---|
| **Nom / Modèle** | Ex : A12, A24, C12 |
| **Surnom** | Ex : "Dos couleur", "Dos N&B" |
| **N° de série** | Pour différencier deux dos identiques |
| **Photo** | Photo du dos |

### Fonctionnement

- Chaque dos peut contenir **une pellicule indépendante**.
- Un Hasselblad avec 3 dos peut donc avoir 3 pellicules chargées simultanément (une couleur, une N&B, une diapo par exemple).
- Lors du chargement d'une pellicule, l'app demande dans **quel dos** la charger.
- La fiche de chaque dos indique quelle pellicule y est actuellement chargée.

> **Note** : les dos sont liés à un boîtier. Ils ne peuvent pas être transférés entre appareils.

---

## 10. Statistiques

L'écran **Stats** offre une vue analytique de votre pratique argentique.

### Cartes résumé

- **Total** — Nombre total de pellicules dans l'app
- **Shootées** — Pellicules qui ont été utilisées (chargées, partielles, exposées, développées, scannées)
- **Développées** — Pellicules qui ont été développées

### Graphiques

#### Consommation mensuelle

Graphique en barres horizontales montrant le nombre de pellicules shootées par mois sur les **12 derniers mois glissants**, avec le total annuel.

#### Répartition par type

Distribution entre Couleur (C-41), N&B, Diapositive (E-6), ECN-2 (cinéma) et Instant.

#### Répartition par marque

Nombre de pellicules utilisées par fabricant (Kodak, Fujifilm, Ilford…).

#### Répartition par format

Distribution entre 35mm, 120 et Instant.

#### Par appareil

Nombre de pellicules passées dans chaque boîtier.

#### Pellicules favorites

Classement des **5 films les plus utilisés** (marque + modèle), avec le nombre d'utilisations.

> **Périmètre** : les statistiques ne comptent que les pellicules qui ont été shootées (pas le stock vierge).

---

## 11. Paramètres

### Langue

Basculez entre **français** (par défaut) et **anglais**. Le changement s'applique immédiatement à toute l'interface.

### Thème

- **Sombre** (par défaut) — Interface "chambre noire" avec tons sombres et accents chauds
- **Clair** — Interface claire

### Informations base de données

- Version du schéma de données
- Nombre de pellicules
- Nombre d'appareils

---

## 12. Import et export de données

### Exporter

1. Allez dans **Paramètres**.
2. Appuyez sur **"Exporter les données"**.
3. Un fichier JSON est téléchargé, nommé avec la date du jour (ex : `filmvault-2026-04-06.json`).

Ce fichier contient l'intégralité de vos données : pellicules, appareils, historiques, notes et photos.

### Importer

1. Allez dans **Paramètres**.
2. Appuyez sur **"Importer des données"**.
3. Sélectionnez un fichier JSON précédemment exporté.
4. Un aperçu s'affiche montrant les données actuelles vs. les données importées.
5. Confirmez l'import.

> **Attention** : l'import **remplace** toutes vos données actuelles. Pensez à exporter d'abord si vous souhaitez conserver vos données existantes.

> L'import gère automatiquement les fichiers provenant de versions antérieures du schéma de données grâce au système de migrations intégré.

---

## 13. Sauvegarde cloud

FilmVault propose une sauvegarde cloud optionnelle pour sécuriser vos données.

### Activation

1. Allez dans **Paramètres**.
2. Activez la **sauvegarde cloud**.
3. Un **code de récupération** est généré — conservez-le précieusement.

### Fonctionnement

- La synchronisation est **automatique** au lancement de l'app (si connecté à internet).
- Un bouton permet de **forcer une synchronisation manuelle**.
- La date de dernière synchronisation est affichée.
- En cas de conflit, la version la plus récente est conservée.

### Restauration

Si vous changez d'appareil ou réinstallez l'app :

1. Ouvrez FilmVault sur le nouvel appareil.
2. Allez dans **Paramètres**.
3. Utilisez votre **code de récupération** pour restaurer vos données.

### Déconnexion

Vous pouvez à tout moment désactiver la sauvegarde cloud depuis les paramètres. Vos données locales ne sont pas supprimées.

---

## Codes couleur des états

| État | Couleur | Icône |
|---|---|---|
| En stock | Bleu | Flocon de neige |
| Chargée | Vert | Appareil photo |
| Partielle | Ambre | Horloge |
| Exposée | Accent (rouge/rose) | Oeil |
| Développée | Gris | Archive |
| Scannée | Orange | Scanner |

---

## Types de pellicules supportés

| Type | Procédé | Exemples |
|---|---|---|
| **Couleur** | C-41 | Portra 400, Gold 200, Superia 400 |
| **N&B** | Divers | Tri-X 400, HP5+, FP4+, Fomapan |
| **Diapositive** | E-6 | Velvia 50, Provia 100F, Ektachrome |
| **ECN-2** | Cinéma | CineStill 800T, CineStill 50D, Vision3 |
| **Instant** | Intégral | Instax Mini, Instax Wide, Polaroid 600 |

---

## Formats supportés

| Format | Poses par défaut | Particularités |
|---|---|---|
| **35mm** | 36 | Supports partiels, demi-format possible |
| **120** | 12 | Varie selon le dos : 4, 6, 8, 10, 12, 15, 16, 24 ou 32 poses |
| **Instant** | 10 | 8 ou 10 selon le pack |

---

*Document généré le 6 avril 2026.*
