import os
from pathlib import Path
import polars as pl
import geopandas as gpd
import shapely
from typing import List

"""
Script: step4_aggregate_with_tri.py
Description: Aggregates buildings by commune, nature, usage_1, and TRI risk level.
Approach: Processes data department-by-department for memory efficiency.
"""

# Configuration
SOURCE_FILE = Path("../csv_large/france_all_bats_clean.parquet")
INSEE_FILE = Path("../csv/insee_cog_2026_communes.parquet")
TRI_GPKG = Path("../csv_large/national_tri_2020_optimized.gpkg")
OUTPUT_FILE = Path("../csv_large/france_all_bats_agg.parquet")

def process_aggregation():
    print(f"Starting aggregation process...")
    
    # 1. Load INSEE mapping (Commune -> Department)
    print(f"Loading INSEE reference from {INSEE_FILE}...")
    insee_df = pl.read_parquet(INSEE_FILE)
    # Filter 'COM' to avoid arrondissements (PLM) and keep mapping
    insee_mapping = insee_df.filter(pl.col("TYPECOM") == "COM").select([
        pl.col("COM").alias("code_commune_insee"), 
        pl.col("DEP").alias("dep_code")
    ])
    
    # 2. Prepare lazy loading of buildings
    print(f"Scanning source file {SOURCE_FILE}...")
    # Join with insee_mapping to get dep_code for each building
    lazy_bats = (
        pl.scan_parquet(SOURCE_FILE)
        .join(insee_mapping.lazy(), on="code_commune_insee", how="left")
    )
    
    # 3. Identify unique departments to process
    # We collect only the dep_code column to get the list
    all_deps = lazy_bats.select("dep_code").drop_nulls().unique().sort("dep_code").collect()["dep_code"].to_list()
    print(f"Found {len(all_deps)} departments to process.")
    
    agg_chunks = []
    
    # Priority logic for TRI scenarios (same as step3)
    scenario_priority = {'01For': 0, '02Moy': 1, '04Fai': 2, 'Unknown': 3}

    for dep in all_deps:
        print(f"\n--- Processing Department {dep} ---")
        
        # Load buildings for this department
        df_dep = lazy_bats.filter(pl.col("dep_code") == dep).collect()
        if df_dep.is_empty():
            continue
            
        print(f"Loaded {len(df_dep)} buildings.")
        
        # Geometry: Create Points from lon/lat
        geometries = [shapely.points(x, y) for x, y in zip(df_dep["lon"], df_dep["lat"])]
        gdf_bats = gpd.GeoDataFrame(
            df_dep.to_pandas(),
            geometry=geometries,
            crs="EPSG:4326"
        )
        
        # 4. Load TRI zones for this department
        try:
            where_clause = f"dep_code = '{dep}'"
            gdf_tri = gpd.read_file(
                TRI_GPKG, 
                layer="national_flood_extents",
                where=where_clause,
                engine="pyogrio",
                columns=["scenario_val", "typ_inond"]
            )
            
            # Ensure CRS match dynamically
            if not gdf_tri.empty and gdf_tri.crs != gdf_bats.crs:
                print(f"Reprojecting buildings from {gdf_bats.crs} to {gdf_tri.crs}...")
                gdf_bats = gdf_bats.to_crs(gdf_tri.crs)
                
        except Exception as e:
            print(f"Warning: Could not load TRI for {dep}: {e}")
            gdf_tri = gpd.GeoDataFrame()

        # Initial default values
        gdf_bats['scenario_inondation'] = "00Nul"
        gdf_bats['type_inondation'] = "Aucun"

        if not gdf_tri.empty:
            print(f"Executing spatial join with {len(gdf_tri)} flood zones...")
            # Spatial join (points in polygons)
            joined = gpd.sjoin(gdf_bats, gdf_tri, how="left", predicate="intersects")
            
            # Risk Priority: Keep only the highest risk per building
            joined['priority'] = joined['scenario_val'].map(scenario_priority).fillna(99)
            joined = joined.sort_values(by=['priority'])
            joined = joined[~joined.index.duplicated(keep='first')]
            
            gdf_bats['scenario_inondation'] = joined['scenario_val'].fillna("00Nul")
            gdf_bats['type_inondation'] = joined['typ_inond'].fillna("Aucun")
        else:
            print("No flood zones in this department.")

        # 5. Local Aggregation (Memory saver)
        df_joined = pl.from_pandas(gdf_bats.drop(columns=['geometry']))
        dep_agg = (
            df_joined.group_by([
                "dep_code",
                "code_commune_insee", 
                "nature", 
                "usage_1", 
                "scenario_inondation", 
                "type_inondation"
            ])
            .agg(pl.len().alias("count_batiments"))
        )
        
        agg_chunks.append(dep_agg)
        print(f"Aggregation done for {dep}: {len(dep_agg)} groups.")

    # 6. Final Consolidation
    if agg_chunks:
        print("\nConsolidating all departments...")
        final_df = pl.concat(agg_chunks)
        
        # Re-aggregate in case some groups span multiple chunks (rare but possible for communes)
        final_df = (
            final_df.group_by([
                "dep_code",
                "code_commune_insee", 
                "nature", 
                "usage_1", 
                "scenario_inondation", 
                "type_inondation"
            ])
            .agg(pl.col("count_batiments").sum())
            .sort(["dep_code", "code_commune_insee", "scenario_inondation"])
        )
        
        print(f"Saving {len(final_df)} rows to {OUTPUT_FILE}...")
        final_df.write_parquet(OUTPUT_FILE)
        print("Done!")
    else:
        print("No data aggregated.")

if __name__ == "__main__":
    process_aggregation()
