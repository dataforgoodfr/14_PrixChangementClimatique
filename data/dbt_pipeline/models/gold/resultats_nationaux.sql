-- CODE POUR COLONNES IMPOTS 2024 ET 2020
WITH impots AS (
    SELECT
        SUM(CASE
            WHEN annee = 2024 AND agregat LIKE 'Impôts locaux'
                THEN montant
            ELSE 0
        END) AS impots_locaux_2024,

        SUM(CASE
            WHEN annee = 2020 AND agregat LIKE 'Impôts locaux'
                THEN montant
            ELSE 0
        END) AS impots_locaux_2020

    FROM {{ ref('donnees_financieres_ofgl') }}
),

-- CODE ASSURANCES 2024 et 2020
primes AS (
    SELECT
        SUM(CASE
            WHEN annee = 2024
                THEN prime_assurance
            ELSE 0
        END) AS primes_assurances_2024,

        SUM(CASE
            WHEN annee = 2020
                THEN prime_assurance
            ELSE 0
        END) AS primes_assurances_2020

    FROM {{ ref('primes_par_communes') }}
)

-- CODE COLONNES RANDOM

SELECT

    CAST(RANDOM() AS DECIMAL(3, 2)) AS score_economique_moy,
    CAST(RANDOM() AS DECIMAL(3, 2)) AS score_georisque_moy,
    CAST(RANDOM() AS DECIMAL(3, 2)) AS score_assurance_moy,
    CAST(RANDOM() AS DECIMAL(3, 2)) AS indice_vulnerabilite_moy,
    CAST(RANDOM() AS INT) AS indice_vulnerabilite_niveau,
    CAST(RANDOM() AS DECIMAL(3, 2)) AS part_communes_vulnerables,

    CAST(p.primes_assurances_2024 AS DECIMAL(15, 2)) AS primes_assurances_2024,
    CAST(p.primes_assurances_2020 AS DECIMAL(15, 2)) AS primes_assurances_2020,
    CAST(i.impots_locaux_2024 AS DECIMAL(15, 2)) AS impots_locaux_2024,
    CAST(i.impots_locaux_2020 AS DECIMAL(15, 2)) AS impots_locaux_2020

FROM primes AS p
CROSS JOIN impots AS i
