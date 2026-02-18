#!/usr/bin/env python
"""Launch DuckDB UI for the database."""

import sys
import webbrowser
from pathlib import Path

import duckdb


def main():

    db_name = "dev.duckdb"
   
    if not Path(db_name).exists():
        print("❌ Database not found: dev.duckdb")
        print("\nAvailable databases in current directory:")
        for db in list(Path('.').glob("*.duckdb")):
            print(f"  - {db.name}")
        sys.exit(1)

    print(f"🦆 Launching DuckDB UI for {db_name}...")

    # Connect to the database and start UI
    conn = duckdb.connect(str(db_name))
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
