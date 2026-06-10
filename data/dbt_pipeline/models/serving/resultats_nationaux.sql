-- CODE POUR COLONNES IMPOTS 2024 ET 2020
WITH impots AS (
    SELECT
        SUM(impots_locaux_2024) AS impots_locaux_2024,

        SUM(impots_locaux_2020) AS impots_locaux_2020

    FROM {{ ref('kpi_impots') }}
),

-- CODE ASSURANCES 2024 et 2020;
-- MEDIANE EVOLUTION PRIME ASSURANCE
-- MEDIANE PART PRIME BUDGET 2024
primes AS (
    SELECT
        SUM(prime_assurance_2024) AS primes_assurances_2024,

        SUM(prime_assurance_2020) AS primes_assurances_2020,

        MEDIAN(evolution_prime_assurance) AS evolution_prime_assurance,

        MEDIAN(part_prime_budget_2024) AS part_prime_budget_2024

    FROM {{ ref('prime') }}
),

-- MEDIANE DEPENSES PAR POPULATION ANNEE 2023, MEDIANE RATIO DETTES DEPENSE
budget AS (
    SELECT
        MEDIAN(depenses_per_pop) AS depenses_per_pop,

        MEDIAN(ratio_dettes_depenses) AS ratio_dettes_depenses

    FROM {{ ref('budget_last') }}
),

-- MEDIANE MULTIPLE FRANCHISE
-- MEDIANE PART ARRETES NON RECONNUS

multi_franchise AS (
    SELECT
        MEDIAN(multiple_franchise_last) AS multiple_franchise,
        MEDIAN(part_arretes_non_reconnus) AS part_arretes_non_reconnus

    FROM {{ ref('ccr_totals') }}
),

-- INDICE VULNERABILITE NIVEAU;
-- CALCUL PART COMMUNES VULNERABLES;
-- MEDIANE DES SCORES ECONOMIQUE,
-- EXPOSITION ET ASSURANCE
commune AS (
    SELECT

        MEDIAN(indice_vulnerabilite_niveau) AS indice_vulnerabilite_niveau,

        COUNT(*) FILTER (
            WHERE indice_vulnerabilite_niveau >= 2
        ) * 1.0 / COUNT(*) AS part_communes_vulnerables,

        MEDIAN(score_economique) AS score_economique,

        MEDIAN(score_exposition) AS score_exposition,

        MEDIAN(score_assurance) AS score_assurance

    FROM {{ ref('indice_par_commune') }}
)

SELECT

    CAST(c.score_economique AS DECIMAL(3, 2)) AS score_economique_median,
    CAST(c.score_exposition AS DECIMAL(3, 2)) AS score_exposition_median,
    CAST(c.score_assurance AS DECIMAL(3, 2)) AS score_assurance_median,
    CAST(c.indice_vulnerabilite_niveau AS INT) AS indice_vulnerabilite_niveau_median,
    CAST(c.part_communes_vulnerables AS DECIMAL(10, 2)) AS part_communes_vulnerables,
    CAST(m.multiple_franchise AS DECIMAL(10, 2)) AS multiple_franchise_mediane,
    CAST(m.part_arretes_non_reconnus AS DECIMAL(10, 2)) AS part_arretes_non_reconnus_median,
    CAST(p.primes_assurances_2024 AS DECIMAL(15, 2)) AS primes_assurances_2024_somme,
    CAST(p.primes_assurances_2020 AS DECIMAL(15, 2)) AS primes_assurances_2020_somme,
    CAST(i.impots_locaux_2024 AS DECIMAL(15, 2)) AS impots_locaux_2024_somme,
    CAST(i.impots_locaux_2020 AS DECIMAL(15, 2)) AS impots_locaux_2020_somme,
    CAST(p.evolution_prime_assurance AS DECIMAL(10, 2)) AS evolution_prime_assurance_mediane,
    CAST(p.part_prime_budget_2024 AS DECIMAL(10, 2)) AS part_prime_budget_mediane,
    CAST(b.depenses_per_pop AS DECIMAL(10, 2)) AS depenses_per_pop_mediane,
    CAST(b.ratio_dettes_depenses AS DECIMAL(10, 5)) AS ratio_dettes_depenses_median

FROM primes AS p
CROSS JOIN impots AS i
CROSS JOIN budget AS b
CROSS JOIN multi_franchise AS m
CROSS JOIN commune AS c
