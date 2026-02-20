import { getDuckDbConnection } from "@/lib/duckdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("commune") ?? undefined;

  try {
    const connection = await getDuckDbConnection();
    const reader = await connection.runAndReadAll(
      `SELECT * FROM communes WHERE com_code = '${code}';`,
    );
    return NextResponse.json(reader.getRowObjectsJson());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Base non disponible";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
