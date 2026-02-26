import { DuckDBInstance, DuckDBConnection } from "@duckdb/node-api";
import fs from "fs";
import path from "path";

function getDbPath() {
  return (
    process.env.DUCKDB_PATH ||
    path.join(process.cwd(), "../data/exploration/dev.duckdb")
  );
}

let instancePromise: Promise<DuckDBInstance> | null = null;

async function getDuckDbInstance(): Promise<DuckDBInstance> {
  if (instancePromise) return instancePromise;

  instancePromise = (async () => {
    const DB_PATH = getDbPath();
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(
        `Database file not found at ${DB_PATH}. Please check that your DUCKDB_PATH environment variable is correctly set or that the default database exists.`,
      );
    }
    try {
      const instance = await DuckDBInstance.create(DB_PATH, {
        access_mode: "READ_ONLY",
        max_memory: "1GB",
        threads: "4",
      });

      const warmup = await instance.connect();
      try {
        await warmup.run("INSTALL spatial;");
      } finally {
        warmup.closeSync();
      }
      return instance;
    } catch (error) {
      instancePromise = null;
      const baseMessage = "Erreur lors de la création de l'instance DuckDB : ";
      const detail = error instanceof Error ? error.message : String(error);
      if (error instanceof Error) {
        throw new Error(baseMessage + detail, { cause: error });
      }
      throw new Error(baseMessage + detail);
    }
  })();

  return instancePromise;
}

export async function getDuckDbConnection(): Promise<DuckDBConnection> {
  const instance = await getDuckDbInstance();
  const connection = await instance.connect();
  await connection.run("LOAD spatial;");
  return connection;
}

export default getDuckDbConnection;
