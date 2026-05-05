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

scores AS (
    SELECT
        MEAN(score_economique) AS score_economique_moy,
        MEAN(score_climatique) AS score_climatique_moy,
        MEAN(score_assurance) AS score_assurance_moy,
        MEAN(indice_vulnerabilite) AS indice_vulnerabilite_moy,
        MEAN(indice_vulnerabilite_niveau) AS indice_vulnerabilite_niveau,
        SUM(CASE WHEN indice_vulnerabilite_niveau >= 4.0 THEN 1 ELSE 0 END)
        /
        COUNT(indice_vulnerabilite_niveau)
            AS part_communes_vulnerables
    FROM {{ ref('indice_par_commune') }}
)

-- CODE COLONNES RANDOM

SELECT

    CAST(s.score_climatique_moy AS DECIMAL(3, 2)) AS score_climatique_moy,
    CAST(s.score_assurance_moy AS DECIMAL(3, 2)) AS score_assurance_moy,
    CAST(s.score_economique_moy AS DECIMAL(3, 2)) AS score_economique_moy,
    CAST(s.indice_vulnerabilite_moy AS DECIMAL(3, 2)) AS indice_vulnerabilite_moy,
    CAST(s.indice_vulnerabilite_niveau AS DECIMAL(3, 2)) AS indice_vulnerabilite_niveau,
    CAST(s.part_communes_vulnerables AS DECIMAL(3, 2)) AS part_communes_vulnerables,

    CAST(p.primes_assurances_2024 AS DECIMAL(15, 2)) AS primes_assurances_2024,
    CAST(p.primes_assurances_2020 AS DECIMAL(15, 2)) AS primes_assurances_2020,
    CAST(i.impots_locaux_2024 AS DECIMAL(15, 2)) AS impots_locaux_2024,
    CAST(i.impots_locaux_2020 AS DECIMAL(15, 2)) AS impots_locaux_2020

FROM primes AS p
CROSS JOIN impots AS i
CROSS JOIN scores AS s
