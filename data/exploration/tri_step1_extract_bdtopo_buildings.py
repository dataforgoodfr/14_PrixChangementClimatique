import os
import subprocess
import logging
import json
import shutil
import pandas as pd
import geopandas as gpd
import polars as pl
from pathlib import Path
from typing import List, Optional, Dict
import argparse

# --- Configuration ---
SOURCE_DIR = Path("data/csv_large/BDTOPO")
TEMP_EXTRACT_DIR = Path("data/csv_large/BDTOPO/temp_extract")
CHUNK_DIR = Path("data/csv_large/BDTOPO/chunks")
OUTPUT_FILE = Path("data/csv_large/france_all_bats_clean.parquet")
CHECKPOINT_PATH = Path("data/csv_large/BDTOPO/checkpoint.json")
COMMUNE_INDEX_PATH = Path("data/csv_large/BDTOPO/commune_index.parquet")

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Territories to process (example list, actual determined by filenames)
TERRITORIES = ["FXX", "REU", "GLP", "GUF", "MYT", "MTQ", "MAF", "BLM", "SPM"]

class BDTopoProcessor:
    def __init__(self, target_territory: Optional[str] = None):
        self.target_territory = target_territory
        self.checkpoint = self._load_checkpoint()
        self.commune_gdf: Optional[gpd.GeoDataFrame] = None
        
        # Ensure directories exist
        TEMP_EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
        CHUNK_DIR.mkdir(parents=True, exist_ok=True)

    def _load_checkpoint(self) -> Dict:
        if CHECKPOINT_PATH.exists():
            with open(CHECKPOINT_PATH, 'r') as f:
                return json.load(f)
        return {"processed_archives": []}

    def _save_checkpoint(self):
        with open(CHECKPOINT_PATH, 'w') as f:
            json.dump(self.checkpoint, f, indent=4)

    def _extract_layer(self, archive_path: Path, filename: str) -> Optional[Path]:
        """Extract a GPKG file matching the filename from a 7z archive."""
        logger.info(f"Extracting {filename} from {archive_path.name}...")
        try:
            # Clear previous extractions in the temp dir to avoid confusion
            shutil.rmtree(TEMP_EXTRACT_DIR, ignore_errors=True)
            TEMP_EXTRACT_DIR.mkdir(parents=True, exist_ok=True)

            # 'e' extracts files from archive to the specified directory (flattens)
            # -r is recursive to find it in nested folders
            subprocess.run([
                "7zz", "e", str(archive_path),
                f"-o{TEMP_EXTRACT_DIR}",
                "-y",
                filename,
                "-r"
            ], check=True, capture_output=True)
            
            matches = list(TEMP_EXTRACT_DIR.glob(filename))
            if matches:
                logger.info(f"Successfully extracted: {matches[0]}")
                return matches[0]
            else:
                logger.warning(f"File {filename} not found after extraction.")
                return None
        except Exception as e:
            logger.error(f"Failed to extract {filename} from {archive_path}: {e}")
            return None

    def build_commune_index(self):
        """Phase 1: Build a global national commune lookup index."""
        if COMMUNE_INDEX_PATH.exists() and not self.target_territory:
            logger.info("Commune index already exists. Loading...")
            self.commune_gdf = gpd.read_parquet(COMMUNE_INDEX_PATH)
            return

        logger.info("--- Phase 1: Building Commune Index ---")
        all_communes = []
        
        # Get list of archives
        archives = sorted(list(SOURCE_DIR.glob("*.7z*")))
        unique_archives = []
        archive_names = set()
        
        for a in archives:
            if a.suffix == ".001" or (a.suffix == ".7z" and ".7z." not in a.name):
                archive_base = a.name.split('.7z')[0]
                if archive_base not in archive_names:
                    archive_names.add(archive_base)
                    unique_archives.append(a)

        for a in unique_archives:
            if self.target_territory and self.target_territory not in a.name:
                continue
                
            gpkg_path = self._extract_layer(a, "commune.gpkg")
            if gpkg_path:
                try:
                    df = gpd.read_file(gpkg_path)
                    col_insee = next((c for c in df.columns if 'insee' in c.lower()), None)
                    if col_insee:
                        df = df[[col_insee, 'geometry']].rename(columns={col_insee: 'code_commune_insee'})
                        if df.crs != "EPSG:4326":
                            df = df.to_crs("EPSG:4326")
                        all_communes.append(df)
                        logger.info(f"  Added {len(df)} communes from {a.name}")
                except Exception as e:
                    logger.error(f"Error reading commune layer from {gpkg_path}: {e}")
                finally:
                    shutil.rmtree(TEMP_EXTRACT_DIR, ignore_errors=True)
                    TEMP_EXTRACT_DIR.mkdir(parents=True, exist_ok=True)

        if all_communes:
            self.commune_gdf = gpd.GeoDataFrame(pd.concat(all_communes, ignore_index=True), crs="EPSG:4326")
            if not self.target_territory:
                logger.info(f"Saving indexed commune boundaries ({len(self.commune_gdf)} rows)...")
                self.commune_gdf.to_parquet(COMMUNE_INDEX_PATH)
        elif not self.commune_gdf:
            logger.error("No communes found!")

    def _process_gpkg_in_chunks(self, gpkg_path: Path, archive_id: str):
        """Read a GPKG in chunks, compute centroids, assign communes, and save to parquet."""
        import pyogrio
        try:
            info = pyogrio.read_info(gpkg_path, layer="batiment")
            total_rows = info["features_count"]
            source_crs = info["crs"]
            logger.info(f"  Total buildings in layer: {total_rows} (CRS: {source_crs})")
        except Exception as e:
            logger.warning(f"Could not get building count: {e}")
            total_rows = None

        chunks_saved = 0
        chunk_size = 50000
        
        for offset in range(0, total_rows if total_rows else 10**9, chunk_size):
            try:
                # Use pyogrio for efficient reading
                chunk_df = gpd.read_file(
                    gpkg_path, 
                    layer="batiment", 
                    skip_features=offset, 
                    max_features=chunk_size,
                    columns=["nature", "usage_1", "cleabs"]
                )
                
                if chunk_df.empty:
                    break

                logger.info(f"  -> Processing chunk starting at offset {offset}...")
                
                # Compute centroid in original CRS for accuracy
                # Handle geographic vs projected
                if chunk_df.crs and chunk_df.crs.is_geographic:
                    # Estimate a UTM CRS for local area to get accurate centroid
                    utm_crs = chunk_df.estimate_utm_crs()
                    chunk_df['centroid'] = chunk_df.to_crs(utm_crs).centroid.to_crs(chunk_df.crs)
                else:
                    chunk_df['centroid'] = chunk_df.geometry.centroid

                # Convert centroid to 4326 for final output and join
                chunk_df = chunk_df.set_geometry('centroid').to_crs("EPSG:4326")
                chunk_df['lon'] = chunk_df.geometry.x
                chunk_df['lat'] = chunk_df.geometry.y

                # Fallback for special territories (like BLM, MAF) where commune.gpkg is missing
                SPECIAL_TERRITORY_CODES = {"BLM": "97701", "MAF": "97127"}
                
                # Identify if the current archive is a special territory
                territory_code = next((k for k in SPECIAL_TERRITORY_CODES if k in archive_id), None)
                
                if territory_code:
                    chunk_df['code_commune_insee'] = SPECIAL_TERRITORY_CODES[territory_code]
                    logger.info(f"  Applied fixed INSEE code {SPECIAL_TERRITORY_CODES[territory_code]} for {territory_code}")
                elif self.commune_gdf is not None:
                    # Spatial join with communes
                    chunk_df = gpd.sjoin(chunk_df, self.commune_gdf, how="left", predicate="within")
                    if 'index_right' in chunk_df.columns:
                        chunk_df = chunk_df.drop(columns=['index_right'])
                else:
                    chunk_df['code_commune_insee'] = None

                # Drop geometry and columns not needed
                cols_to_keep = ['cleabs', 'nature', 'usage_1', 'code_commune_insee', 'lon', 'lat']
                final_chunk = pd.DataFrame(chunk_df[cols_to_keep])
                
                # Save chunk to parquet
                chunk_out = CHUNK_DIR / f"{archive_id}_chunk_{offset}.parquet"
                final_chunk.to_parquet(chunk_out)
                chunks_saved += 1

            except Exception as e:
                logger.error(f"Error processing chunk at offset {offset}: {e}")
                continue
        
        logger.info(f"  Saved {chunks_saved} chunks for {archive_id}")

    def process_buildings(self):
        """Phase 2: Extract and process buildings territory by territory."""
        logger.info("--- Phase 2: Processing Buildings ---")
        
        archives = sorted(list(SOURCE_DIR.glob("*.7z*")))
        unique_archives = []
        archive_names = set()
        
        for a in archives:
             if a.suffix == ".001" or (a.suffix == ".7z" and ".7z." not in a.name):
                archive_base = a.name.split('.7z')[0]
                if archive_base not in archive_names:
                    archive_names.add(archive_base)
                    unique_archives.append(a)

        for archive in unique_archives:
            if self.target_territory and self.target_territory not in archive.name:
                continue

            archive_id = archive.name
            if archive_id in self.checkpoint["processed_archives"] and not self.target_territory:
                logger.info(f"Skipping {archive_id} (Already processed)")
                continue

            gpkg_path = self._extract_layer(archive, "batiment.gpkg")
            if not gpkg_path:
                logger.warning(f"Could not find batiment.gpkg in {archive_id}")
                continue

            logger.info(f"Processing buildings from {gpkg_path}...")
            self._process_gpkg_in_chunks(gpkg_path, archive_id)
            
            if not self.target_territory:
                self.checkpoint["processed_archives"].append(archive_id)
                self._save_checkpoint()
            
            shutil.rmtree(TEMP_EXTRACT_DIR, ignore_errors=True)
            TEMP_EXTRACT_DIR.mkdir(parents=True, exist_ok=True)

    def finalize(self):
        """Phase 3: Aggregation of all chunks into one Parquet file."""
        logger.info("--- Phase 3: Finalizing Aggregation ---")
        
        chunk_files = list(CHUNK_DIR.glob("*.parquet"))
        if not chunk_files:
            logger.warning("No processed chunks found.")
            return

        logger.info(f"Aggregating {len(chunk_files)} chunks...")
        
        # Use Polars for fast aggregation
        df = pl.read_parquet(str(CHUNK_DIR / "*.parquet"))
        
        # Save final result
        df.write_parquet(OUTPUT_FILE)
        logger.info(f"Success! Final data saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract buildings from BD TOPO GPKG archives.")
    parser.add_argument("--territory", type=str, help="Code of the territory to process (e.g., MYT, REU, FXX)")
    args = parser.parse_args()

    processor = BDTopoProcessor(target_territory=args.territory)
    processor.build_commune_index()
    processor.process_buildings()
    processor.finalize()
