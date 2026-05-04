-- models/intermediate/int_score_eco.sql
{{
  config(
    description  = 'Score économique par commune : dettes et dépenses par habitant'
  )
}}

WITH source AS (
    SELECT

        c.code_geo,
        b.depenses_per_pop,
        b.ratio_dettes_depenses

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('budget_last') }} AS b ON c.code_geo = b.code_geo
),

prep AS (
    SELECT
        code_geo,
        -- Exclure les infinis (divisions par 0 dans la source)
        ratio_dettes_depenses,
        CASE
            WHEN
                depenses_per_pop = 'Infinity'::float
                OR depenses_per_pop = '-Infinity'::float
                THEN null
            ELSE depenses_per_pop
        END AS depenses_per_pop
    FROM source
),

-- Clip p10-p99 (comme dans le code Python)
caps AS (
    SELECT
        percentile_cont(0.10) WITHIN GROUP (ORDER BY depenses_per_pop) AS p_10_dep,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY depenses_per_pop) AS p_99_dep,
        percentile_cont(0.10) WITHIN GROUP (ORDER BY ratio_dettes_depenses) AS p_10_dette,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY ratio_dettes_depenses) AS p_99_dette
    FROM prep
),

clipped AS (
    SELECT
        p.code_geo,
        greatest(c.p_10_dep, least(c.p_99_dep, p.depenses_per_pop)) AS dep_clipped,
        greatest(c.p_10_dette, least(c.p_99_dette, p.ratio_dettes_depenses)) AS dette_clipped
    FROM prep AS p
    CROSS JOIN caps AS c
),

minmax AS (
    SELECT
        min(dep_clipped) AS min_dep,
        max(dep_clipped) AS max_dep,
        min(dette_clipped) AS min_dette,
        max(dette_clipped) AS max_dette
    FROM clipped
),

final AS (
    SELECT
        c.code_geo,

        -- Normalisation puis inversion (1 - x) : plus de dépenses/dettes = plus vulnérable
        1 - (c.dep_clipped - m.min_dep) / nullif(m.max_dep - m.min_dep, 0) AS depenses_per_pop_norm,
        1 - (c.dette_clipped - m.min_dette) / nullif(m.max_dette - m.min_dette, 0) AS ratio_dettes_norm,

        -- Score économique
        {{ var('poids_dettes', 0.5) }}
        * (1 - (c.dette_clipped - m.min_dette) / nullif(m.max_dette - m.min_dette, 0))
        + (1 - {{ var('poids_dettes', 0.5) }})
        * (1 - (c.dep_clipped - m.min_dep) / nullif(m.max_dep - m.min_dep, 0))
            AS score_economique

    FROM clipped AS c
    CROSS JOIN minmax AS m
)

SELECT * FROM final
