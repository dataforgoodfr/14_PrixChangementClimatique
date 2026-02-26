-- insee_commune.sql

SELECT
    TYPECOM AS TYPE_COM,
    -- code commune - appelé code_geo dans les données bronze du projet
    COM,
    REG,
    DEP,
    CTCD,
    ARR,
    TNCC,
    NCC,
    NCCENR,
    LIBELLE,
    CAN,
    COMPARENT AS COM_PARENT
FROM
    'pipeline_inputs/insee_commune_2025.csv'
