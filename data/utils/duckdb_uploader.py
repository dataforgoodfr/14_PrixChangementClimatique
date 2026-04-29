"""
Upload DuckDB database files to S3.

Usage:
    python upload.py
        -> uploads dev.duckdb

    python upload.py --website
        -> uploads website.duckdb

Behavior:
- Selects which local DuckDB file to upload based on CLI argument
- Uses S3 credentials from environment (.env file)
- Uploads file to S3 bucket defined by S3_PCC_BUCKET
- Overwrites remote file if it already exists (replace=True)

Available targets:
    - dev
    - website

Dependencies:
- s3_connector (get_s3_client, send_large_file_to_s3)
- python-dotenv
"""

from s3_connector import get_s3_client, send_large_file_to_s3
from pathlib import Path
import os
from dotenv import load_dotenv
import sys

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent

# Constantes
DATA_DIR = REPO_ROOT / "data" / "dbt_pipeline"

FILES = {
    "dev": "dev.duckdb",
    "website": "website.duckdb",
}

DEFAULT_MODE = "dev"

load_dotenv(Path.cwd() / ".env")
BUCKET_NAME = os.getenv("S3_PCC_BUCKET")


def get_mode() -> str:
    return "website" if "--website" in sys.argv else DEFAULT_MODE


if __name__ == "__main__":
    """Creates a S3 client and uploads the local DuckDB file to the
    specified bucket and key, making it publicly accessible.
    """
    mode = get_mode()
    filename = FILES[mode]

    send_large_file_to_s3(
        s3_client=get_s3_client(),
        bucket=BUCKET_NAME,
        filepath=DATA_DIR / filename,
        s3_filepath=filename,
        replace=True,
    )