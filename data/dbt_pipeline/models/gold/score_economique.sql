-- score_economique.sql
-- Reproduit fidèlement le calcul Marimo :
--
--   debt_indice :
--     x_max = -median(ratio_dettes) / 0.2
--     indice = clip((-ratio_dettes) / x_max, 0, 1)
--
--   dep_indice :
--     x_min = p1(depenses),  x_max = expm1(log1p(x_min) + (log1p(median) - log1p(x_min)) / 0.8)
--     indice = clip(1 - (log1p(x) - log1p(x_min)) / (log1p(x_max) - log1p(x_min)), 0, 1)
--
--   score_eco_raw = sqrt(0.5·debt² + 0.5·dep²)
--   score_eco     = score_eco_raw / max(score_eco_raw)   [Marimo : /max, pas min-max]

WITH source AS (
    SELECT
        c.code_geo,
        b.depenses_per_pop,
        b.ratio_dettes_depenses
    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('budget_last') }} AS b ON c.code_geo = b.code_geo
),

cleaned AS (
    SELECT
        code_geo,
        ratio_dettes_depenses,
        CASE
            WHEN
                depenses_per_pop IN ('Infinity'::float, '-Infinity'::float)
                OR depenses_per_pop IS NULL
                THEN NULL
            ELSE depenses_per_pop
        END AS depenses_per_pop
    FROM source
),

stats AS (
    SELECT
        -percentile_cont(0.5) WITHIN GROUP (ORDER BY ratio_dettes_depenses) / 0.2
            AS dette_x_max,
        percentile_cont(0.01) WITHIN GROUP (ORDER BY depenses_per_pop) AS dep_p_01,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY depenses_per_pop) AS dep_median
    FROM cleaned
    WHERE depenses_per_pop IS NOT NULL
),

dep_bounds AS (
    SELECT
        dette_x_max,
        dep_p_01,
        exp(
            ln(1 + dep_p_01)
            + (ln(1 + dep_median) - ln(1 + dep_p_01)) / 0.8
        ) - 1 AS dep_x_max
    FROM stats
),

indices AS (
    SELECT
        c.code_geo,

        CASE
            WHEN b.dette_x_max = 0 THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (-c.ratio_dettes_depenses) / b.dette_x_max
                ))
        END AS debt_indice,

        CASE
            WHEN c.depenses_per_pop IS NULL THEN NULL
            WHEN ln(1 + b.dep_x_max) = ln(1 + b.dep_p_01) THEN 0
            ELSE least(1.0, greatest(
                0.0,
                1.0 - (ln(1 + greatest(b.dep_p_01, c.depenses_per_pop)) - ln(1 + b.dep_p_01))
                / (ln(1 + b.dep_x_max) - ln(1 + b.dep_p_01))
            ))
        END AS dep_indice

    FROM cleaned AS c
    CROSS JOIN dep_bounds AS b
),

scores_bruts AS (
    SELECT
        *,
        sqrt(
            0.5 * power(debt_indice, 2)
            + 0.5 * power(dep_indice, 2)
        ) AS score_eco_raw
    FROM indices
),

-- ── Rescaling /max (Marimo : score / score.max()) ────────────────────────────
max_params AS (
    SELECT max(score_eco_raw) AS max_val
    FROM scores_bruts
)

SELECT
    s.code_geo,
    s.debt_indice,
    s.dep_indice AS depenses_per_pop_indice,
    s.score_eco_raw,
    p.max_val,

    CASE
        WHEN p.max_val = 0 THEN 0
        ELSE s.score_eco_raw / p.max_val
    END AS score_economique

FROM scores_bruts AS s
CROSS JOIN max_params AS p
