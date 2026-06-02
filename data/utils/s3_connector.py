#!/usr/bin/env python

"""
S3 helper utilities for Clever Cloud Object Storage.

Environment variables
---------------------
The following variables must be available either in the environment
or in a `.env` file located two directories above this module:

    CLEVER_TOKEN
    CLEVER_SECRET
    CLEVER_ENDPOINT_URL
    CLEVER_REGION
    CLEVER_PCC_BUCKET

Functions
---------
get_s3_client()
    Create and return a configured boto3 S3 client.

send_file_to_s3(
    s3_client,
    filepath,
    s3_filepath,
    replace=False
)
    Upload a local file to the Clever Cloud S3 bucket and make it public.

    Parameters
    ----------
    s3_client : boto3.client
        Configured S3 client.
    filepath : str | Path
        Local file path.
    s3_filepath : str
        Destination object key in S3.
    replace : bool, default=False
        If False, the function checks whether the remote object
        already exists and compares file sizes. Upload is skipped
        when sizes match.
        If True, the file is uploaded unconditionally.

Example
-------
    from pathlib import Path

    client = get_s3_client()

    send_file_to_s3(
        s3_client=client,
        filepath=Path("data.csv"),
        s3_filepath="pipeline_inputs/data.csv",
        replace=False,
    )
"""

from pathlib import Path
import os

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(ENV_PATH)

ACCESS_KEY = os.getenv("CLEVER_TOKEN")
SECRET_KEY = os.getenv("CLEVER_SECRET")
ENDPOINT_URL = os.getenv("CLEVER_ENDPOINT_URL")
REGION_NAME = os.getenv('CLEVER_REGION')
BUCKET_NAME = os.getenv("CLEVER_PCC_BUCKET")


def get_s3_client():
    """Create and return a configured S3 client."""

    load_dotenv(ENV_PATH)

    return boto3.client(
        "s3",
        region_name=REGION_NAME,
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(
            signature_version="s3v4",
            request_checksum_calculation="WHEN_REQUIRED",
            response_checksum_validation="WHEN_REQUIRED",
        ),
    )


def send_file_to_s3(
    s3_client,
    filepath: str | Path,
    s3_filepath: str,
    replace: bool = False,
):
    """Upload a file to S3."""

    filepath = Path(filepath)

    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    local_size = filepath.stat().st_size

    if not replace:
        try:
            response = s3_client.head_object(
                Bucket=BUCKET_NAME,
                Key=s3_filepath,
            )

            remote_size = response["ContentLength"]

            if remote_size == local_size:
                print(
                    f"File already exists on S3 "
                    f"({local_size} bytes) → skip"
                )
                return

            print(
                "Remote file exists with different size "
                f"(local={local_size}, remote={remote_size}) → upload"
            )

        except ClientError as error:
            if error.response["Error"]["Code"] != "404":
                raise

    print(f"Uploading {filepath} → s3://{BUCKET_NAME}/{s3_filepath}")

    with open(filepath, "rb") as file:
        data = bytes(file.read())

    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=s3_filepath,
        Body=data,
        ContentLength=len(data),
    )

    s3_client.put_object_acl(
        Bucket=BUCKET_NAME,
        Key=s3_filepath,
        ACL="public-read",
    )

    print("Upload completed and file is public ✅")


if __name__ == "__main__":

    load_dotenv(ENV_PATH)

    client = get_s3_client()

    response = client.list_objects_v2(
        Bucket=BUCKET_NAME
    )

    print(response)