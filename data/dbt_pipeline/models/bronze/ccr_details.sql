-- ccr_details.sql

SELECT 
    codeInsee,
    nomCommune,
    dateDebutEvenement,
    dateFinEvenement,
    dateArrete,
    dateParutionJO,
    nomPeril,
    franchise,
    libelleAvis,
    code_arrete
FROM 
    'pipeline_inputs/ccr_details.csv'
