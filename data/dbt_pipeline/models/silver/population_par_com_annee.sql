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
)

-- DEUXIEME ETAPE: On filtre les données de population nulles
SELECT 
*
FROM table_pivot_population
WHERE population IS NOT NULL


-- TROISIEME ETAPE : Ajout dans la table population finale les données de population (2017) de Mayotte
-- Lien de la source : https://www.insee.fr/fr/statistiques/5392668?sommaire=2120838

INSERT INTO table_pivot_population_not_null (code_geo, annee_recensement, annee, population)
VALUES
('97601', 2017, 2020, 5384),
('97602', 2017, 2020, 14211),
('97603', 2017, 2020, 10529),
('97604', 2017, 2020, 6503'),
('97605', 2017, 2020, 8616),
('97606', 2017, 2020, 9197),
('97607', 2017, 2020, 16116),
('97608', 2017, 2020, 18237),
('97609', 2017, 2020, 5716),
('97610', 2017, 2020, 32752),
('97611', 2017, 2020, 72974),
('97612', 2017, 2020, 8025),
('97613', 2017, 2020, 6586),
('97614', 2017, 2020, 10393),
('97615', 2017, 2020, 11802),
('97616', 2017, 2020, 11619),
('97617', 2017, 2020, 14235);
