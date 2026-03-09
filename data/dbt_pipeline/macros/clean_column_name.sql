{% macro clean_column_name(column_name) %}
    {{ column_name
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
        | trim('_')
    }}
{% endmacro %}