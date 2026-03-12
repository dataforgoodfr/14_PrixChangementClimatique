{{ config(materialized='view') }}

WITH raw_data AS (
    SELECT *
    FROM read_csv_auto(
        'pipeline_inputs/impots_fusion_rei.csv',
        all_varchar=true
    )
)

SELECT 
    {%- for column_name in adapter.get_columns_in_relation(ref('impots_fusion_rei')) %}
        -- On applique ta macro sur chaque nom de colonne
        {{ column_name.name }} AS {{ clean_column_name(column_name.name) }}
        {%- if not loop.last %},{% endif %}
    {%- endfor %}
FROM raw_data
