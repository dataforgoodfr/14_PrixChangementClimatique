"""
Ce script génère le jeu de données intermédiaire regroupant l'ensemble des variables nécessaires à l'implémentation de l'indice de vulnérabilité.
Référence Outline: https://outline.services.dataforgood.fr/doc/indice-de-vulnerabilite-YOd6JzwpAs (Visité le 23/03/2026)

Liste Reclaim Finance:
- Exposition aux risques RGA:
    *nb_bat_rga_moyen_fort: Nombre de batiments à risque RGA moyen ou fort
    *pct_bat_rga_moyen_fort: Pourcentage de batiments à risque RGA moyen ou fort
    *nb_bat_rga_age_risk: Nombre de batiments à risque RGA moyen ou fort et avec fondations à risque
    *pct_bat_rga_age_risk: Pourcentage de batiments à risque RGA moyen ou fort et avec fondations à risque
    *pct_rga_moyen_fort: Pourcentage total de la surface territoire à risque RGA moyen ou fort [MISSING]
- Exposition aux risques inondations:
    *nb_bat_tri_moyen_fort: Nombre de batiments à risque d'inondations moyen ou fort
    *pct_bat_tri_moyen_fort: Pourcentage de batiments à risque d'inondations moyen ou fort
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
- Exposition aux risques en 2050 (SSP2-4.5):
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
- Variables Economiques:
    *depenses_per_capita: Budget de la commune par hab
    *ratio_dettes_depenses: Taux d’endettement (dette de la commune par rapport au budget)
    *evo_primes_20_24: Évolution de la prime entre 2020 et 2024 (%)
    *ratio_primes_depenses: Part de la prime dans le budget (2024)
- Statut de la franchise Cat-Nat (0: Pas de CatNat, 1: Simple, 2: Doublée, 3: Triplée, 4: Quadruplée):
    *last_franchise_is_ino: Dernier statut de la franchise pour catnat inondations
    *last_franchise_is_sec
    *last_franchise_is_mvt
    *last_franchise_is_tem
    *last_franchise_is_vag
    *last_franchise_is_autre

Variables additionelles:
- cout_moy_tout: Couts moyen de tout sinistres (categorical)
- cout_moy_tout_ino: ..... inondations (categorical)
- cout_moy_sec:
- cout_moy_mvt:
- cout_cumul_tout: Couts cumulés de tout sinistres (categorical)
- cout_cumul_tout_ino: ..... inondations (categorical)
- cout_cumul_sec:
- cout_cumu_mvt:


Inspiration Chloé Barré
"""

from pathlib import Path

import duckdb
import geopandas as gpd
import numpy as np
import pandas as pd


