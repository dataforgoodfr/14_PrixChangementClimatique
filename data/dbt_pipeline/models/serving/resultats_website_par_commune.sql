-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI
-- Source: Bronze layer communes +  KPI gold + scores gold
-- Description: Contient les données communes nécessaires pour le site web

SELECT
    c.code_geo AS code_insee,
    c.nom_departement AS departement,
    c.nom_region AS region,
    c.geo_point_2_d,
    c.code_departement,
    c.code_region,
    c.geometry,
    c.nom_commune,

    -- KPI récupérés depuis la table indice_par_commune
    i.score_economique,
    i.score_exposition,
    i.score_assurance,
    i.score_secheresse,
    i.score_inondation,
    i.indice_vulnerabilite_niveau,

    r.swi_04_d_abs,
    r.rr_50_d_abs,

    r.pxcwd_abs,
    r.tx_35_d_abs,
    t.nb_total_arretes_recon,
    t.nb_total_arretes,

    t.nb_total_arretes_ino,
    t.nb_total_arretes_sec,

    t.nb_total_arretes_autre,
    t.multiple_franchise_last,
    pr.date_approbation_rga,
    pr.date_approbation_ino,
    pop.population,
    i_loc.impots_locaux,
    ROUND(tr.indicateur_tri, 2) AS indicateur_tri,

    ROUND(tr.indicateur_rga, 2) AS indicateur_rga,
    ROUND(b.ratio_dettes_depenses * -100, 1) AS taux_endettement,
    ROUND(b.depenses_per_pop, 0) AS depenses_per_pop,
    ROUND(t.part_arretes_non_reconnus, 2) AS part_arretes_non_reconnus,
    ROUND(p.prime_assurance_2024, 2) AS prime_assurance_2024,
    ROUND(p.prime_assurance_2023, 2) AS prime_assurance_2023,
    ROUND(p.prime_assurance_2022, 2) AS prime_assurance_2022,

    ROUND(p.prime_assurance_2021, 2) AS prime_assurance_2021,
    ROUND(p.prime_assurance_2020, 2) AS prime_assurance_2020,

    ROUND(p.part_prime_budget, 2) AS part_prime_budget,

    ROUND(p.evolution_prime_assurance, 2) AS evolution_prime_assurance,
    ROUND(i_loc.impots_locaux_evolution, 2) AS impots_locaux_evolution,
    ROUND(i_loc.part_impots_locaux, 3) AS part_impots_locaux,

    pr.pprn_rga IS TRUE AS pprn_rga,
    pr.pprn_ino IS TRUE AS pprn_ino

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
