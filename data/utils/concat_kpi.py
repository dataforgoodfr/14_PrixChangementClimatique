"""
Ce script génère le jeu de données intermédiaire regroupant l'ensemble des variables nécessaires à l'implémentation de l'indice de vulnérabilité.
Référence Outline: https://outline.services.dataforgood.fr/doc/indice-de-vulnerabilite-YOd6JzwpAs (Visité le 23/03/2026)

Liste Reclaim Finance:
- Exposition aux risques RGA: [MISSING]
    *Nombre de batiments à risque moyen ou fort
    *Surface territoire à risque moyen ou fort
- Exposition aux risques inondations: [MISSING]
    *Nombre de batiments à risque d'inondation
    *azi: Commune en zone inondable
- Nombre d’arrêtés Cat-Nat reconnus et non:
    *nb_arrete: Total arretés
    *nb_arrete_rec: Total arretés reconnues
    *nb_arrete_ref: Total arretés non-reconnues
    *nb_arrete_ino: Total arretés inondation
    *nb_arrete_sec: Total arretés secheresse
    *nb_arrete_mvt: Total arretés mouvement de terrain
    *nb_arrete_tem: Total arretés tempete
    *nb_arrete_vag: Total arretés vagues
    *nb_arrete_autre: Total arretés type autre
    *nb_arrete_pre_2010: Total arretés depuis 2010
    *nb_arrete_post_2010: Total arretés après 2010
- Exposition aux risques en 2050 (SSP2-4.5) [Fichier DIRAS pas encore disponible dans db]: [MISSING]
    *norswi04_yr: Nombres de jours avec sol sec
    *norrr_yr: Cumul de précipitations annuelles (mm)
    *norrrq_yr: Cumul de précipitations quotidiennes remarquables (percentile 99 du cumul quotidien) (mm)
    *nortx35d_yr: Nombre de jours avec la température maximale dépassant les 35°C
- Existence d’un PPRN:
    *pprn_rga : Couverture RGA
    *pprn_i: Couverture inondations
    *pprn_l: Couverture littoral
    *pprn_mvt: Couverture mouvement de terrain
    *pprn-tem: Couverture mouvement de tempete
- Variables Economiques: [MISSING]
    *bugdet_per_capita: Budget de la commune par hab
    *ratio_dettes_budget: Taux d’endettement (dette de la commune par rapport au budget)
    *evo_prime_20_24: Évolution de la prime entre 2020 et 2024
    *ratio_prime_budget: Part de la prime dans le budget (2024)
- Statut de la franchise légale Cat-Nat (Simple, Double, Triple, Quadruple): [MISSING]
    *last_franchise_secheresse: Dernier niveau de franchise par rapport aux catnat de type secheresse
    *last_franchise_ino: ..... inondations
    *last_franchise_autre: ..... autre

Variables additionelles:
- cout_moy_tout: Cout moyen de tout sinistres (categorical)
- cout_moy_ino: Cout moyen des sinistres inondations (categorical)
- cout_moy_sec: Cout moyen des sinistres secheresse (categorical)


Inspiration Chloé Barré
"""

from pathlib import Path

import duckdb
import geopandas as gpd
import numpy as np
import pandas as pd


