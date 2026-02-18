SELECT
    EXER AS annee,
    IDENT AS siret,
    NDEPT AS code_departement,
    INSEE AS code_insee,
    CREGI AS code_region,
    type_compte AS type_compte,
    SD AS solde_debiteur,
    SC AS solde_crediteur,
    (SD - SC) AS solde,
    (CAST(NDEPT AS TEXT) || CAST(INSEE AS TEXT)) AS code_geo
FROM 'pipeline_inputs/budget_per_compte_communes.csv'
