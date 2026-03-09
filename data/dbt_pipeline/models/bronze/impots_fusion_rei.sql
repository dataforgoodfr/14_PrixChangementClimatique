SELECT 
    {% for col in adapter.get_columns_in_relation(source('pipeline_inputs', 'impots_fusion_rei')) %}
    CAST({{ col.column }} AS VARCHAR) AS {{ clean_column_name(col.column) }}{{ "," if not loop.last }}
    {% endfor %}
FROM {{ source('pipeline_inputs', 'impots_fusion_rei') }}