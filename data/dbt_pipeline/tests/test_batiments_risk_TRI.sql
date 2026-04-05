SELECT
    code_geo,
    tri_score
FROM
    {{ ref('batiments_risk_TRI') }}
WHERE
    (code_geo = 1030 AND ROUND(tri_score, 3) != 1.347)
    AND (code_geo = 1043 AND ROUND(tri_score, 4) != 0.0038)
    AND (code_geo = 1123 AND ROUND(tri_score, 2) != 0.84)
    AND (code_geo = 1134 AND ROUND(tri_score, 2) != 0.38)
    AND (code_geo = 1157 AND ROUND(tri_score, 2) != 0.14)
    AND (code_geo = 1159 AND ROUND(tri_score, 2) != 0.87)
