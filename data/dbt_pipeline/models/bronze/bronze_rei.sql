SELECT 
  * EXCEPT(code_insee, departement),
  code_insee AS code_geo,
  departement AS code_departement
FROM 
  'pipeline_inputs/impots_REI_2022.csv'
