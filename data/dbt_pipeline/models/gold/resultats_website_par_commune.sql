-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI temporaire
-- Source: Bronze layer communes +  KPI
-- Description: Contient les données communes nécessaires pour le site web
-- avec les KPI attendus :
-- o indices et scores temporaires randoms issus de la table indice_par_commune

WITH prime AS (
    SELECT
        code_geo,
        CASE WHEN annee = 2024 THEN prime_assurance END AS prime_assurance_2024,
        CASE WHEN annee = 2020 THEN prime_assurance END AS prime_assurance_2020
    FROM {{ ref('primes_par_communes') }}
    WHERE annee IN (2020, 2024)
),

ccr_totals AS (
    SELECT
        code_geo,
        SUM(nb_arrete_recon) AS nb_total_arretes_recon,
        SUM(nb_arrete) AS nb_total_arretes,
        SUM(nb_arrete_ino) AS nb_total_arretes_ino,
        SUM(nb_arrete_sec) AS nb_total_arretes_sec
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
                ORDER BY
                    CASE WHEN depenses_per_pop IS NOT NULL THEN 0 ELSE 1 END,
                    annee DESC
            ) AS rn
        FROM {{ ref('indicateurs_budget') }}
    )
    WHERE rn = 1
),

pprn AS (
    SELECT
        code_geo,
        (pprn_desc ILIKE '%tassements différentiels%') AS pprn_rga,
        (pprn_libelle ILIKE '%Inondation%') AS pprn_ino
    FROM {{ ref('pprn_clean') }}
)

SELECT
    c.code_geo,
    c.nom_departement AS departement,
    c.nom_region AS region,
    c.geo_point_2_d,
    c.code_departement,
    c.code_region,

    -- KPI randoms récupérés depuis la table indices
    i.score_economique,
    i.score_georisque,
    i.score_assurance,
    i.indice_vulnerabilite,
    i.indice_vulnerabilite_niveau,

    r.swi_04_d_abs,
    r.rr_50_d_abs,
    r.pxcwd_abs,
    r.tx_35_d_abs,

    b.ratio_dettes_depenses,
    b.depenses_per_pop,

    t.nb_total_arretes_recon,
    t.nb_total_arretes,
    t.nb_total_arretes_ino,
    t.nb_total_arretes_sec,
    l.multiple_franchise,

    p.prime_assurance_2024,

    pr.pprn_rga,
    pr.pprn_ino,

    pop.population,
    CAST(c.geometry AS geometry) AS geometry, --noqa

    p.prime_assurance_2024 / b.depenses AS part_prime_budget,
    (p.prime_assurance_2024 - p.prime_assurance_2020) / NULLIF(p.prime_assurance_2020, 0) AS evolution_prime_assurance

FROM {{ ref('opendatasoft_communes') }} AS c

LEFT JOIN {{ ref('scenario_2050') }} AS r
    ON c.code_geo = r.code_geo

LEFT JOIN {{ ref('population_par_com_annee') }} AS pop
    ON
        c.code_geo = pop.code_geo
        AND pop.annee = 2026

LEFT JOIN budget_last AS b
    ON c.code_geo = b.code_geo

LEFT JOIN ccr_totals AS t
    ON c.code_geo = t.code_geo

LEFT JOIN ccr_last AS l
    ON c.code_geo = l.code_geo

LEFT JOIN prime AS p
    ON c.code_geo = p.code_geo

LEFT JOIN pprn AS pr
    ON c.code_geo = pr.code_geo

LEFT JOIN {{ ref('indice_par_commune') }} AS i
    ON c.code_geo = i.code_geo
