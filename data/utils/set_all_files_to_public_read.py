#!/usr/bin/env python

"""
This script will set all files in the Clever Cloud S3 bucket to public read

Requires the following environment variables to be set:
- CLEVER_S3_TOKEN
- CLEVER_S3_SECRET
- CLEVER_ENDPOINT_URL
- CLEVER_PCC_BUCKET
- CLEVER_REGION
"""

import os
from dotenv import load_dotenv
from pathlib import Path
import boto3

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(ENV_PATH)
ACCESS_KEY = os.getenv("CLEVER_S3_TOKEN")
SECRET_KEY = os.getenv("CLEVER_S3_SECRET")
ENDPOINT_URL = os.getenv("CLEVER_ENDPOINT_URL")
REGION_NAME = os.getenv('CLEVER_REGION')
BUCKET_NAME = os.getenv("CLEVER_PCC_BUCKET")


prefix = ""  # vide si tout le bucket


s3 = boto3.client(
    "s3",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    endpoint_url=ENDPOINT_URL,
    region_name=REGION_NAME,
)

# Liste tous les objets
objects = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)

for obj in objects.get("Contents", []):
    key = obj["Key"]
    s3.put_object_acl(Bucket=BUCKET_NAME, Key=key, ACL="public-read")
    print(f"{key} est maintenant public")
