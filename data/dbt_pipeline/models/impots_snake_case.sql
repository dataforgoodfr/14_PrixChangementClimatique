{{ config(materialized='view') }}

-- On sélectionne les données de la couche bronze
WITH bronze_data AS (
    SELECT * FROM {{ ref('impots_fusion_rei') }}
)

-- On applique la macro de nettoyage sur chaque colonne dynamiquement
SELECT 
    {%- set columns = adapter.get_columns_in_relation(ref('impots_fusion_rei')) %}
    
    {%- for column in columns %}
        {{ column.name }} AS {{ clean_column_name(column.name) }}
        {%- if not loop.last %},{% endif %}
    {%- endfor %}
FROM bronze_data