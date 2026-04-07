/**
 * Propriétés d'une commune — schéma partagé entre les tuiles vectorielles (PMTiles)
 * et la table DuckDB `resultats_website_par_commune`.
 */
export interface CommuneProperties {
  code_geo: string;
  nom_commune: string;
  code_geo_actuel?: string | null;
  nom_commune_majuscule?: string | null;
  nom_commune_minuscule?: string | null;
  code_zone_superficie?: string | null;
  type_commune?: string | null;
  code_siren?: string | null;
  zone_montagne?: string | null;
  code_departement?: string | null;
  nom_departement?: string | null;
  code_region?: string | null;
  nom_region?: string | null;
  code_arrondissement_departemental?: string | null;
  nom_arrondissement_departemental?: string | null;
  code_epci?: string | null;
  nom_epci?: string | null;
  code_zone_emploi_2020?: string | null;
  nom_zone_emploi_2020?: string | null;
  code_bassin_vie_2022?: string | null;
  nom_bassin_vie_2022?: string | null;
  geo_point_2_d?: string | null;
  valeur?: number | null;
  [key: string]: unknown;
}
