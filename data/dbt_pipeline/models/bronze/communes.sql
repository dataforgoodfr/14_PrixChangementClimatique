-- communes.sql
-- Table des communes françaises avec géométries spatiales (polygones) et données complémentaires
-- Source: HuWise / Georef France Commune

SELECT
    com_code[1] AS code_commune,
    com_name[1] AS nom_commune,
    com_current_code[1] AS code_commune_actuel,
    com_name_upper AS nom_commune_majuscule,
    com_name_lower AS nom_commune_minuscule,
    com_area_code AS code_zone_superficie,
    com_type AS type_commune,
    com_siren_code AS code_siren,
    com_is_mountain_area AS zone_montagne,
    dep_code[1] AS code_departement,
    dep_name[1] AS nom_departement,
    reg_code[1] AS code_region,
    reg_name[1] AS nom_region,
    arrdep_code[1] AS code_arrondissement_departemental,
    arrdep_name[1] AS nom_arrondissement_departemental,
    epci_code[1] AS code_epci,
    epci_name[1] AS nom_epci,
    ze2020_code[1] AS code_zone_emploi_2020,
    ze2020_name[1] AS nom_zone_emploi_2020,
    bv2022_code[1] AS code_bassin_vie_2022,
    bv2022_name[1] AS nom_bassin_vie_2022,
    geo_point_2d,
    geom AS geometry
FROM ST_READ('https://hub.huwise.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson')
