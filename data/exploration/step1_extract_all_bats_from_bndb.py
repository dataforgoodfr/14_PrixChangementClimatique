# Load necessary imports and variables
import polars as pl
import zipfile
import tarfile
import os
from pathlib import Path
import glob
import shutil
import shapely
from shapely import wkt
from shapely.geometry import Point


# Configuration

ARCHIVE_PATH = Path("../csv_large/open_data_millesime_2025-07-a_france_csv.tar.gz")
TRI_GPKG = Path("../csv_large/national_tri_2020_optimized.gpkg")
SOURCE_DIR = Path("../csv_large/extracted_france/csv")
PARTITIONS_DIR = Path("../csv_large/bdnb_partitions_all_bats")
OUTPUT_FILE_CLEAN = Path("../csv_large/france_all_bats_clean.parquet")
OUTPUT_FILE_AGG = Path("../csv/france_all_bats_agg.parquet")
TEMP_OUTPUT_DIR = Path("../csv_large/bdnb_processed_chunks_all_bats")

# Relevant files in the archive (standard paths for France dump often have ./ prefixes or different nesting)
# We will search for these suffixes
REQUIRED_SUFFIXES = [
    "batiment_groupe.csv",
    "batiment_groupe_risques.csv",
    "batiment_groupe_ffo_bat.csv",
    "batiment_groupe_synthese_propriete_usage.csv"
]

# 1. Partition the data by departement and join tables

# List of files we need
FILES = {
    'usage': 'batiment_groupe_synthese_propriete_usage.csv',
    'base': 'batiment_groupe.csv',
    'risques': 'batiment_groupe_risques.csv',
    'ffo': 'batiment_groupe_ffo_bat.csv'
}
paths = {key: SOURCE_DIR / filename for key, filename in FILES.items()}

def get_construction_period():
    """Returns a Polars expression for construction period grouping (INSEE Standard)."""
    return (
        pl.when(pl.col("annee_construction").is_null()).then(pl.lit("Inconnue"))
        .when(pl.col("annee_construction") < 1945).then(pl.lit("Avant 1945"))
        .when(pl.col("annee_construction") < 1976).then(pl.lit("1945-1975"))
        .when(pl.col("annee_construction") < 2020).then(pl.lit("1976-2020"))
        .otherwise(pl.lit("Après 2020"))
        .alias("periode_construction")
    )

def partition_data():
    print(f"\n--- Phase 1: Partitioning BDNB Data by Department ---")
    print(f"Reading from {SOURCE_DIR}")
    
    # 1. Define the list of departments for Metropolitan France
    # 01-19, 2A, 2B, 21-95
    print("Setting target scope: Metropolitan France...")
    deps_numeric = [str(i).zfill(2) for i in range(1, 96) if i != 20]
    deps = sorted(deps_numeric + ["2A", "2B"])
    print(f"Targeting {len(deps)} departments (01-95, including 2A/2B).")

    # 2. Iterate through departments
    with pl.StringCache():
        for dep in deps:
            out_path = PARTITIONS_DIR / f"code_departement_insee={dep}"
            target_file = out_path / "data.parquet"
            
            if target_file.exists():
                print(f"  -> Skipping Department {dep} (Already partitioned)")
                continue
                
            print(f"  -> Processing Department {dep}...")
            
            # Create isolated scans FOR THIS DEPARTMENT ONLY
            # By applying the filter immediately on the scan, Polars can push down the predicate
            # to the CSV reader, massively reducing the size of the data before the join.
            
            q_base = (
                pl.scan_csv(paths['base'], separator=';', 
                           infer_schema_length=10000, 
                           schema_overrides={"code_departement_insee": pl.String, "code_commune_insee": pl.String})
                .with_columns(pl.col("code_departement_insee").cast(pl.String).str.zfill(2))
                .filter(pl.col("code_departement_insee") == dep)
                .select(["batiment_groupe_id", "code_departement_insee", "code_commune_insee", "geom_groupe"])
            )
            
            # For the other files, it might be faster to just load the whole thing into memory once 
            # if they are small enough, but joining the scans is safer memory-wise.
            q_usage = (
                pl.scan_csv(paths['usage'], separator=';', infer_schema_length=10000)
                # .filter(pl.col("usage_principal_bdnb_open") == "Résidentiel individuel")
                .select(["batiment_groupe_id", "usage_principal_bdnb_open"])
            )
            q_risks = (
                pl.scan_csv(paths['risques'], separator=';', infer_schema_length=10000)
                .select(["batiment_groupe_id", "alea_argile"])
            )
            q_ffo = (
                pl.scan_csv(paths['ffo'], separator=';', infer_schema_length=10000)
                .select(["batiment_groupe_id", "annee_construction"])
            )
            
            # The join focuses ONLY on the department's geometry rows
            plan = (
                q_base
                .join(q_usage, on="batiment_groupe_id", how="inner") # Inner join immediately filters to residentiel
                .with_columns([
                    pl.col("code_commune_insee").cast(pl.String).str.zfill(5),
                    pl.col("usage_principal_bdnb_open")    
                ])
            )
            
            try:
                # This should now execute relatively quickly per department since the 
                # massive geometries are only loaded for the specific department
                out_path.mkdir(exist_ok=True, parents=True)
                plan.sink_parquet(target_file)
            except Exception as e:
                print(f"     Error processing {dep}: {e}")


PARTITIONS_DIR.mkdir(parents=True, exist_ok=True)

partition_data()
