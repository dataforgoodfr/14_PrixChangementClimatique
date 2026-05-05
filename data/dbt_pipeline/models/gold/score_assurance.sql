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
        least(coalesce(part_prime_budget, 0), {{ var('cap_ppb') }}) AS part_prime_budget_clipped,
        least(coalesce(evolution_prime_assurance, 0), {{ var('cap_epa') }}) AS evolution_prime_clipped,
        coalesce(multiple_franchise_last, 1) AS multiple_franchise_last,
        CASE
            WHEN coalesce(nb_total_arretes, 0) = 0 THEN 0
            ELSE
                (coalesce(nb_total_arretes, 0) - coalesce(nb_total_arretes_recon, 0))
                / nullif(nb_total_arretes::float, 0)
        END AS part_arretes_non_reco
    FROM source
),

final AS (
    SELECT
        code_geo,

        (part_prime_budget_clipped - {{ var('min_ppb') }})
        / ({{ var('max_ppb') }} - {{ var('min_ppb') }}) AS part_prime_budget_norm,
        (evolution_prime_clipped - {{ var('min_epa') }})
        / ({{ var('max_epa') }} - {{ var('min_epa') }}) AS evolution_prime_norm,
        (multiple_franchise_last - 1.0) / 4.0 AS franchise_norm,
        part_arretes_non_reco,

        {{ var('poids_evolution_prime') }}
        * (evolution_prime_clipped - {{ var('min_epa') }})
        / ({{ var('max_epa') }} - {{ var('min_epa') }})
        + {{ var('poids_prime_budget') }}
        * (part_prime_budget_clipped - {{ var('min_ppb') }})
        / ({{ var('max_ppb') }} - {{ var('min_ppb') }})
        + (1 - {{ var('poids_evolution_prime') }} - {{ var('poids_prime_budget') }}) * part_arretes_non_reco
        + {{ var('poids_franchise') }} * (multiple_franchise_last - 1.0) / 4.0
            AS score_assurance

    FROM prep
)

SELECT * FROM final
