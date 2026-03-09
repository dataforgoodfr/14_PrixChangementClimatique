SELECT
    * EXCLUDE ("commune", "departement"),
    "commune" AS code_geo,
    "departement" AS code_departement
FROM
    'pipeline_inputs/impots_REI_2022.csv'
