SELECT
    code_geo, rga_score
FROM 
     {{ ref('batiments_risk_RGA') }}
WHERE
    (code_geo = 1229 AND ROUND(rga_score,3) != 3.36)
    AND (code_geo = 95675 AND ROUND(rga_score,4) != 0.8286)
    AND (code_geo = 95379 AND ROUND(rga_score,2) != 4.19)
    AND (code_geo = 1134 AND ROUND(rga_score,2) != 3.39)
    AND (code_geo = 1157 AND ROUND(rga_score,2) != 0.58)
    AND (code_geo = 1159 AND ROUND(rga_score,2) != 2.50)