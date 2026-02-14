SELECT 
    * EXCLUDE (insee_dep),
    insee_dep AS code_departement 
FROM ST_READ('pipeline_inputs/AleaRG_2025_Fxx_L93.gpkg')
