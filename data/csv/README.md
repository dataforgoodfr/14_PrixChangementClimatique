# Documentation des données CSV

Ce dossier contient les fichiers de données consolidés et agrégés pour l'analyse des risques climatiques sur le parc de maisons individuelles en France.

## Fichiers principaux

### `rga_houses_flat.csv`

Agrégation par commune de l'exposition au Retrait-Gonflement des Argiles (RGA).

- **Périmètre** : France métropolitaine uniquement (01-95, incluant 2A/2B).
- **Contenu** : Uniquement les maisons individuelles (usage BDNB "Résidentiel individuel").
- **Colonnes principales** :
  - `code_commune_insee` : Code INSEE de la commune.
  - `nb_maisons_total` : Nombre total de maisons individuelles.
  - `nb_maisons_exposition_rga` : Nombre cumulé de maisons en zones d'aléa (Faible, Moyen, Fort).
  - `pct_exposition_rga` : Ratio de maisons exposées (hors pondération).
  - `[p]_[rga]` : Détail par période (`pre1945`, `1945-1975`, `1976-2020`, `post2020`, `unk`) et niveau d'aléa (`nul`, `faible`, `moyen`, `fort`).
- **Sources** : BDNB (CSTB).

### `tri_all_bats_flat.csv`

Agrégation par commune de l'exposition au risque d'inondation (Zonage TRI).

- **Périmètre** : France entière, DROMs inclus (FXX, REU, GLP, GUF, MYT, MTQ, MAF, BLM, SPM).
- **Contenu** : Tous types de bâtiments (tous usages).
- **Colonnes principales** :
  - `code_commune_insee` : Code INSEE de la commune.
  - `nb_bats_total` : Nombre total de bâtiments.
  - `nb_bats_exposition_tri` : Nombre de bâtiments en zone de risque (Faible, Moyen, Fort).
  - `pct_exposition_tri` : Ratio de batiments exposées (hors pondération).
  - `[usage]_[scenario]` : Détail par usage (`resid`, `service`, `agri`, `indus`, `autres`) et scénario (`nul`, `faible`, `moyen`, `fort`).
- **Sources** : BDTOPO (v3) pour le bâti, croisé avec le Zonage TRI (DGPR - Directive Inondation).

## Suggestions d'indices d'exposition aux GeoRisques

- `indice_expo_rga` : Score pondéré de vulnérabilité.
  - **Pondération par période** : 1945-1975 (0.5), 1976-2020 (1.0), Après 2020 (0.5), Avant 1945 (0.0).
  - **Pondération par sévérité** : Faible (1), Moyen (5), Fort (10).
  - **Formule** : `Σ(p_weight * s_weight * count) / nb_maisons_total`.

- `indice_expo_tri` : Score pondéré de vulnérabilité aux inondations (tous usages confondus).
  - **Pondération par sévérité** : Faible (1), Moyen (3), Fort (5).
  - **Formule** : `Σ(s_weight * count) / nb_bats_total`.

### `risques_catnat_communes_flat.parquet`

Version enrichie de la table "flat" incluant les statistiques de catastrophes naturelles.

- `catnat_sec_count` : Nombre d'arrêtés CatNat pour le risque "Sécheresse" (mouvements de terrain différentiels) de 1982 à nos jours.
- `catnat_inond_count` : Nombre d'arrêtés CatNat pour le risque "Inondation" (débordements, ruissellements, submersions).
- `total_maisons` : Nombre total de maisons individuelles (Source BDNB).
- `rga_*` : Indicateurs de risque Argile.
- `tri_*` : Indicateurs de risque Inondation.

### `risques_communes_flat.parquet`

Version de base proposant une version "plate" (une ligne par commune) des risques d'inondation (TRI) et de Retrait-Gonflement des Argiles (RGA).

**Index :** `code_commune_insee`

**Colonnes :**

- `total_maisons` : Nombre total de maisons individuelles dans la commune.
- `rga_[periode]_[niveau]` : Nombre de maisons par période de construction et niveau d'aléa RGA.
  - _Périodes_ : `pre1945`, `1945_1975`, `1976_2020`, `post2020`, `unk`.
  - _Niveaux_ : `nul`, `faible`, `moyen`, `fort`.
- `tri_[type]_[scenario]` : Nombre de maisons par type d'inondation et scénario de risque.
  - _Types_ : `t01` (Débordement de cours d'eau), `t02` (Submersion marine), `t03` (Ruissellement).
  - _Scénarios_ : `nul`, `faible`, `moyen`, `fort` (correspondant aux fréquences d'occurrence).

### `gaspar_catnat.parquet`

Historique des arrêtés de Catastrophe Naturelle (CatNat) issus de la base GASPAR.

- `cod_commune` : Code INSEE de la commune.
- `lib_risque_jo` : Libellé du risque (ex: Sécheresse, Inondation).

## Sources de données

- **BDNB (CSTB)** : Base de Données Nationale des Bâtiments. Source principale pour le parc de maisons, les périodes de construction et l'aléa RGA. [lien](https://bdnb.io/)
- **BDTOPO (IGN)** : Base de données vectorielle 3D du territoire. Utilisée pour l'inventaire exhaustif des bâtiments et leurs usages (TRI).
- **TRI (DGPR)** : Territoires à Risque d'Inondation. Zonages d'aléa inondation par scénario (Directive Inondation). [lien](https://www.data.gouv.fr/datasets/territoire-a-risque-dinondation-tri-du-sig-directive-inondation-france-metropolitaine-rapportage-2020-241)
- **GASPAR / CatNat (Ministère de la Transition Écologique)** : Base de gestion des procédures administratives relatives aux risques naturels et technologiques.
- **Géorisques** : Données d'exposition aux risques naturels (Argile/RGA). Intégrées dans la base BDNB.

---

_Généré par les explorations dans `data/exploration/eda_jacques.ipynb`_
