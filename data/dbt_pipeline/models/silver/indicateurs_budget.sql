-- indicateurs_budget.sql

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
LEFT JOIN
    {{ ref('population_par_com_annee') }} AS pop
    ON
        budget.code_geo = pop.code_geo
        AND budget.annee = pop.annee
