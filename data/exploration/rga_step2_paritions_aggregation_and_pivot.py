import polars as pl
from pathlib import Path

# Paths (Relative to data/exploration)
PARTITIONS_DIR = Path("../csv_large/bdnb_partitions")
OUTPUT_FILE_AGG = Path("../csv/rga_houses_flat.csv")

def aggregate_national():
    """Scans all partitions and aggregates counts by commune, period and RGA level."""
    print(f"\n--- Phase 2: National Aggregation ---")
    
    # 1. Scan all paritioned parquet files
    # Using glob pattern to pick up all partitioned departments
    partition_pattern = str(PARTITIONS_DIR / "*" / "*.parquet")
    print(f"Scanning partitions: {partition_pattern}")
    
    try:
        # Use scan_parquet for lazy evaluation
        df_all = pl.scan_parquet(partition_pattern)
    except Exception as e:
        print(f"Error scanning partitions: {e}")
        return None
    
    # 2. Aggregation Plan
    # Only keeping RGA relevant columns
    print("Building aggregation plan...")
    
    agg_plan = (
        df_all
        .group_by(["code_commune_insee", "periode_construction", "alea_argile"])
        .agg(pl.len().alias("nb_maisons"))
    )
    
    # 3. Execute
    print("Executing aggregation (streaming)...")
    df_agg = agg_plan.collect(streaming=True)
    
    print(f"Aggregated into {df_agg.height} rows.")
    return df_agg

def flatten_commune_data(df: pl.DataFrame) -> pl.DataFrame:
    """Pivots the aggregated data to produce one row per commune with detailed counts."""
    print(f"\n--- Phase 3: Flattening and Pivoting ---")
    
    # 1. Standardize/Clean values for column names
    # Period mappings
    p_map = {
        'Avant 1945': 'pre1945',
        '1945-1975': '1945-1975', 
        '1976-2020': '1976-2020',
        'Après 2020': 'post2020',
        'Inconnue': 'unk'
    }
    # RGA Level mappings
    level_map = {
        'Nul': 'nul', 'Faible': 'faible', 'Moyen': 'moyen', 'Fort': 'fort'
    }
    
    # 2. Map values using Polars replace
    df = df.with_columns([
        pl.col("periode_construction").replace(p_map).alias("p"),
        pl.col("alea_argile").replace(level_map).alias("rga")
    ])
    
    # 3. Compute total houses per commune
    df_totals = (
        df.group_by("code_commune_insee")
        .agg(pl.sum("nb_maisons").alias("nb_maisons_total"))
    )
    
    # 4. Pivot for RGA counts: rga_[period]_[level]
    # We first create a combined column name to pivot on
    df_pivot = (
        df.with_columns(
            (pl.col("p") + pl.lit("_") + pl.col("rga")).alias("pivot_col")
        )
        .pivot(
            values="nb_maisons",
            index="code_commune_insee",
            on="pivot_col",
            aggregate_function="sum"
        )
        .fill_null(0)
    )
    
    # 5. Final Merge
    df_final = df_totals.join(df_pivot, on="code_commune_insee", how="left")
    
    # 6. Exposition and Percentages (inspired by tri_step3)
    # Exposition defined as Moyen or Fort (Argile) or Faible? 
    # Usually in RGA, Moyen and Fort are the main concerns, 
    # but the user asked like in TRI script which uses all risk suffixes.
    risk_suffixes = ["_faible", "_moyen", "_fort"]
    risk_cols = [c for c in df_final.columns if any(c.endswith(s) for s in risk_suffixes)]
    
    df_final = df_final.with_columns([
        pl.sum_horizontal(risk_cols).alias("nb_maisons_exposition_rga")
    ]).with_columns([
        pl.when(pl.col("nb_maisons_total") > 0)
        .then(pl.col("nb_maisons_exposition_rga") / pl.col("nb_maisons_total"))
        .otherwise(0.0)
        .alias("pct_exposition_rga")
    ])

    # Sort for convenience
    df_final = df_final.sort("code_commune_insee")
    
    print(f"Final flat table contains {df_final.height} communes.")
    return df_final

if __name__ == "__main__":
    df_agg = aggregate_national()
    
    if df_agg is not None:
        df_flat = flatten_commune_data(df_agg)
        
        # Ensure output directory exists
        OUTPUT_FILE_AGG.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"Saving to {OUTPUT_FILE_AGG}...")
        df_flat.write_csv(OUTPUT_FILE_AGG)
        
        print("\nPreview of final data:")
        print(df_flat.head(10))
