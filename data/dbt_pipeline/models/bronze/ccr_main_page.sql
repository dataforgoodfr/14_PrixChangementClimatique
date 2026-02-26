-- ccr_main_page.sql
-- Use alias to respect naming convention : snake_case

SELECT
    NOMPERIL AS NOM_PERIL,
    DATEARRETE AS DATE_ARRETE,
    DATEPARUTIONJO AS DATE_PARUTION_JO,
    CODENOR AS CODE_NOR,
    CODEARRETE AS CODE_ARRETE
FROM 'pipeline_inputs/ccr_main_page.csv'
