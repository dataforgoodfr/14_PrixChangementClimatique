{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/ccr_details.csv'
