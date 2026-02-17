{{
  config(
    materialized='table'
  )
}}
SELECT * FROM 'pipeline_inputs/impots_REI_2022.csv'
