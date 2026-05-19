-- PREMIERE ETAPE : création de la "table pivot" de population par commune par année
WITH table_pivot_population AS (
    SELECT
        code_geo,
        2013 AS annee_recensement,
        2016 AS annee,
        pop_2016 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2014 AS annee_recensement,
        2017 AS annee,
        pop_2017 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2015 AS annee_recensement,
        2018 AS annee,
        pop_2018 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2016 AS annee_recensement,
        2019 AS annee,
        pop_2019 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2017 AS annee_recensement,
        2020 AS annee,
        pop_2020 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2018 AS annee_recensement,
        2021 AS annee,
        pop_2021 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2019 AS annee_recensement,
        2022 AS annee,
        pop_2022 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2020 AS annee_recensement,
        2023 AS annee,
        pop_2023 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2021 AS annee_recensement,
        2024 AS annee,
        pop_2024 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2022 AS annee_recensement,
        2025 AS annee,
        pop_2025 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2023 AS annee_recensement,
        2026 AS annee,
        pop_2026 AS population
    FROM {{ ref('population_code_geo') }}
),

-- DEUXIEME ETAPE : on somme les arrondissements pour Marseille, Paris et Lyon
-- & on filtre les lignes où les populations sont "null"
population_agregee AS (
    SELECT
        annee_recensement,
        annee,
        CASE
            -- Paris (75xxx -> 75000)
            WHEN code_geo LIKE '75%' THEN '75000'

            -- Lyon (693xx -> 69123)
            WHEN code_geo LIKE '693%' THEN '69123'

            -- Marseille (132xx -> 13055)
            WHEN code_geo LIKE '132%' THEN '13055'

            -- autres communes inchangées
            ELSE code_geo
        END AS code_geo,
        SUM(population) AS population
    FROM table_pivot_population
    WHERE population IS NOT NULL
    GROUP BY
        CASE
            WHEN code_geo LIKE '75%' THEN '75000'
            WHEN code_geo LIKE '693%' THEN '69123'
            WHEN code_geo LIKE '132%' THEN '13055'
            ELSE code_geo
        END,
        annee_recensement,
        annee
)

SELECT *
FROM population_agregee
