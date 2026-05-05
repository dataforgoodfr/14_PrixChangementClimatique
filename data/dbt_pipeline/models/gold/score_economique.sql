WITH source AS (
    SELECT

        c.code_geo,
        b.depenses_per_pop,
        b.ratio_dettes_depenses

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('budget_last') }} AS b ON c.code_geo = b.code_geo
),

prep AS (
    SELECT
        code_geo,
        ratio_dettes_depenses,
        CASE
            WHEN
                depenses_per_pop = 'Infinity'::float
                OR depenses_per_pop = '-Infinity'::float
                THEN null
            ELSE depenses_per_pop
        END AS depenses_per_pop
    FROM source
),

clipped AS (
    SELECT
        code_geo,
        greatest({{ var('p10_dep') }}, least({{ var('p99_dep') }}, depenses_per_pop)) AS dep_clipped,
        greatest({{ var('p10_dette') }}, least({{ var('p99_dette') }}, ratio_dettes_depenses)) AS dette_clipped
    FROM prep
),

final AS (
    SELECT
        code_geo,

        1
        - (dep_clipped - {{ var('p10_dep') }}) / ({{ var('p99_dep') }} - {{ var('p10_dep') }}) AS depenses_per_pop_norm,
        1
        - (dette_clipped - {{ var('p10_dette') }})
        / ({{ var('p99_dette') }} - {{ var('p10_dette') }}) AS ratio_dettes_norm,

        {{ var('poids_dettes') }}
        * (1 - (dette_clipped - {{ var('p10_dette') }}) / ({{ var('p99_dette') }} - {{ var('p10_dette') }}))
        + (1 - {{ var('poids_dettes') }})
        * (1 - (dep_clipped - {{ var('p10_dep') }}) / ({{ var('p99_dep') }} - {{ var('p10_dep') }}))
            AS score_economique

    FROM clipped
)

SELECT * FROM final
