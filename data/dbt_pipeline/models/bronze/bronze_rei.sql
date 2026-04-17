SELECT
    "COMMUNE" AS code_geo,
    "DEPARTEMENT" AS code_departement,
    "DIRECTION" AS direction,
    "Libellé commune" AS libelle_commune,
    "COMMUNE RECENSEE (R si recensée)" AS commune_recensee,
    "Numéro national du groupement" AS numero_national_de_groupement,
    "Libellé du Groupement" AS libelle_groupement,
    "option fiscale de l'EPCI (FPA, FPU ou FPZ)" AS option_fiscale_epci,
    "Forme juridique EPCI (CA, CU, CC, SAN ou Mét)" AS forme_juridique_epci,
    "FNB - COMMUNE / BASE NETTE" AS fnb_commune_base_nette,
    "FNB - COMMUNE / TAUX NET" AS fnb_commune_taux_net,
    "FNB - COMMUNE / MONTANT REEL" AS fnb_commune_montant_reel,
    "TAFNB - COMMUNE / TAUX NET" AS tafnb_base_taxable_communale,
    "TAFNB - COMMUNE / MONTANT REEL NET" AS tafnb_commune_montant_reel_net
FROM
    'pipeline_inputs/impots_REI_2022.csv'
