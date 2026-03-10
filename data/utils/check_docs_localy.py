"""
Script utilitaire pour exécuter les hooks des pre-commit liés à la doc dbt.

Le script :
1. Met à jour les métadonnées dbt (manifest et catalogue).
2. Lance les hooks de pre-commit en mode manuel sur l'ensemble des fichiers.
"""

import subprocess


def run_pre_commit_hook(hook_id):
    """Runs a specific pre-commit hook via uv."""
    # print(f"--- Running {hook_id} ---")
    command = f"uv run pre-commit run {hook_id} --all-files --hook-stage manual"
    result = subprocess.run(command, shell=True, text=True, capture_output=True)

    if result.returncode != 0:
        print(result.stdout.strip())
        return False

    # print("✅ Passed")
    return True


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

    print("Mise à jour du manifest...")
    parse_res = subprocess.run(
        "uv run dbt parse",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("Génération du catalogue...")
    docs_res = subprocess.run(
        "uv run dbt docs generate",
        cwd=PROJECT_DIR,
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    if parse_res.returncode != 0 or docs_res.returncode != 0:
        print(
            "⚠️ Attention : Une commande dbt a échoué. Les hooks risquent d'utiliser des données obsolètes."
        )
    else:
        print("✅ Métadonnées dbt à jour.")

    hooks = [
        "check-model-has-all-columns",
        "check-model-columns-have-desc",
        "check-model-has-description",
    ]

    results = {}
    for hook in hooks:
        results[hook] = run_pre_commit_hook(hook)

    # Summary
    print("=" * 20)
    all_passed = True
    for hook, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {hook}")
        if not passed:
            all_passed = False

    if not all_passed:
        exit(1)


if __name__ == "__main__":
    main()
