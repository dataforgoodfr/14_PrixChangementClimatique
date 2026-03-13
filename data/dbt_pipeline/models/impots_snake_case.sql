-- sqlfluff:disable:layout,PRS,TMP
{{ config(materialized='view') }}

WITH source_data AS (
    SELECT * FROM {{ ref('impots_fusion_rei') }}
)

SELECT
    {%- for col in adapter.get_columns_in_relation(ref('impots_fusion_rei')) %}
    {{ col.name }} AS {{ clean_column_name(col.name) }}
    {%- if not loop.last %},{% endif %}
    {%- endfor %}
FROM source_data
