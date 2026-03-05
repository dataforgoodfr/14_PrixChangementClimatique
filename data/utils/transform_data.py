from pathlib import Path

import duckdb
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from dotenv import load_dotenv
from download import download_file
from s3_connector import connect_to_s3, send_file_to_s3
from sklearn.preprocessing import MinMaxScaler

current_dir = Path.cwd()
exploration_dir = current_dir / "data" / "exploration"

load_dotenv(current_dir / ".env")

# Connection
con = duckdb.connect(exploration_dir / "dev.duckdb", read_only=True)
con.sql("LOAD spatial;")  # if geospatial data needed


def transform_ccr_details(plotting=True):

    query_ccr_details = """
                        SELECT
                            *
                        FROM dev.main.ccr_details
                        """

    ccr_details = con.sql(query_ccr_details)
    ccr_details_df = ccr_details.df()

    ccr_details_df = ccr_details_df.copy()

    # Date filtering
    ccr_details_df = ccr_details_df[
        (ccr_details_df["date_arrete"].dt.year > 1983)
        & (ccr_details_df["date_arrete"].dt.year < 2026)
    ]

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

    data_trans = ccr_details_df.copy()

    # ------ FEATURES CREATION ------

    # Number of CatNat (ADD spatial_lag and sparial correlation, spatial_temporal_lag; giddy, gini, thiel)
    catnat_total = data_trans.groupby("code_geo").size()
    catnat_total.name = "catnat"
    catnat_per_peril = data_trans.groupby(["code_geo", "nom_peril"]).size()

    catnat_per_peril = (
        data_trans.groupby(["code_geo", "nom_peril"])
        .size()
        .unstack(fill_value=0)
        .add_prefix("catnat_")
    )

    catnat_per_peril["secheresse_share"] = catnat_per_peril["catnat_secheresse"] / (
        catnat_per_peril.sum(axis=1)
    ).fillna(0)

    # Frequency of Catnat
    date_range = (
        data_trans["date_arrete"].dt.year.max()
        - data_trans["date_arrete"].dt.year.min()
    )
    freq_catnat_total = catnat_total / date_range
    freq_catnat_total.name = "freq_catnat"
    freq_catnat_per_peril = (
        catnat_per_peril.drop(columns="secheresse_share") / date_range
    )

    freq_catnat_per_peril.columns = [
        col.replace("catnat", "freq_catnat") for col in freq_catnat_per_peril.columns
    ]

    # Stats on CatNat duration per peril
    data_trans["duration"] = (
        data_trans["date_fin_evenement"] - data_trans["date_debut_evenement"]
    ).dt.days + 1

    stats_duration_per_peril = (
        data_trans.groupby(["code_geo", "nom_peril"])["duration"]
        .agg(["median", "max"])
        .unstack(fill_value=0)
    )
    stats_duration_per_peril.columns = [
        f"{stat}_duration_{peril}" for stat, peril in stats_duration_per_peril.columns
    ]

    # Refusal Rate
    recon_total = (
        data_trans[data_trans["libelle_avis"] == "Reconnue"].groupby("code_geo").size()
    )
    recon_total.name = "recon_counts"
    recon_total = recon_total.reindex_like(catnat_total).fillna(0)
    refusal_rate = 1 - (recon_total / catnat_total)
    refusal_rate.name = "refusal_rate"

    recon_per_peril = (
        data_trans[data_trans["libelle_avis"] == "Reconnue"]
        .groupby(["code_geo", "nom_peril"])
        .size()
        .unstack(fill_value=0)
        .add_prefix("recon_")
    )

    recon_per_peril = recon_per_peril.reindex_like(catnat_per_peril).fillna(0)
    refusal_rate_per_peril = 1 - (
        recon_per_peril / catnat_per_peril.drop(columns="secheresse_share")
    )
    refusal_rate_per_peril = refusal_rate_per_peril.add_prefix("refusal_rate_").fillna(
        0
    )

    recon_per_peril = recon_per_peril.add_prefix("recon_")

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

    penalty_freq.rename(
        columns={
            "freq_Doublée": "freq_double",
            "freq_Triplée": "freq_triple",
            "freq_Quadruplée": "freq_quadruple",
        },
        inplace=True,
    )

    # Fearture per period
    bins = [1984, 2004, 2026]
    labels = ["84_03", "04_25"]
    durations = {"84_03": 20, "04_25": 22}

    data_trans["period"] = pd.cut(
        data_trans["date_debut_evenement"].dt.year,
        bins=bins,
        labels=labels,
        right=False,
    )

    period_catnat_counts = (
        data_trans.groupby(["code_geo", "period"]).size().unstack(fill_value=0)
    )

    period_secheresse_counts = (
        data_trans[data_trans["nom_peril"] == "secheresse"]
        .groupby(["code_geo", "period"])
        .size()
        .unstack(fill_value=0)
    )

    period_refused_counts = (
        data_trans[data_trans["libelle_avis"] != "Reconnue"]
        .groupby(["code_geo", "period"])
        .size()
        .unstack(fill_value=0)
    )

    period_refusal_rate = period_refused_counts.divide(period_catnat_counts).fillna(0)

    def statistical_changes(df, durations=durations):
        epsilon = 1e-6
        cols = list(df.columns)

        for col in cols:
            df[f"vel_{col}"] = df[col] / durations[col]

        for i in range(1, len(cols)):
            curr = cols[i]
            prev = cols[i - 1]

            df[f"change_{curr}"] = (df[curr] + epsilon) / (df[prev] + epsilon)

            df[f"growth_{curr}"] = (df[f"vel_{curr}"] + epsilon) / (
                df[f"vel_{prev}"] + epsilon
            )
            df[f"rank_delta_{curr}"] = df[curr].rank() - df[prev].rank()

        return df

    period_catnat_counts = statistical_changes(period_catnat_counts).add_prefix(
        "catnat_"
    )

    period_refusal_rate = statistical_changes(period_refusal_rate).add_prefix(
        "refusal_rate_"
    )

    period_secheresse_counts = statistical_changes(period_secheresse_counts).add_prefix(
        "secheresse_"
    )

    # Stress Indicators/Features
    def max_consecutive_years(grp):
        years = sorted(grp["year"].unique())
        if not years:
            return 0

        max_streak = 1
        current_streak = 1
        for i in range(1, len(years)):
            if years[i] == years[i - 1] + 1:
                current_streak += 1
            else:
                max_streak = max(max_streak, current_streak)
                current_streak = 1
        return max(max_streak, current_streak)

    data_trans["year"] = data_trans["date_debut_evenement"].dt.year
    years_with_events = data_trans.groupby(["code_geo", "year"]).size().reset_index()

    stress_features = (
        years_with_events.groupby("code_geo").size().to_frame(name="total_years_hit")
    )

    stress_features["persistence_score"] = (
        stress_features["total_years_hit"] / date_range
    )

    stress_features["max_consecutive_streak"] = data_trans.groupby("code_geo").apply(
        max_consecutive_years
    )

    data_trans = data_trans.sort_values(["code_geo", "date_debut_evenement"])
    data_trans["days_since_last"] = (
        data_trans.groupby("code_geo")["date_debut_evenement"].diff().dt.days
    )

    stress_features["avg_recovery_days"] = data_trans.groupby("code_geo")[
        "days_since_last"
    ].mean()

    # ------ MERGING FEATURES ------
    datasets = [
        catnat_total,
        catnat_per_peril,
        freq_catnat_total,
        freq_catnat_per_peril,
        stats_duration_per_peril,
        recon_total,
        recon_per_peril,
        refusal_rate,
        refusal_rate_per_peril,
        penalty_freq,
        period_catnat_counts,
        period_refusal_rate,
        period_secheresse_counts,
        stress_features,
    ]
    final_dataset = pd.concat(datasets, axis=1, join="outer")
    final_dataset = final_dataset.fillna(0)
    print("Shape:", final_dataset.shape)

    # Risk Indicator
    scaler = MinMaxScaler()
    final_dataset["franchise_penalty_score"] = (
        (final_dataset["freq_double"] * 2)
        + (final_dataset["freq_triple"] * 3)
        + (final_dataset["freq_quadruple"] * 4)
    ) / (final_dataset["catnat"] + 1e-9)

    data_to_scale = final_dataset[
        [
            "franchise_penalty_score",
            "refusal_rate_change_04_25",
        ]  # Max consecutive strikes?
    ]
    mixed_scores = scaler.fit_transform(data_to_scale)

    final_dataset["financial_friction_index"] = final_dataset[
        "financial_friction_index"
    ] = np.mean(mixed_scores, axis=1)

    import pdb

    pdb.set_trace()

    if plotting:  # (To finish)
        correlation_df = final_dataset.copy()

        test_columns = [
            "financial_friction_index",
            # "catnat_growth",
            "catnat_inondations",
            "catnat_secheresse",
            "secheresse_share",
            # "secheresse_growth",
            "max_consecutive_streak",
        ]

        corr_matrix = correlation_df[test_columns].corr()

        plt.figure(figsize=(10, 8))
        sns.heatmap(corr_matrix, annot=True, cmap="RdBu_r", center=0)
        plt.title("Is Drought the Driver of Financial Friction?")
        plt.show()

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
