-- models/intermediate/int_score_climatique.sql
-- Calcul des scores sécheresse et inondation par commune
-- Les coefficients PCA sont pré-calculés (issus du run Python de référence)
-- et injectés via des variables dbt ou directement en dur pour commencer.

WITH source AS (
    SELECT

        c.code_geo,

        pr.pprn_rga,
        pr.pprn_ino,

        ccr.nb_total_arretes_sec,
        ccr.nb_total_arretes_ino,
        ccr.nb_total_arretes_autre,

        sc.swi_04_d_abs,
        sc.rr_50_d_abs,

        i.indicateur_rga,
        i.indicateur_tri

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('pprn') }} AS pr ON c.code_geo = pr.code_geo
    LEFT JOIN {{ ref('ccr_totals') }} AS ccr ON c.code_geo = ccr.code_geo
    LEFT JOIN {{ ref('scenario_2050') }} AS sc ON c.code_geo = sc.code_geo
    LEFT JOIN {{ ref('indicateurs_tri_rga_bats_par_com') }} AS i ON c.code_geo = i.code_geo

),

-- Standardisation manuelle : (x - mean) / std
-- Les stats de référence doivent être stables (calculées sur le périmètre métropole)
stats AS (
    SELECT
        avg(coalesce(swi_04_d_abs, 0)) AS mean_swi,
        stddev(coalesce(swi_04_d_abs, 0)) AS std_swi,
        avg(coalesce(nb_total_arretes_sec, 0)) AS mean_arr_sec,
        stddev(coalesce(nb_total_arretes_sec, 0)) AS std_arr_sec,
        avg(coalesce(indicateur_rga, 0)) AS mean_rga,
        stddev(coalesce(indicateur_rga, 0)) AS std_rga,
        avg(coalesce(rr_50_d_abs, 0)) AS mean_rr_50,
        stddev(coalesce(rr_50_d_abs, 0)) AS std_rr_50,
        avg(coalesce(nb_total_arretes_ino, 0)) AS mean_arr_ino,
        stddev(coalesce(nb_total_arretes_ino, 0)) AS std_arr_ino,
        avg(coalesce(indicateur_tri, 0)) AS mean_tri,
        stddev(coalesce(indicateur_tri, 0)) AS std_tri,
        avg(coalesce(nb_total_arretes_autre, 0)) AS mean_autre,
        stddev(coalesce(nb_total_arretes_autre, 0)) AS std_autre
    FROM source
    WHERE NOT (code_geo LIKE '97%' OR code_geo LIKE '98%')
),

standardized AS (
    SELECT
        s.code_geo,
        -- Variables sécheresse standardisées
        s.pprn_rga,
        s.pprn_ino,
        (coalesce(s.swi_04_d_abs, 0) - st.mean_swi) / nullif(st.std_swi, 0) AS z_swi,
        -- Variables inondation standardisées
        (coalesce(s.nb_total_arretes_sec, 0) - st.mean_arr_sec) / nullif(st.std_arr_sec, 0) AS z_arr_sec,
        (coalesce(s.indicateur_rga, 0) - st.mean_rga) / nullif(st.std_rga, 0) AS z_rga,
        (coalesce(s.rr_50_d_abs, 0) - st.mean_rr_50) / nullif(st.std_rr_50, 0) AS z_rr_50,
        -- Variable autres arrêtés
        (coalesce(s.nb_total_arretes_ino, 0) - st.mean_arr_ino) / nullif(st.std_arr_ino, 0) AS z_arr_ino,
        -- Colonnes de prévention (pour le score net)
        (coalesce(s.indicateur_tri, 0) - st.mean_tri) / nullif(st.std_tri, 0) AS z_tri,
        (coalesce(s.nb_total_arretes_autre, 0) - st.mean_autre) / nullif(st.std_autre, 0) AS z_autre
    FROM source AS s
    CROSS JOIN stats AS st
),

