import { getDuckDbConnection } from "@/lib/duckdb";
import { NextRequest, NextResponse } from "next/server";

/** Code commune INSEE : 5 chiffres. */
const CODE_COMMUNE_REGEX = /^\d{5}$/;

function isValidCodeCommune(code: string | null): code is string {
  return typeof code === "string" && CODE_COMMUNE_REGEX.test(code);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("commune");

  if (!isValidCodeCommune(code)) {
    return NextResponse.json(
      {
        error: "Paramètre 'commune' invalide : code INSEE à 5 chiffres attendu",
      },
      { status: 400 },
    );
  }

  let connection;
  try {
    connection = await getDuckDbConnection();
    const prepared = await connection.prepare(
      "SELECT * FROM insee_commune WHERE com = $1",
    );
    prepared.bindVarchar(1, code);
    const reader = await prepared.runAndReadAll();
    return NextResponse.json(reader.getRowObjectsJson());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Base non disponible";
    return NextResponse.json({ error: message }, { status: 503 });
  } finally {
    connection?.closeSync();
  }
}
