
SELECT

    "CODE MODELE" as code_modele,
    "LIBELLE MODELE" as libelle_modele,
    "CODE PROECEDURE" as code_procedure,
    "LIBELLE PROCEDURE" as libelle_procedure,
    "LIBELLE ORGANISME" as libelle_organisme,
    "BASSIN RISQUE" as bassin_risque,
    "BASSINS HYDROGRAPHIQUES" as bassins_hydrographiques,
    "COURS EAU" as cours_eau,
    "CODE INSEE COMMUNE" as code_geo, -- code commune - appelé code_geo dans les données bronze du projet
    "CODE RISQUE 1" as code_risque_1,
    "LIBELLE RISQUE 1" as libelle_risque_1,
    "CODE RISQUE 2" as code_risque_2,
    "LIBELLE RISQUE 2" as libelle_risque_2,
    "CODE RISQUE 2_1" as code_risque_2_1,
    "LIBELLE RISQUE 3" as libelle_risque_3,
    "PROCEDURE REVISANTE" as procedure_revisante,
    "CODES REVISES" as codes_revises,
    "PROCEDURE REVISEE" as procedure_revisee,
    "CODES REVISANTS" as codes_revisants,
    "PRESCRIPTION" as prescription,
    "ENQUETE_PUBL_DEBUT" as enquete_publ_debut,
    "ENQUETE_PUBL_FIN" as enquete_publ_fin,
    "ANNEX_PLU" as annex_plu,
    "DEPRESCRIPTION" as deprescription,
    "APPROBATION" as approbation,
    "ANNULATION" as annulation,
    "ABROGATION" as abrogation,
    "LIBELLE ETAT" as libelle_etat,
    "DATE ETAT" as date_etat,
    "LIBELLE SOUS-ETAT" as libelle_sous_etat,
    "DATE SOUS-ETAT" as date_sous_etat,
    "DATE DERNIERE MISE A JOUR" as date_derniere_mise_a_jour


 FROM 'pipeline_inputs/pprm_gaspar.csv'
