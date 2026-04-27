WITH source_budget AS (
    -- On agrège par commune et année pour éviter les doublons de budgets multiples
    SELECT
        annee,
        code_geo,
        SUM(montant) AS montant_budget
    FROM {{ ref('budget_communes') }}
    GROUP BY annee, code_geo
),

source_impots AS (
    -- On agrège pour garantir l'unicité par commune et par année
    SELECT
        annee,
        code_geo,
        SUM(montant) AS montant_impot
    FROM {{ ref('donnees_financieres_ofgl') }}
    WHERE agregat = 'Impôts locaux'
    GROUP BY annee, code_geo
)

SELECT
    b.annee,
    b.code_geo,
    b.montant_budget,
    COALESCE(i.montant_impot, 0) AS montant_impot
FROM source_budget AS b
LEFT JOIN source_impots AS i
    ON
        b.code_geo = i.code_geo
        AND b.annee = i.annee
