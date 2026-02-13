from s3_connector import get_s3_client, send_large_file_to_s3
from pathlib import Path
import os
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
LOCAL_DUCKDB_PATH = REPO_ROOT / "data" / "dbt_pipeline" / "dev.duckdb"

load_dotenv(Path.cwd() / ".env")
BUCKET_NAME = os.getenv("S3_PCC_BUCKET")

REMOTE_KEY = "dev.duckdb"

if __name__ == "__main__":
    """Creates a S3 client and uploads the local DuckDB file to the
    specified bucket and key, making it publicly accessible.
    """
    send_large_file_to_s3(
        s3_client = get_s3_client(),
        bucket = BUCKET_NAME,
        filepath = LOCAL_DUCKDB_PATH,
        s3_filepath = REMOTE_KEY,
        replace = True,
    )
