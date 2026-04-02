-- pprn_clean.sql

-- Filtrer PPRN actifs
WITH active_pprn AS (
    SELECT *
    FROM {{ ref('pprn_gaspar') }}
    WHERE libelle_etat = 'Opposable'
),

-- Approbation plus recentes
last_update AS (
    SELECT *,
        ROW_NUMBER() OVER(
            PARTITION BY code_modele, code_geo
            ORDER BY CAST(approbation AS TIMESTAMP) DESC
        ) AS rn
    FROM active_pprn
)

SELECT 
    code_geo,
    REPLACE(code_modele, 'PPRN-', '') AS pprn,
    libelle_risque_2 AS pprn_libelle,
    libelle_risque_3 AS pprn_desc,
    approbation AS date_approbation
FROM last_update
WHERE rn = 1;
