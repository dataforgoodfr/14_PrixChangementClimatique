/*
pprn.sql

Agrège les informations de Plans de Prévention des Risques Naturels (PPRN)
par commune servant au calcul du score exposition et affichés sur le site.

───────────────────────────────────────────────────────────────────────────────
Logique d’agrégation

- BOOL_OR est utilisé pour détecter la présence d’au moins un PPRN
  par type sur la commune.
- MAX sur les dates permet de récupérer la dernière approbation
  par type de risque.

───────────────────────────────────────────────────────────────────────────────

Source :
    - Silver : pprn_clean

Granularité :
    - 1 ligne par code_geo

*/


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
