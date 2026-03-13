"""
Script utilitaire pour executer la pipeline DBT et mettre à jour les models.

Le script :
1. Mets à jour UV
2. Télécharge tous les fichiers sources depuis le S3
3. Lance les commande dbt : deps, parse, run et generate docs
"""

import subprocess


def main():

    from pathlib import Path

    SCRIPT_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = SCRIPT_DIR.parents[1]

    DBT_FILE = PROJECT_ROOT / "data" / "dbt_pipeline" / "dbt_project.yml"
    PROJECT_DIR = PROJECT_ROOT / "data" / "dbt_pipeline"

    print(DBT_FILE)

    if not DBT_FILE.is_file():
        print("dbt_project.yml introuvable")
        return False

    print("###########################")
    print("uv sync...")
    subprocess.run(
        "uv sync",
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("###########################")
    print("download_pipeline_inputs...")
    subprocess.run(
        "uv run python data/utils/download_pipeline_inputs.py",
        shell=False,
        check=False,
        stderr=subprocess.DEVNULL,
    )

    print("###########################")
    print("dbt : Download dependencies...")
    subprocess.run(
        "uv run dbt deps",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("###########################")
    print("dbt : run all models (without tests)...")
    subprocess.run(
        "uv run dbt run",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stderr=subprocess.DEVNULL,
    )

    print("###########################")
    print("Mise à jour du manifest...")
    subprocess.run(
        "uv run dbt parse",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("###########################")
    print("Génération du catalogue...")
    subprocess.run(
        "uv run dbt docs generate",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print("Run : uv run dbt docs serve to the documenation website")


if __name__ == "__main__":
    main()
