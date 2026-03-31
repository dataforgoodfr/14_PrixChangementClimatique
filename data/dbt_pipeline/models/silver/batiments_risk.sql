-- batiments_risk.sql

WITH
add_weighted AS (
    SELECT
        *,
       /* 0 AS weighted_rga_pre_1945_nul,
        0 AS weighted_rga_pre_1945_faible,
        0 AS weighted_rga_pre_1945_moyen,
        0 AS weighted_rga_pre_1945_fort,
        0 AS weighted_rga_1945_1975_nul,
        0 AS weighted_rga_1976_2020_nul,
        0 AS weighted_rga_post_2020_nul,*/
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
    ) / total_maisons AS rga_score,
    (
        tri_t_01_faible + 3 * tri_t_01_moyen + 5 * tri_t_01_fort
        + tri_t_02_faible + 3 * tri_t_02_moyen + 5 * tri_t_02_fort
        + tri_t_03_faible + 3 * tri_t_03_moyen + 5 * tri_t_03_fort
    ) / total_maisons AS tri_score
FROM 
    add_weighted
