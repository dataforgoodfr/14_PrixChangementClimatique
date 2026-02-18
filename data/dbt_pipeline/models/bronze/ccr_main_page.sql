-- ccr_main_page.sql
-- Use alias to respect naming convention : snake_case

SELECT 
  nomPeril AS nom_peril,
  dateArrete AS date_arrete,
  dateParutionJO AS date_parution_jo,
  codeNOR AS code_nor,
  codeArrete AS code_arrete
FROM 'pipeline_inputs/ccr_main_page.csv'
