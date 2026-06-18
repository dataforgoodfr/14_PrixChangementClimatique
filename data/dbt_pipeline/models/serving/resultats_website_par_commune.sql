/*
resultats_website_par_commune.sql

Table d’exposition (Serving layer) construite pour alimenter le site web.

Elle regroupe, par commune, l’ensemble des données calculées et des données
sources que l'on souhaite afficher

───────────────────────────────────────────────────────────────────────────────
Sources :

    - Bronze :
        - opendatasoft_communes

    - Silver :
        - scenario_2050
        - indicateurs_tri_rga_bats_par_com
        - population_par_com_annee

    - Gold :
        - budget_last
        - Golccr_totals
        - prime
        - pprn
        - indice_par_commune
        - kpi_impots


Granularité :
    - 1 ligne par commune (code INSEE)

*/

SELECT

    -- Dimensions géographiques (source : opendatasoft_communes)
    c.code_geo AS code_insee,
    c.nom_departement AS departement,
    c.nom_region AS region,
    c.geo_point_2_d,
    c.code_departement,
    c.code_region,
    c.geometry,
    c.nom_commune,
    pop.population,

    -- Scores synthétiques (Gold KPI)
    i.score_economique,
    i.score_exposition,
    i.score_assurance,
    i.score_secheresse,
    i.score_inondation,
    i.indice_vulnerabilite_niveau,

    -- Indicateurs climatiques et scénarios
    r.swi_04_d_abs,
    r.rr_50_d_abs,
    r.pxcwd_abs,
    r.tx_35_d_abs,

    -- Indicateurs arrêtés
    t.nb_total_arretes_recon,
    t.nb_total_arretes,
    t.nb_total_arretes_ino,
    t.nb_total_arretes_sec,
    t.nb_total_arretes_autre,
    pr.date_approbation_rga,

    -- Indicateurs de risques naturels
    pr.date_approbation_ino,
    i_loc.impots_locaux_2024,
    t.multiple_franchise_last,
    ROUND(t.part_arretes_non_reconnus, 2) AS part_arretes_non_reconnus,
    ROUND(tr.indicateur_tri, 2) AS indicateur_tri,
    ROUND(tr.indicateur_rga, 2) AS indicateur_rga,

    -- Indicateurs économiques
    pr.pprn_rga IS TRUE AS pprn_rga,
    pr.pprn_ino IS TRUE AS pprn_ino,
    ROUND(i_loc.impots_locaux_evolution, 2) AS impots_locaux_evolution,
    ROUND(i_loc.part_impots_locaux, 2) AS part_impots_locaux,
    ROUND(b.ratio_dettes_depenses * 100, 1) AS taux_endettement,

    -- Indicateurs assurantiels
    ROUND(b.depenses_per_pop, 0) AS depenses_per_pop,
    ROUND(p.prime_assurance_2024, 2) AS prime_assurance_2024,
    ROUND(p.prime_assurance_2023, 2) AS prime_assurance_2023,
    ROUND(p.prime_assurance_2022, 2) AS prime_assurance_2022,
    ROUND(p.prime_assurance_2021, 2) AS prime_assurance_2021,
    ROUND(p.prime_assurance_2020, 2) AS prime_assurance_2020,
    ROUND(p.evolution_prime_assurance, 2) AS evolution_prime_assurance,
    ROUND(p.part_prime_budget_2024, 4) AS part_prime_budget_2024,
    ROUND(p.part_prime_budget_2023, 4) AS part_prime_budget_2023,
    ROUND(p.part_prime_budget_2022, 4) AS part_prime_budget_2022,
    ROUND(p.part_prime_budget_2021, 4) AS part_prime_budget_2021,
    ROUND(p.part_prime_budget_2020, 4) AS part_prime_budget_2020,

    -- Rang de la commune pour texte explicatif
    CASE
        WHEN p.part_prime_budget_2024 IS NULL THEN NULL
        ELSE ROUND(
            (
                RANK() OVER (
                    ORDER BY p.part_prime_budget_2024 DESC
                ) - 1
            ) * 100.0
            /
            NULLIF(
                COUNT(p.part_prime_budget_2024) OVER () - 1,
                0
            )
        )
    END AS rank_part_prime_budget,

    CASE
        WHEN p.evolution_prime_assurance IS NULL THEN NULL
        ELSE ROUND(
            (
                RANK() OVER (
                    ORDER BY p.evolution_prime_assurance DESC
                ) - 1
            ) * 100.0
            /
            NULLIF(
                COUNT(p.evolution_prime_assurance) OVER () - 1,
                0
            )
        )
    END AS rank_evolution_prime,

    CASE
        WHEN t.part_arretes_non_reconnus IS NULL THEN NULL
        ELSE ROUND(
            (
                RANK() OVER (
                    ORDER BY t.part_arretes_non_reconnus DESC
                ) - 1
            ) * 100.0
            /
            NULLIF(
                COUNT(t.part_arretes_non_reconnus) OVER () - 1,
                0
            )
        )
    END AS rank_part_arretes_non_reconnus,

    CASE
        WHEN b.ratio_dettes_depenses IS NULL THEN NULL
        ELSE ROUND(
            (
                RANK() OVER (
                    ORDER BY b.ratio_dettes_depenses DESC
                ) - 1
            ) * 100.0
            /
            NULLIF(
                COUNT(b.ratio_dettes_depenses) OVER () - 1,
                0
            )
        )
    END AS rank_ratio_dettes_depenses,

    CASE
        WHEN b.depenses_per_pop IS NULL THEN NULL
        ELSE ROUND(
            (
                RANK() OVER (
                    ORDER BY b.depenses_per_pop ASC
                ) - 1
            ) * 100.0
            /
            NULLIF(
                COUNT(b.depenses_per_pop) OVER () - 1,
                0
            )
        )
    END AS rank_depenses_per_pop

FROM {{ ref('opendatasoft_communes') }} AS c

LEFT JOIN {{ ref('scenario_2050') }} AS r
    ON c.code_geo = r.code_geo

LEFT JOIN {{ ref('indicateurs_tri_rga_bats_par_com') }} AS tr
    ON c.code_geo = tr.code_geo

LEFT JOIN {{ ref('population_par_com_annee') }} AS pop
    ON
        c.code_geo = pop.code_geo
        AND pop.annee_recensement = 2023

LEFT JOIN {{ ref('budget_last') }} AS b
    ON c.code_geo = b.code_geo

LEFT JOIN {{ ref('ccr_totals') }} AS t
    ON c.code_geo = t.code_geo

LEFT JOIN {{ ref('prime') }} AS p
    ON c.code_geo = p.code_geo

LEFT JOIN {{ ref('pprn') }} AS pr
    ON c.code_geo = pr.code_geo

LEFT JOIN {{ ref('indice_par_commune') }} AS i
    ON c.code_geo = i.code_geo

LEFT JOIN {{ ref('kpi_impots') }} AS i_loc
    ON c.code_geo = i_loc.code_geo
