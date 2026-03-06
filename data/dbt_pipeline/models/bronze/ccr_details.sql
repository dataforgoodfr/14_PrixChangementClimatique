-- ccr_details.sql
-- Use alias to respect naming convention : snake_case

SELECT
    "codeInsee" AS code_geo,
    "nomCommune" AS nom_commune,
    "dateDebutEvenement" AS date_debut_evenement,
    "dateFinEvenement" AS date_fin_evenement,
    "dateArrete" AS date_arrete,
    "dateParutionJO" AS date_parution_jo,
    "nomPeril" AS nom_peril,
    franchise,
    "libelleAvis" AS libelle_avis,
    code_arrete
FROM
    'pipeline_inputs/ccr_details.csv'
