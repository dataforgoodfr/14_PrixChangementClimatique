-- budget_par_com_annee.sql

SELECT
    annee,
    code_geo_from_siren AS code_geo,
    SUM(CASE WHEN type_compte = 'dettes' THEN solde ELSE 0 END) AS dettes,
    SUM(CASE WHEN type_compte = 'depenses' THEN solde ELSE 0 END) AS depenses,
    SUM(CASE WHEN type_compte = 'produits' THEN solde ELSE 0 END) AS produits
FROM
    {{ ref('budget_per_compte_communes') }}
WHERE
    type_compte IN ('dettes', 'depenses', 'produits')
    AND code_geo_from_siren IS NOT NULL
GROUP BY
    annee,
    code_geo_from_siren
