from pathlib import Path
import os

from dotenv import load_dotenv

from s3_connector import get_s3_client, send_file_to_s3


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

ENV_PATH = REPO_ROOT / ".env"
load_dotenv(ENV_PATH)

LOCAL_DUCKDB_PATH = (
    REPO_ROOT
    / "data"
    / "dbt_pipeline"
    / "dev.duckdb"
)

BUCKET_NAME = os.getenv("CLEVER_PCC_BUCKET")
REMOTE_KEY = "dev.duckdb"


if __name__ == "__main__":

    send_file_to_s3(
        s3_client=get_s3_client(),
        bucket=BUCKET_NAME,
        filepath=LOCAL_DUCKDB_PATH,
        s3_filepath=REMOTE_KEY,
        replace=True,
    )