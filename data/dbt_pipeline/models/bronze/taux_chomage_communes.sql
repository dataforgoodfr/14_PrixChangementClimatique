SELECT
    code_region,
    region,
    code_departement,
    departement,
    code_commune,
    commune,
    codgeo AS code_geo,
    nombre_de_demandeurs_d_emploi,
    p23_pop,
    ratio_abc_pop_commune,
    ratio_abc_pop_dep,
    t3_2025_departement,
    t3_2025_proxy_commune

FROM 'pipeline_inputs/taux_chomage_communes.csv'
