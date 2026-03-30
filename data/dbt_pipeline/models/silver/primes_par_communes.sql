WITH primes AS (
    SELECT
        annee,
        code_geo_from_siren AS code_geo,
        SUM(solde) AS prime_assurance
    FROM {{ ref('primes_assurances_communes') }}
    -- Filtre sur les comptes d'assurances spécifiés par la revue
    WHERE compte IN ('616', '6161', '6162', '6168')
    GROUP BY annee, code_geo_from_siren
)

SELECT
    annee,
    code_geo,
    prime_assurance
FROM primes
