#!/usr/bin/env python
"""Download all pipeline_inputs files from S3-compatible bucket."""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable, List
from urllib.parse import urlencode
from urllib.request import Request, urlopen


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
            downloaded = 0

            with open(destination, "wb") as f:
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)

                    # Show progress every 10MB
                    if total_size > 0 and downloaded % (10 * 1024 * 1024) < chunk_size:
                        progress = (downloaded / total_size) * 100
                        mb_downloaded = downloaded / (1024 * 1024)
                        mb_total = total_size / (1024 * 1024)
                        print(
                            f"  Progrès: {progress:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)"
                        )

        print(f"✅ Téléchargement réussi : {destination}")
        return True
    except Exception as e:
        print(f"❌ Échec du téléchargement pour {url}: {e}")
        # Clean up partial download
        if destination.exists():
            destination.unlink()
        return False


def list_s3_objects(bucket_base_url: str, prefix: str) -> List[str]:
    """List all object keys under a prefix using S3 ListObjectsV2 API."""
    keys: List[str] = []
    continuation_token: str | None = None

    while True:
        query = {
            "list-type": "2",
            "prefix": prefix,
        }
        if continuation_token:
            query["continuation-token"] = continuation_token

        url = f"{bucket_base_url}?{urlencode(query)}"
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)
        for contents in root.findall(".//{*}Contents"):
            key = contents.findtext("{*}Key")
            if key:
                keys.append(key)

        is_truncated = root.findtext("{*}IsTruncated")
        if is_truncated and is_truncated.lower() == "true":
            continuation_token = root.findtext("{*}NextContinuationToken")
            if not continuation_token:
                break
        else:
            break

    return keys


def iter_pipeline_inputs(bucket_base_url: str, prefix: str) -> Iterable[str]:
    for key in list_s3_objects(bucket_base_url, prefix):
        if not key or key.endswith("/"):
            continue
        if prefix and key.startswith(prefix):
            yield key[len(prefix) :].lstrip("/")
        else:
            yield key


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

    existing_files = set(list_local_files(pipeline_inputs_dir))
    if existing_files:
        print("Fichiers déjà présents:")
        for path in sorted(existing_files):
            print(f"  - {path}")

    bucket_base_url = "https://s3.fr-par.scw.cloud/qppcc-upload"
    prefix = "pipeline_inputs/"

    files = list(iter_pipeline_inputs(bucket_base_url, prefix))
    if not files:
        print("Aucun fichier trouvé dans pipeline_inputs.")
        sys.exit(1)

    # Download each file
    success_count = 0
    for relative_path in files:
        if relative_path in existing_files:
            print(f"⏭️  Déjà présent, ignoré : {relative_path}")
            success_count += 1
            continue
        url = f"{bucket_base_url}/{prefix}{relative_path}"
        destination = pipeline_inputs_dir / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if download_file(url, destination):
            success_count += 1

    print(f"\nTéléchargements terminés ! ({success_count}/{len(files)} réussi(s))")

    # Exit with error code if any download failed
    sys.exit(0 if success_count == len(files) else 1)


if __name__ == "__main__":
    main()
