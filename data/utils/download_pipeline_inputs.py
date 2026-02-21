#!/usr/bin/env python
"""Download all pipeline_inputs files from S3-compatible bucket."""

import json
import os
import sys
from pathlib import Path
from typing import List
from urllib.parse import quote
from urllib.request import Request, urlopen

import boto3
from botocore import UNSIGNED
from botocore.client import Config
from tqdm import tqdm

tracker_file = "data_version_tracker.json"


def get_tracker_file(tracker_file_path) -> dict:
    # Charger le tracker existant ou créer un dict vide
    if os.path.exists(tracker_file_path):
        with open(tracker_file_path, "r") as f:
            tracker = json.load(f)
    else:
        tracker = {}  # dictionnaire avec des éléments key : ETag pour traquer les versions des fichiers locaux
    return tracker


def download_file(url: str, destination: Path) -> bool:
    """Download a file from URL to destination path with progress."""
    print(f"Téléchargement de {url} vers {destination}...")

    try:
        # Open URL and get file size
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as response:
            total_size = int(response.headers.get("content-length", 0))

            # Download in chunks with progress
            chunk_size = 8192  # 8KB chunks

            with (
                open(destination, "wb") as f,
                tqdm(
                    total=total_size,
                    unit="B",
                    unit_scale=True,
                    unit_divisor=1024,
                    desc=destination.name,
                ) as progress_bar,
            ):
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    progress_bar.update(len(chunk))

        print(f"✅ Téléchargement réussi : {destination}")
        return True
    except Exception as e:
        print(f"❌ Échec du téléchargement pour {url}: {e}")
        # Clean up partial download
        if destination.exists():
            destination.unlink()
        return False


def list_s3_objects_anonymous(bucket_name: str, prefix: str, endpoint_url: str) -> dict:
    """
    Liste tous les objets sous un préfixe dans un bucket S3 public compatible
    et retourne une liste de dictionnaires avec 'Key' et 'ETag'.
    Aucun accès authentifié requis (anonyme).
    """
    # Client S3 anonyme
    s3 = boto3.client(
        "s3",
        config=Config(signature_version=UNSIGNED),
        endpoint_url=endpoint_url,
    )

    objects = {}  # dictionnaire clé - ETag
    continuation_token = None

    while True:
        params = {"Bucket": bucket_name, "Prefix": prefix, "MaxKeys": 1000}
        if continuation_token:
            params["ContinuationToken"] = continuation_token

        # Liste les objets
        response = s3.list_objects_v2(**params)

        # Extraire Key + ETag
        for obj in response.get("Contents", []):
            objects[obj["Key"]] = obj["ETag"].strip('"')

        # Pagination
        if response.get("IsTruncated"):
            continuation_token = response.get("NextContinuationToken")
            if not continuation_token:
                break
        else:
            break

    return objects


def server_pipeline_inputs(bucket_name: str, prefix: str, endpoint_url) -> dict:
    server_files_tracker = {}  # dictionnaire avec des éléments key : ETag pour traquer les versions des fichiers remote sur le S3
    for key, etag in list_s3_objects_anonymous(
        bucket_name, prefix, endpoint_url
    ).items():
        if not key or key.endswith("/"):
            continue
        if prefix and key.startswith(prefix):
            key_relative = key[len(prefix) :].lstrip("/")
        else:
            key_relative = key
        server_files_tracker[key_relative] = etag
    return server_files_tracker


def list_local_files(root: Path) -> List[str]:
    """Return relative file paths (posix) under root."""
    if not root.exists():
        return []
    return sorted(
        p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()
    )


def main():
    # Get the project root (2 levels up from this script)
    project_root = Path(__file__).parent.parent.parent
    pipeline_inputs_dir = project_root / "data" / "dbt_pipeline" / "pipeline_inputs"

    # Ensure the destination directory exists
    pipeline_inputs_dir.mkdir(parents=True, exist_ok=True)

    local_tracker = get_tracker_file(pipeline_inputs_dir / tracker_file)

    existing_files = set(list_local_files(pipeline_inputs_dir))

    bucket_base_url = "https://s3.fr-par.scw.cloud/qppcc-upload"
    bucket_name = "qppcc-upload"
    endpoint_url = "https://s3.fr-par.scw.cloud/"
    prefix = "pipeline_inputs/"

    server_files_tracker = server_pipeline_inputs(bucket_name, prefix, endpoint_url)
    if not server_files_tracker:
        print("Aucun fichier trouvé dans pipeline_inputs.")
        sys.exit(1)

    # Download each file
    success_count = 0
    for relative_path in server_files_tracker.keys():
        if relative_path in existing_files:
            if server_files_tracker[relative_path] == local_tracker.get(relative_path):
                print(f"⏭️  Déjà présent, ignoré : {relative_path}")
                success_count += 1
                continue
            else:
                print(f"🔄️  Fichier modifié : {relative_path}")

        url = f"{bucket_base_url}/{prefix}{quote(relative_path)}"
        destination = pipeline_inputs_dir / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if download_file(url, destination):
            local_tracker[relative_path] = server_files_tracker[relative_path]
            success_count += 1

    print(
        f"\nTéléchargements terminés ! ({success_count}/{len(server_files_tracker)} réussi(s))"
    )
    # 3️⃣ Sérialiser le tracker final en JSON
    with open(pipeline_inputs_dir / tracker_file, "w") as f:
        json.dump(local_tracker, f, indent=2)
    print(f"Contrôle des sources de données enregistré : {tracker_file}")
    # Exit with error code if any download failed
    sys.exit(0 if success_count == len(server_files_tracker) else 1)


if __name__ == "__main__":
    main()
