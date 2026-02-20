import { DuckDBInstance, DuckDBConnection } from "@duckdb/node-api";
import fs from "fs";
import path from "path";

function getDbPath() {
  return (
    process.env.DUCKDB_PATH ||
    path.join(process.cwd(), "../database/data.duckdb")
  );
}

let connectionPromise: Promise<DuckDBConnection> | null = null;

export async function getDuckDbConnection(): Promise<DuckDBConnection> {
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const DB_PATH = getDbPath();
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(
        `Database file not found at ${DB_PATH}. Please check that your DUCKDB_PATH environment variable is correctly set or that the default database exists.`,
      );
    }
    try {
      // Connection en Read Write pour pouvoir écrire dans la base de données pour les données d'exemple
      // TODO: Changer en Read Only pour la production
      const dbInstance = await DuckDBInstance.create(DB_PATH, {
        access_mode: "READ_WRITE",
        max_memory: "1GB",
        threads: "4",
      });
      const dbConnection = await dbInstance.connect();
      // Extensions géospatiales
      await dbConnection.run("INSTALL spatial;");
      await dbConnection.run("LOAD spatial;");
      return dbConnection;
    } catch (error) {
      connectionPromise = null;
      throw new Error(
        "Erreur lors de la création de la connexion DuckDB : " + error,
      );
    }
  })();
  return connectionPromise;
}

export default getDuckDbConnection;
