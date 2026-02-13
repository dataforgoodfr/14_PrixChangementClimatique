{{
  config(
    materialized='table'
  )
}}

SELECT * FROM read_csv_auto('pipeline_inputs/risq_gaspar.csv', columns={'num_risque': 'VARCHAR'})
