-- features_indices.sql

WITH prime AS (
    SELECT
        code_geo,
        CASE WHEN annee = 2024 THEN prime_assurance END AS prime_assurance_2024,
        CASE WHEN annee = 2020 THEN prime_assurance END AS prime_assurance_2020
    FROM {{ ref('primes_par_communes') }}
    WHERE annee IN (2020, 2024)
),

WITH ccr_totals AS (
    SELECT
        code_geo,
        SUM(nb_arrete_recon) AS nb_arrete_recon,
        SUM(nb_arrete) AS nb_arrete,
        SUM(nb_arrete_ino) AS nb_arrete_ino,
        SUM(nb_arrete_sec) AS nb_arrete_sec
    FROM {{ ref('ccr_stats') }}
    GROUP BY code_geo
),

ccr_last AS (
    SELECT 
        code_geo,
        multiple_franchise
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY code_geo
                   ORDER BY annee DESC
               ) AS rn
        FROM {{ ref('ccr_stats') }}
    )
    WHERE rn = 1
)

WITH budget_last AS (
    SELECT 
        code_geo,
        ratio_dettes_depenses,
        depenses_per_pop
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY code_geo
                   ORDER BY annee DESC
               ) AS rn
        FROM {{ ref('indicateurs_budget') }}
    )
    WHERE rn = 1
)

pprn AS (
    SELECT
        code_geo,
        CASE
            WHEN pprn_desc ILIKE '%tassements différentiels%'
            THEN TRUE
            ELSE FALSE
        END AS pprn_rga,

        CASE
            WHEN pprn_libelle ILIKE '%Inondation%'
            THEN TRUE
            ELSE FALSE
        END AS pprn_ino,
    FROM {{ ref('pprn_clean') }}
)


SELECT
    r.code_geo,
    r.swi_04_d_abs,
    r.rr_50_d_abs,
    r.pxcwd_abs,
    r.tx_35_d_abs,

    b.ratio_dettes_depenses,
    b.depenses_per_pop,

    t.nb_arrete_recon,
    t.nb_arrete,
    t.nb_arrete_ino,
    t.nb_arrete_sec,
    l.multiple_franchise,

    p.prime_assurance_2024,
    (p.prime_assurance_2024 - p.prime_assurance_2020)/NULLIF(p.prime_assurance_2020, 0) AS evolution_prime_assurance,

    pr.pprn_rga,
    pr.pprn_ino

FROM {{ ref('resultat_2050') }} r

LEFT JOIN budget_last AS b
    ON r.code_geo = b.code_geo

LEFT JOIN ccr_totals AS t
    ON r.code_geo = t.code_geo

LEFT JOIN ccr_last AS l
    ON r.code_geo = l.code_geo

LEFT JOIN prime AS p
    ON r.code_geo = p.code_geo

LEFT JOIN pprn pr
    ON r.code_geo = pr.code_geo

