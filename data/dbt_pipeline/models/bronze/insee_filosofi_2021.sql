-- insee_filosofi_2021.sql
-- Use alias to respect naming convention : snake_case
SELECT
    GEO AS CODE_GEO,
    GEO_OBJECT,
    FILOSOFI_MEASURE,
    UNIT_MEASURE,
    UNIT_MULT,
    CONF_STATUS,
    OBS_STATUS,
    TIME_PERIOD,
    OBS_VALUE
FROM
    'pipeline_inputs/ds_filosofi_cc_2021_data.csv'
