import { getDuckDbConnection } from "@/lib/duckdb";
import { NextRequest, NextResponse } from "next/server";

/** Code commune INSEE : 5 chiffres. */
const CODE_COMMUNE_REGEX = /^\d{5}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";

  if (!CODE_COMMUNE_REGEX.test(code)) {
    return NextResponse.json(
      {
        error: "Code commune invalide : code INSEE à 5 chiffres attendu",
      },
      { status: 400 },
    );
  }

  let connection;
  try {
    connection = await getDuckDbConnection();
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

    return NextResponse.json(rows[0]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Base non disponible";
    return NextResponse.json({ error: message }, { status: 503 });
  } finally {
    connection?.closeSync();
  }
}
