-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI temporaire
-- Source: Bronze layer communes + random KPI
-- Description: Contient toutes les données des communes avec un KPI temporaire 'valeur' (nombre aléatoire)

WITH prime AS (
    SELECT
        code_geo,
        MAX(CASE WHEN annee = 2024 THEN prime_assurance END) AS prime_assurance_2024,
        MAX(CASE WHEN annee = 2020 THEN prime_assurance END) AS prime_assurance_2020
    FROM {{ ref('primes_par_communes') }}
    WHERE annee IN (2020, 2024)
    GROUP BY code_geo
),

ccr_totals AS (
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
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY code_geo
                ORDER BY annee DESC
            ) AS rn
        FROM {{ ref('ccr_stats') }}
    )
    WHERE rn = 1
),

budget_last AS (
    SELECT
        code_geo,
        ratio_dettes_depenses,
        depenses_per_pop,
        depenses
    FROM (
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY code_geo
                ORDER BY annee DESC
            ) AS rn
        FROM {{ ref('indicateurs_budget') }}
    )
    WHERE rn = 1
),

pprn AS (
    SELECT
        code_geo,
        COALESCE(pprn_desc ILIKE '%tassements différentiels%', FALSE) AS pprn_rga,

        COALESCE(pprn_libelle ILIKE '%Inondation%', FALSE) AS pprn_ino
    FROM {{ ref('pprn_clean') }}
),

SELECT
    o.code_geo,
    o.code_departement,
    o.code_region,
    o.geometry,
    o.geo_point_2_d,

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

    pr.pprn_rga,
    pr.pprn_ino,

    pop.pop_2026,
    p.prime_assurance_2024 / b.depenses AS part_prime_budget,

    (p.prime_assurance_2024 - p.prime_assurance_2020) / NULLIF(p.prime_assurance_2020, 0) AS evolution_prime_assurance

FROM {{ ref('opendatasoft_communes') }} AS o

LEFT JOIN {{ ref('scenario_2050') }} AS r
    ON o.code_geo = r.code_geo

LEFT JOIN {{ ref('population_par_com_annee') }} AS pop
    ON o.code_geo = pop.code_geo

LEFT JOIN budget_last AS b
    ON o.code_geo = b.code_geo

LEFT JOIN ccr_totals AS t
    ON o.code_geo = t.code_geo

LEFT JOIN ccr_last AS l
    ON o.code_geo = l.code_geo

LEFT JOIN prime AS p
    ON o.code_geo = p.code_geo

LEFT JOIN pprn AS pr
    ON o.code_geo = pr.code_geo
