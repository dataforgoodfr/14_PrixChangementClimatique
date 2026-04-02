-- pprn_clean.sql

-- Approbation plus recentes
WITH last_update AS (
    SELECT 
        code_geo,
        code_modele,
        libelle_risque_2,
        libelle_risque_3,
        CAST(approbation AS TIMESTAMP) AS date_approbation
    FROM pprn_gaspar
    WHERE libelle_etat = 'Opposable'
),

-- Le PPRN-Multi peut couvrir plusieurs risques, on modifie donc les libellés pour que tous les risques figurent
aggregated_risks AS (
    SELECT 
        code_geo,
        code_modele,
        STRING_AGG(DISTINCT libelle_risque_2, ' / ') AS agg_libelle,
        STRING_AGG(DISTINCT libelle_risque_3, ' / ') AS agg_desc,
        MAX(date_approbation) AS max_approbation
    FROM last_update
    GROUP BY code_geo, code_modele
)

SELECT 
    code_geo,
    REPLACE(code_modele, 'PPRN-', '') AS pprn,
    CASE 
        WHEN code_modele = 'PPRN-Multi' THEN agg_libelle 
        ELSE agg_libelle 
    END AS pprn_libelle,
    CASE 
        WHEN code_modele = 'PPRN-Multi' THEN agg_desc 
        ELSE agg_desc 
    END AS pprn_desc,
    max_approbation AS date_approbation
FROM aggregated_risks;