def load_data(con):

    # GEOSPATIAL
    query = """
           SELECT 
                c.code AS commune_code,
                c.nom AS commune_name,
                r.niveau AS rga_level,
                SUM(ST_Area(ST_Intersection(ST_Transform(c.geom, 'EPSG:4326', 'EPSG:2154'), r.geom))) AS intersecting_area_m2
            FROM 
                ST_Read('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-avec-outre-mer.geojson') AS c
            JOIN 
                rga AS r 
                ON ST_Intersects(ST_Transform(c.geom, 'EPSG:4326', 'EPSG:2154'), r.geom)
            WHERE 
                r.niveau IN (2, 3)
            GROUP BY 
                1, 2, 3;
            """

    # rga_communes = con.sql(query).df()

    communes_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-avec-outre-mer.geojson"
    communes_geo = gpd.read_file(communes_geojson_url).to_crs("EPSG:4326")
    communes_geo["lat"] = communes_geo.geometry.centroid.y
    communes_geo["lon"] = communes_geo.geometry.centroid.x
    communes_geo.columns = ["code_geo", "nom", "geometry", "lat", "lon"]

    # SIMPLE DATA
    azi_gaspar = con.sql("""SELECT	* FROM dev.main.azi_gaspar""").df()
    ccr_details = con.sql("""SELECT	* FROM dev.main.ccr_details""").df()
    geoportail_ccr_communes = con.sql(
        """SELECT * FROM dev.main.geoportail_ccr_communes"""
    ).df()
    pprn = con.sql("""SELECT * FROM dev.main.pprn_gaspar""").df()
    comptes = con.sql("""SELECT * FROM budget_per_compte_communes""").df()
    population = con.sql("""SELECT * FROM population_code_geo""").df()
    # bat_rga_tri = con.sql("""SELECT * FROM rga_tri_communes""").df()

    # Duplicated in CCR Server
    ccr_details = ccr_details[~ccr_details.duplicated()]

    dataset = {
        # "rga_communes": rga_communes,
        "communes_geo": communes_geo,
        "azi_gaspar": azi_gaspar,
        "ccr_details": ccr_details,
        "geoportail_ccr_communes": geoportail_ccr_communes,
        "pprn": pprn,
        "comptes": comptes,
        "population": population,
    }

    # Scenarios 2050 (pas encore disponible dans db)
    """
    keep_cols = [
        "Point",
        "Latitude",
        "Longitude",
        "Niveau",
        "NORTMm_yr",
        "NORTMm_seas_JJA",
        "NORTMm_seas_DJF",
        "NORTXm_seas_JJA",
        "NORTX35D_yr",
        "NORTX30D_yr",
        "NORTR_yr",
        "NORRR_yr",
        "NORRR_seas_JJA",
        "NORRR_seas_DJF",
        "NORRRq99_yr",
        "NORRx1d_yr",
        "NORRRq99refD_yr",
        "NORIFM40_yr",
        "NORSWI04_yr",
        "ATMm_yr",
        "ATMm_seas_JJA",
        "ATMm_seas_DJF",
        "ATXm_seas_JJA",
        "ATX35D_yr",
        "ATX30D_yr",
        "ATR_yr",
        "ARRq99refD_yr",
        "AIFM40_yr",
        "ASWI04_yr",
        "ARRR_yr",
        "ARRR_seas_JJA",
        "ARRR_seas_DJF",
        "ARRRq99_yr",
        "ARRx1d_yr",
    ]
    DRIAS = pd.read_csv(
        "../exploration/DRIAS.txt",
        sep=";",
        comment="#",
        names=keep_cols,
        usecols=range(len(keep_cols)),
    )
    """

    return dataset


