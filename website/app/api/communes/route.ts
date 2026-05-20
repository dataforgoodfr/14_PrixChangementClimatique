import { NextRequest, NextResponse } from "next/server";
import {
  getCommuneCodeFromUrl,
  isValidCodeCommune,
} from "@/lib/api/validators";
import { withDuckDb } from "@/lib/api/duckdb-handler";

export async function GET(request: NextRequest) {
  const code = getCommuneCodeFromUrl(request);
  if (!isValidCodeCommune(code)) {
    return NextResponse.json(
      {
        error: "Code commune invalide : code INSEE à 5 chiffres ou format Corse (2Axxx/2Bxxx) attendu",
      },
      { status: 400 },
    );
  }

  return withDuckDb(async (connection) => {
    const reader = await connection.runAndReadAll(
      "SELECT * EXCLUDE (geometry) FROM resultats_website_par_commune WHERE code_insee = $1",
      [code],
    );
    const rows = reader.getRowObjectsJson();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `Commune introuvable : ${code}` },
        { status: 404 },
      );
    }

    return rows[0];
  });
}
