from pathlib import Path
import duckdb
import os
from dotenv import load_dotenv

from download import download_file
from s3_connector import connect_to_s3, send_file_to_s3

# URL source for communes GeoJSON export from OpenDataSoft API
# Using export endpoint to bypass 10k offset limitation
communes_geojson_url = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson"

# Setup directories and environment
# Get project root (script location is at data/utils/, so go up 2 levels)
script_dir = Path(__file__).parent
download_file_dir = script_dir / "downloaded_files"

# Ensure download directory exists
download_file_dir.mkdir(parents=True, exist_ok=True)

# Load environment from project root
project_root = script_dir.parent.parent
load_dotenv(project_root / ".env")

# Debug log: Starting communes data ingestion
print("Starting communes data ingestion from OpenDataSoft API...")
print(f"Download directory: {download_file_dir}")

# Download the full GeoJSON export
print(f"Downloading GeoJSON from: {communes_geojson_url}")
geojson_path = download_file_dir / "opendatasoft_communes.geojson"
download_file(
    url=communes_geojson_url,
    destination=geojson_path
)
print(f"✓ GeoJSON downloaded to: {geojson_path}")

# Create DuckDB connection and install spatial extension for GeoJSON
print("Loading spatial extension and reading GeoJSON...")
conn = duckdb.connect()
conn.execute("INSTALL spatial;")
conn.execute("LOAD spatial;")

# Debug log: Querying and transforming communes data
print("Querying and transforming communes data...")

# Execute the query to transform communes data
# Using ST_READ to read the downloaded GeoJSON file
output_csv_path = download_file_dir / "opendatasoft_communes.csv"
conn.sql(f"""
    SELECT
        list_extract(com_code, 1) AS code_commune,
        list_extract(com_name, 1) AS nom_commune,
        list_extract(com_current_code, 1) AS code_commune_actuel,
        com_name_upper AS nom_commune_majuscule,
        com_name_lower AS nom_commune_minuscule,
        com_area_code AS code_zone_superficie,
        com_type AS type_commune,
        com_siren_code AS code_siren,
        com_is_mountain_area AS zone_montagne,
        list_extract(dep_code, 1) AS code_departement,
        list_extract(dep_name, 1) AS nom_departement,
        list_extract(reg_code, 1) AS code_region,
        list_extract(reg_name, 1) AS nom_region,
        list_extract(arrdep_code, 1) AS code_arrondissement_departemental,
        list_extract(arrdep_name, 1) AS nom_arrondissement_departemental,
        list_extract(epci_code, 1) AS code_epci,
        list_extract(epci_name, 1) AS nom_epci,
        list_extract(ze2020_code, 1) AS code_zone_emploi_2020,
        list_extract(ze2020_name, 1) AS nom_zone_emploi_2020,
        list_extract(bv2022_code, 1) AS code_bassin_vie_2022,
        list_extract(bv2022_name, 1) AS nom_bassin_vie_2022,
        geo_point_2d,
        geom AS geometry
    FROM ST_READ('{geojson_path}')
""").write_csv(str(output_csv_path), sep=";")
print(f"✓ Data written to: {output_csv_path}")

# Debug log: Uploading to S3
print("Connecting to S3 and uploading file...")

# Connect to S3 and upload the processed file
s3_client = connect_to_s3(
    endpoint_url=os.getenv('S3_ENDPOINT_URL'),
    access_key_id=os.getenv('S3_ACCESS_KEY'),
    secret_access_key=os.getenv('S3_SECRET_ACCESS_KEY'),
    region_name=os.getenv('S3_REGION')
)

# Upload to S3 bucket
send_file_to_s3(
    s3_client=s3_client,
    bucket=os.getenv("QPPCC_BUCKET"),
    filepath=str(output_csv_path),
    s3_filepath="pipeline_inputs/opendatasoft_communes.csv"
)

# Debug log: Completed
print("✓ Communes data successfully ingested and uploaded to S3")

# Close connections
s3_client.close()
conn.close()
