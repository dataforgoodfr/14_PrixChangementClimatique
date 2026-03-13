-- resultats_par_commune.sql
-- Gold layer: Résultats enrichis par commune avec KPI temporaire
-- Source: Bronze layer communes + random KPI
-- Description: Contient toutes les données des communes avec un KPI temporaire 'valeur' (nombre aléatoire)

SELECT
    *,
    -- KPI temporaire: génère un nombre aléatoire entre 0 et 1
    RANDOM() AS valeur
FROM {{ ref('opendatasoft_communes') }}
