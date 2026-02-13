{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/azi_gaspar.csv'
