{#- Configuration pour le linter sqlfluff qui ne voit pas les colonnes en dehors de dbt -#}
{% set cols = adapter.get_columns_in_relation(source('pipeline_inputs', 'impots_fusion_rei')) %}

SELECT
    {% if cols %}
        {% for col in cols -%}
            "{{ col.name }}" AS {{ clean_column_name(col.name) }}{% if not loop.last %},{% endif %}
        {% endfor %}
    {%- else -%}
        *
    {%- endif %}
FROM {{ source('pipeline_inputs', 'impots_fusion_rei') }}