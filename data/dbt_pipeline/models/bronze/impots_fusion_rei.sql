{{ config(materialized='view') }}

WITH raw_data AS (
    SELECT *
    FROM read_csv_auto(
        'pipeline_inputs/impots_fusion_rei.csv',
        all_varchar=true
    )
)

SELECT 
    {%- set columns = adapter.get_columns_in_relation(source('pipeline_inputs', 'impots_fusion_rei')) %}
    
    {%- for column in columns %}
        {{ column.name }} AS {{ clean_column_name(column.name) }}
        {%- if not loop.last %},{% endif %}
    {%- endfor %}
FROM raw_data
