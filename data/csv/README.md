# Documentation des données CSV

Ce dossier contient les fichiers de données consolidés et agrégés pour l'analyse des risques climatiques sur le parc de maisons individuelles en France.

## Fichiers principaux

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

- **BDNB (CSTB)** : Base de Données Nationale des Bâtiments. Utilisée pour le parc de maisons et les années de construction.
- **TRI (DGPR)** : Territoires à Risque d'Inondation. Zones d'aléa inondation par scénario.
- **GASPAR / CatNat (Ministère de la Transition Écologique)** : Base de gestion des procédures administratives relatives aux risques naturels et technologiques.
- **Géorisques** : Données d'exposition aux risques naturels (Argile/RGA).

---

_Généré par les explorations dans `data/exploration/eda_jacques.ipynb`_
