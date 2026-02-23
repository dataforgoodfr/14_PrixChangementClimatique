# Documentation des données CSV

Ce dossier contient les fichiers de données consolidés et agrégés pour l'analyse des risques climatiques sur le parc de maisons individuelles en France.

## Fichiers principaux

### `risques_communes_flat.parquet`

Ce fichier propose une version "plate" (une ligne par commune) des risques d'inondation (TRI) et de Retrait-Gonflement des Argiles (RGA).

**Index :** `code_commune_insee`

**Colonnes :**

- `total_maisons` : Nombre total de maisons individuelles dans la commune.
- `rga_[periode]_[niveau]` : Nombre de maisons par période de construction et niveau d'aléa RGA.
  - _Périodes_ : `pre1945`, `1945_1975`, `1976_2020`, `post2020`, `unk`.
  - _Niveaux_ : `nul`, `faible`, `moyen`, `fort`.
- `tri_[type]_[scenario]` : Nombre de maisons par type d'inondation et scénario de risque.
  - _Types_ : `t01` (Débordement de cours d'eau), `t02` (Submersion marine), `t03` (Ruissellement).
  - _Scénarios_ : `nul`, `faible`, `moyen`, `fort` (correspondant aux fréquences d'occurrence).

### `france_houses_agg.parquet`

Données sources agrégées par commune, période de construction, et type de risque avant pivot. Utilisé comme base pour générer le fichier flat.

### `gaspar_catnat.parquet`

Historique des arrêtés de Catastrophe Naturelle (CatNat) issus de la base GASPAR, filtrés et compressés.

- `cod_commune` : Code INSEE de la commune.
- `lib_risque_jo` : Libellé du risque (ex: Sécheresse, Inondation).
- `dat_pub_jo` : Date de publication au Journal Officiel.

---

_Généré par les explorations dans `data/exploration/eda_jacques.ipynb`_
