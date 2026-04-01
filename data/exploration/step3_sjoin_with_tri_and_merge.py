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
import geopandas as gpd

# Configuration

ARCHIVE_PATH = Path("../csv_large/open_data_millesime_2025-07-a_france_csv.tar.gz")
TRI_GPKG = Path("../csv_large/national_tri_2020_optimized.gpkg")
SOURCE_DIR = Path("../csv_large/extracted_france/csv")
PARTITIONS_DIR = Path("../csv_large/bdnb_partitions_all_bats")
OUTPUT_FILE_CLEAN = Path("../csv_large/france_all_bats_clean.parquet")
OUTPUT_FILE_AGG = Path("../csv_large/france_all_bats_agg.parquet")
TEMP_OUTPUT_DIR = Path("../csv_large/bdnb_processed_chunks_all_bats")

# 3. Spatial sjoin to identify batiments in TRI

def process_department(dep_dir: str):
    """Loads a BDNB partition, and spatial joins with TRI flood zones."""
    
    # Extract department code from directory name, e.g., 'code_departement_insee=01'
    dep_name = os.path.basename(dep_dir)
    dep_code = dep_name.split('=')[-1]
    
    out_file = TEMP_OUTPUT_DIR / f"processed_{dep_code}.parquet"
    if out_file.exists():
        print(f"Skipping {dep_code} - chunk already exists.")
        return
        
    print(f"\n--- Processing Department {dep_code} ---")
    
    ## 1. Load the BDNB Partition
    try:
        df_bats = pl.read_parquet(os.path.join(dep_dir, "*.parquet"))
    except Exception as e:
        print(f"Error loading BDNB partition for {dep_code}: {e}")
        return

    if df_bats.is_empty():
        print(f"No batiments found for {dep_code}. Skipping.")
        return
        
    print(f"Loaded {len(df_bats)} batiments.")
    
    ## 2. Load Centroids from WKB
    print("Loading pre-computed Centroids from WKB...")
    if "centroid_wkb" not in df_bats.columns:
        print(f"Error: 'centroid_wkb' not found in department {dep_code}. Did you run scripts/compute_centroids.py?")
        return
        
    # Speed: shapely.from_wkb is extremely fast on binary series
    geometries = [shapely.from_wkb(g) if g else None for g in df_bats["centroid_wkb"].to_list()]
    
    # Create GeoDataFrame
    gdf_bats = gpd.GeoDataFrame(
        df_bats.drop("centroid_wkb").to_pandas(), 
        geometry=geometries, 
        crs="EPSG:2154" # BDNB coordinates are in Lambert 93
    )
    
    ## 3. Load TRI Flood Zone Geometries
    print(f"Loading TRI Flood Zones for department {dep_code}...")
    try:
        where_clause = f"dep_code = '{dep_code}'"
        gdf_tri = gpd.read_file(
            TRI_GPKG, 
            layer="national_flood_extents",
            where=where_clause,
            engine="pyogrio",
            columns=["scenario_val", "typ_inond"]
        )
        print(f"Loaded {len(gdf_tri)} flood zones.")
    except Exception as e:
        print(f"Error loading TRI for {dep_code}: {e}")
        gdf_tri = gpd.GeoDataFrame()

    ## 4. Initialize columns and Spatial Join
    gdf_bats['scenario_inondation'] = "00Nul"
    gdf_bats['type_inondation'] = "Aucun"

    if gdf_tri.empty:
        print(f"No flood zones recorded for department {dep_code}.")
    else:
        print(f"Executing Spatial Join (sjoin) on {len(gdf_bats)} batiments...")
        
        # Ensure CRS match
        if gdf_bats.crs != gdf_tri.crs:
            gdf_bats = gdf_bats.to_crs(gdf_tri.crs)
            
        # left join avoids dropping batiments outside the flood zones
        joined = gpd.sjoin(gdf_bats, gdf_tri, how="left", predicate="intersects")
        
        # Priority Logic: Keep the highest risk scenario
        scenario_priority = {'01For': 0, '02Moy': 1, '04Fai': 2, 'Unknown': 3}
        joined['priority'] = joined['scenario_val'].map(scenario_priority).fillna(99)
        joined = joined.sort_values(by=['priority'])
        joined = joined[~joined.index.duplicated(keep='first')]
        
        # Populate the fields
        gdf_bats['scenario_inondation'] = joined['scenario_val'].fillna("00Nul")
        gdf_bats['type_inondation'] = joined['typ_inond'].fillna("Aucun")
        print("Join complete.")

    ## 5. Save Chunk
    print(f"Saving chunk for {dep_code}...")

    wkb_geometries = shapely.to_wkb(gdf_bats.geometry) # We convert centroids to wkb since from_pandas does not support the type geometries
    
    df_final = (
        pl.from_pandas(gdf_bats.drop(columns=['geometry']))
        .with_columns(pl.Series("geometry", wkb_geometries))
    )

    df_final.write_parquet(out_file)
    print("Done.\n")


def consolidate_results():
    print(f"\n--- Consolidating chunks into {OUTPUT_FILE_CLEAN} ---")
    chunks = glob.glob(str(TEMP_OUTPUT_DIR / "*.parquet"))
    if not chunks:
        print("No chunks found to consolidate.")
        return
        
    print(f"Merging {len(chunks)} fragments...")
    try:
        # Use scanning to merge potentially large fragmented results efficiently
        df_all = pl.scan_parquet(str(TEMP_OUTPUT_DIR / "*.parquet")).collect(engine='streaming')
        df_all.write_parquet(OUTPUT_FILE_CLEAN)
        print(f"Successfully consolidated {len(df_all)} batiments into {OUTPUT_FILE_CLEAN}")
        
        # Optional: Print summary
        print(df_all["scenario_inondation"].value_counts())
        
    except Exception as e:
        print(f"Consolidation failed: {e}")
                

## Run Inondations lookup
## NOTE: DELETE the bdnb_processed_chunks folder before re-running this

TEMP_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if not TRI_GPKG.exists():
    print(f"CRITICAL ERROR: {TRI_GPKG} not found!")
else:
    # Find all partitioned folders
    partitions = glob.glob(str(PARTITIONS_DIR / "code_departement_insee=*"))

    if not partitions:
        print(f"No partitions found in {PARTITIONS_DIR}. Did Phase 1 succeed?")
    else:
        for p in sorted(partitions):
            process_department(p)

        # Final Merge
        consolidate_results()   
