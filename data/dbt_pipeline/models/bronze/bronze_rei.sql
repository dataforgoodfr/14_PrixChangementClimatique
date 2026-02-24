SELECT 
  * EXCLUDE (COMMUNE, DEPARTEMENT),
  COMMUNE AS code_geo,
  DEPARTEMENT AS code_departement
FROM 
  'pipeline_inputs/impots_REI_2022.csv'
