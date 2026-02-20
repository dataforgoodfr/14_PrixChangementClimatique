"""
uv pip install xlrd openpyxl pyarrow => Read excel files and parquet
Taux de chômage localisés au 3ᵉ trimestre 2025: https://www.insee.fr/fr/statistiques/2012804#graphique-TCRD_025_tab1_regions2016
sl_etc_2025T3.xls => Données par region

Les inscrits à France Travail : données communales:
https://dares.travail-emploi.gouv.fr/donnees/les-inscrits-france-travail-donnees-communales
Utilisation API

=> Idée merge les deux jeux de données en extrapolant les données de communes à partir de celles des départements
=> Pour cela faut aussi la population par commune (https://www.data.gouv.fr/datasets/population-municipale-des-communes-france-entiere)
=> Ce coefficient est un proxy pour le taux de chomage au niveau communal
"""

import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from s3_connector import connect_to_s3, send_file_to_s3

current_dir = Path.cwd()
download_file_dir = current_dir / "data" / "utils" / "downloaded_files"

load_dotenv(current_dir / ".env")

# Taux de chomage par departement
taux_chomage_departement = pd.read_excel(
    download_file_dir / "downloaded_files" / "sl_etc_2025T3.xls",
    sheet_name="Département",
    skiprows=3,
    skipfooter=4,
)[["Code", "Libellé", "T3_2025"]]


communes_france_travail = pd.read_parquet(
    download_file_dir / "downloaded_files" / "dares_defm_communales-brutes.parquet"
)
communes_france_travail = communes_france_travail[
    (communes_france_travail["date"] == "2024-T4")
    & (communes_france_travail["tranche_d_age"] == "Total")
    & (communes_france_travail["sexe"] == "Total")
].drop(columns=["date", "tranche_d_age", "sexe", "categorie", "type_de_donnees"])

# Données population par commune (2023) (Tout la population pas simplement pop active)
pop_communes = pd.read_excel(
    download_file_dir
    / "downloaded_files"
    / "POPULATION_MUNICIPALE_COMMUNES_FRANCE.xlsx"
)
pop_communes = pop_communes[["dep", "cv", "codgeo", "p23_pop"]]

# Merging data
c_fr_tr_pop = communes_france_travail.merge(
    pop_communes, left_on="code_commune", right_on="codgeo"
)

# Règle de trois
c_fr_tr_pop["ratio_ABC_pop_commune"] = (
    c_fr_tr_pop["nombre_de_demandeurs_d_emploi"] / c_fr_tr_pop["p23_pop"]
)
c_fr_tr_pop["ratio_ABC_pop_dep"] = c_fr_tr_pop.groupby("dep")[
    "nombre_de_demandeurs_d_emploi"
].transform("sum") / c_fr_tr_pop.groupby("dep")["p23_pop"].transform("sum")


taux_chomage_communes = taux_chomage_departement.merge(
    c_fr_tr_pop, left_on="Code", right_on="code_departement"
)

taux_chomage_communes["T3_2025_proxy_commune"] = (
    taux_chomage_communes["T3_2025"]
    / taux_chomage_communes["ratio_ABC_pop_dep"]
    * taux_chomage_communes["ratio_ABC_pop_commune"]
)

# Nettoyage et Sauvegarde
reordered_cols = [
    "code_region",
    "region",
    "code_departement",
    "departement",
    "code_commune",
    "commune",
    "codgeo",
    "nombre_de_demandeurs_d_emploi",
    "p23_pop",
    "ratio_ABC_pop_commune",
    "ratio_ABC_pop_dep",
    "T3_2025_departement",
    "T3_2025_proxy_commune",
]

taux_chomage_communes = taux_chomage_communes.drop(
    columns=[
        "Code",
        "Libellé",
    ]
)
taux_chomage_communes = taux_chomage_communes.rename(
    columns={"T3_2025": "T3_2025_departement"}
)

taux_chomage_communes = taux_chomage_communes[reordered_cols]
taux_chomage_communes["T3_2025_proxy_commune"] = taux_chomage_communes[
    "T3_2025_proxy_commune"
].round(2)
taux_chomage_communes.to_csv(
    download_file_dir / "taux_chomage_communes.csv", index=False
)

s3_client = connect_to_s3(
    endpoint_url=os.getenv("S3_ENDPOINT_URL"),
    access_key_id=os.getenv("S3_ACCESS_KEY"),
    secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
    region_name=os.getenv("S3_REGION"),
)

send_file_to_s3(
    s3_client=s3_client,
    bucket=os.getenv("QPPCC_BUCKET"),
    filepath=download_file_dir / "taux_chomage_communes.csv",
    s3_filepath="pipeline_inputs/taux_chomage_communes.csv",
)
