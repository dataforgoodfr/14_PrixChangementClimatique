-- opendatasoft_communes.sql
-- Table des communes françaises avec géométries spatiales (polygones) et données complémentaires
-- Source: OpenDataSoft / Georef France Commune (processed via ingest_communes.py)

SELECT
    code_commune AS code_geo,
    nom_commune,
    code_commune_actuel AS code_geo_actuel,
    nom_commune_majuscule,
    nom_commune_minuscule,
    code_zone_superficie,
    type_commune,
    code_siren,
    zone_montagne,
    code_departement,
    nom_departement,
    code_region,
    nom_region,
    code_arrondissement_departemental,
    nom_arrondissement_departemental,
    code_epci,
    nom_epci,
    code_zone_emploi_2020,
    nom_zone_emploi_2020,
    code_bassin_vie_2022,
    nom_bassin_vie_2022,
    "geo_point_2d" AS geo_point_2_d,
    geometry
FROM 'pipeline_inputs/opendatasoft_communes.csv'
