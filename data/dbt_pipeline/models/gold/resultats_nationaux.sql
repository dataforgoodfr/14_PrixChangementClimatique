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
),

-- EVOLUTION PRIME ASSURANCE

evol_prime AS (
    SELECT
        (primes_assurances_2024 - primes_assurances_2020)
        / NULLIF(primes_assurances_2020, 0)
        * 100 AS evolution_prime_assurance

    FROM primes
),

-- PART PRIME BUDGET 2024

prime_budget AS (
    SELECT
        SUM(CASE
            WHEN annee = 2024
                THEN depenses
            ELSE 0
        END) AS depenses_2024

    FROM {{ ref('indicateurs_budget') }}
),

-- DEPENSES PAR POPULATION ANNEE 2023

dep_pop AS (
    SELECT
        SUM(CASE
            WHEN annee = 2023
                THEN
                    CASE
                        WHEN NOT ISFINITE(depenses_per_pop) THEN NULL
                        ELSE depenses_per_pop
                    END
            ELSE 0
        END) AS depenses_per_pop

    FROM {{ ref('indicateurs_budget') }}
),

-- RATIO DETTES DEPENSE

ratio_dette_dep AS (
    SELECT
        SUM(CASE
            WHEN annee = 2024
                THEN dettes
            ELSE 0
        END) AS dettes_2024

    FROM {{ ref('indicateurs_budget') }}
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
    CAST(i.impots_locaux_2020 AS DECIMAL(15, 2)) AS impots_locaux_2020,
    CAST(e.evolution_prime_assurance AS DECIMAL(10, 2)) AS evolution_prime_assurance,
    CAST(
        p.primes_assurances_2024
        / NULLIF(b.depenses_2024, 0) * 100
        AS DECIMAL(10, 2)
    ) AS part_prime_budget,
    CAST(
        CASE
            WHEN NOT ISFINITE(d.depenses_per_pop) THEN NULL
            ELSE d.depenses_per_pop
        END AS DECIMAL(10, 2)
    ) AS depenses_per_pop,
    CAST(r.dettes_2024 / NULLIF(b.depenses_2024, 0) AS DECIMAL(10, 5)) AS ratio_dettes_depenses

FROM primes AS p
CROSS JOIN impots AS i
CROSS JOIN evol_prime AS e
CROSS JOIN prime_budget AS b
CROSS JOIN dep_pop AS d
CROSS JOIN ratio_dette_dep AS r
