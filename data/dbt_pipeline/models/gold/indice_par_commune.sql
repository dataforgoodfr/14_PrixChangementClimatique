-- indice_par_commune.sql
-- Gold layer: Table des scores et indices par commune
-- Source: Bronze layer opendatasoft_communes + scores temporaires précalculés


SELECT
    c.code_geo,
    s.score_economique,
    s.score_exposition,
    s.score_assurance,
    s.indice_vulnerabilite_niveau
FROM {{ ref('opendatasoft_communes') }} AS c
LEFT JOIN {{ ref('score_temporaire') }} AS s
    ON c.code_geo = s.code_insee