def clean_pprn(pprn):
    drop_cols = [
        "libelle_organisme",
        "bassin_risque",
        "bassins_hydrographiques",
        "procedure_revisante",
        "codes_revises",
        "procedure_revisee",
        "codes_revisants",
        "programmation_debut",
        "programmation_fin",
        "montage_debut",
        "montage_fin",
        "prescription",
        "etudes_hydr_debut",
        "etudes_hydr_fin",
        "carte_aleas_debut",
        "carte_aleas_fin",
        "carte_enjeux_debut",
        "carte_enjeux_fin",
        "zonage_regl_debut",
        "zonage_regl_fin",
        "reg_et_note_pres_debut",
        "reg_et_note_pres_fin",
        "concertation_debut",
        "concertation_fin",
        "consultation_debut",
        "consultation_fin",
        "consult_serv_debut",
        "consult_serv_fin",
        "enquete_publ_debut",
        "enquete_publ_fin",
        "annex_plu",
        "prorogation",
        "applic_antic",
        "deprescription",
    ]

    pprn_filter = pprn.drop(columns=drop_cols)
    pprn_filter = pprn_filter.dropna(subset="code_modele")
    pprn_filter = pprn_filter[pprn_filter["libelle_etat"] == "Opposable"]
    pprn_filter = pprn_filter[pprn_filter["code_risque_2_1"] != "<NA>"]

    pprn_filter["code_risque_2_1"] = pprn_filter.groupby(
        ["code_geo", "code_procedure"]
    )["code_risque_2_1"].transform(
        lambda x: "_".join(
            sorted(
                x.astype(str).unique(),
                key=lambda val: (
                    float(val) if val.replace(".", "", 1).isdigit() else val
                ),
            )
        )
    )
    pprn_filter["libelle_risque_3"] = pprn_filter.groupby(
        ["code_geo", "code_procedure"]
    )["libelle_risque_3"].transform(lambda x: "<br>".join(x.astype(str).unique()))

    def readable_pprn(x):
        if not isinstance(x, str):
            return "inconnu"

        mapping = {
            "I": "inondations",
            "L": "littoral",
            "RGA": "rga",
            "Mvt": "mouvement_de_terrain",
            "Multi": "couverture_multiple",
        }

        for key, label in mapping.items():
            if key in x:
                return label
        return "autre"

    pprn_filter["code_modele_desc"] = pprn_filter["code_modele"].apply(readable_pprn)

    pprn_df = pprn_filter.copy()
    pprn_df["date_derniere_mise_a_jour"] = pd.to_datetime(
        pprn_df["date_derniere_mise_a_jour"]
    )
    pprn_df = pprn_df.sort_values("date_derniere_mise_a_jour", ascending=False)
    pprn_df = pprn_df.drop_duplicates(
        subset=["code_modele", "code_geo", "code_risque_2_1"], keep="first"
    )

    is_ino = pprn_df["libelle_risque_2"].str.contains(
        "Inondation", case=False, na=False
    )
    is_mvt = pprn_df["libelle_risque_2"].str.contains("terrain", case=False, na=False)
    is_tem = pprn_df["libelle_risque_2"].str.contains(
        "atmosphère", case=False, na=False
    )

    conditions = [is_ino, is_mvt, is_tem]
    choices = ["PPRN-I", "PPRN-Mvt", "PPRN-Tem"]

    pprn_df["code_modele"] = np.where(
        pprn_df["code_modele"] == "PPRN-Multi",
        np.select(conditions, choices, default="Autre"),
        pprn_df["code_modele"],
    )
    return pprn_df


def clean_comptes(comptes, pop):
    types_to_keep = [
        "dettes financieres",
        "primes d assurances",
        "depenses",
        "produits",
    ]
    comptes_filtered = comptes[comptes["type_compte"].isin(types_to_keep)].copy()

    comptes_final = comptes_filtered.pivot_table(
        index=[
            "code_geo_from_siren",
            "nom_com",
            "code_departement",
            "region_name",
            "annee",
        ],
        columns="type_compte",
        values="solde",
        aggfunc="sum",
    ).reset_index()

    comptes_final = comptes_final.rename(
        columns={
            "dettes financieres": "dettes",
            "primes d assurances": "primes",
            "depenses": "depenses",
            "produits": "produits",
        }
    )

    comptes_final["solde_annuel"] = (
        comptes_final["produits"] - comptes_final["depenses"]
    )
    comptes_final["ratio_dettes_produits"] = (
        comptes_final["dettes"] / comptes_final["produits"]
    ) * 100
    comptes_final["ratio_dettes_depenses"] = (
        comptes_final["dettes"].abs() / comptes_final["depenses"]
    ) * 100
    comptes_final["ratio_primes_depenses"] = (
        comptes_final["primes"] / comptes_final["depenses"]
    ) * 100

    cols_to_fix = ["primes", "dettes", "depenses", "produits"]

    for col in cols_to_fix:
        if col in comptes_final.columns:
            comptes_final[col] = comptes_final[col].abs()

    # Per Capita
    pop.columns = pop.columns.str.replace("pop_", "")
    pop = pop.drop(columns=["nom_geo", "code_departement", "code_region"])
    pop_long = pop.melt(id_vars=["code_geo"], var_name="annee", value_name="population")
    pop_long["annee"] = pop_long["annee"].astype(int)

    comptes_final = pd.merge(
        comptes_final,
        pop_long,
        left_on=["code_geo_from_siren", "annee"],
        right_on=["code_geo", "annee"],
        how="left",
    )

    cols_to_capita = ["dettes", "primes", "depenses", "produits", "solde_annuel"]

    for col in cols_to_capita:
        comptes_final[f"{col}_per_capita"] = (
            comptes_final[col] / (comptes_final["population"])
        )

    return comptes_final


