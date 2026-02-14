-- insee_filosofi_2021.sql
-- Use alias to respect naming convention : snake_case

SELECT 
    GEO AS geo,
    GEO_OBJECT AS geo_object,
    FILOSOFI_MEASURE AS filosofi_measure,
    UNIT_MEASURE AS  unit_measure,
    UNIT_MULT AS unit_mult,
    CONF_STATUS AS conf_status,
    OBS_STATUS AS obs_status,
    TIME_PERIOD AS time_period,
    OBS_VALUE AS obs_value
FROM 
    'pipeline_inputs/ds_filosofi_cc_2021_data.csv'
