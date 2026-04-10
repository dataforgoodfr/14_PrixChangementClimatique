-- pprn_clean.sql
-- Le PPRN-Multi peut couvrir plusieurs risques, on modifie donc les libellés pour que tous les risques figurent
SELECT
    code_geo,
    REPLACE(code_modele, 'PPRN-', '') AS pprn,
    STRING_AGG(DISTINCT libelle_risque_2, ' / ') AS pprn_libelle,
    STRING_AGG(DISTINCT libelle_risque_3, ' / ') AS pprn_desc,
    MAX(CAST(approbation AS DATETIME)) AS date_approbation
FROM
    {{ ref('pprn_gaspar') }}
WHERE
    libelle_etat = 'Opposable'
GROUP BY
    code_geo, code_modele
