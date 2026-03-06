import { DuckDBInstance, DuckDBConnection } from "@duckdb/node-api";
import fs from "fs";
import path from "path";

const dbPath =
  process.env.DUCKDB_PATH ??
  path.join(process.cwd(), "../data/exploration/dev.duckdb");

if (!fs.existsSync(dbPath)) {
  throw new Error(
    `Database file not found at ${dbPath}. Please check that your DUCKDB_PATH environment variable is correctly set or that the default database exists.`,
  );
}

const db = await DuckDBInstance.create(dbPath, {
  access_mode: "READ_ONLY",
  max_memory: "1GB",
  threads: "4",
});

const warmup = await db.connect();
try {
  await warmup.run("INSTALL spatial;");
} finally {
  warmup.closeSync();
}

export async function getDuckDbConnection(): Promise<DuckDBConnection> {
  const connection = await db.connect();
  // console.log("Nouvelle connexion DuckDB établie");
  await connection.run("LOAD spatial;");
  return connection;
}

export default getDuckDbConnection;
