#!/usr/bin/env python
"""Download all pipeline_inputs files from Clever Cloud Cellar."""

import json
import sys
from pathlib import Path
from typing import List
from urllib.parse import quote
from urllib.request import Request, urlopen

import boto3
from botocore.client import Config
from botocore import UNSIGNED

from tqdm import tqdm


TRACKER_FILE = "data_version_tracker.json"

BUCKET_NAME = "assurermaville"
BUCKET_BASE_URL = (
    "https://assurermaville.cellar-c2.services.clever-cloud.com"
)
ENDPOINT_URL = "https://cellar-c2.services.clever-cloud.com"

PREFIX = "pipeline_inputs/"


def get_tracker_file(tracker_file_path: Path) -> dict:
    """Load tracker file or return empty dict."""

    if tracker_file_path.exists():
        with open(tracker_file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    return {}


def download_file(url: str, destination: Path) -> bool:
    """Download a file with progress bar."""

    print(f"Downloading {url} → {destination}")

    try:
        request = Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
        )

        with urlopen(request) as response:
            total_size = int(response.headers.get("content-length", 0))

            with (
                open(destination, "wb") as file,
                tqdm(
                    total=total_size,
                    unit="B",
                    unit_scale=True,
                    unit_divisor=1024,
                    desc=destination.name,
                ) as progress_bar,
            ):
                while True:
                    chunk = response.read(8192)

                    if not chunk:
                        break

                    file.write(chunk)
                    progress_bar.update(len(chunk))

        print(f"✅ Download completed: {destination}")
        return True

    except Exception as error:
        print(f"❌ Download failed for {url}: {error}")

        if destination.exists():
            destination.unlink()

        return False


def list_remote_objects(bucket_name: str, prefix: str) -> dict:
    """List public objects from Clever Cloud Cellar."""

    s3_client = boto3.client(
        "s3",
        region_name="default",
        endpoint_url=ENDPOINT_URL,
        config=Config(signature_version=UNSIGNED),
    )

    objects = {}
    continuation_token = None

    while True:
        params = {
            "Bucket": bucket_name,
            "Prefix": prefix,
            "MaxKeys": 1000,
        }

        if continuation_token:
            params["ContinuationToken"] = continuation_token

        response = s3_client.list_objects_v2(**params)

        for obj in response.get("Contents", []):
            objects[obj["Key"]] = obj["ETag"].strip('"')

        if response.get("IsTruncated"):
            continuation_token = response.get(
                "NextContinuationToken"
            )
        else:
            break

    return objects


def server_pipeline_inputs(bucket_name: str, prefix: str) -> dict:
    """Return remote files with ETags."""

    server_files_tracker = {}

    for key, etag in list_remote_objects(
        bucket_name,
        prefix,
    ).items():

        if not key or key.endswith("/"):
            continue

        relative_key = key.removeprefix(prefix).lstrip("/")

        server_files_tracker[relative_key] = etag

    return server_files_tracker


def list_local_files(root: Path) -> List[str]:
    """Return local relative file paths."""

    if not root.exists():
        return []

    return sorted(
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file()
    )


def main():

    project_root = Path(__file__).resolve().parents[2]

    pipeline_inputs_dir = (
        project_root
        / "data"
        / "dbt_pipeline"
        / "pipeline_inputs"
    )

    pipeline_inputs_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    local_tracker = get_tracker_file(
        pipeline_inputs_dir / TRACKER_FILE
    )

    existing_files = set(
        list_local_files(pipeline_inputs_dir)
    )

    server_files_tracker = server_pipeline_inputs(
        BUCKET_NAME,
        PREFIX,
    )

    if not server_files_tracker:
        print("No files found in pipeline_inputs.")
        sys.exit(1)

    success_count = 0

    for relative_path, remote_etag in (
        server_files_tracker.items()
    ):

        if (
            relative_path in existing_files
            and remote_etag == local_tracker.get(relative_path)
        ):
            print(f"⏭️ Already up to date: {relative_path}")
            success_count += 1
            continue

        url = (
            f"{BUCKET_BASE_URL}/"
            f"{PREFIX}{quote(relative_path)}"
        )

        destination = (
            pipeline_inputs_dir / relative_path
        )

        destination.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        if download_file(url, destination):
            local_tracker[relative_path] = remote_etag
            success_count += 1

    print(
        f"\nDownloads completed "
        f"({success_count}/{len(server_files_tracker)})"
    )

    with open(
        pipeline_inputs_dir / TRACKER_FILE,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(local_tracker, file, indent=2)

    print(
        f"Tracker file updated: {TRACKER_FILE}"
    )

    sys.exit(
        0
        if success_count == len(server_files_tracker)
        else 1
    )


if __name__ == "__main__":
    main()