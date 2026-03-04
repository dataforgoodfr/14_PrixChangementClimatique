#!/usr/bin/env python
"""Download DuckDB database files from S3."""

import sys
from pathlib import Path
from urllib.request import Request, urlopen


def _get_remote_etag(url: str) -> str | None:
    """Return the remote ETag using a HEAD request."""
    try:
        req = Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as response:
            etag = response.headers.get("ETag")
            if etag:
                return etag.strip('"')
    except Exception:
        pass
    return None


def download_file(url: str, destination: Path) -> bool:
    """Download a file from URL to destination path with progress."""
    print(f"Téléchargement de {url} vers {destination}...")

    try:
        # Open URL and get file size
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as response:
            total_size = int(response.headers.get("content-length", 0))

            chunk_size = 8192
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


def _read_etag(marker: Path, key: str) -> str | None:
    """Read stored ETag for key from marker file."""
    try:
        for line in marker.read_text().splitlines():
            if line.startswith(f"{key}:"):
                return line[len(key) + 1:].strip()
    except OSError:
        pass
    return None


def _write_etag(marker: Path, key: str, etag: str) -> None:
    """Store ETag in marker file."""
    lines = []
    try:
        lines = [
            line
            for line in marker.read_text().splitlines()
            if not line.startswith(f"{key}:")
        ]
    except OSError:
        pass
    lines.append(f"{key}:{etag}")
    marker.write_text("\n".join(lines) + "\n")


def main():
    # Get the project root (2 levels up from this script)
    project_root = Path(__file__).parent.parent.parent
    exploration_dir = project_root / "data" / "exploration"

    # Ensure the exploration directory exists
    exploration_dir.mkdir(parents=True, exist_ok=True)

    # Files to download
    files = [
        ("https://s3.fr-par.scw.cloud/qppcc-upload/dev.duckdb", "dev.duckdb"),
        ("https://s3.fr-par.scw.cloud/qppcc-upload/odis.duckdb", "odis.duckdb"),
    ]

    # Download each file
    success_count = 0
    marker = exploration_dir / ".downloaded"

    for url, filename in files:
        destination = exploration_dir / filename
        etag_key = f"ETAG_{filename}"

        remote_etag = _get_remote_etag(url)
        local_etag = _read_etag(marker, etag_key)

        if destination.exists() and remote_etag and local_etag == remote_etag:
            print(f"⏭️  {filename} déjà à jour (ETag identique) : téléchargement ignoré")
            success_count += 1
            continue

        if download_file(url, destination):
            if remote_etag:
                _write_etag(marker, etag_key, remote_etag)
            success_count += 1

    print(f"\nTéléchargements terminés ! ({success_count}/{len(files)} réussi(s) ou ignoré(s))")
    sys.exit(0 if success_count == len(files) else 1)


if __name__ == "__main__":
    main()