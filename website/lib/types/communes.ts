/**
 * Type pour une ligne commune renvoyée par l’API duckdb-demo / table communes du DuckDB fourni par l’équipe data.
 */
export type CommuneRow = {
  com_code?: string | null;
  com_name?: string | null;
  com_current_code?: string | null;
  dep_code?: string | null;
  dep_name?: string | null;
  reg_code?: string | null;
  reg_name?: string | null;
  arrdep_code?: string | null;
  arrdep_name?: string | null;
  epci_code?: string | null;
  epci_name?: string | null;
  ze2020_code?: string | null;
  ze2020_name?: string | null;
  bv2022_code?: string | null;
  bv2022_name?: string | null;
  com_name_upper?: string | null;
  com_name_lower?: string | null;
  com_area_code?: string | null;
  com_type?: string | null;
  com_is_mountain_area?: boolean | null;
  com_siren_code?: string | null;
  geo_point_2d?: unknown;
};
