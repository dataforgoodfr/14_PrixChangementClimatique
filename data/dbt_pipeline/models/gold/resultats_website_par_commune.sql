-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI temporaire
-- Source: Bronze layer communes +  KPI
-- Description: Contient les données communes nécessaires pour le site web
-- avec les KPI attendus :
-- o indices et scores temporaires randoms issus de la table indice_par_commune

SELECT
    c.code_geo AS code_insee,
    c.nom_departement AS departement,
    c.nom_region AS region,
    c.geo_point_2_d,
    c.geometry,

    -- KPI randoms récupérés depuis la table indices
    i.score_georisque,
    i.score_assurance,
    i.indice_vulnerabilite,
    i.indice_vulnerabilite_niveau,
    i.score_economique

FROM {{ ref('opendatasoft_communes') }} AS c
LEFT JOIN {{ ref('indice_par_commune') }} AS i
    ON c.code_geo = i.code_geo
