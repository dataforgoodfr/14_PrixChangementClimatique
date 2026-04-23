import { getDuckDbConnection } from "@/lib/duckdb";
import { NextResponse } from "next/server";

type DuckDbQueryFn<T> = (
  connection: Awaited<ReturnType<typeof getDuckDbConnection>>,
) => Promise<T | NextResponse<T>>;

/**
 * Wrapper pour exécuter une requête DuckDB avec gestion automatique
 * de la connexion et des erreurs.
 *
 * @param queryFn - Fonction contenant la requête DuckDB à exécuter.
 *                  Peut retourner des données ou une NextResponse pour un contrôle personnalisé.
 * @returns NextResponse avec les données ou l'erreur
 *
 * @example
 * // Retour simple de données
 * return withDuckDb(async (connection) => {
 *   const reader = await connection.runAndReadAll("SELECT * FROM table", []);
 *   return reader.getRowObjectsJson();
 * });
 *
 * @example
 * // Retour avec NextResponse personnalisée (ex: 404)
 * return withDuckDb(async (connection) => {
 *   const rows = await connection.runAndReadAll("SELECT * FROM table WHERE id = $1", [id]);
 *   const data = rows.getRowObjectsJson();
 *   if (data.length === 0) {
 *     return NextResponse.json({ error: "Not found" }, { status: 404 });
 *   }
 *   return data[0];
 * });
 */
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
