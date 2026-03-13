SELECT
    "No disposition" AS numero_disposition,
    "Date mutation" AS date_mutation,
    "Nature mutation" AS nature_mutation,
    "Valeur fonciere" AS valeur_fonciere,
    "No voie" AS numero_voie,
    "B/T/Q" AS b_t_q,
    "Type de voie" AS type_de_voie,
    "Code voie" AS code_voie,
    "Voie" AS voie,
    "Commune" AS commune,
    "Prefixe de section" AS prefixe_de_section,
    "Section" AS section,
    "No plan" AS numero_plan,
    "No Volume" AS numero_volume,
    "1er lot" AS _1_er_lot,
    "Surface Carrez du 1er lot" AS surface_carrez_du_1_er_lot,
    "2eme lot" AS _2_eme_lot,
    "Surface Carrez du 2eme lot" AS surface_carrez_du_2_eme_lot,
    "3eme lot" AS _3_eme_lot,
    "Surface Carrez du 3eme lot" AS surface_carrez_du_3_eme_lot,
    "4eme lot" AS _4_eme_lot,
    "Surface Carrez du 4eme lot" AS surface_carrez_du_4_eme_lot,
    "5eme lot" AS _5_eme_lot,
    "Surface Carrez du 5eme lot" AS surface_carrez_du_5_eme_lot,
    "Nombre de lots" AS nombre_de_lots,
    "Code type local" AS code_type_local,
    "Type local" AS type_local,
    "Identifiant local" AS identifiant_local,
    "Surface reelle bati" AS surface_reelle_bati,
    "Nombre pieces principales" AS nombre_pieces_principales,
    "Nature culture" AS nature_culture,
    "Nature culture speciale" AS nature_culture_speciale,
    "Surface terrain" AS surface_terrain,
    "annee" AS annee_enregistrement,
    lpad(cast("Code postal" AS VARCHAR), 5, '0') AS code_postal,
    CASE
        WHEN cast("Code departement" AS VARCHAR) LIKE '97%' THEN lpad(cast("Code departement" AS VARCHAR), 3, '0')
        ELSE lpad(cast("Code departement" AS VARCHAR), 2, '0')
    END AS code_departement,
    CASE
        WHEN cast("Code departement" AS VARCHAR) LIKE '97%' THEN lpad(cast("Code commune" AS VARCHAR), 2, '0')
        ELSE lpad(cast("Code commune" AS VARCHAR), 3, '0')
    END AS code_commune,
    concat(code_departement, code_commune) AS code_geo

FROM "pipeline_inputs/valeurs_foncieres_combined.parquet"
