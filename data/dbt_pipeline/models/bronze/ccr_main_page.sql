-- ccr_main_page.sql

SELECT 
  nomPeril,
  dateArrete,
  dateParutionJO,
  codeNOR,
  codeArrete
FROM 'pipeline_inputs/ccr_main_page.csv'
