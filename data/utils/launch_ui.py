#!/usr/bin/env python
"""Launch DuckDB UI for the database."""

import sys
import webbrowser
from pathlib import Path

import duckdb


def main():
    # Get the project root (2 levels up from this script)
    project_root = Path(__file__).parent.parent.parent
    exploration_dir = project_root / "data" / "exploration"

    db_file = exploration_dir / "dev.duckdb"

    if not db_file.exists():
        print(f"❌ Database not found: {db_file}")
        print(f"\nAvailable databases in {exploration_dir}:")
        for db in exploration_dir.glob("*.duckdb"):
            print(f"  - {db.name}")
        sys.exit(1)

    print(f"🦆 Launching DuckDB UI for {db_file}...")

    # Connect to the database and start UI
    conn = duckdb.connect(str(db_file))
    result = conn.sql("CALL start_ui();").fetchone()

    if result and result[0]:
        url = result[0]
        print(f"✅ DuckDB UI started at: {url}")
        print("Opening in browser...")
        webbrowser.open(url)
        print("\nPress Ctrl+C to stop the server")

        # Keep the connection alive
        try:
            import time

            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Stopping DuckDB UI...")
            conn.close()
    else:
        print("❌ Failed to start DuckDB UI")
        sys.exit(1)


if __name__ == "__main__":
    main()
