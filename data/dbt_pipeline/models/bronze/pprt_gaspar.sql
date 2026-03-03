
SELECT 
    "CODE MODELE" AS code_modele,
    "LIBELLE MODELE" AS libelle_modele,
    "CODE PROECEDURE" AS code_procedure,
    "LIBELLE PROCEDURE" AS libelle_procedure,
    "LIBELLE ORGANISME" AS libelle_organisme,
    "BASSIN RISQUE" AS bassin_risque,
    "BASSINS HYDROGRAPHIQUES" AS bassins_hydrographiques,
    "COURS EAU" AS cours_eau,
    "CODE INSEE COMMUNE" AS code_geo, -- code commune - appelé code_geo dans les données bronze du projet
    "CODE RISQUE 1" AS code_risque_1,
    "LIBELLE RISQUE 1" AS libelle_risque_1,
    "CODE RISQUE 2" AS code_risque_2,
    "LIBELLE RISQUE 2" AS libelle_risque_2,
    "CODE RISQUE 2_1" AS code_risque_2_1,
    "LIBELLE RISQUE 3" AS libelle_risque_3,
    "PROCEDURE REVISANTE" AS procedure_revisante,
    "CODES REVISES" AS codes_revises,
    "PROCEDURE REVISEE" AS procedure_revisee,
    "CODES REVISANTS" AS codes_revisants,
    "PRESCRIPTION" AS prescription,
    "ENQUETE_PUBL_DEBUT" AS enquete_publ_debut,
    "ENQUETE_PUBL_FIN" AS enquete_publ_fin,
    "ANNEX_PLU" AS annex_plu,
    "DEPRESCRIPTION" AS deprescription,
    "APPROBATION" AS approbation,
    "ANNULATION" AS annulation,
    "ABROGATION" AS abrogation,
    "LIBELLE ETAT" AS libelle_etat,
    "DATE ETAT" AS date_etat,
    "LIBELLE SOUS-ETAT" AS libelle_sous_etat,
    "DATE SOUS-ETAT" AS date_sous_etat,
    "DATE DERNIERE MISE A JOUR" AS date_derniere_mise_a_jour


 FROM 'pipeline_inputs/pprt_gaspar.csv'
