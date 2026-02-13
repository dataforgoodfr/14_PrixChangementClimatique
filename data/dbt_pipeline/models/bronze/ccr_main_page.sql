{{
  config(
    materialized='table'
  )
}}

SELECT * FROM 'pipeline_inputs/ccr_main_page.csv'
