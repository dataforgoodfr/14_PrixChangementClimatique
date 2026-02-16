{{
  config(
    materialized='table'
  )
}}
    
select
    codgeo               as code_geo,
    libgeo               as nom_geo,
    dep                  as code_departement,
    cast(reg as varchar) as code_region,
    p13_pop              as pop_2016,
    p14_pop              as pop_2017,
    p15_pop              as pop_2018,
    p16_pop              as pop_2019,
    p17_pop              as pop_2020,
    p18_pop              as pop_2021,
    p19_pop              as pop_2022,
    p20_pop              as pop_2023,
    p21_pop              as pop_2024,
    p22_pop              as pop_2025,
    p23_pop              as pop_2026
from 'pipeline_inputs/population_communes_france_raw.csv'

