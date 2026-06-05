#!/usr/bin/env python

"""
CLI usage
---------

Upload a specific CSV or parquet file from the local `pipeline_inputs` directory
to the Clever Cloud bucket.

The CSV or parquet filename is required as a positional argument.

Example:
    python csv_uploader.py my_file.csv

Behavior:
    - The file must exist in data/dbt_pipeline/pipeline_inputs/
    - The file will be uploaded to:
        s3://<CLEVER_PCC_BUCKET>/pipeline_inputs/<filename>
    - Existing files with identical name will be overwritten
    - The file will be made public

Requires the following environment variables to be set to use the S3 connector:
- CLEVER_S3_TOKEN
- CLEVER_S3_SECRET
- CLEVER_ENDPOINT_URL
- CLEVER_PCC_BUCKET
- CLEVER_REGION
"""

from s3_connector import get_s3_client, send_file_to_s3
from pathlib import Path
import argparse


SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
LOCAL_CSV_PATH = REPO_ROOT / "data" / "dbt_pipeline" / "pipeline_inputs"


def main():
    """Upload a specific CSV file to S3. The CSV filename must be provided via CLI."""

    parser = argparse.ArgumentParser(
        description="Upload a specific CSV file to S3" \
        " and forces the file replacement on S3 if a file" \
        " with the same name already exists."
        f"\n\n The file must be located in:\n"
        f"{LOCAL_CSV_PATH}\n" ,
        formatter_class=argparse.RawTextHelpFormatter
    )

    parser.add_argument(
        "csv_name",
        type=str,
        help="Name of the CSV file to upload (e.g. my_file.csv)"
    )

    args = parser.parse_args()

    csv_file = LOCAL_CSV_PATH / args.csv_name

    if not csv_file.exists():
        raise FileNotFoundError(f"File not found: {csv_file}")

    if csv_file.suffix.lower() not in [".csv", ".parquet"]:
        raise ValueError("Provided file must be a .csv or .parquet file")

    s3_client = get_s3_client()

    send_file_to_s3(
        s3_client=s3_client,
        filepath=csv_file,
        s3_filepath=f"pipeline_inputs/{csv_file.name}",
        replace=True
    )


if __name__ == "__main__":
    main()