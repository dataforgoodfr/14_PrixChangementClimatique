-- score_exposition.sql
-- Fidèle au Marimo :
--   clip_minmax(s, q_low, q_high) = (clip(s, p_low, p_high) - p_low) / (p_high - p_low)
--   avec q_low=0 → p_low = min(s)  [= 0 pour les variables coalesce'd à 0, sauf swi_x_rga]
--   score_secheresse : MinMaxScaler fitté sur métropole (hors 97*, 98*)
--   score_inondation : MinMaxScaler fitté sur hors 98*

WITH source AS (
    SELECT
        c.code_geo,
        pr.pprn_rga,
        pr.pprn_ino,
        pr.date_approbation_rga,
        pr.date_approbation_ino,
        coalesce(ccr.nb_total_arretes_sec, 0) AS nb_total_arretes_sec,
        coalesce(ccr.nb_total_arretes_ino, 0) AS nb_total_arretes_ino,
        coalesce(ccr.nb_total_arretes_autre, 0) AS nb_total_arretes_autre,
        coalesce(sc.swi_04_d_abs, 0) AS swi_04_d_abs,
        coalesce(sc.rr_50_d_abs, 0) AS rr_50_d_abs,
        coalesce(i.indicateur_rga, 0) AS indicateur_rga,
        coalesce(i.indicateur_tri, 0) AS indicateur_tri
    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('pprn') }} AS pr ON c.code_geo = pr.code_geo
    LEFT JOIN {{ ref('ccr_totals') }} AS ccr ON c.code_geo = ccr.code_geo
    LEFT JOIN {{ ref('scenario_2050') }} AS sc ON c.code_geo = sc.code_geo
    LEFT JOIN {{ ref('indicateurs_tri_rga_bats_par_com') }} AS i ON c.code_geo = i.code_geo
),

-- ── Étape 1 : percentiles des variables brutes (métropole) ───────────────────
-- q_low=0 → p0 = min = 0 car toutes ces variables sont coalesce'd à 0
-- q_high=0.99 → p99
pct_sec_bruts AS (
    SELECT
        percentile_cont(0.0) WITHIN GROUP (ORDER BY swi_04_d_abs) AS p_0_swi,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY swi_04_d_abs) AS p_99_swi,
        percentile_cont(0.0) WITHIN GROUP (ORDER BY indicateur_rga) AS p_0_rga,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY indicateur_rga) AS p_99_rga,
        percentile_cont(0.0) WITHIN GROUP (ORDER BY nb_total_arretes_sec) AS p_0_arr_sec,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY nb_total_arretes_sec) AS p_99_arr_sec
    FROM source
    WHERE
        code_geo NOT LIKE '97%'
        AND code_geo NOT LIKE '98%'
),

-- ── Étape 2 : calcul des indices swi et rga sur métropole ────────────────────
-- clip_minmax(x, 0, 0.99) avec p0=0 → x / p99  (clippé dans [0,1])
indices_sec_metro AS (
    SELECT
        CASE
            WHEN p.p_99_swi = p.p_0_swi THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(p.p_0_swi, least(p.p_99_swi, s.swi_04_d_abs)) - p.p_0_swi)
                    / (p.p_99_swi - p.p_0_swi)
                ))
        END AS swi_indice,
        CASE
            WHEN p.p_99_rga = p.p_0_rga THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(p.p_0_rga, least(p.p_99_rga, s.indicateur_rga)) - p.p_0_rga)
                    / (p.p_99_rga - p.p_0_rga)
                ))
        END AS rga_indice
    FROM source AS s
    CROSS JOIN pct_sec_bruts AS p
    WHERE
        s.code_geo NOT LIKE '97%'
        AND s.code_geo NOT LIKE '98%'
),

-- ── Étape 3 : p0 et p99 du produit swi×rga sur métropole ────────────────────
-- Le produit peut avoir un min > 0, donc p0 = min(produit) ≠ 0
pct_swi_x_rga AS (
    SELECT
        percentile_cont(0.0) WITHIN GROUP (ORDER BY swi_indice * rga_indice) AS p_0,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY swi_indice * rga_indice) AS p_99
    FROM indices_sec_metro
),

-- ── Percentiles inondation : fitté sur tout sauf 98* ────────────────────────
pct_ino AS (
    SELECT
        percentile_cont(0.0) WITHIN GROUP (ORDER BY rr_50_d_abs) AS p_0_rr_50,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY rr_50_d_abs) AS p_99_rr_50,
        percentile_cont(0.0) WITHIN GROUP (ORDER BY indicateur_tri) AS p_0_tri,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY indicateur_tri) AS p_99_tri,
        percentile_cont(0.0) WITHIN GROUP (ORDER BY nb_total_arretes_ino) AS p_0_arr_ino,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY nb_total_arretes_ino) AS p_99_arr_ino
    FROM source
    WHERE code_geo NOT LIKE '98%'
),

