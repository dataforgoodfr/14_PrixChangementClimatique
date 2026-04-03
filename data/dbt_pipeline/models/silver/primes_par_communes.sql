WITH primes AS (
    SELECT
        annee,
        code_geo_from_siren AS code_geo,
        SUM(solde) AS prime_assurance
    FROM {{ ref('primes_assurances_communes') }}
    -- Filtre sur les comptes d'assurances spécifiés par la revue
    WHERE
        compte IN ('6161')
        AND code_geo_from_siren IS NOT NULL
    GROUP BY annee, code_geo_from_siren
)

SELECT
    annee,
    code_geo,
    prime_assurance
FROM primes
