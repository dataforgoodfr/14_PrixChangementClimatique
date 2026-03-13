select
    "No disposition" as numero_disposition,
    "Date mutation" as date_mutation,
    "Nature mutation" as nature_mutation,
    "Valeur fonciere" as valeur_fonciere,
    "No voie" as numero_voie,
    "B/T/Q" as b_t_q,
    "Type de voie" as type_de_voie,
    "Code voie" as code_voie,
    "Voie" as voie,
    lpad(cast("Code postal" as VARCHAR), 5, '0') as code_postal,
    "Commune" as commune,
    case
        when cast("Code departement" as VARCHAR) like '97%' then lpad(cast("Code departement" as VARCHAR), 3, '0')
        else lpad(cast("Code departement" as VARCHAR), 2, '0')
    end as code_departement,
    case
        when cast("Code departement" as VARCHAR) like '97%' then lpad(cast("Code commune" as VARCHAR), 2, '0')
        else lpad(cast("Code commune" as VARCHAR), 3, '0')
    end as code_commune,
    "Prefixe de section" as prefixe_de_section,
    "Section" as section,
    "No plan" as numero_plan,
    "No Volume" as numero_volume,
    "1er lot" as _1er_lot,
    "Surface Carrez du 1er lot" as surface_carrez_du_1er_lot,
    "2eme lot" as _2eme_lot,
    "Surface Carrez du 2eme lot" as surface_carrez_du_2eme_lot,
    "3eme lot" as _3eme_lot,
    "Surface Carrez du 3eme lot" as surface_carrez_du_3eme_lot,
    "4eme lot" as _4eme_lot,
    "Surface Carrez du 4eme lot" as surface_carrez_du_4eme_lot,
    "5eme lot" as _5eme_lot,
    "Surface Carrez du 5eme lot" as surface_carrez_du_5eme_lot,
    "Nombre de lots" as nombre_de_lots,
    "Code type local" as code_type_local,
    "Type local" as type_local,
    "Identifiant local" as identifiant_local,
    "Surface reelle bati" as surface_reelle_bati,
    "Nombre pieces principales" as nombre_pieces_principales,
    "Nature culture" as nature_culture,
    "Nature culture speciale" as nature_culture_speciale,
    "Surface terrain" as surface_terrain,
    "annee" as annee_enregistrement,
    concat(code_departement, code_commune) as code_geo

from "pipeline_inputs/valeurs_foncieres_combined.parquet"
