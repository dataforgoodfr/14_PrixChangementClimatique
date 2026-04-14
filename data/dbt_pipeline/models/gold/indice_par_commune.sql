-- indice_par_commune.sql
-- Gold layer: Table des scores et indices par commune avec valeurs randoms temporaires
-- Source: Bronze layer opendatasoft_communes + random

SELECT
    code_geo,
    -- KPI temporaires: génère des valeurs aléatoires entre 0 et 1
    RANDOM() AS score_economique,
    RANDOM() AS score_georisque,
    RANDOM() AS score_assurance,
    RANDOM() AS indice_vulnerabilite,
    -- KPI temporaires: génère des valeurs aléatoires entières entre 1 et 5
    FLOOR(1 + (RANDOM() * 5)) AS indice_vulnerabilite_niveau
FROM {{ ref('opendatasoft_communes') }}
