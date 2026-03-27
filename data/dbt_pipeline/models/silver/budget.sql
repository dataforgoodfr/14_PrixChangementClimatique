WITH
bugdet AS (
    SELECT
        code_geo_from_siren,
        nom_com,
        annee,
        SUM(CASE WHEN type_compte = 'dettes financieres' THEN solde ELSE 0 END) AS dettes,
        SUM(CASE WHEN type_compte = 'primes d ASsurances' THEN solde ELSE 0 END) AS primes,
        SUM(CASE WHEN type_compte = 'depenses' THEN solde ELSE 0 END) AS depenses,
        SUM(CASE WHEN type_compte = 'produits' THEN solde ELSE 0 END) AS produits
    FROM
        {{ ref('budget_per_compte_communes') }}
    WHERE
        type_compte IN ('dettes financieres', 'primes d ASsurances', 'depenses', 'produits')
    GROUP BY
        code_geo_from_siren,
        nom_com,
        annee
),

pop_unpivoted AS (
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
)

SELECT
    bugdet.*,
    pop.population,
    bugdet.produits - bugdet.depenses AS solde_annuel,
    bugdet.dettes / bugdet.produits AS ratio_dettes_produits,
    bugdet.dettes / bugdet.depenses AS ratio_dettes_depenses,
    bugdet.primes / bugdet.depenses AS ratio_primes_depenses,
    bugdet.dettes / pop.population AS dettes_per_pop,
    bugdet.primes / pop.population AS primes_per_pop,
    bugdet.depenses / pop.population AS depenses_per_pop,
    bugdet.produits / pop.population AS produits_per_pop,
    (bugdet.produits - bugdet.depenses) / pop.population AS solde_annuel_per_pop
FROM
    bugdet
LEFT JOIN
    pop_unpivoted AS pop
    ON
        bugdet.code_geo_from_siren = pop.code_geo
        AND bugdet.annee = pop.annee
