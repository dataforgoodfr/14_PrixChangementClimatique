{% macro clean_column_name(column_name) %}
    {% set cleaned = column_name 
        | lower 
        | replace(' ', '_') 
        | replace('-', '_') 
        | replace('/', '_') 
        | replace('.', '_') 
        | replace(':', '_') 
        | replace("'", '') 
        | replace('(', '') 
        | replace(')', '') 
        | replace('é', 'e') 
        | replace('è', 'e') 
        | replace('ê', 'e') 
        | replace('à', 'a') 
    %}
    {# Appliquer le regex sur la version nettoyée #}
    {{ cleaned | regex_replace(r'__+', '_') | trim('_') }}
{% endmacro %}