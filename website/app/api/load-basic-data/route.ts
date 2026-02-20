import { GEOJSON_PATH } from "@/lib/constants";
import { NextResponse } from "next/server";
import dbConnexion from "@/lib/duckdb";

export async function GET() {
  try {
    const connection = await dbConnexion();
    await connection.run(`
    CREATE TABLE IF NOT EXISTS communes AS
    SELECT
      com_code[1] AS com_code,
      com_name[1] AS com_name,
      com_current_code[1] AS com_current_code,
      dep_code[1] AS dep_code,
      dep_name[1] AS dep_name,
      reg_code[1] AS reg_code,
      reg_name[1] AS reg_name,
      arrdep_code[1] AS arrdep_code,
      arrdep_name[1] AS arrdep_name,
      epci_code[1] AS epci_code,
      epci_name[1] AS epci_name,
      ze2020_code[1] AS ze2020_code,
      ze2020_name[1] AS ze2020_name,
      bv2022_code[1] AS bv2022_code,
      bv2022_name[1] AS bv2022_name,
      com_name_upper,
      com_name_lower,
      com_area_code,
      com_type,
      com_is_mountain_area,
      com_siren_code,
      geo_point_2d
    FROM ST_Read('${GEOJSON_PATH}')
  `);

    const reader = await connection.runAndReadAll("SELECT * FROM communes");
    const rows = reader.getRowObjectsJson();

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
