-- budget_par_com_annee.sql

SELECT
    code_geo_from_siren,
    nom_com,
    annee,
    SUM(CASE WHEN type_compte = 'dettes financieres' THEN solde ELSE 0 END) AS dettes,
    SUM(CASE WHEN type_compte = 'primes d ASsurances' THEN solde ELSE 0 END) AS primes,
    SUM(CASE WHEN type_compte = 'depenses' THEN solde ELSE 0 END) AS depenses,
    SUM(CASE WHEN type_compte = 'produits' THEN solde ELSE 0 END) AS produits
FROM
    {{ ref('budget_per_compte_communes') }}
WHERE
    type_compte IN ('dettes financieres', 'primes d ASsurances', 'depenses', 'produits')
GROUP BY
    code_geo_from_siren,
    nom_com,
    annee
