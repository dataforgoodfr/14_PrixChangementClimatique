-- ccr_details.sql
-- Use alias to respect naming convention : snake_case

SELECT 
    codeInsee as code_geo,
    nomCommune as nom_commune,
    dateDebutEvenement as date_debut_evenement,
    dateFinEvenement as date_fin_evenement,
    dateArrete as date_arrete,
    dateParutionJO as date_parution_jo,
    nomPeril as nom_peril,
    franchise,
    libelleAvis as libelle_avis,
    code_arrete
FROM 
    'pipeline_inputs/ccr_details.csv'
