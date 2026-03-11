-- models/bronze/impots_fusion_rei.sql
SELECT * FROM read_csv_auto(
    'pipeline_inputs/impots_fusion_rei.csv', 
    all_varchar=True
)