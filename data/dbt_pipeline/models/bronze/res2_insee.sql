{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/res2_insee.csv'
