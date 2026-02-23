SELECT
    cod_commune as code_geo,
    CAST(num_risque AS VARCHAR) as num_risque,
    lib_commune,
    lib_risque
FROM read_csv_auto(
    'pipeline_inputs/risq_gaspar.csv',
    types={'num_risque': 'VARCHAR'}
)