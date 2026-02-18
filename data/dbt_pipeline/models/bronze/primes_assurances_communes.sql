SELECT
    EXER AS annee,
    IDENT AS siret,
    NDEPT AS code_departement,
    INSEE AS code_insee,
    CREGI AS code_region,
    COMPTE AS compte,
    SD AS solde_debiteur,
    SC AS solde_crediteur,
    (CAST(NDEPT AS TEXT) || CAST(INSEE AS TEXT)) AS code_geo
FROM 'pipeline_inputs/primes_assurances_communes.csv'