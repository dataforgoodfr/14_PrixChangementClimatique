WITH population_without_mayotte AS (
    SELECT
        "codgeo" AS code_geo,
        "libgeo" AS nom_geo,
        "dep" AS code_departement,
        "p13_pop" AS pop_2016,
        "p14_pop" AS pop_2017,
        "p15_pop" AS pop_2018,
        "p16_pop" AS pop_2019,
        "p17_pop" AS pop_2020,
        "p18_pop" AS pop_2021,
        "p19_pop" AS pop_2022,
        "p20_pop" AS pop_2023,
        "p21_pop" AS pop_2024,
        "p22_pop" AS pop_2025,
        "p23_pop" AS pop_2026,
        CAST("reg" AS VARCHAR) AS code_region
    FROM 'pipeline_inputs/population_communes_france_raw.csv'
)

population_mayotte AS (
    SELECT
        CAST("code_geo" AS VARCHAR) AS code_geo,
        "nom_geo" AS nom_geo,
        CAST("code_departement" AS VARCHAR) AS code_departement,
        "pop_2016" AS pop_2016,
        "pop_2017" AS pop_2017,
        "pop_2018" AS pop_2018,
        "pop_2019" AS pop_2019,
        "pop_2020" AS pop_2020,
        "pop_2021" AS pop_2021,
        "pop_2022" AS pop_2022,
        "pop_2023" AS pop_2023,
        "pop_2024" AS pop_2024,
        "pop_2025" AS pop_2025,
        "pop_2026" AS pop_2026,
        CAST("reg" AS VARCHAR) AS code_region
    FROM 'pipeline_inputs/population_mayotte_2017.csv'
)

-- On réunit les deux tables
SELECT
*
FROM population_without_mayotte

UNION ALL
SELECT
*
FROM population_mayotte
