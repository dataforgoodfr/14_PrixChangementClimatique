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
DOCKERFILE_PATH = SCRIPT_DIR / "tippecanoe.Dockerfile"
DOCKER_IMAGE = "tippecanoe-local"
REPO_ROOT = SCRIPT_DIR.parent.parent
WEBSITE_DIR = REPO_ROOT / "website"

DUCKDB_PATH = REPO_ROOT / "data" / "exploration" / "dev.duckdb"
CACHE_DIR = REPO_ROOT / ".cache"
GEOJSON_PATH = CACHE_DIR / "communes.geojsonl"
PMTILES_PATH = WEBSITE_DIR / "public/pmtiles/communes.pmtiles"

TIPPECANOE_ARGS = [
    "-zg",
    "-l",
    "communes",
    "--coalesce-densest-as-needed",
    "--extend-zooms-if-still-dropping",
    "--force",
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
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print(f"Error: command exited with code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)


def ensure_docker_image():
    result = subprocess.run(
        ["docker", "image", "inspect", DOCKER_IMAGE],
        capture_output=True,
    )
    if result.returncode != 0:
        print(
            f"  Building Docker image '{DOCKER_IMAGE}' from {DOCKERFILE_PATH.name}..."
        )
        build = subprocess.run(
            [
                "docker",
                "build",
                "-f",
                str(DOCKERFILE_PATH),
                "-t",
                DOCKER_IMAGE,
                str(SCRIPT_DIR),
            ]
        )
        if build.returncode != 0:
            print(
                f"Error: docker build failed with code {build.returncode}",
                file=sys.stderr,
            )
            sys.exit(build.returncode)


def generate_pmtiles():
    print("Step 2: generating PMTiles...")
    PMTILES_PATH.parent.mkdir(parents=True, exist_ok=True)

    if shutil.which("tippecanoe"):
        run_tippecanoe(
            ["tippecanoe"]
            + TIPPECANOE_ARGS
            + ["-o", str(PMTILES_PATH), str(GEOJSON_PATH)]
        )
    elif shutil.which("docker"):
        print("  tippecanoe not found locally, using Docker...")
        ensure_docker_image()
        run_tippecanoe(
            [
                "docker",
                "run",
                "--rm",
                "-v",
                f"{GEOJSON_PATH.parent}:/data/geojson",
                "-v",
                f"{PMTILES_PATH.parent}:/data/pmtiles",
                DOCKER_IMAGE,
                "tippecanoe",
            ]
            + TIPPECANOE_ARGS
            + [
                "-o",
                f"/data/pmtiles/{PMTILES_PATH.name}",
                f"/data/geojson/{GEOJSON_PATH.name}",
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
