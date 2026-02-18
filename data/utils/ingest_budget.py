from pathlib import Path
import duckdb

import os
from dotenv import load_dotenv

from download import download_file
from s3_connector import connect_to_s3, send_file_to_s3

budget_download_csv_url = "https://data.ofgl.fr/api/explore/v2.1/catalog/datasets/ofgl-base-communes/exports/csv?lang=fr&timezone=Europe%2FBerlin&use_labels=true&delimiter=%3B"

current_dir = Path.cwd()
dbt_pipeline_dir = current_dir / "data" / "dbt_pipeline"
download_file_dir = current_dir / "data" / "utils" / "downloaded_files"

load_dotenv(current_dir / ".env")

download_file(
    url=budget_download_csv_url,
    destination=Path(download_file_dir / "ofgl-base-communes.csv")
)

csv_path = (download_file_dir / "ofgl-base-communes.csv").resolve()

city_budget_df = duckdb.query(f"""
    SELECT 
        "Exercice", 
        "Code Insee 2024 Commune", 
        "Nom 2024 Commune", 
        "Siret Budget", 
        "Libellé Budget", 
        "Type de budget", 
        "Montant"
    FROM '{csv_path}'
""").write_csv(f"{download_file_dir}/budget-communes.csv", sep=";")

s3_client = connect_to_s3(
    endpoint_url=os.getenv('S3_ENDPOINT_URL'),
    access_key_id=os.getenv('S3_ACCESS_KEY'),
    secret_access_key=os.getenv('S3_SECRET_ACCESS_KEY'),
    region_name=os.getenv('S3_REGION')
)

send_file_to_s3(
    s3_client=s3_client,
    bucket=os.getenv("QPPCC_BUCKET"),
    filepath=f"{download_file_dir}/budget-communes.csv",
    s3_filepath="pipeline_inputs/budget-communes.csv"
)

s3_client.close()