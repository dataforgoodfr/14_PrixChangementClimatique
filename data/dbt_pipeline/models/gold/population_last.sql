/*
    population_last.sql

    Pour chaque code géographique :
    - conserve la valeur la plus récente de population disponible
    - conserve l'année de recensement correspondante

    Source :
        - Silver : population_par_com_annee

    Granularité :
        - une ligne par code_geo
*/

SELECT
    code_geo,
    MAX(annee_recensement) AS annee_recensement,
    MAX_BY(population, annee_recensement) AS population
FROM {{ ref('population_par_com_annee') }}
GROUP BY code_geo