-- ── Percentiles autres : France entière ─────────────────────────────────────
pct_autre AS (
    SELECT
        percentile_cont(0.0) WITHIN GROUP (ORDER BY nb_total_arretes_autre) AS p_0_autre,
        percentile_cont(0.999) WITHIN GROUP (ORDER BY nb_total_arretes_autre) AS p_999_autre
    FROM source
),

-- ── Étape 4 : indices de chaque variable (toutes communes) ──────────────────
clipped AS (
    SELECT
        s.*,

        -- sécheresse : clip_minmax(x, 0, p99) = x/p99  car min=0
        CASE
            WHEN ps.p_99_swi = ps.p_0_swi THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(ps.p_0_swi, least(ps.p_99_swi, s.swi_04_d_abs)) - ps.p_0_swi)
                    / (ps.p_99_swi - ps.p_0_swi)
                ))
        END AS swi_indice,

        CASE
            WHEN ps.p_99_rga = ps.p_0_rga THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(ps.p_0_rga, least(ps.p_99_rga, s.indicateur_rga)) - ps.p_0_rga)
                    / (ps.p_99_rga - ps.p_0_rga)
                ))
        END AS rga_indice,

        CASE
            WHEN ps.p_99_arr_sec = ps.p_0_arr_sec THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(ps.p_0_arr_sec, least(ps.p_99_arr_sec, s.nb_total_arretes_sec)) - ps.p_0_arr_sec)
                    / (ps.p_99_arr_sec - ps.p_0_arr_sec)
                ))
        END AS arr_sec_indice,

        -- inondation
        CASE
            WHEN pi.p_99_rr_50 = pi.p_0_rr_50 THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(pi.p_0_rr_50, least(pi.p_99_rr_50, s.rr_50_d_abs)) - pi.p_0_rr_50)
                    / (pi.p_99_rr_50 - pi.p_0_rr_50)
                ))
        END AS rr_50_indice,

        CASE
            WHEN pi.p_99_tri = pi.p_0_tri THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(pi.p_0_tri, least(pi.p_99_tri, s.indicateur_tri)) - pi.p_0_tri)
                    / (pi.p_99_tri - pi.p_0_tri)
                ))
        END AS tri_indice,

        CASE
            WHEN pi.p_99_arr_ino = pi.p_0_arr_ino THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(pi.p_0_arr_ino, least(pi.p_99_arr_ino, s.nb_total_arretes_ino)) - pi.p_0_arr_ino)
                    / (pi.p_99_arr_ino - pi.p_0_arr_ino)
                ))
        END AS arr_ino_indice,

        -- autres risques naturels
        CASE
            WHEN pa.p_999_autre = pa.p_0_autre THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(pa.p_0_autre, least(pa.p_999_autre, s.nb_total_arretes_autre)) - pa.p_0_autre)
                    / (pa.p_999_autre - pa.p_0_autre)
                ))
        END AS score_autres_risques_nat

    FROM source AS s
    CROSS JOIN pct_sec_bruts AS ps
    CROSS JOIN pct_ino AS pi
    CROSS JOIN pct_autre AS pa
),

-- ── Étape 5 : swi_x_rga_indice = clip_minmax(swi×rga, p0, p99) ─────────────
-- p0 = min du produit sur métropole (peut être > 0)
scores_bruts AS (
    SELECT
        c.*,

        -- swi_x_rga_indice
        CASE
            WHEN px.p_99 = px.p_0 THEN 0
            ELSE
                least(1.0, greatest(
                    0.0,
                    (greatest(px.p_0, least(px.p_99, c.swi_indice * c.rga_indice)) - px.p_0)
                    / (px.p_99 - px.p_0)
                ))
        END AS swi_x_rga_indice,

        -- score_secheresse_brut = sqrt(0.5 * swi_x_rga_indice² + 0.5 * arr_sec²)
        sqrt(
            0.5 * power(
                CASE
                    WHEN px.p_99 = px.p_0 THEN 0
                    ELSE
                        least(1.0, greatest(
                            0.0,
                            (greatest(px.p_0, least(px.p_99, c.swi_indice * c.rga_indice)) - px.p_0)
                            / (px.p_99 - px.p_0)
                        ))
                END, 2
            )
            + 0.5 * power(c.arr_sec_indice, 2)
        ) AS score_secheresse_brut,

        -- score_inondation_brut = sqrt(0.2*tri² + 0.3*rr50² + 0.5*arr_ino²)
        sqrt(
            0.2 * power(c.tri_indice, 2)
            + 0.3 * power(c.rr_50_indice, 2)
            + 0.5 * power(c.arr_ino_indice, 2)
        ) AS score_inondation_brut

    FROM clipped AS c
    CROSS JOIN pct_swi_x_rga AS px
),

