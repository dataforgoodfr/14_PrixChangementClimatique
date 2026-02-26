SELECT
    Exercice AS Annee,
    "Code Insee 2024 Commune" AS Code_geo,
    "Siret Budget" AS Siret_budget,
    "Libellé Budget" AS Libelle_budget,
    "Type de budget" AS Type_budget,
    Montant
FROM 'pipeline_inputs/budget-communes.csv'
