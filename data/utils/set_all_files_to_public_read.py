"""
Ce programme rend tous les fichiers du bucket accessibles (en lecture) à tous.
"""

import os

import boto3

access_key = os.environ["S3_ACCESS_KEY"]
secret_key = os.environ["S3_SECRET_ACCESS_KEY"]

s3 = boto3.client(
    "s3",
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    endpoint_url="https://s3.fr-par.scw.cloud",
    region_name="fr-par",
)

bucket_name = "qppcc-upload"
prefix = ""  # vide si tout le bucket

# Liste tous les objets
objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

for obj in objects.get("Contents", []):
    key = obj["Key"]
    s3.put_object_acl(Bucket=bucket_name, Key=key, ACL="public-read")
    print(f"{key} est maintenant public")
