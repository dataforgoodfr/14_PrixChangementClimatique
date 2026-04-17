SELECT
    "cod_commune" AS code_geo,
    lib_commune,
    lib_risque,
    CAST("num_risque" AS VARCHAR) AS num_risque
FROM READ_CSV_AUTO(
    'pipeline_inputs/risq_gaspar.csv',
    types = { 'num_risque': 'VARCHAR' }
)
