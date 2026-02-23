 
SELECT
    codgeo               AS code_geo,
    libgeo               AS nom_geo,
    dep                  AS code_departement,
    CAST(reg AS VARCHAR) AS code_region,
    p13_pop              AS pop_2016,
    p14_pop              AS pop_2017,
    p15_pop              AS pop_2018,
    p16_pop              AS pop_2019,
    p17_pop              AS pop_2020,
    p18_pop              AS pop_2021,
    p19_pop              AS pop_2022,
    p20_pop              AS pop_2023,
    p21_pop              AS pop_2024,
    p22_pop              AS pop_2025,
    p23_pop              AS pop_2026
FROM 'pipeline_inputs/population_communes_france_raw.csv'

