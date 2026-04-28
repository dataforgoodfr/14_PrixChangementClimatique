import { NextRequest } from "next/server";
import {
  getCommuneCodeFromUrl,
  isValidCodeCommune,
} from "@/lib/api/validators";
import { withDuckDb } from "@/lib/api/duckdb-handler";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const codeInsee = getCommuneCodeFromUrl(request);

  if (!isValidCodeCommune(codeInsee)) {
    return NextResponse.json(
      {
        error: "Code commune invalide : code INSEE à 5 chiffres attendu",
      },
      { status: 400 },
    );
  }

  return withDuckDb(async (connection) => {
    const query = `
      SELECT *
      FROM catnat_historique
      WHERE code_insee = $1
      ORDER BY date_debut DESC
    `;

    const prepared = await connection.prepare(query);
    prepared.bindVarchar(1, codeInsee);
    const reader = await prepared.runAndReadAll();
    return reader.getRowObjectsJson();
  });
}
