import { getDuckDbConnection } from "@/lib/duckdb";
import { NextResponse } from "next/server";
import type { CommuneProperties } from "@/lib/types/communes";

/** Code commune INSEE : 5 chiffres. */
const CODE_COMMUNE_REGEX = /^\d{5}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

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
      "SELECT * FROM resultats_website_par_commune WHERE code_geo = $1",
      [code],
    );
    const rows = reader.getRowObjectsJson() as CommuneProperties[];

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