-- ── MinMaxScaler sécheresse fitté sur métropole ──────────────────────────────
minmax_sec AS (
    SELECT
        min(score_secheresse_brut) AS min_val,
        max(score_secheresse_brut) AS max_val
    FROM scores_bruts
    WHERE
        code_geo NOT LIKE '97%'
        AND code_geo NOT LIKE '98%'
),

-- ── MinMaxScaler inondation fitté sur hors 98* ───────────────────────────────
minmax_ino AS (
    SELECT
        min(score_inondation_brut) AS min_val,
        max(score_inondation_brut) AS max_val
    FROM scores_bruts
    WHERE code_geo NOT LIKE '98%'
),

normalized AS (
    SELECT
        s.*,
        CASE
            WHEN s.code_geo LIKE '97%' OR s.code_geo LIKE '98%' THEN NULL
            WHEN ms.max_val = ms.min_val THEN 0
            ELSE (s.score_secheresse_brut - ms.min_val) / (ms.max_val - ms.min_val)
        END AS score_secheresse_non_corrige,

        CASE
            WHEN s.code_geo LIKE '98%' THEN NULL
            WHEN mi.max_val = mi.min_val THEN 0
            ELSE (s.score_inondation_brut - mi.min_val) / (mi.max_val - mi.min_val)
        END AS score_inondation_non_corrige

    FROM scores_bruts AS s
    CROSS JOIN minmax_sec AS ms
    CROSS JOIN minmax_ino AS mi
),

net AS (
    SELECT
        *,
        CASE
            WHEN score_secheresse_non_corrige IS NULL THEN NULL
            ELSE
                greatest(
                    0.0,
                    score_secheresse_non_corrige
                    - CASE
                        WHEN
                            date_approbation_rga IS NOT NULL
                            AND extract(YEAR FROM current_date)
                            - extract(YEAR FROM date_approbation_rga::date) < 10
                            THEN 0.2
                        ELSE 0.1
                    END
                    * coalesce(pprn_rga, 0)
                )
        END AS score_secheresse,

        CASE
            WHEN score_inondation_non_corrige IS NULL THEN NULL
            ELSE
                greatest(
                    0.0,
                    score_inondation_non_corrige
                    - CASE
                        WHEN
                            date_approbation_ino IS NOT NULL
                            AND extract(YEAR FROM current_date)
                            - extract(YEAR FROM date_approbation_ino::date) < 10
                            THEN 0.2
                        ELSE 0.1
                    END
                    * coalesce(pprn_ino, 0)
                )
        END AS score_inondation

    FROM normalized
),

final AS (
    SELECT
        code_geo,
        score_secheresse_brut,
        score_secheresse_non_corrige,
        score_secheresse,
        swi_indice,
        rga_indice,
        tri_indice,
        rr_50_indice,
        swi_x_rga_indice,
        arr_sec_indice,
        arr_ino_indice,
        score_inondation_brut,
        score_inondation_non_corrige,
        score_inondation,
        score_autres_risques_nat,

        CASE
            WHEN score_secheresse IS NULL
                THEN sqrt(0.8 * power(score_inondation, 2) + 0.2 * power(score_autres_risques_nat, 2))
            ELSE sqrt(
                0.4 * power(score_secheresse, 2)
                + 0.4 * power(score_inondation, 2)
                + 0.2 * power(score_autres_risques_nat, 2)
            )
        END AS score_agrege,

        greatest(
            coalesce(score_secheresse, 0),
            coalesce(score_inondation, 0)
        ) AS score_principal

    FROM net
)

SELECT
    code_geo,
    score_secheresse,
    score_inondation,
    score_autres_risques_nat,
    score_secheresse_brut,
    score_secheresse_non_corrige,
    score_inondation_brut,
    score_inondation_non_corrige,
    swi_indice,
    rga_indice,
    swi_x_rga_indice,
    tri_indice,
    rr_50_indice,
    arr_sec_indice,
    arr_ino_indice,
    greatest(score_agrege, score_principal) AS score_exposition

FROM final
