WITH primes AS (
    SELECT
        annee,
        code_geo_from_siren AS code_geo,
        sum(solde) AS prime_assurance
    FROM {{ ref('primes_assurances_communes') }}
    GROUP BY 1, 2
),

communes AS (
    SELECT
        code_geo,
        libelle,
        dep,
        reg,
        arr,
        can,
        type_com
    FROM {{ ref('insee_commune') }}
)

SELECT
    p.annee,
    p.code_geo,
    p.prime_assurance,
    c.libelle,
    c.dep,
    c.reg,
    c.arr,
    c.can,
    c.type_com
FROM primes p
LEFT JOIN communes c USING (code_geo)
