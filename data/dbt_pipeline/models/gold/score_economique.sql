/*
    score_economique.sql

    Calcule le score de vulnérabilité économique de chaque commune sur [0, 1].

    Un score élevé indique une commune disposant de faibles marges financières
    pour absorber ou financer des travaux de prévention ou de réparation.

    Composantes du score :

    1. debt_indice (poids 0,5)
       Mesure le niveau d'endettement communal à partir du ratio
       dettes / dépenses.

       Plus le ratio est négatif, plus l'indice est élevé.

       La borne de normalisation est définie à partir de la médiane :

           x_max = -mediane(ratio) / 0.2

       indice = clip(-ratio / x_max, 0, 1)

       Une commune dont le ratio correspond à deux fois la médiane
       négative obtient un indice d'environ 0,4.

    2. dep_indice (poids 0,5)
       Mesure la capacité de dépense par habitant de manière inversée :
       les communes dépensant peu obtiennent un indice élevé.

       La normalisation est logarithmique afin de réduire l'effet des
       très fortes dépenses observées dans certaines communes.

           x_min = p1(depenses_par_habitant)

           x_max tel que :

               log1p(x_max) =
                   log1p(x_min)
                   + (log1p(mediane) - log1p(x_min)) / 0.8

       indice = clip(
           1 - (
               (log1p(x) - log1p(x_min))
               / (log1p(x_max) - log1p(x_min))
           ),
           0,
           1
       )

       Les valeurs inférieures à x_min donnent un indice de 1.
       Les valeurs supérieures à x_max donnent un indice de 0.

    Agrégation :

        score_raw =
            sqrt(
                0.5 * debt² +
                0.5 * depenses²
            )

        score_economique = score_raw / max(score_raw)

    Le score final est normalisé sur [0, 1].
    Les communes sans données d'endettement ou de dépenses ont un score NULL.
*/

WITH source AS (
    SELECT
        c.code_geo,
        b.depenses_per_pop,
        b.ratio_dettes_depenses
    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('budget_last') }} AS b ON c.code_geo = b.code_geo
),

-- ── Nettoyage des infinis éventuels sur les dépenses ────────────────────────
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

-- ── Statistiques de calibration ──────────────────────────────────────────────
stats AS (
    SELECT
        -- borne haute dette : -médiane / 0.2  (médiane est négatif car dettes = passif)
        -percentile_cont(0.5) WITHIN GROUP (ORDER BY ratio_dettes_depenses) / 0.2
            AS dette_x_max,
        percentile_cont(0.01) WITHIN GROUP (ORDER BY depenses_per_pop) AS dep_p_01,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY depenses_per_pop) AS dep_median
    FROM cleaned
    WHERE depenses_per_pop IS NOT NULL
),

-- ── Borne haute des dépenses (échelle log) ───────────────────────────────────
dep_bounds AS (
    SELECT
        dette_x_max,
        dep_p_01,
        -- x_max log : point légèrement au-dessus de la médiane sur l'échelle log
        exp(
            ln(1 + dep_p_01)
            + (ln(1 + dep_median) - ln(1 + dep_p_01)) / 0.8
        ) - 1 AS dep_x_max
    FROM stats
),

indices AS (
    SELECT
        c.code_geo,

        -- Indice endettement : -ratio normalisé sur [0, dette_x_max]
        CASE
            WHEN c.ratio_dettes_depenses IS NULL THEN NULL
            WHEN b.dette_x_max = 0 THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (-c.ratio_dettes_depenses) / b.dette_x_max
                ))
        END AS debt_indice,

        -- Indice dépenses : score inversé sur échelle log
        -- 1 = peu de dépenses (vulnérable), 0 = beaucoup de dépenses (résilient)
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
        -- NULL si l'une des deux composantes est absente
        sqrt(
            0.5 * power(debt_indice, 2)
            + 0.5 * power(dep_indice, 2)
        ) AS score_eco_raw
    FROM indices
),

-- ── Normalisation par le maximum ─────────────────────────────────────────────
max_params AS (
    SELECT max(score_eco_raw) AS max_val
    FROM scores_bruts
)

SELECT
    s.code_geo,
    s.debt_indice,
    s.dep_indice AS depenses_per_pop_indice,
    s.score_eco_raw,

    CASE
        WHEN p.max_val = 0 THEN 0
        ELSE s.score_eco_raw / p.max_val
    END AS score_economique

FROM scores_bruts AS s
CROSS JOIN max_params AS p