scores_bruts AS (
    SELECT
        code_geo,
        -- Score sécheresse = PCA 1 composante
        -- Loadings à mettre à jour après run de référence Python
        -- Valeurs ci-dessous = exemple à calibrer
        (
            z_swi * {{ var('loading_sec_swi',     0.6) }}
            + z_arr_sec * {{ var('loading_sec_arr_sec', 0.5) }}
            + z_rga * {{ var('loading_sec_rga',     0.6) }})
            AS score_secheresse_raw,

        -- Score inondation = PCA 2 composantes pondérées par variance expliquée
        (
            z_rr_50 * {{ var('loading_ino_rr50',    0.6) }}
            + z_arr_ino * {{ var('loading_ino_arr_ino', 0.5) }}
            + z_tri * {{ var('loading_ino_tri',     0.6) }})
            AS score_inondation_raw,

        z_autre,
        pprn_rga,
        pprn_ino
    FROM standardized
),

-- Normalisation clip p1-p99 puis min-max (reproduce clip_minmax Python)
percentiles AS (
    SELECT
        percentile_cont(0.01) WITHIN GROUP (ORDER BY score_secheresse_raw) AS p_01_sec,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY score_secheresse_raw) AS p_99_sec,
        percentile_cont(0.01) WITHIN GROUP (ORDER BY score_inondation_raw) AS p_01_ino,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY score_inondation_raw) AS p_99_ino,
        percentile_cont(0.01) WITHIN GROUP (ORDER BY z_autre) AS p_01_autre,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY z_autre) AS p_99_autre
    FROM scores_bruts
),

clipped AS (
    SELECT
        sb.code_geo,
        sb.pprn_rga,
        sb.pprn_ino,
        p.p_01_sec,
        p.p_99_sec,
        p.p_01_ino,
        p.p_99_ino,
        p.p_01_autre,
        p.p_99_autre,
        greatest(p.p_01_sec, least(p.p_99_sec, sb.score_secheresse_raw)) AS score_sec_clipped,
        greatest(p.p_01_ino, least(p.p_99_ino, sb.score_inondation_raw)) AS score_ino_clipped,
        greatest(p.p_01_autre, least(p.p_99_autre, sb.z_autre)) AS score_autre_clipped
    FROM scores_bruts AS sb
    CROSS JOIN percentiles AS p
),

minmax AS (
    SELECT
        min(score_sec_clipped) AS min_sec,
        max(score_sec_clipped) AS max_sec,
        min(score_ino_clipped) AS min_ino,
        max(score_ino_clipped) AS max_ino,
        min(score_autre_clipped) AS min_autre,
        max(score_autre_clipped) AS max_autre
    FROM clipped
),

final AS (
    SELECT
        c.code_geo,

        -- Scores normalisés [0-1]
        (c.score_sec_clipped - m.min_sec) / nullif(m.max_sec - m.min_sec, 0) AS score_secheresse_norm,
        (c.score_ino_clipped - m.min_ino) / nullif(m.max_ino - m.min_ino, 0) AS score_inondation_norm,
        (c.score_autre_clipped - m.min_autre) / nullif(m.max_autre - m.min_autre, 0) AS score_autres_norm,

        -- Scores nets (soustraction pondérée de la prévention)
        greatest(
            0,
            (c.score_sec_clipped - m.min_sec) / nullif(m.max_sec - m.min_sec, 0)
            - {{ var('poids_prevention', 0.2) }} * coalesce(c.pprn_rga, 0)
        ) AS score_secheresse_net,

        greatest(
            0,
            (c.score_ino_clipped - m.min_ino) / nullif(m.max_ino - m.min_ino, 0)
            - {{ var('poids_prevention', 0.2) }} * coalesce(c.pprn_ino, 0)
        ) AS score_inondation_net

    FROM clipped AS c
    CROSS JOIN minmax AS m
),

global AS (
    SELECT
        code_geo,
        score_secheresse_norm,
        score_inondation_norm,
        score_secheresse_net,
        score_inondation_net,

        -- Score climatique global = 90% risques nets + 10% autres arrêtés
        (score_secheresse_net + score_inondation_net) / 2.0 * 0.9
        + 0.1 * score_autres_norm
            AS score_climatique

    FROM final
)

SELECT * FROM global
