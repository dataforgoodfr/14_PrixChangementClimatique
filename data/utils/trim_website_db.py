"""
Build a trimmed website.duckdb from dev.duckdb (data/exploration/).

Extracts all tables from the `main_serving` schema of dev.duckdb and copies
them into the `main` schema of website.duckdb. Used by the website build
pipeline before Docker image creation.
"""

import logging
import os
from pathlib import Path

import duckdb

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent

DATA_DIR = REPO_ROOT / "data" / "exploration"

FILES = {
    "dev": "dev.duckdb",
    "website": "website.duckdb",
}

DEV_PATH = DATA_DIR / FILES["dev"]
WEBSITE_PATH = DATA_DIR / FILES["website"]


def db_size(path: str) -> str:
    if not os.path.exists(path):
        return "n/a"
    size = os.path.getsize(path)
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


if WEBSITE_PATH.exists():
    WEBSITE_PATH.unlink()
    log.info("Ancien website.duckdb supprimé")

con = duckdb.connect(WEBSITE_PATH)
con.execute(f"ATTACH '{DEV_PATH}' AS dev (READ_ONLY)")
con.execute("CREATE SCHEMA IF NOT EXISTS main_serving")

tables = con.execute("""
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'main_serving'
    AND table_catalog = 'dev'
""").fetchall()

log.info(f"{len(tables)} tables 'serving' trouvées dans dev.duckdb")

for (table_name,) in tables:
    rows = con.execute(
        f"SELECT COUNT(*) FROM dev.main_serving.{table_name}"
    ).fetchone()[0]
    con.execute(f"""
        CREATE OR REPLACE TABLE main_serving.{table_name}
        AS SELECT * FROM dev.main_serving.{table_name}
    """)
    log.info(f"  ✅ {table_name} ({rows:,} lignes)")

con.close()

log.info(f"dev.duckdb     : {db_size(DEV_PATH)}")
log.info(f"website.duckdb : {db_size(WEBSITE_PATH)}")
