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

standardized AS (
    SELECT
        code_geo,
        pprn_rga,
        pprn_ino,

        (coalesce(swi_04_d_abs, 0) - {{ var('mean_swi') }}) / {{ var('std_swi') }} AS z_swi,
        (coalesce(nb_total_arretes_sec, 0) - {{ var('mean_arr_sec') }}) / {{ var('std_arr_sec') }} AS z_arr_sec,
        (coalesce(indicateur_rga, 0) - {{ var('mean_rga') }}) / {{ var('std_rga') }} AS z_rga,

        (coalesce(rr_50_d_abs, 0) - {{ var('mean_rr50') }}) / {{ var('std_rr50') }} AS z_rr_50,
        (coalesce(nb_total_arretes_ino, 0) - {{ var('mean_arr_ino') }}) / {{ var('std_arr_ino') }} AS z_arr_ino,
        (coalesce(indicateur_tri, 0) - {{ var('mean_tri') }}) / {{ var('std_tri') }} AS z_tri,

        coalesce(nb_total_arretes_autre, 0) AS nb_total_arretes_autre

    FROM source
),

scores_bruts AS (
    SELECT
        code_geo,
        pprn_rga,
        pprn_ino,
        nb_total_arretes_autre,

        z_swi * {{ var('loading_sec_swi') }}
        + z_arr_sec * {{ var('loading_sec_arr_sec') }}
        + z_rga * {{ var('loading_sec_rga') }}
            AS score_sec_raw,

        z_rr_50 * {{ var('loading_ino_rr50') }}
        + z_arr_ino * {{ var('loading_ino_arr_ino') }}
        + z_tri * {{ var('loading_ino_tri') }}
            AS score_ino_raw

    FROM standardized
),

normalized AS (
    SELECT
        code_geo,
        pprn_rga,
        pprn_ino,

        (greatest({{ var('p01_sec') }}, least({{ var('p99_sec') }}, score_sec_raw)) - {{ var('p01_sec') }})
        / ({{ var('p99_sec') }} - {{ var('p01_sec') }})
            AS score_secheresse_norm,

        (greatest({{ var('p01_ino') }}, least({{ var('p99_ino') }}, score_ino_raw)) - {{ var('p01_ino') }})
        / ({{ var('p99_ino') }} - {{ var('p01_ino') }})
            AS score_inondation_norm,

        (
            greatest({{ var('p01_autre') }}, least({{ var('p99_autre') }}, nb_total_arretes_autre))
            - {{ var('p01_autre') }}
        )
        / ({{ var('p99_autre') }} - {{ var('p01_autre') }})
            AS score_autres_norm

    FROM scores_bruts
),

final AS (
    SELECT
        code_geo,
        score_secheresse_norm,
        score_inondation_norm,
        score_autres_norm,

        greatest(
            0,
            score_secheresse_norm - {{ var('poids_prevention') }} * coalesce(pprn_rga, 0)
        ) AS score_secheresse_net,

        greatest(
            0,
            score_inondation_norm - {{ var('poids_prevention') }} * coalesce(pprn_ino, 0)
        ) AS score_inondation_net

    FROM normalized
)

SELECT
    code_geo,
    score_secheresse_norm,
    score_inondation_norm,
    score_secheresse_net,
    score_inondation_net,
    (score_secheresse_net + score_inondation_net) / 2.0 * 0.9
    + 0.1 * score_autres_norm
        AS score_exposition

FROM final
