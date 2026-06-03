/*
    ccr_totals.sql

    Agrège les statistiques d’arrêtés de catastrophe naturelle par commune utiles
    au calcul des scores assurance et exposition et affichés sur le site.

    Source :
        - Silver : ccr_stats

    Agrégation :
        - granularité finale : 1 ligne par code_geo
*/

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
