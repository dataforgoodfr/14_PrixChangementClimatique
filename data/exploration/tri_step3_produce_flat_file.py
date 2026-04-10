import polars as pl

# 1. Chargement
df_agg = pl.read_parquet("../csv_large/france_all_bats_agg.parquet")

# 2. Simplification et Regroupement des usages
# - Service au lieu de Tertiaire
# - Regroupement de (Annexe, Sportif, Religieux, Indifférencié) en 'Autres'
usage_map = {
    "Résidentiel": "resid",
    "Commercial et services": "rervice",
    "Agricole": "agri",
    "Industriel": "indus",
    "Annexe": "autres",
    "Sportif": "autres",
    "Religieux": "autres",
    "Indifférencié": "autres"
}

level_map = {
        '00Nul': 'nul', '04Fai': 'faible', '02Moy': 'moyen', '01For': 'fort'
    }

df_prep = (
    df_agg
    .with_columns(pl.col("usage_1").replace(usage_map))
    .with_columns(pl.col("scenario_inondation").replace(level_map))
    # On crée la clé de pivot combinée : "Usage_Scenario"
    .with_columns((pl.col("usage_1") + "_" + pl.col("scenario_inondation")).alias("pivot_key"))
    # Regroupement final (nécessaire car plusieurs 'Autres' vont fusionner)
    .group_by(["code_commune_insee", "pivot_key"])
    .agg(pl.col("count_batiments").sum())
)

# 3. Pivot
df_flat = (
    df_prep.pivot(
        index=["code_commune_insee"],
        columns="pivot_key",
        values="count_batiments",
        aggregate_function="sum"
    )
    .fill_null(0)
)

# 4. Calcul des totaux et synthèse
# On identifie les colonnes par suffixes de risque
risk_suffixes = ["_fort", "_moyen", "_faible"]
risk_cols = [c for c in df_flat.columns if any(c.endswith(s) for s in risk_suffixes)]
all_val_cols = [c for c in df_flat.columns if c not in ["code_commune_insee"]]

df_flat = df_flat.with_columns([
    pl.sum_horizontal(all_val_cols).alias("nb_bats_total"),
    pl.sum_horizontal(risk_cols).alias("nb_bats_exposition_tri")
]).with_columns([
    pl.when(pl.col("nb_bats_total") > 0)
    .then(pl.col("nb_bats_exposition_tri") / pl.col("nb_bats_total"))
    .otherwise(0.0)
    .alias("pct_exposition_tri")
])

df_flat = df_flat.sort(["code_commune_insee"])

print(f"Dataset consolidé : {df_flat.shape[0]} communes.")
print(f"Colonnes générées : {sorted([c for c in df_flat.columns if '_' in c])}")

# Save the flat file
df_flat.write_csv('../csv/tri_all_bats_flat.csv')