def load_data(con):

    # ------------
    # GEOSPATIAL
    # ------------
    communes_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-avec-outre-mer.geojson"
    communes_geo = gpd.read_file(communes_geojson_url).to_crs("EPSG:4326")
    communes_geo["lat"] = communes_geo.geometry.centroid.y
    communes_geo["lon"] = communes_geo.geometry.centroid.x
    communes_geo.columns = ["code_geo", "nom", "geometry", "lat", "lon"]

    query = """
            SELECT
                gid,
                niveau,
                surf_m2,
                ST_AsWKB(geom) AS geom,
                code_departement
            FROM rga
            """
    rga_geo = con.sql(query).df()
    rga_geo["geom"] = gpd.GeoSeries.from_wkb(rga_geo["geom"].map(bytes))
    rga_geo = gpd.GeoDataFrame(rga_geo, geometry="geom", crs="EPSG:2154")
    rga_geo[rga_geo["niveau"].isin([2, 3])]

    communes_geo_crs = communes_geo.to_crs("EPSG:4326")
    communes_geo_crs["total_area_m2"] = communes_geo_crs.geometry.area
    rga_high_risk = rga_geo[rga_geo["niveau"].isin([2, 3])]
    intersection = gpd.overlay(communes_geo_crs, rga_high_risk, how="intersection")
    intersection["intersect_area_m2"] = intersection.geometry.area

    rga_stats = (
        intersection.groupby("code_geo")["intersect_area_m2"].sum().reset_index()
    )
    rga_area = communes_geo_crs.merge(rga_stats, on="code_geo", how="left")
    rga_area["intersect_area_m2"] = rga_area["intersect_area_m2"].fillna(0)
    rga_area["pct_rga_moyen_fort"] = (
        rga_area["intersect_area_m2"] / rga_area["total_area_m2"]
    ) * 100
    rga_area = rga_area[rga_area["code_geo", "pct_rga_moyen_fort"]].drop(
        columns="geometry"
    )

    # ------------
    # TABULAR DATA
    # ------------
    azi_gaspar = con.sql("""SELECT	* FROM dev.main.azi_gaspar""").df()
    ccr_details = con.sql("""SELECT	* FROM dev.main.ccr_details""").df()
    geoportail_ccr_communes = con.sql(
        """SELECT * FROM dev.main.geoportail_ccr_communes"""
    ).df()
    pprn = con.sql("""SELECT * FROM dev.main.pprn_gaspar""").df()
    comptes = con.sql("""SELECT * FROM budget_per_compte_communes""").df()
    population = con.sql("""SELECT * FROM population_code_geo""").df()

    # Duplicated Error in CCR Server
    ccr_details = ccr_details[~ccr_details.duplicated()]

    # Scenarios 2050
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
    diras = pd.read_csv(
        "https://s3.fr-par.scw.cloud/qppcc-upload/pipeline_inputs/DRIAS.txt",  # Maybe change that :D
        sep=";",
        comment="#",
        names=keep_cols,
        usecols=range(len(keep_cols)),
    )

    # Exposition aux risques
    rga_tri_communes = pd.read_parquet(
        "https://s3.fr-par.scw.cloud/qppcc-upload/pipeline_inputs/rga_tri_communes.parquet",
    )
    rga_tri_communes = rga_tri_communes.rename(
        columns={"code_commune_insee": "code_geo"}
    )

    dataset = {
        "rga_area": rga_area,
        "communes_geo": communes_geo,
        "azi_gaspar": azi_gaspar,
        "ccr_details": ccr_details,
        "geoportail_ccr_communes": geoportail_ccr_communes,
        "pprn": pprn,
        "comptes": comptes,
        "population": population,
        "diras": diras,
        "rga_tri_communes": rga_tri_communes,
    }

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
    kpi_df = kpi_df.drop(columns=["geometry", "lat", "lon"])
    print("Init:", kpi_df.shape)

    # ============================
    # Exposition aux risques RGA & Inondations
    # ============================
    rga_tri_communes = dataset["rga_tri_communes"]
    rga_high_risk = [
        "rga_pre1945_moyen",
        "rga_1945_1975_moyen",
        "rga_1976_2020_moyen",
        "rga_post2020_moyen",
        "rga_pre1945_fort",
        "rga_1945_1975_fort",
        "rga_1976_2020_fort",
        "rga_post2020_fort",
    ]

    rga_tri_communes["nb_bat_rga_moyen_fort"] = rga_tri_communes[rga_high_risk].sum(
        axis=1
    )
    rga_tri_communes["pct_bat_rga_moyen_fort"] = (
        rga_tri_communes["nb_bat_rga_moyen_fort"] / rga_tri_communes["total_maisons"]
    )
    rga_tri_communes["nb_bat_rga_age_risk"] = rga_tri_communes[
        ["rga_1976_2020_moyen", "rga_1976_2020_fort"]
    ].sum(axis=1)
    rga_tri_communes["pct_bat_rga_age_risk"] = (
        rga_tri_communes["nb_bat_rga_age_risk"] / rga_tri_communes["total_maisons"]
    )

    tri_high_risk = [
        "tri_t01_moyen",
        "tri_t01_fort",
        "tri_t02_moyen",
        "tri_t02_fort",
        "tri_t03_moyen",
        "tri_t03_fort",
    ]

    rga_tri_communes["nb_bat_tri_moyen_fort"] = rga_tri_communes[tri_high_risk].sum(
        axis=1
    )
    rga_tri_communes["pct_bat_tri_age_risk"] = (
        rga_tri_communes["nb_bat_tri_moyen_fort"] / rga_tri_communes["total_maisons"]
    )

    rga_area = dataset["rga_area"]
    rga_area = rga_area.set_index("code_geo")

    kpi_df = kpi_df.join(rga_tri_communes)
    print("Exposition aux risques RGA & Inondations:", kpi_df.shape)

    # ============================
    # AZI: Atlas zone Inondable
    # ============================
    kpi_df["azi"] = kpi_df.index.isin(dfs["azi_gaspar"]["cod_commune"]).astype(int)
    print("AZI:", kpi_df.shape)

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
    kpi_df = kpi_df.join(ccr_stats)
    print("CCR CatNat:", kpi_df.shape)

    # ============================
    # Exposition aux risques en 2050
    # ============================
    communes_geo = dataset["commune_geo"]
    diras = dataset["diras"]
    variables_extremes = ["NORSWI04_yr", "NORRR_yr", "NORRRq99_yr", "NORTX35D_yr"]
    gdf_communes = gpd.GeoDataFrame(
        communes_geo,
        geometry=gpd.points_from_xy(communes_geo["lon"], communes_geo["lat"]),
        crs="EPSG:4326",
    )

    gdf_stations = gpd.GeoDataFrame(
        diras,
        geometry=gpd.points_from_xy(diras["Longitude"], diras["Latitude"]),
        crs="EPSG:4326",
    )

    climate_extremes = gpd.sjoin_nearest(
        gdf_communes,
        gdf_stations[["geometry"] + variables_extremes],
        how="left",
        distance_col="dist_to_station",
    )
    climate_extremes = climate_extremes.set_index("code_geo")[
        variables_extremes
    ].rename(columns=str.lower)

    kpi_df = kpi_df.join(climate_extremes)
    print("Climat 2050:", kpi_df.shape)

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

    kpi_df = kpi_df.join(pprn_dummies)
    kpi_df = kpi_df.astype(int, errors="ignore")
    print("PPRN:", kpi_df.shape)

    # ============================
    # Budget de la commune par hab
    # ============================
    comptes = clean_comptes(dfs["comptes"], dfs["population"])

    def get_base_100_trends(comptes, base_year=2020):
        base_primes = comptes.loc[base_year, "primes"]
        return (comptes["primes"] / base_primes) * 100

    comptes_kpi = comptes[comptes["annee"] == 2024][
        [
            "code_geo_from_siren",
            "depenses_per_capita",
            "ratio_dettes_depenses",
            "ratio_primes_depenses",
        ]
    ]
    comptes_kpi["evo_primes_20_24"] = get_base_100_trends(comptes, base_year=2020)
    comptes_kpi = comptes_kpi.rename(columns={"code_geo_from_siren": "code_geo"})

    # Missing values
    # depenses_per_capita 24
    # ratio_dettes_depenses 1277
    # ratio_primes_depenses 150
    kpi_df = kpi_df.join(comptes_kpi)
    print("Comptes:", kpi_df.shape)

    # ============================
    # Statut de la franchise légale Cat-Nat (Simple, Double, Triple, Quadruple)
    # ============================
    ccr_franchises = ccr.copy()
    franchise_map = {"Simple": 1, "Doublée": 2, "Triplée": 3, "Quadruplée": 4}
    ccr_franchises["franchise_level"] = (
        ccr_franchises["franchise"].str.capitalize().map(franchise_map).fillna(1)
    )

    peril_cols = ["is_ino", "is_sec", "is_mvt", "is_tem", "is_vag", "is_autre"]

    for col in peril_cols:
        ccr_franchises[f"last_franchise_{col}"] = (
            ccr_franchises[col] * ccr_franchises["franchise_level"]
        )

    ccr_franchises = ccr_franchises.sort_values(
        by="date_parution_jo", ascending=False
    ).drop_duplicates(subset=["code_geo", "nom_peril"])
    ccr_franchises = ccr_franchises.set_index("code_geo")
    ccr_franchises = ccr_franchises.filter(like="last")

    kpi_df = kpi_df.join(ccr_franchises)
    print("Franchises:", kpi_df.shape)

    # ============================
    # Geoportail CCR
    # ============================
    geoportail_ccr = dataset["geoportail_ccr_communes"]
    geoportail_ccr = geoportail_ccr.set_index("code_geo")

    cols = [
        "cout_moy_tout",
        "cout_moy_tout_ino",
        "cout_moy_sec",
        "cout_moy_mvt",
        "cout_cumul_tout",
        "cout_cumul_tout_ino",
        "cout_cumul_sec",
        "cout_cumul_mvt",
    ]

    kpi_df = kpi_df.join(geoportail_ccr[cols])
    print("Geoportail CCR:", kpi_df.shape)

    kpi_df.to_csv("indicateurs_reclaim.csv", index=True)

    return kpi_df


if __name__ == "__main__":
    current_dir = Path.cwd()
    exploration_dir = current_dir / "data" / "exploration"

    con = duckdb.connect(exploration_dir / "dev.duckdb", read_only=True)
    con.execute("INSTALL spatial;")
    con.execute("LOAD spatial;")
    dataset = load_data(con)
    kpi_df = features_eng(dataset)

    # Push to S3
