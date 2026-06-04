/*
prime.sql

Construit un historique des primes d’assurance par commune et calcule
des indicateurs de tension assurantielle entre 2020 et 2024 utilisés
pour le calcul sur score assurance et les affichés sur le site.

Le modèle pivote les données annuelles puis les combine avec les données
budgétaires pour mesurer le poids des primes dans les finances locales.

Sources :
    - Silver :primes_par_communes
    - Gold : budget_last

Granularité :
     - 1 ligne par code_geo

*/

WITH primes_pivot AS (
    SELECT
        p.code_geo,

        MAX(CASE WHEN p.annee = 2024 THEN p.prime_assurance END) AS prime_assurance_2024,
        MAX(CASE WHEN p.annee = 2023 THEN p.prime_assurance END) AS prime_assurance_2023,
        MAX(CASE WHEN p.annee = 2022 THEN p.prime_assurance END) AS prime_assurance_2022,
        MAX(CASE WHEN p.annee = 2021 THEN p.prime_assurance END) AS prime_assurance_2021,
        MAX(CASE WHEN p.annee = 2020 THEN p.prime_assurance END) AS prime_assurance_2020

    FROM {{ ref('primes_par_communes') }} AS p
    WHERE p.annee BETWEEN 2020 AND 2024
    GROUP BY p.code_geo
)

SELECT
    pp.code_geo,

    pp.prime_assurance_2024,
    pp.prime_assurance_2023,
    pp.prime_assurance_2022,
    pp.prime_assurance_2021,
    pp.prime_assurance_2020,

    (pp.prime_assurance_2024 - pp.prime_assurance_2020)
    / NULLIF(pp.prime_assurance_2020, 0)
        AS evolution_prime_assurance,

    pp.prime_assurance_2024 / NULLIF(b.depenses, 0)
        AS part_prime_budget_2024,
    pp.prime_assurance_2023 / NULLIF(b.depenses, 0)
        AS part_prime_budget_2023,
    pp.prime_assurance_2022 / NULLIF(b.depenses, 0)
        AS part_prime_budget_2022,
    pp.prime_assurance_2021 / NULLIF(b.depenses, 0)
        AS part_prime_budget_2021,
    pp.prime_assurance_2020 / NULLIF(b.depenses, 0)
        AS part_prime_budget_2020

FROM primes_pivot AS pp
LEFT JOIN {{ ref('budget_last') }} AS b
    ON pp.code_geo = b.code_geo
