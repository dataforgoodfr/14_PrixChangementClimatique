{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/pprt_gaspar.csv'
