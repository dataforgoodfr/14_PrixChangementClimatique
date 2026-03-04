#!/usr/bin/env python
"""Download DuckDB database files from S3."""

import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

# Mettre à jour cette date à chaque fois que odis.duckdb change côté S3.
# Format ISO 8601 UTC. Tout téléchargement antérieur à cette date sera rejoué.
ODIS_DB_UPDATED_AT = datetime(2026, 3, 4, 0, 0, 0, tzinfo=timezone.utc)


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


def _read_marker(marker: Path, key: str) -> datetime | None:
    """Lit la timestamp associée à key dans .downloaded, ou None si absente/invalide."""
    try:
        for line in marker.read_text().splitlines():
            if line.startswith(f"{key}:"):
                return datetime.fromisoformat(line[len(key) + 1:].strip())
    except (ValueError, OSError):
        pass
    return None


def _write_marker(marker: Path, key: str) -> None:
    """Écrit ou met à jour la ligne key:<timestamp> dans .downloaded."""
    now = datetime.now(tz=timezone.utc).isoformat()
    lines = []
    try:
        lines = [line for line in marker.read_text().splitlines() if not line.startswith(f"{key}:")]
    except OSError:
        pass
    lines.append(f"{key}:{now}")
    marker.write_text("\n".join(lines) + "\n")


def odis_already_downloaded(destination: Path) -> bool:
    """Return True si odis.duckdb est présent et a été téléchargé après ODIS_DB_UPDATED_AT."""
    if not destination.exists():
        return False
    marker = destination.parent / ".downloaded"
    ts = _read_marker(marker, "ODIS")
    return ts is not None and ts > ODIS_DB_UPDATED_AT


def mark_odis_downloaded(destination: Path) -> None:
    """Écrit la timestamp du téléchargement dans .downloaded."""
    _write_marker(destination.parent / ".downloaded", "ODIS")


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
    for url, filename in files:
        destination = exploration_dir / filename
        if filename == "odis.duckdb" and odis_already_downloaded(destination):
            print(f"⏭️  {filename} déjà à jour : téléchargement ignoré")
            success_count += 1
            continue
        if download_file(url, destination):
            if filename == "odis.duckdb":
                mark_odis_downloaded(destination)
            success_count += 1

    print(f"\nTéléchargements terminés ! ({success_count}/{len(files)} réussi(s))")

    # Exit with error code if any download failed
    sys.exit(0 if success_count == len(files) else 1)


if __name__ == "__main__":
    main()
