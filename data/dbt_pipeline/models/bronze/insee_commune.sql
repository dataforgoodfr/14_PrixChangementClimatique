-- insee_commune.sql

SELECT 
    TYPECOM AS type_com,
    COM AS geo,
    REG AS reg,
    DEP AS dep,
    CTCD AS  ctcd,
    ARR AS arr,
    TNCC AS tncc,
    NCC AS ncc,
    NCCENR AS nccenr,
    LIBELLE AS libelle,
    CAN AS can,
    COMPARENT AS com_parent
FROM 
    'pipeline_inputs/insee_commune_2025.csv'
