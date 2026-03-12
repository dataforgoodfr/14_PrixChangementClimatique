{{ config(materialized='table') }}

select
    {% for col in adapter.get_columns_in_relation(source('pipeline_inputs', 'impots_fusion_rei')) %}
        cast({{ col.name }} as varchar) as {{ clean_column_name(col.name) }}{% if not loop.last %},{% endif %}
    {% endfor %}
from {{ source('pipeline_inputs', 'impots_fusion_rei') }}