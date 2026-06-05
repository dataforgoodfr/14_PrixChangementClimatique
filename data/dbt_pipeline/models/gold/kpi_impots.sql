/*
    kpi_impots.sql

    Calcule les indicateurs financiers relatifs aux impôts locaux affichés
    sur le site.

    Source :
        - Bronze : donnees_financieres_ofgl

    Granularité :
        - 1 ligne par code_geo
*/

SELECT
    code_geo,
    SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END) AS impots_locaux_2024,
    (
        SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
        - SUM(CASE WHEN annee = 2020 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
    ) / NULLIF(
        SUM(CASE WHEN annee = 2020 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END), 0
    ) AS impots_locaux_evolution,
    SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END)
    / NULLIF(
        SUM(CASE WHEN annee = 2024 AND agregat = 'Recettes de fonctionnement' THEN montant ELSE 0 END), 0
    ) AS part_impots_locaux,
    SUM(CASE WHEN annee = 2024 AND agregat = 'Impôts locaux' THEN montant ELSE 0 END) AS impots_locaux_2020

FROM {{ ref('donnees_financieres_ofgl') }}
GROUP BY code_geo
