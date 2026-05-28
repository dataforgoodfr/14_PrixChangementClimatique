-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI temporaire
-- Source: Bronze layer communes +  KPI
-- Description: Contient les données communes nécessaires pour le site web
-- avec les KPI attendus :
-- o indices et scores temporaires randoms issus de la table indice_par_commune

WITH prime AS (
    SELECT
        code_geo,

        MAX(CASE WHEN annee = 2024 THEN prime_assurance END) AS prime_assurance_2024,
        MAX(CASE WHEN annee = 2023 THEN prime_assurance END) AS prime_assurance_2023,
        MAX(CASE WHEN annee = 2022 THEN prime_assurance END) AS prime_assurance_2022,
        MAX(CASE WHEN annee = 2021 THEN prime_assurance END) AS prime_assurance_2021,
        MAX(CASE WHEN annee = 2020 THEN prime_assurance END) AS prime_assurance_2020

    FROM {{ ref('primes_par_communes') }}
    WHERE annee BETWEEN 2020 AND 2024
    GROUP BY code_geo
),

ccr_totals AS (
    SELECT
        code_geo,
        SUM(nb_arrete_recon)::INTEGER AS nb_total_arretes_recon,
        SUM(nb_arrete)::INTEGER AS nb_total_arretes,
        SUM(nb_arrete_ino)::INTEGER AS nb_total_arretes_ino,
        SUM(nb_arrete_sec)::INTEGER AS nb_total_arretes_sec,
        (
            SUM(nb_arrete_mvt)::INTEGER + SUM(nb_arrete_meteo)::INTEGER + SUM(nb_arrete_marin)::INTEGER
            + SUM(nb_arrete_sism)::INTEGER + SUM(nb_arrete_autre)::INTEGER
        ) AS nb_total_arretes_autre,
        MAX_BY(multiple_franchise, annee) AS multiple_franchise_last,
        COALESCE(SUM(nb_arrete_refus)::INTEGER / NULLIF(SUM(nb_arrete)::INTEGER, 0), 0) AS part_arretes_non_reconnus
    FROM {{ ref('ccr_stats') }}
    GROUP BY code_geo
),

budget_last AS (
    SELECT
        code_geo,
        MAX(ratio_dettes_depenses) FILTER (WHERE annee = 2024) AS ratio_dettes_depenses,
        MAX(depenses) FILTER (WHERE annee = 2024) AS depenses,
        MAX_BY(depenses_per_pop, annee) AS depenses_per_pop
    FROM {{ ref('indicateurs_budget') }}
    WHERE annee IN (2022, 2023, 2024)
    GROUP BY code_geo
),

pprn AS (
    SELECT
        code_geo,
        COALESCE(BOOL_OR(pprn_desc ILIKE '%tassements différentiels%'), FALSE) AS pprn_rga,
        COALESCE(BOOL_OR(pprn_libelle ILIKE '%Inondation%'), FALSE) AS pprn_ino,
        MAX(
            CASE
                WHEN pprn_desc ILIKE '%tassements différentiels%'
                    THEN date_approbation
            END
        ) AS date_approbation_rga,
        MAX(
            CASE
                WHEN pprn_libelle ILIKE '%inondation%'
                    THEN date_approbation
            END
        ) AS date_approbation_ino
    FROM {{ ref('pprn_clean') }}
    GROUP BY code_geo
),

kpi_impots AS (
    SELECT
        code_geo,
        SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END) AS impots_locaux,
        (
            SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
            - SUM(CASE WHEN annee = 2020 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
        ) / NULLIF(
            SUM(CASE WHEN annee = 2020 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END), 0
        ) AS impots_locaux_evolution,
        SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
        / NULLIF(
            SUM(CASE WHEN annee = 2024 AND agregat = 'Recettes de fonctionnement' THEN montant ELSE 0 END), 0
        ) AS part_impots_locaux
    FROM {{ ref('donnees_financieres_ofgl') }}
    GROUP BY code_geo
)

SELECT
    c.code_geo AS code_insee,
    c.nom_departement AS departement,
    c.nom_region AS region,
    c.geo_point_2_d,
    c.code_departement,
    c.code_region,
    c.geometry,
    c.nom_commune,

    -- scores récupérés depuis la table indices
    i.score_economique,
    i.score_exposition,
    i.score_assurance,
    i.indice_vulnerabilite_niveau,

    tr.indicateur_tri,
    tr.indicateur_rga,

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
    t.nb_total_arretes_autre,
    t.multiple_franchise_last,
    t.part_arretes_non_reconnus,
    p.prime_assurance_2024,

    p.prime_assurance_2023,
    p.prime_assurance_2022,
    p.prime_assurance_2021,
    p.prime_assurance_2020,
    pr.date_approbation_rga,

    pr.date_approbation_ino,
    pop.population,
    i_loc.impots_locaux,
    i_loc.impots_locaux_evolution,

    i_loc.part_impots_locaux,

    ROUND(b.ratio_dettes_depenses * -100, 1) AS taux_endettement,
    pr.pprn_rga IS TRUE AS pprn_rga,

    pr.pprn_ino IS TRUE AS pprn_ino,
    p.prime_assurance_2024 / b.depenses AS part_prime_budget,
    (p.prime_assurance_2024 - p.prime_assurance_2020) / NULLIF(p.prime_assurance_2020, 0) AS evolution_prime_assurance,

    ROUND(PERCENT_RANK() OVER (ORDER BY p.prime_assurance_2024 / b.depenses DESC) * 100)
        AS rank_part_prime_budget,
    ROUND(
        PERCENT_RANK()
            OVER (ORDER BY (p.prime_assurance_2024 - p.prime_assurance_2020) / NULLIF(p.prime_assurance_2020, 0) DESC)
        * 100
    )
        AS rank_evolution_prime,
    ROUND(PERCENT_RANK() OVER (ORDER BY t.part_arretes_non_reconnus DESC) * 100)
        AS rank_part_arretes_non_reconnus,
    ROUND(PERCENT_RANK() OVER (ORDER BY b.ratio_dettes_depenses ASC) * 100)
        AS rank_ratio_dettes_depenses,
    ROUND(PERCENT_RANK() OVER (ORDER BY b.depenses_per_pop ASC) * 100)
        AS rank_depenses_per_pop

FROM {{ ref('opendatasoft_communes') }} AS c

LEFT JOIN {{ ref('scenario_2050') }} AS r
    ON c.code_geo = r.code_geo

LEFT JOIN {{ ref('indicateurs_tri_rga_bats_par_com') }} AS tr
    ON c.code_geo = tr.code_geo

LEFT JOIN {{ ref('population_par_com_annee') }} AS pop
    ON
        c.code_geo = pop.code_geo
        AND pop.annee_recensement = 2023

LEFT JOIN budget_last AS b
    ON c.code_geo = b.code_geo

LEFT JOIN ccr_totals AS t
    ON c.code_geo = t.code_geo

LEFT JOIN prime AS p
    ON c.code_geo = p.code_geo

LEFT JOIN pprn AS pr
    ON c.code_geo = pr.code_geo

LEFT JOIN {{ ref('indice_par_commune') }} AS i
    ON c.code_geo = i.code_geo

LEFT JOIN kpi_impots AS i_loc
    ON c.code_geo = i_loc.code_geo
