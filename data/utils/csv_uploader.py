from s3_connector import get_s3_client, send_large_file_to_s3
from pathlib import Path
import os
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
LOCAL_CSV_PATH = REPO_ROOT / "data" / "dbt_pipeline" / "pipeline_inputs"

load_dotenv(Path.cwd() / ".env")
BUCKET_NAME = os.getenv("S3_PCC_BUCKET")


if __name__ == "__main__":
    '''Uploads all CSV files from the local pipeline_inputs
      directory to the specified S3 bucket under the
      pipeline_inputs/ prefix, without replacing existing files.'''
    
    s3_client = get_s3_client()

    csv_files = LOCAL_CSV_PATH.glob("*.csv")

    for csv_file in csv_files:
        send_large_file_to_s3(
            s3_client=s3_client,
            bucket=BUCKET_NAME,
            filepath=csv_file,
            s3_filepath=f"pipeline_inputs/{csv_file.name}",
            replace=False,
        )
