-- models/bronze/test_simple.sql
SELECT * FROM {{ source('pipeline_inputs', 'impots_fusion_rei') }}