SELECT
    "Exercice" AS annee,
    "Code Insee 2024 Commune" AS code_geo,
    "Siret Budget" AS siret_budget,
    "Libellé Budget" AS libelle_budget,
    "Type de budget" AS type_budget,
    "Montant" AS montant
FROM 'pipeline_inputs/budget-communes.csv'