def features_eng(dfs):

    kpi_df = dfs["communes_geo"].copy()
    kpi_df = kpi_df.set_index("code_geo")

    # ============================
    # AZI: Atlas zone Inondable
    # ============================
    kpi_df["azi"] = kpi_df.index.isin(dfs["azi_gaspar"]["cod_commune"]).astype(int)

    # ============================
    # Nombre d’arrêtés Cat-Nat reconnus et non
    # ============================
    ccr = dfs["ccr_details"].copy()

    ccr["is_recon"] = (ccr["libelle_avis"] == "Reconnue").astype(int)
    ccr["is_refus"] = (ccr["libelle_avis"] == "Non reconnue").astype(int)
    ccr["is_ino"] = (
        ccr["nom_peril"].str.contains("inondation", case=False, na=False).astype(int)
    )
    ccr["is_sec"] = (
        ccr["nom_peril"].str.contains("sécheresse", case=False, na=False).astype(int)
    )
    ccr["is_mvt"] = (
        ccr["nom_peril"]
        .str.contains("mouvement de terrain", case=False, na=False)
        .astype(int)
    )
    ccr["is_tem"] = (
        ccr["nom_peril"].str.contains("tempête", case=False, na=False).astype(int)
    )
    ccr["is_vag"] = (
        ccr["nom_peril"].str.contains("vagues", case=False, na=False).astype(int)
    )
    select_catnat = (
        ccr["is_ino"] | ccr["is_sec"] | ccr["is_mvt"] | ccr["is_tem"] | ccr["is_vag"]
    )
    ccr["is_autre"] = 1 - select_catnat

    ccr_stats = ccr.groupby("code_geo").agg(
        nb_arrete=("code_geo", "count"),
        nb_arrete_recon=("is_recon", "sum"),
        nb_arrete_refus=("is_refus", "sum"),
        nb_arrete_ino=("is_ino", "sum"),
        nb_arrete_sec=("is_sec", "sum"),
        nb_arrete_mvt=("is_mvt", "sum"),
        nb_arrete_tem=("is_tem", "sum"),
        nb_arrete_vag=("is_vag", "sum"),
        nb_arrete_autre=("is_autre", "sum"),
    )

    ccr["period"] = pd.cut(
        ccr["date_debut_evenement"].dt.year,
        bins=[1984, 2010, 2026],
        labels=["nb_arrete_pre_2010", "nb_arrete_post_2010"],
        right=False,
    )

    period_counts = (
        ccr.groupby(["code_geo", "period"], observed=False).size().unstack(fill_value=0)
    )

    ccr_stats = ccr_stats.join(period_counts)
    kpi_df = kpi_df.join(ccr_stats).fillna(0)

    # ============================
    # PPRN
    # ============================
    pprn = clean_pprn(dfs["pprn"])
    pprn_dummies = pd.get_dummies(
        pprn[["code_geo", "code_modele"]],
        columns=["code_modele"],
        prefix="",
    )
    pprn_dummies = pprn_dummies.set_index("code_geo")

    pprn_dummies.columns = [c.lstrip("_") for c in pprn_dummies.columns]

    kpi_df = kpi_df.join(pprn_dummies).fillna(0)
    kpi_df = kpi_df.astype(int, errors="ignore")

    # ============================
    # Budget de la commune par hab
    # ============================
    comptes = clean_comptes(dfs["comptes"], dfs["population"])

    kpi_df = kpi_df.join(pprn_dummies).fillna(0)

    return


if __name__ == "__main__":
    current_dir = Path.cwd()
    exploration_dir = current_dir / "data" / "exploration"

    con = duckdb.connect(exploration_dir / "dev.duckdb", read_only=True)
    con.execute("INSTALL spatial;")
    con.execute("LOAD spatial;")
    dataset = load_data(con)
    features_eng(dataset)

    # Push to S3
