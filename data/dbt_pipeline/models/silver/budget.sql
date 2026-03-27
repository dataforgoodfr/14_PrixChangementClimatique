WITH
 bugdet AS (
    SELECT 
        code_geo_from_siren,
        nom_com,
        annee,
        SUM(CASE WHEN type_compte='dettes financieres' THEN solde ELSE 0 END ) AS dettes,
        SUM(CASE WHEN type_compte='primes d assurances' THEN solde ELSE 0 END ) AS primes,
        SUM(CASE WHEN type_compte='depenses' THEN solde ELSE 0 END ) AS depenses,
        SUM(CASE WHEN type_compte='produits' THEN solde ELSE 0 END ) AS produits
    FROM 
        {{ ref('budget_per_compte_communes') }}
    WHERE
        type_compte IN ('dettes financieres','primes d assurances','depenses','produits')
    GROUP BY 
        code_geo_from_siren,
        nom_com,
        annee
),

pop_unpivoted AS (
    {{ dbt_utils.unpivot(
        relation=ref('population_code_geo'),
        cast_to='integer',
        exclude=['code_geo', 'nom_geo', 'code_departement', 'code_region'],
        field_name='annee_raw',
        value_name='population'
    ) }}
),

pop AS (
    SELECT 
        code_geo,
        CAST(REPLACE(annee_raw, 'pop_', '') as integer) as annee,
        SUM(population) AS population
    FROM
        pop_unpivoted
    GROUP BY 
        code_geo,
        annee_raw
)


SELECT
    bugdet.*,
    pop.population,
    bugdet.produits - bugdet.depenses AS solde_annuel,
    bugdet.dettes/bugdet.produits AS ratio_dettes_produits,
    bugdet.dettes/bugdet.depenses AS ratio_dettes_depenses,
    bugdet.primes/bugdet.depenses AS ratio_primes_depenses,
    bugdet.dettes/pop.population AS dettes_per_pop,
    bugdet.primes/pop.population AS primes_per_pop ,
    bugdet.depenses/pop.population AS depenses_per_pop ,
    bugdet.produits/pop.population AS produits_per_pop ,
    (bugdet.produits - bugdet.depenses)/pop.population AS solde_annuel_per_pop
FROM 
    bugdet
LEFT JOIN
    pop
ON
    bugdet.code_geo_from_siren =pop.code_geo
    AND bugdet.annee =pop.annee
