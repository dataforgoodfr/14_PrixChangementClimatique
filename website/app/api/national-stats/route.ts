import { NextResponse } from "next/server";
import { withDuckDb } from "@/lib/api/duckdb-handler";

export async function GET() {
  return withDuckDb(async (connection) => {
    const reader = await connection.runAndReadAll(
      "SELECT * FROM main_serving.resultats_nationaux LIMIT 1",
    );
    const rows = reader.getRowObjectsJson();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Statistiques nationales introuvables" },
        { status: 404 },
      );
    }

    return rows[0];
  });
}
