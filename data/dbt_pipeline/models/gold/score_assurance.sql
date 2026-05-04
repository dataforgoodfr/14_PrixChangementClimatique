-- models/intermediate/score_assurance.sql
{{
  config(
    description  = 'Score assurance par commune : primes, franchise, arrêtés non reconnus'
  )
}}

WITH source AS (
    SELECT

        c.code_geo,
        ccr.nb_total_arretes,
        ccr.nb_total_arretes_recon,
        p.part_prime_budget,
        p.evolution_prime_assurance,
        ccr.multiple_franchise_last

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('ccr_totals') }} AS ccr ON c.code_geo = ccr.code_geo
    LEFT JOIN {{ ref('prime') }} AS p ON c.code_geo = p.code_geo
),

prep AS (
    SELECT
        code_geo,
        coalesce(part_prime_budget, 0) AS part_prime_budget,
        coalesce(evolution_prime_assurance, 0) AS evolution_prime_assurance,
        coalesce(multiple_franchise_last, 1) AS multiple_franchise_last,
        coalesce(nb_total_arretes, 0) AS nb_total_arretes,
        coalesce(nb_total_arretes_recon, 0) AS nb_total_arretes_recon,

        -- Part des arrêtés non reconnus (0 si aucun arrêté)
        CASE
            WHEN coalesce(nb_total_arretes, 0) = 0 THEN 0
            ELSE
                (coalesce(nb_total_arretes, 0) - coalesce(nb_total_arretes_recon, 0))
                / nullif(nb_total_arretes::float, 0)
        END AS part_arretes_non_reco
    FROM source
),

-- Clip à p99 (borne haute uniquement, comme dans le code Python)
caps AS (
    SELECT
        percentile_cont(0.99) WITHIN GROUP (ORDER BY part_prime_budget) AS cap_ppb,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY evolution_prime_assurance) AS cap_epa
    FROM prep
),

clipped AS (
    SELECT
        p.code_geo,
        p.multiple_franchise_last,
        p.part_arretes_non_reco,
        least(p.part_prime_budget, c.cap_ppb) AS part_prime_budget_clipped,
        least(p.evolution_prime_assurance, c.cap_epa) AS evolution_prime_clipped
    FROM prep AS p
    CROSS JOIN caps AS c
),

minmax AS (
    SELECT
        min(part_prime_budget_clipped) AS min_ppb,
        max(part_prime_budget_clipped) AS max_ppb,
        min(evolution_prime_clipped) AS min_epa,
        max(evolution_prime_clipped) AS max_epa
    FROM clipped
),

final AS (
    SELECT
        c.code_geo,

        -- Normalisation min-max des variables clippées
        c.part_arretes_non_reco,
        (c.part_prime_budget_clipped - m.min_ppb) / nullif(m.max_ppb - m.min_ppb, 0)
            AS part_prime_budget_norm,

        -- Franchise normalisée : (x-1)/(5-1), supposant un max théorique de 5
        (c.evolution_prime_clipped - m.min_epa) / nullif(m.max_epa - m.min_epa, 0)
            AS evolution_prime_norm,

        (c.multiple_franchise_last - 1.0) / 4.0 AS franchise_norm,

        -- Score assurance = combinaison linéaire pondérée
        {{ var('poids_evolution_prime', 0.3) }}
        * (c.evolution_prime_clipped - m.min_epa)
        / nullif(m.max_epa - m.min_epa, 0)
        + {{ var('poids_prime_budget',    0.4) }}
        * (c.part_prime_budget_clipped - m.min_ppb)
        / nullif(m.max_ppb - m.min_ppb, 0)
        + (1 - {{ var('poids_evolution_prime', 0.3) }} - {{ var('poids_prime_budget', 0.4) }})
        * c.part_arretes_non_reco
        + {{ var('poids_franchise',       0.2) }} * (c.multiple_franchise_last - 1.0) / 4.0
            AS score_assurance

    FROM clipped AS c
    CROSS JOIN minmax AS m
)

SELECT * FROM final
