{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/pprm_gaspar.csv'
