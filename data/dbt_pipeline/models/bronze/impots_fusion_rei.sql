SELECT
    IDCOM AS code_geo,
    * EXCLUDE (IDCOM)
FROM read_csv_auto(
    'pipeline_inputs/impots_fusion_rei.csv',
    all_varchar = true
)
