import zipfile
import tarfile
import os
from pathlib import Path
import glob
import shutil
import shapely
from shapely import wkt
from shapely.geometry import Point
import polars as pl


# Configuration

ARCHIVE_PATH = Path("../csv_large/open_data_millesime_2025-07-a_france_csv.tar.gz")
TRI_GPKG = Path("../csv_large/national_tri_2020_optimized.gpkg")
SOURCE_DIR = Path("../csv_large/extracted_france/csv")
PARTITIONS_DIR = Path("../csv_large/bdnb_partitions_all_bats")
OUTPUT_FILE_CLEAN = Path("../csv_large/france_all_bats_clean.parquet")
OUTPUT_FILE_AGG = Path("../csv/france_all_bats_agg.parquet")
TEMP_OUTPUT_DIR = Path("../csv_large/bdnb_processed_chunks_all_bats")

# 2. Compute Centroids and drop the heavy batiment polygons

def compute_centroids_for_partition(dep_dir: str):
    """Loads a BDNB partition, calculates centroids, drops WKT, and overwrites the parquet."""
    
    dep_name = os.path.basename(dep_dir)
    dep_code = dep_name.split('=')[-1]
    
    # We look for the data.parquet file inside the partition folder
    data_files = glob.glob(os.path.join(dep_dir, "*.parquet"))
    
    if not data_files:
        print(f"Skipping {dep_code} - no data files found.")
        return
        
    print(f"\n--- Computing Centroids for Department {dep_code} ---")
    
    for f in data_files:
        try:
            # 1. Load Partition
            df = pl.read_parquet(f)
            
            if "geom_groupe" not in df.columns:
                print(f"  -> {os.path.basename(f)}: Already processed (no 'geom_groupe'). Skipping.")
                continue
                
            print(f"  -> {os.path.basename(f)}: Processing {len(df)} rows...")
            
            # 2. Extract WKT and compute Centroids
            # We use Shapely to parse and compute the centroid
            # Then we convert to WKB (binary) for efficient storage in Parquet
            wkt_list = df["geom_groupe"].to_list()
            
            def get_wkb_centroid(wkt_str):
                if not wkt_str: return None
                try:
                    geom = wkt.loads(wkt_str)
                    return geom.centroid.wkb
                except:
                    return None
            
            # Vectorized-ish approach in Python
            centroids_wkb = [get_wkb_centroid(g) for g in wkt_list]
            
            # 3. Update DataFrame
            df_new = df.with_columns(
                pl.Series("centroid_wkb", centroids_wkb, dtype=pl.Binary)
            ).drop("geom_groupe")
            
            # 4. Save Back
            df_new.write_parquet(f)
            print(f"     Done. Replaced 'geom_groupe' with 'centroid_wkb'.")
            
        except Exception as e:
            print(f"     Error processing {f}: {e}")


## Runs the centroids compute

# Find all partitioned folders
partitions = sorted(glob.glob(str(PARTITIONS_DIR / "code_departement_insee=*")))

if not partitions:
    print(f"No partitions found in {PARTITIONS_DIR}. Did Phase 1 succeed?")
else:
    for p in partitions:
        compute_centroids_for_partition(p)
print("\n--- Centroid Computation Complete for all partitions ---")
