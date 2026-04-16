WITH source_budget AS (
    SELECT * FROM {{ ref('budget_communes') }}
),

source_impots AS (
    -- On agrège pour garantir l'unicité par commune et par année
    SELECT
        annee,
        code_geo,
        SUM(montant) as montant_impot
    FROM {{ ref('donnees_financieres_ofgl') }}
    WHERE agregat = 'Impôts locaux'
    GROUP BY annee, code_geo
)

SELECT
    b.annee,
    b.code_geo,
    b.siret_budget,
    b.libelle_budget,
    b.type_budget,
    b.montant AS montant_budget, -- On renomme pour éviter le conflit avec montant_impot
    COALESCE(i.montant_impot, 0) AS montant_impot
FROM source_budget b
LEFT JOIN source_impots i
    ON b.code_geo = i.code_geo
    AND b.annee = i.annee
