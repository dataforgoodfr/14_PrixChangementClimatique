#!/usr/bin/env python3
"""
build_pmtiles.py
Export resultats_website_par_commune from DuckDB → GeoJSON → PMTiles

Usage:
    uv run data/utils/build_pmtiles.py

Requirements:
    - duckdb (already in pyproject.toml)
    - tippecanoe (https://github.com/felt/tippecanoe) installed locally OR Docker available
"""

import shutil
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
WEBSITE_DIR = REPO_ROOT / "website"

DUCKDB_PATH = REPO_ROOT / "data" / "exploration" / "dev.duckdb"
CACHE_DIR = REPO_ROOT / ".cache"
GEOJSON_PATH = CACHE_DIR / "communes.geojsonl"
PMTILES_PATH = WEBSITE_DIR / "public/pmtiles/communes.pmtiles"

TIPPECANOE_ARGS = [
    "-zg",
    "-o",
    str(PMTILES_PATH),
    "-l",
    "communes",
    "--coalesce-densest-as-needed",
    "--extend-zooms-if-still-dropping",
    "--force",
    str(GEOJSON_PATH),
]


# ── Step 1: Export GeoJSON from DuckDB ────────────────────────────────────────


def export_geojson():
    import duckdb

    print(f"Step 1: exporting GeoJSON from DuckDB ({DUCKDB_PATH})...")
    print(f"  (intermediate file: {GEOJSON_PATH})")
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    conn = duckdb.connect(str(DUCKDB_PATH), read_only=True)
    conn.execute("LOAD spatial")
    conn.execute(f"""
        COPY (
            SELECT
                * EXCLUDE (geometry),
                ST_GeomFromText(geometry) AS geometry
            FROM resultats_website_par_commune
        )
        TO '{GEOJSON_PATH}' (FORMAT GDAL, DRIVER 'GeoJSONSeq')
    """)
    conn.close()

    count = sum(1 for line in open(GEOJSON_PATH) if line.strip())
    print(f"  → {count} features written to {GEOJSON_PATH}")


# ── Step 2: GeoJSON → PMTiles ──────────────────────────────────────────────────


def run_tippecanoe(cmd: list[str]):
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print(f"Error: command exited with code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)


def generate_pmtiles():
    print("Step 2: generating PMTiles...")
    PMTILES_PATH.parent.mkdir(parents=True, exist_ok=True)

    if shutil.which("tippecanoe"):
        run_tippecanoe(["tippecanoe"] + TIPPECANOE_ARGS)
    elif shutil.which("docker"):
        print(
            "  tippecanoe not found locally, using Docker (ghcr.io/felt/tippecanoe)..."
        )
        run_tippecanoe(
            [
                "docker",
                "run",
                "--rm",
                "-v",
                f"{GEOJSON_PATH.parent}:/geojson",
                "-v",
                f"{PMTILES_PATH.parent}:/pmtiles",
                "ghcr.io/felt/tippecanoe",
                "tippecanoe",
                "-zg",
                "-o",
                "/pmtiles/communes.pmtiles",
                "-l",
                "communes",
                "--coalesce-densest-as-needed",
                "--extend-zooms-if-still-dropping",
                "--force",
                "/geojson/communes.geojson",
            ]
        )
    else:
        print(
            "Error: neither tippecanoe nor docker found. Install one of them.",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    export_geojson()
    generate_pmtiles()
    GEOJSON_PATH.unlink()
    print(f"Done: {PMTILES_PATH}")
