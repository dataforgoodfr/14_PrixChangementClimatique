{{ config(materialized='table') }}

SELECT *
FROM read_csv_auto(
  'pipeline_inputs/impots_REI_2022.csv',
  header=True,
  delim=';',
  encoding='latin1'
)