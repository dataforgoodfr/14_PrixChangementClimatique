import { getDuckDbConnection } from "@/lib/duckdb";
import { NextResponse } from "next/server";

type DuckDbQueryFn<T> = (
  connection: Awaited<ReturnType<typeof getDuckDbConnection>>,
) => Promise<T | NextResponse<T>>;

export async function withDuckDb<T>(
  queryFn: DuckDbQueryFn<T>,
): Promise<NextResponse<T | { error: string }>> {
  let connection;
  try {
    connection = await getDuckDbConnection();
    const result = await queryFn(connection);

    if (result instanceof NextResponse) {
      return result;
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Base non disponible";
    console.error("Erreur DuckDB:", message);
    return NextResponse.json({ error: message }, { status: 503 });
  } finally {
    connection?.closeSync();
  }
}
