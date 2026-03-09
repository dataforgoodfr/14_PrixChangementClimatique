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
        | regex_replace(r'__+', '_')     # remplace les doubles underscores
        | trim('_')                      # enlève _ au début/fin
    }}
{% endmacro %}