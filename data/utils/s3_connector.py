import boto3
from pathlib import Path

import os

from dotenv import load_dotenv

def connect_to_s3(
    endpoint_url: str,
    access_key_id: str,
    secret_access_key: str,
    region_name: str
):
    """ Créer un client de connexion avec un S3
    """
    try:
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region_name
        )
        return s3_client
    except Exception as e:
        print(f"Erreur de connexion : {e}")
        return None

def send_file_to_s3(
    s3_client: boto3.client,
    bucket: str,
    filepath: str,
    s3_filepath: str,
):
    """Dépose un fichier sur un bucket S3
    """
    with open(filepath, 'rb') as f:  # ✅ Ouvrir en mode binaire
        s3_client.put_object(
            Bucket=bucket,
            Body=f,
            Key=s3_filepath,
            ACL='public-read' 
        )

def send_db_to_s3(
    s3_client: boto3.client,
    bucket: str,
    filepath: str,
    s3_filepath: str
):
    """Upload de gros fichiers S3 avec upload_file (pour db) et le rend public"""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Fichier non trouvé : {filepath}")

    print(f"Upload de {filepath} vers {bucket}/{s3_filepath} ...")
    s3_client.upload_file(
        filepath,
        bucket,
        s3_filepath,
        ExtraArgs={"ACL": "public-read"}
    )
    print("Upload terminé ✅")

    

def get_s3_client():
    """Charge le .env et retourne un client S3 configuré pour Scaleway ou AWS."""
    # Charger .env
    current_dir = Path.cwd()
    load_dotenv(current_dir / ".env")

    # Créer le client S3
    client = boto3.client(
        "s3",
        endpoint_url=os.getenv("S3_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
        region_name=os.getenv("S3_REGION")
    )
    return client


if __name__ == "__main__":

    print(get_s3_client().list_objects_v2(Bucket="qppcc-upload"))