SELECT
    "Point" AS pts,
    "Latitude" AS latitude,
    "Longitude" AS longitude,
    "NORTX35D_yr" AS nortx_35_d_yr,
    "NORRRq99refD_yr" AS norrrq_99_ref_d_yr,
    "NORSWI04_yr " AS norswi_04_yr ,
    "NORTR_yr" AS nortr_yr,
    "NORRR_yr" AS norrr_yr
FROM
    read_csv(
        'pipeline_inputs/DRIAS.txt', delim = ';', skip = 47, header = false,
        column_names = [
            'Point', 'Latitude', 'Longitude', 'Niveau', 'NORTMm_yr',
            'NORTMm_seas_JJA', 'NORTMm_seas_DJF', 'NORTXm_seas_JJA',
            'NORTX35D_yr', 'NORTX30D_yr', 'NORTR_yr', 'NORRR_yr',
            'NORRR_seas_JJA', 'NORRR_seas_DJF', 'NORRRq99_yr', 'NORRx1d_yr',
            'NORRRq99refD_yr', 'NORIFM40_yr', 'NORSWI04_yr',
            'ATMm_yr', 'ATMm_seas_JJA', 'ATMm_seas_DJF', 'ATXm_seas_JJA',
            'ATX35D_yr', 'ATX30D_yr', 'ATR_yr', 'ARRq99refD_yr', 'AIFM40_yr',
            'ASWI04_yr', 'ARRR_yr', 'ARRR_seas_JJA', 'ARRR_seas_DJF', 'ARRRq99_yr', 'ARRx1d_yr'
        ]
    )
