# FilmVault — Contenu Landing Page

> Ce document rassemble le contenu textuel et la structure pour la landing page de FilmVault.
> Il est destiné à être utilisé comme base pour l'intégration web.

---

## Hero Section

### Titre

**Gérez vos pellicules argentiques, du frigo au scan.**

### Sous-titre

FilmVault est l'app gratuite qui remplace votre carnet papier. Suivez votre stock, vos appareils et le cycle de vie complet de chaque pellicule — même hors connexion.

### CTA

Ouvrir FilmVault (lien vers l'app PWA)

---

## Problème / Accroche

### Titre de section

Vous perdez le fil de vos pellicules ?

### Points de douleur

- **Stock invisible** — Impossible de savoir combien de Portra 400 en 120 il reste sans ouvrir le frigo.
- **Péremptions oubliées** — Des pellicules expirent au fond d'un tiroir sans qu'on s'en rende compte.
- **Infos dispersées** — Les réglages de push/pull, les dates de shoot et les notes de prise de vue sont éparpillés dans un carnet, une app de notes, ou simplement oubliés.
- **Aucune vue d'ensemble** — Combien de rolls cette année ? Quel ratio couleur/N&B ? Quel est votre film préféré ? Mystère.

---

## Fonctionnalités Clés

### 1. Inventaire complet de votre stock

Ajoutez vos pellicules en quelques secondes grâce à l'autocomplétion depuis un catalogue de **95+ films** (Kodak, Fujifilm, Ilford, CineStill, Lomography, Foma, Rollei, ORWO…). L'ISO, le type et le format se remplissent automatiquement. Gérez les formats 35mm, 120 et instant.

### 2. Cycle de vie en 6 étapes

Suivez chaque pellicule de l'achat à la numérisation :

| Étape | Description |
|---|---|
| **En stock** | Dans le frigo, prête à être utilisée |
| **Chargée** | Dans un appareil, en cours de prise de vue |
| **Partielle** | Retirée en cours de route (35mm), en attente de rechargement |
| **Exposée** | Terminée, en attente de développement |
| **Développée** | Sortie du labo |
| **Scannée** | Numérisée, cycle complet |

Chaque transition est enregistrée avec date, appareil, ISO de prise de vue et commentaire. L'historique complet est affiché sous forme de timeline visuelle.

### 3. Gestion des appareils et dos interchangeables

Enregistrez tous vos boîtiers avec marque, modèle, surnom et photo. Pour les appareils à dos interchangeables (Hasselblad, Mamiya RB67…), gérez plusieurs dos et chargez une pellicule différente dans chacun.

### 4. Alertes de péremption

Ne laissez plus une pellicule expirer par oubli. FilmVault affiche clairement les films périmés et ceux qui arrivent à expiration dans les 3 prochains mois, directement sur le tableau de bord.

### 5. Statistiques détaillées

Visualisez vos habitudes de photographe argentique :

- Consommation mensuelle sur 12 mois glissants
- Répartition par type (couleur, N&B, diapo, ECN-2, instant)
- Répartition par marque et par format
- Utilisation par appareil
- Top 5 de vos pellicules préférées

### 6. Notes de prise de vue

Associez des notes par pose : numéro de vue, ouverture, vitesse, objectif, lieu et photo de contexte. Idéal pour analyser vos résultats une fois les scans reçus.

### 7. Fonctionne hors connexion

FilmVault est une PWA installable sur votre téléphone. Toutes vos données sont stockées localement — pas besoin d'internet pour consulter votre stock ou enregistrer un changement d'état. Sauvegarde cloud optionnelle disponible.

---

## Section "Comment ça marche"

### 3 étapes

1. **Ajoutez vos pellicules** — Saisissez votre stock ou scannez depuis le catalogue intégré. Créez plusieurs exemplaires en une seule action.
2. **Suivez le cycle de vie** — Chargez une pellicule dans un appareil, marquez-la comme exposée, puis développée et scannée. Chaque étape est tracée.
3. **Consultez vos stats** — Visualisez votre consommation, vos marques préférées et l'utilisation de vos appareils.

---

## Caractéristiques Techniques (pour les curieux)

| Caractéristique | Détail |
|---|---|
| **Type d'app** | PWA — installable, pas besoin de store |
| **Hors connexion** | 100% fonctionnel sans internet |
| **Données** | Stockées localement sur votre appareil |
| **Sauvegarde** | Export JSON + backup cloud optionnel |
| **Import** | Importez vos données depuis un fichier JSON |
| **Thème** | Interface "chambre noire" (sombre par défaut), thème clair disponible |
| **Langues** | Français et anglais |
| **Prix** | Gratuit |
| **Code source** | Open source sur GitHub |
| **Appareils** | Mobile (iOS/Android) et desktop |

---

## Section "Pour qui ?"

### Photographes argentiques qui veulent :

- **Un suivi structuré** de leur stock sans tableur ni carnet papier
- **Ne plus oublier** une pellicule périmée au fond du frigo
- **Garder une trace** de chaque prise de vue : quel appareil, quel ISO, quelles notes
- **Comprendre leurs habitudes** : combien de rolls par mois, quel film revient le plus souvent
- **Un outil offline** qui marche sur le terrain, sans dépendre d'une connexion

---

## Section "Catalogue intégré"

### 95+ films référencés

Kodak (Portra, Gold, Tri-X, T-Max, Ektar, Vision3…), Fujifilm (Superia, Velvia, Provia, Acros…), Ilford (HP5, FP4, Delta, Pan F…), CineStill (800T, 50D), Lomography, Foma (Fomapan), Rollei (RPX), ORWO, Polaroid, Instax.

5 types de films : **Couleur** (C-41), **N&B**, **Diapositive** (E-6), **ECN-2** (cinéma), **Instant**.

3 formats : **35mm**, **120**, **Instant**.

Saisie libre toujours possible — le catalogue aide, mais ne contraint jamais.

---

## FAQ (suggestions)

**FilmVault est-il gratuit ?**
Oui, entièrement gratuit et open source.

**Mes données sont-elles envoyées sur un serveur ?**
Non. Par défaut tout est stocké localement sur votre appareil. Vous pouvez activer une sauvegarde cloud optionnelle si vous le souhaitez.

**Puis-je l'utiliser sans connexion internet ?**
Oui. FilmVault est une PWA qui fonctionne à 100% hors connexion.

**Comment installer l'app ?**
Sur Android : ouvrez le site dans Chrome et appuyez sur "Ajouter à l'écran d'accueil". Sur iOS : ouvrez dans Safari, appuyez sur Partager puis "Sur l'écran d'accueil".

**Puis-je exporter mes données ?**
Oui, en JSON depuis les paramètres. L'import est aussi disponible.

**Le grand format (4x5, 8x10) est-il supporté ?**
Pas encore. Les formats supportés sont le 35mm, le 120 et l'instant. Le grand format est prévu pour une version future.

---

## Footer / CTA final

### Titre

Prêt à organiser votre stock ?

### Sous-titre

Installez FilmVault gratuitement et commencez à suivre vos pellicules dès aujourd'hui.

### CTA

Ouvrir FilmVault

---

*Document généré le 6 avril 2026 — À adapter lors de l'intégration web.*
