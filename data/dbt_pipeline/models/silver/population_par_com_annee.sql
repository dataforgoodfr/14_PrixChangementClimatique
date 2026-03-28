-- population_par_com_annee.sql

    SELECT
        code_geo,
        2016 AS annee,
        pop_2016 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2017 AS annee,
        pop_2017 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2018 AS annee,
        pop_2018 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2019 AS annee,
        pop_2019 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2020 AS annee,
        pop_2020 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2021 AS annee,
        pop_2021 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2022 AS annee,
        pop_2022 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2023 AS annee,
        pop_2023 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2024 AS annee,
        pop_2024 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2025 AS annee,
        pop_2025 AS population
    FROM {{ ref('population_code_geo') }}

    UNION ALL
    SELECT
        code_geo,
        2026 AS annee,
        pop_2026 AS population
    FROM {{ ref('population_code_geo') }}