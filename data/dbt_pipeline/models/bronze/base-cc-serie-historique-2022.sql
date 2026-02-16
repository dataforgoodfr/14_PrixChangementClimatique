{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/base-cc-serie-historique-2022.CSV'
