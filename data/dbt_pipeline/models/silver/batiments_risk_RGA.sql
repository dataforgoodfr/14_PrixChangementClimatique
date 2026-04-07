-- batiments_risk_RGA.sql

WITH
add_weighted AS (
    SELECT
        code_geo,
        total_maisons,
        0.5 * 1 * rga_1945_1975_faible AS weighted_rga_1945_1975_faible,
        0.5 * 5 * rga_1945_1975_moyen AS weighted_rga_1945_1975_moyen,
        0.5 * 10 * rga_1945_1975_fort AS weighted_rga_1945_1975_fort,
        1 * 1 * rga_1976_2020_faible AS weighted_rga_1976_2020_faible,
        1 * 5 * rga_1976_2020_moyen AS weighted_rga_1976_2020_moyen,
        1 * 10 * rga_1976_2020_fort AS weighted_rga_1976_2020_fort,
        0.5 * 1 * rga_post_2020_faible AS weighted_rga_post_2020_faible,
        0.5 * 5 * rga_post_2020_moyen AS weighted_rga_post_2020_moyen,
        0.5 * 10 * rga_post_2020_fort AS weighted_rga_post_2020_fort
    FROM
        {{ ref('rga_tri_communes') }}
)

SELECT
    code_geo,
    (
        weighted_rga_1945_1975_faible + weighted_rga_1945_1975_moyen + weighted_rga_1945_1975_fort
        + weighted_rga_1976_2020_faible + weighted_rga_1976_2020_moyen + weighted_rga_1976_2020_fort
        + weighted_rga_post_2020_faible + weighted_rga_post_2020_moyen + weighted_rga_post_2020_fort
    ) / total_maisons AS rga_score
FROM
    add_weighted
