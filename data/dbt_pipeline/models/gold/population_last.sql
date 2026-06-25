/*
    population_last.sql

    Pour chaque code géographique :
    - conserve la valeur la plus récente de population disponible
      parmi les années 2022 à 2024.

    Source :
        - Silver : population_par_com_annee

    Granularité :
        - une ligne par code_geo
*/

SELECT
    code_geo,
    annee_recensement,
    MAX_BY(population, annee_recensement) AS population
FROM {{ ref('population_par_com_annee') }}
GROUP BY code_geo
