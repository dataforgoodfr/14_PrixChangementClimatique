-- batiments_risk_TRI.sql

SELECT
    code_geo,
    (
        tri_t_01_faible + 3 * tri_t_01_moyen + 5 * tri_t_01_fort
        + tri_t_02_faible + 3 * tri_t_02_moyen + 5 * tri_t_02_fort
        + tri_t_03_faible + 3 * tri_t_03_moyen + 5 * tri_t_03_fort
    ) / total_maisons AS tri_score
FROM
    {{ ref('rga_tri_communes') }}
