#!/usr/bin/env python

"""
CLI usage
---------

Upload the dev.duckdb database from the local dbt pipeline directory to the Clever Cloud bucket.

Behavior:
    - The file must exist in data/dbt_pipeline/
    - The file will be uploaded to:
        s3://<CLEVER_PCC_BUCKET>/<filename>
    - Existing dev.duck file will be overwritten
    - The file will be made public

Requires the following environment variables to be set to use the S3 connector:
- CLEVER_TOKEN
- CLEVER_SECRET
- CLEVER_ENDPOINT_URL
- CLEVER_PCC_BUCKET
- CLEVER_REGION
"""

from pathlib import Path
from s3_connector import get_s3_client, send_file_to_s3


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

LOCAL_DUCKDB_PATH = (
    REPO_ROOT
    / "data"
    / "dbt_pipeline"
    / "dev.duckdb"
)

REMOTE_KEY = "dev.duckdb"


if __name__ == "__main__":

    send_file_to_s3(
        s3_client=get_s3_client(),
        filepath=LOCAL_DUCKDB_PATH,
        s3_filepath=REMOTE_KEY,
        replace=True,
    )