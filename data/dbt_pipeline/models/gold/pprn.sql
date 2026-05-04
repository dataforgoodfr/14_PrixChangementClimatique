SELECT
    code_geo,
    COALESCE(BOOL_OR(pprn_desc ILIKE '%tassements différentiels%'), FALSE) AS pprn_rga,
    COALESCE(BOOL_OR(pprn_libelle ILIKE '%Inondation%'), FALSE) AS pprn_ino,
    MAX(
        CASE
            WHEN pprn_desc ILIKE '%tassements différentiels%'
                THEN date_approbation
        END
    ) AS date_approbation_rga,
    MAX(
        CASE
            WHEN pprn_libelle ILIKE '%inondation%'
                THEN date_approbation
        END
    ) AS date_approbation_ino
FROM {{ ref('pprn_clean') }}
GROUP BY code_geo
