-- ccr_details.sql

WITH drop_duplicates AS (
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
        code_arrete,
        ROW_NUMBER() OVER (
            PARTITION BY code_geo, code_arrete, nom_peril
            ORDER BY date_arrete DESC
        ) AS rn
    FROM 'pipeline_inputs/ccr_details.csv'
)

SELECT
    code_geo,
    nom_commune,
    date_debut_evenement,
    date_fin_evenement,
    date_arrete,
    date_parution_jo,
    nom_peril,
    franchise,
    libelle_avis,
    code_arrete
FROM drop_duplicates
WHERE rn = 1
