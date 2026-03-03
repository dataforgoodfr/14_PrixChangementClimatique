from pathlib import Path

import duckdb
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from download import download_file
from s3_connector import connect_to_s3, send_file_to_s3

current_dir = Path.cwd()
exploration_dir = current_dir / "data" / "exploration"

load_dotenv(current_dir / ".env")

# Connection
con = duckdb.connect(exploration_dir / "dev.duckdb", read_only=True)
con.sql("LOAD spatial;")  # if geospatial data needed


def transform_ccr_details():

    query_ccr_details = """
                        SELECT
                            *
                        FROM dev.main.ccr_details
                        """

    ccr_details = con.sql(query_ccr_details)
    ccr_details_df = ccr_details.df()

    ccr_details_df = ccr_details_df.copy()

    # ------ DATA MANIPULATION ------

    # Converting to datetime
    ccr_details_df["date_arrete"] = pd.to_datetime(ccr_details_df["date_arrete"])
    ccr_details_df["date_debut_evenement"] = pd.to_datetime(
        ccr_details_df["date_debut_evenement"]
    )
    ccr_details_df["date_fin_evenement"] = pd.to_datetime(
        ccr_details_df["date_fin_evenement"]
    )

    # Modify Reconnue(sans impact sur la modulation)
    ccr_details_df["libelle_avis"] = ccr_details_df["libelle_avis"].replace(
        {"Reconnue(sans impact sur la modulation)": "Reconnue"}
    )

    # Remove potential duplicated
    ccr_details_df = ccr_details_df[~ccr_details_df.duplicated()]

    # Segment by major perils
    ccr_details_df["nom_peril"] = (
        ccr_details_df["nom_peril"]
        .mask(ccr_details_df["nom_peril"].str.contains("Inondations"), "inondations")
        .where(
            ccr_details_df["nom_peril"].str.contains("Inondations|Sécheresse"),
            "autre",
        )
    )
    ccr_details_df["nom_peril"] = ccr_details_df["nom_peril"].str.replace(
        "Sécheresse", "secheresse"
    )

    # Segment by decades
    decades = [2000, 2010, 2020]
    for decade in decades:
        ccr_details_df = ccr_details_df[
            (ccr_details_df["date_arrete"].dt.year > 1983)
            & (ccr_details_df["date_arrete"].dt.year < 2026)
        ]
        ccr_details_df[f"periode_{decade}"] = np.where(
            ccr_details_df["date_arrete"].dt.year < decade,
            f"Before {decade}",
            f"After {decade}",
        )

    data_trans = ccr_details_df.copy()

    # ------ FEATURES CREATION ------

    # Number of CatNat
    catnat_total = data_trans.groupby("code_geo").size()
    catnat_total.name = "catnat"
    catnat_per_peril = data_trans.groupby(["code_geo", "nom_peril"]).size()

    catnat_per_peril = (
        data_trans.groupby(["code_geo", "nom_peril"])
        .size()
        .unstack(fill_value=0)
        .add_prefix("catnat_")
    )

    # Frequency of Catnat
    date_range = (
        data_trans["date_arrete"].dt.year.max()
        - data_trans["date_arrete"].dt.year.min()
    )
    freq_catnat_global = catnat_total / date_range
    freq_catnat_global.name = "freq_catnat"
    freq_catnat_per_peril = catnat_per_peril / date_range

    freq_catnat_per_peril.columns = [
        col.replace("catnat", "freq_catnat") for col in freq_catnat_per_peril.columns
    ]

    # Stats on CatNat duration per peril
    data_trans["duration"] = (
        data_trans["date_fin_evenement"] - data_trans["date_debut_evenement"]
    ).dt.days + 1

    stats_duration_per_peril = (
        data_trans.groupby(["code_geo", "nom_peril"])["duration"]
        .agg(["median", "mean", "min", "max"])
        .unstack(fill_value=0)
    )
    stats_duration_per_peril.columns = [
        f"{stat}_duration_{peril}" for stat, peril in stats_duration_per_peril.columns
    ]
    stats_duration_per_peril = stats_duration_per_peril.reset_index()

    # Refusal Rate
    recon_total = (
        data_trans[data_trans["libelle_avis"] == "Reconnue"].groupby("code_geo").size()
    )
    recon_total.name = "num_recon"
    recon_total = recon_total.reindex_like(catnat_total).fillna(0)
    refusal_rate = 1 - (recon_total / catnat_total)

    recon_per_peril = (
        data_trans[data_trans["libelle_avis"] == "Reconnue"]
        .groupby(["code_geo", "nom_peril"])
        .size()
        .unstack(fill_value=0)
        .add_prefix("recon_")
    )

    recon_per_peril = recon_per_peril.reindex_like(catnat_per_peril).fillna(0)
    refusal_rate_per_peril = 1 - (recon_per_peril / catnat_per_peril)
    refusal_rate_per_peril = refusal_rate_per_peril.add_prefix("refusal_rate_").fillna(
        0
    )

    # Penalty Count & Frequency
    not_simple_franchise = data_trans[
        (data_trans["libelle_avis"] == "Reconnue")
        & (data_trans["franchise"] != "Simple")
    ]
    penalty_freq = (
        not_simple_franchise.groupby(["code_geo", "franchise"])
        .size()
        .unstack(fill_value=0)
        .add_prefix("freq_")
        / date_range
    )

    import pdb

    pdb.set_trace()

    # Features per period

    # ------ MERGING FEATURES ------
    print("Shape:")
    return


def transform_geoportail_ccr():

    return


def transform_pprn():
    return


def main():

    transform_ccr_details()

    # Save dataset in silver or gold


if __name__ == "__main__":
    main()
