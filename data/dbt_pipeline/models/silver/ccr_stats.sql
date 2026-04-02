-- PREMIERE ETAPE : il s'agit de transformer les catégories de certaines colonnes (nom_peril, franchise,
--  correction sur libelle_avis) et récupérer uniquement l'annee pour la date de l'évènement (date_debut_evenement)

WITH mapping_columns_crr_details AS (
    SELECT
        code_geo,
        IF(libelle_avis = 'Reconnue(sans impact sur la modulation)', 'Reconnue', libelle_avis) AS libelle_avis,
        YEAR(date_debut_evenement) AS annee,
        CASE
            WHEN
                nom_peril IN (
                    'Inondations et/ou Coulées de Boue',
                    'Inondations Remontée Nappe',
                    'Coulée de Boue',
                    'Lave Torrentielle'
                )
                THEN 'inondation'
            WHEN
                nom_peril IN (
                    'Mouvement de Terrain',
                    'Glissement de Terrain',
                    'Effondrement et/ou Affaisement',
                    'Eboulement et/ou Chute de Blocs',
                    'Glissement et Effondrement de Terrain',
                    'Glissement et Eboulement Rocheux'
                )
                THEN 'mouvement_terrain'
            WHEN nom_peril IN ('Tempête', 'Grêle', 'Poids de la Neige', 'Vents Cycloniques')
                THEN 'meteo'
            WHEN nom_peril IN ('Chocs Mécaniques liés à l''action des Vagues', 'Raz de Marée')
                THEN 'marin'
            WHEN nom_peril IN ('Secousse Sismique', 'Eruption Volcanique')
                THEN 'sismique'
            WHEN nom_peril = 'Sécheresse' THEN 'secheresse_rga'
            ELSE 'autre'
        END AS nom_peril,
        IF(franchise = '-', 'Simple', franchise) AS franchise
    FROM
        {{ ref('ccr_details') }}
),

-- DEUXIEME ETAPE : il s'agit de créer/ajouter des colonnes 'numérisées' à partir de la table précédente
-- pour permettre les opérations de calculs de l'étape suivante

add_columns_ccr_details AS (
    SELECT
        annee,
        code_geo,
        CASE
            WHEN franchise = 'Simple' THEN 1
            WHEN franchise = 'Doublée' THEN 2
            WHEN franchise = 'Triplée' THEN 3
            WHEN franchise = 'Quadruplée' THEN 4
        END AS multiple_franchise,
        IF(libelle_avis == 'Reconnue', 1, 0) AS is_recon,
        IF(libelle_avis == 'Non reconnue', 1, 0) AS is_refus,
        IF(nom_peril == 'inondation', 1, 0) AS is_ino,
        IF(nom_peril == 'secheresse_rga', 1, 0) AS is_sec,
        IF(nom_peril == 'mouvement_terrain', 1, 0) AS is_mvt,
        IF(nom_peril == 'meteo', 1, 0) AS is_meteo,
        IF(nom_peril == 'marin', 1, 0) AS is_marin,
        IF(nom_peril == 'sismique', 1, 0) AS is_sism,
        IF(nom_peril == 'autre', 1, 0) AS is_autre
    FROM mapping_columns_crr_details
)

-- TROISIEME ETAPE : l'aggrégation finale par code_geo et annee

SELECT
    annee,
    code_geo,
    COUNT(*) AS nb_arrete,
    SUM(is_recon) AS nb_arrete_recon,
    SUM(is_refus) AS nb_arrete_refus,
    SUM(is_ino) AS nb_arrete_ino,
    SUM(is_sec) AS nb_arrete_sec,
    SUM(is_mvt) AS nb_arrete_mvt,
    SUM(is_meteo) AS nb_arrete_meteo,
    SUM(is_marin) AS nb_arrete_marin,
    SUM(is_sism) AS nb_arrete_sism,
    SUM(is_autre) AS nb_arrete_autre,
    AVG(multiple_franchise) AS avg_multiple_franchise
FROM add_columns_ccr_details
GROUP BY annee, code_geo
