{% set cols = adapter.get_columns_in_relation(source('pipeline_inputs', 'impots_fusion_rei')) %}

SELECT
    {% for col in cols %}
        "{{ col.name }}" AS {{ clean_column_name(col.name) }}{% if not loop.last %},{% endif %}
    {% endfor %}
FROM {{ source('pipeline_inputs', 'impots_fusion_rei') }}