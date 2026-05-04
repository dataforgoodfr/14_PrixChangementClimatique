SELECT
    code_geo,
    MAX(ratio_dettes_depenses) FILTER (WHERE annee = 2024) AS ratio_dettes_depenses,
    MAX(depenses) FILTER (WHERE annee = 2024) AS depenses,
    MAX_BY(depenses_per_pop, annee) AS depenses_per_pop
FROM {{ ref('indicateurs_budget') }}
WHERE annee IN (2022, 2023, 2024)
GROUP BY code_geo
