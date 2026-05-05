-- indicateurs_budget.sql

WITH pop_adjusted AS (

    SELECT
        code_geo,
        annee_recensement,
        population
    FROM {{ ref('population_par_com_annee') }}
    
    UNION ALL

    SELECT
        '75056' AS code_geo,
        annee_recensement,
        SUM(population) AS population
    FROM {{ ref('population_par_com_annee') }}
    WHERE code_geo LIKE '75%'
    GROUP BY annee_recensement

)


SELECT
    budget.*,
    pop.population,
    budget.produits - budget.depenses AS solde_annuel,
    budget.dettes / budget.produits AS ratio_dettes_produits,
    budget.dettes / budget.depenses AS ratio_dettes_depenses,
    budget.produits / budget.depenses AS ratio_produits_depenses,
    budget.dettes / pop.population AS dettes_per_pop,
    budget.depenses / pop.population AS depenses_per_pop,
    budget.produits / pop.population AS produits_per_pop,
    (budget.produits - budget.depenses) / pop.population AS solde_annuel_per_pop
FROM
    {{ ref('budget_par_com_annee') }} AS budget

LEFT JOIN pop_adjusted AS pop
    ON budget.code_geo = pop.code_geo
    AND (
        -- Cas 976 → toujours année 2017
        (budget.code_geo LIKE '976%' AND pop.annee_recensement = 2017)

        -- Autres cas 
        OR (budget.code_geo NOT LIKE '976%' AND budget.annee = pop.annee_recensement)
    )
