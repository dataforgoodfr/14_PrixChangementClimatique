#!/usr/bin/env python3
"""
Detect newly added dbt models in a GitHub push and build a notification message.

Requirements:
- Git available in PATH
"""

import os
import subprocess
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
import requests

import yaml
from dotenv import load_dotenv


MODELS_DIR = Path("data/dbt_pipeline/models")
load_dotenv()
MATTERMOST_WEBHOOK_URL = os.getenv("MATTERMOST_WEBHOOK_URL")

# ---------------------------------------------------------------------------
# Git utilities
# ---------------------------------------------------------------------------

def run_git_command(cmd: List[str]) -> str:
    """Run a git command and return stdout."""
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def get_git_diff_range() -> Tuple[str, str]:
    """Return commit range (base, head) for diff."""

    before = os.environ.get("GITHUB_EVENT_BEFORE")
    sha = os.environ.get("GITHUB_SHA")

    if before and sha:
        return before, sha

    # Local fallback
    base = run_git_command(["git", "rev-parse", "HEAD~1"])
    head = run_git_command(["git", "rev-parse", "HEAD"])
    return base, head


def get_added_files() -> List[Path]:
    """Return newly added files between two commits."""
    base, head = get_git_diff_range()

    output = run_git_command(
        ["git", "diff", "--name-status", base, head]
    )

    added: List[Path] = []

    for line in output.splitlines():
        status, path = line.split("\t", 1)
        if status == "A":
            added.append(Path(path))

    return added


# ---------------------------------------------------------------------------
# dbt model detection
# ---------------------------------------------------------------------------

def filter_new_models(files: List[Path]) -> Set[str]:
    """Return model names from added SQL files under MODELS_DIR."""
    models: Set[str] = set()

    for file in files:
        if (
            file.suffix == ".sql"
            and MODELS_DIR in file.parents
        ):
            models.add(file.stem)

    return models


def load_model_descriptions(
    models_to_find: Set[str],
    models_root: Path = MODELS_DIR,
) -> Dict[str, str]:
    """Extract model descriptions from schema.yml files."""
    descriptions: Dict[str, str] = {}

    if not models_root.exists():
        return descriptions

    schema_files = list(models_root.rglob("*.yml")) + list(models_root.rglob("*.yaml"))

    for schema_file in schema_files:
        try:
            content = yaml.safe_load(schema_file.read_text(encoding="utf-8"))
        except Exception:
            continue

        if not isinstance(content, dict):
            continue

        for model in content.get("models", []):
            name: Optional[str] = model.get("name")
            if not name or name not in models_to_find:
                continue

            descriptions[name] = model.get(
                "description",
                "No description provided",
            )

    return descriptions


# ---------------------------------------------------------------------------
# Message sender
# ---------------------------------------------------------------------------

def build_message(models: Set[str], descriptions: Dict[str, str]) -> str:
    """Build notification message."""
    if not models:
        return ""

    lines = [
        "Nouveau(x) modèle(s) dbt ingéré(s) dans dev.duckdb :",
        "",
    ]

    for model in sorted(models):
        desc = descriptions.get(model, "No description available")
        lines.append(f"**{model}**")
        lines.append(desc)
        lines.append("")

    return "\n".join(lines).strip()


def send_mattermost(message: str):
    """Send message to Mattermost."""
    if not MATTERMOST_WEBHOOK_URL:
        raise RuntimeError("MATTERMOST_WEBHOOK_URL is not set")
    payload = { "text": message }
    response = requests.post( MATTERMOST_WEBHOOK_URL, json=payload, timeout=10 )
    response.raise_for_status()
    print("Mattermost notification sent.")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    added_files = get_added_files()

    if not added_files:
        print("No new files detected.")
        return

    new_models = filter_new_models(added_files)

    if not new_models:
        print("No new dbt models detected.")
        return

    descriptions = load_model_descriptions(new_models)
    message = build_message(new_models, descriptions)

    if message:
        send_mattermost(message)


if __name__ == "__main__":
    main()