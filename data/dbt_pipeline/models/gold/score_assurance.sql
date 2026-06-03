-- score_assurance.sql
--
-- Calcule le score de vulnérabilité assurantielle de chaque commune sur [0, 1].
-- Un score élevé indique une commune dont les habitants subissent des conditions
-- d'assurance dégradées : primes en forte hausse, budget contraint, arrêtés non
-- reconnus, ou franchises majorées.
--
-- ── Composantes du score ─────────────────────────────────────────────────────
--
-- 1. indice_prime (poids 0.5)
--    Mesure la hausse de la prime d'assurance MRH entre la première et la
--    dernière année disponible. La normalisation est logarithmique pour
--    compresser les très fortes hausses :
--      indice = clip(ln(1 + evolution) / ln(1 + 1.5), 0, 1)
--    Une baisse de 100% ou plus (evolution ≤ -1) donne un indice de 0.
--    Une hausse de 150% ou plus donne un indice de 1.
--
-- 2. prime_budget_indice (poids 0.2)
--    Part de la prime dans le budget des ménages, normalisée par écrêtage
--    inter-percentile [p1, p99] pour neutraliser les valeurs aberrantes.
--
-- 3. part_arretes_non_reco (poids 0.2)
--    Part des arrêtés de catastrophe naturelle déposés mais non reconnus par
--    l'État, sur le total des arrêtés. Vaut 1 si la commune n'a déposé aucun
--    arrêté (absence d'historique = incertitude maximale).
--
-- 4. franchise_indice (poids 0.1)
--    Multiple de franchise appliqué lors du dernier sinistre, normalisé sur [0, 1]
--    par division par 5 (valeur maximale observée).
--    Une franchise absente (NULL) est traitée comme un multiple de 0.
--
-- ── Agrégation et normalisation ──────────────────────────────────────────────
--    score_raw = sqrt(0.5·prime² + 0.2·budget² + 0.2·arretes_nr² + 0.1·franchise²)
--    score_assurance = score_raw / max(score_raw)
--    → ramène le score dans [0, 1] en fixant à 1 la commune la plus exposée.
--    Les communes sans données de prime ou de budget ont un score NULL.

WITH source AS (
    SELECT
        c.code_geo,
        ccr.nb_total_arretes,
        ccr.nb_total_arretes_recon,
        p.part_prime_budget_2024,
        p.evolution_prime_assurance,
        ccr.multiple_franchise_last
    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('ccr_totals') }} AS ccr ON c.code_geo = ccr.code_geo
    LEFT JOIN {{ ref('prime') }} AS p ON c.code_geo = p.code_geo
),

-- ── Bornes de normalisation de la part prime/budget ─────────────────────────
percentiles AS (
    SELECT
        percentile_cont(0.01) WITHIN GROUP (ORDER BY part_prime_budget_2024) AS p_01_ppb,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY part_prime_budget_2024) AS p_99_ppb
    FROM source
    WHERE part_prime_budget_2024 IS NOT NULL
),

prep AS (
    SELECT
        s.code_geo,

        -- Part des arrêtés non reconnus ∈ [0, 1]
        -- 1 si aucun arrêté déposé (absence d'historique = incertitude maximale)
        CASE
            WHEN coalesce(s.nb_total_arretes, 0) = 0 THEN 1.0
            ELSE least(1.0, greatest(
                0.0,
                (coalesce(s.nb_total_arretes, 0) - coalesce(s.nb_total_arretes_recon, 0))
                / nullif(s.nb_total_arretes::numeric, 0)
            ))
        END AS part_arretes_non_reco,

        -- Indice prime : normalisation log de l'évolution de la prime
        -- Une évolution ≤ -1 (baisse totale) donne 0 ; ≥ +150% donne 1
        -- NULL si aucune donnée de prime disponible
        CASE
            WHEN s.evolution_prime_assurance IS NULL THEN NULL
            WHEN s.evolution_prime_assurance <= -1.0 THEN 0.0
            ELSE least(1.0, greatest(
                0.0,
                ln(1.0 + s.evolution_prime_assurance)
                / ln(1.0 + 1.5)
            ))
        END AS indice_prime,

        -- Indice part prime/budget : écrêtage inter-percentile [p1, p99]
        -- NULL si aucune donnée disponible
        CASE
            WHEN s.part_prime_budget_2024 IS NULL THEN NULL
            WHEN p.p_99_ppb = p.p_01_ppb THEN 0
            ELSE least(1.0, greatest(
                0.0,
                (
                    greatest(p.p_01_ppb, least(p.p_99_ppb, s.part_prime_budget_2024))
                    - p.p_01_ppb
                )
                / (p.p_99_ppb - p.p_01_ppb)
            ))
        END AS prime_budget_indice,

        -- Indice franchise : multiple / 5
        -- NULL traité comme 0 (absence de franchise majorée)
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

-- ── Normalisation par le maximum ─────────────────────────────────────────────
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
