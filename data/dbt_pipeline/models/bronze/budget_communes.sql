SELECT 
    "Exercice" as annee,
    "Code Insee 2024 Commune" as code_geo,
    "Siret Budget" as siret_budget,
    "Libellé Budget" as libelle_budget,
    "Type de budget" as type_budget,
    "Montant" as montant
FROM 'pipeline_inputs/budget-communes.csv'