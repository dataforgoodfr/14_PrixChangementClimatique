/*
budget_par_com_annee.sql

Agrégation des comptes de dettes, dépenses et produits par commune
Passage en positif des valeurs de dettes
Suppression des valeurs de dettes anormales (< 0 après changement de signe)

Source :
    - Bronze : budget_per_compte_communes

Granularité :
    - Commune
*/


WITH dettes_par_annee_geo AS (
    SELECT
        annee,
        code_geo_from_siren AS code_geo,
        SUM(CASE WHEN type_compte = 'dettes' THEN -solde ELSE 0 END) AS somme_dettes,
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
)

SELECT
    annee,
    code_geo,
    depenses,
    produits,
    CASE WHEN somme_dettes < 0 THEN NULL ELSE somme_dettes END AS dettes
FROM
    dettes_par_annee_geo
