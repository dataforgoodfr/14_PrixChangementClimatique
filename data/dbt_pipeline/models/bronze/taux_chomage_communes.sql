SELECT
    code_region,
    region,
    code_departement,
    departement,
    code_commune,
    commune,
    "codgeo" AS code_geo,
    nombre_de_demandeurs_d_emploi,
    "p23_pop" AS p_23_pop,
    "ratio_ABC_pop_commune" AS ratio_abc_pop_commune,
    "ratio_ABC_pop_dep" AS ratio_abc_pop_dep,
    "T3_2025_departement" AS t_3_2025_departement,
    "T3_2025_proxy_commune" AS t_3_2025_proxy_commune

FROM 'pipeline_inputs/taux_chomage_communes.csv'
