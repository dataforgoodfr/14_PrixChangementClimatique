-- score_assurance.sql
-- Reproduit fidèlement le calcul Marimo :
--   - indice_prime               = log1p(clip(x, -1)) / log1p(1.5), clip(0,1)
--   - prime_budget_indice        = clip_minmax(part_prime_budget, p1, p99)
--   - part_arretes_non_reco      = ratio non reconnus ∈ [0,1] (1 si aucun arrêté)
--   - franchise_indice           = multiple_franchise_last / 5
--
--   score_assurance_raw = sqrt(0.5·prime² + 0.2·budget² + 0.2·arretes_nr² + 0.1·franchise²)
--   score_assurance     = score_assurance_raw / max(score_assurance_raw)   [Marimo : /max]

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

-- ── Percentiles pour clip_minmax(part_prime_budget, p1, p99) ────────────────
percentiles AS (
    SELECT
        percentile_cont(0.01) WITHIN GROUP (ORDER BY part_prime_budget) AS p_01_ppb,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY part_prime_budget) AS p_99_ppb
    FROM source
    WHERE part_prime_budget IS NOT NULL
),

prep AS (
    SELECT
        s.code_geo,

        -- part_arretes_non_reconnus
        CASE
            WHEN coalesce(s.nb_total_arretes, 0) = 0 THEN 1.0
            ELSE least(1.0, greatest(
                0.0,
                (coalesce(s.nb_total_arretes, 0) - coalesce(s.nb_total_arretes_recon, 0))
                / nullif(s.nb_total_arretes::numeric, 0)
            ))
        END AS part_arretes_non_reco,

        -- indice_prime : x <= -1 → 0 (log1p(-1) = -inf → clip → 0 en Python)
        -- NULL si pas de donnée prime (pas de fillna dans le Marimo)
        CASE
            WHEN s.evolution_prime_assurance IS NULL THEN NULL
            WHEN s.evolution_prime_assurance <= -1.0 THEN 0.0
            ELSE least(1.0, greatest(
                0.0,
                ln(1.0 + s.evolution_prime_assurance)
                / ln(1.0 + 1.5)
            ))
        END AS indice_prime,

        -- prime_budget_indice : clip_minmax(p1, p99)
        CASE
            WHEN s.part_prime_budget IS NULL THEN NULL
            WHEN p.p_99_ppb = p.p_01_ppb THEN 0
            ELSE least(1.0, greatest(
                0.0,
                (
                    greatest(p.p_01_ppb, least(p.p_99_ppb, s.part_prime_budget))
                    - p.p_01_ppb
                )
                / (p.p_99_ppb - p.p_01_ppb)
            ))
        END AS prime_budget_indice,

        -- franchise_indice : multiple / 5
        coalesce(s.multiple_franchise_last, 0.0) / 5.0 AS franchise_indice

    FROM source AS s
    CROSS JOIN percentiles AS p
),

scores_bruts AS (
    SELECT
        *,
        sqrt(
            0.5 * power(indice_prime, 2)
            + 0.2 * power(prime_budget_indice, 2)
            + 0.2 * power(part_arretes_non_reco, 2)
            + 0.1 * power(franchise_indice, 2)
        ) AS score_assurance_raw
    FROM prep
),

-- ── Rescaling /max (Marimo : score / score.max()) ────────────────────────────
max_params AS (
    SELECT max(score_assurance_raw) AS max_val
    FROM scores_bruts
)

SELECT
    s.code_geo,
    s.indice_prime,
    s.prime_budget_indice,
    s.part_arretes_non_reco,
    s.franchise_indice,

    CASE
        WHEN p.max_val = 0 THEN 0
        ELSE s.score_assurance_raw / p.max_val
    END AS score_assurance

FROM scores_bruts AS s
CROSS JOIN max_params AS p
