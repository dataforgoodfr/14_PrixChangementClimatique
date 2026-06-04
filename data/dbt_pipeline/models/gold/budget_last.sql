/*
    budget_last.sql

    Agrège les principaux indicateurs budgétaires par territoire utiles au
    calcul du score économique et affichés sur le site.

    Pour chaque code géographique :
    - récupère le ratio dettes/dépenses de l'année 2024 ;
    - récupère le montant des dépenses de l'année 2024 ;
    - conserve la valeur la plus récente des dépenses par habitant
      parmi les années 2022 à 2024.

    Source :
        - Silver : indicateurs_budget

    Granularité :
        - une ligne par code_geo
*/

SELECT
    code_geo,
    MAX(ratio_dettes_depenses) FILTER (WHERE annee = 2024) AS ratio_dettes_depenses,
    MAX(depenses) FILTER (WHERE annee = 2024) AS depenses,
    MAX_BY(depenses_per_pop, annee) AS depenses_per_pop
FROM {{ ref('indicateurs_budget') }}
WHERE annee IN (2022, 2023, 2024)
GROUP BY code_geo
