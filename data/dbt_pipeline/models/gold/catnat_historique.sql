WITH table_catnat_preparation AS (
    SELECT
        code_geo,
        date_debut_evenement AS date_debut,
        date_fin_evenement AS date_fin,
        YEAR(date_debut_evenement) AS annee_debut,
        CASE
            WHEN
                nom_peril IN (
                    'Inondations et/ou Coulées de Boue',
                    'Inondations Remontée Nappe',
                    'Coulée de Boue',
                    'Lave Torrentielle'
                )
                THEN 'Inondation'
            WHEN
                nom_peril IN (
                    'Mouvement de Terrain',
                    'Glissement de Terrain',
                    'Effondrement et/ou Affaisement',
                    'Eboulement et/ou Chute de Blocs',
                    'Glissement et Effondrement de Terrain',
                    'Glissement et Eboulement Rocheux'
                )
                THEN 'Mouvement de Terrain'
            WHEN nom_peril IN ('Tempête', 'Grêle', 'Poids de la Neige', 'Vents Cycloniques')
                THEN 'Météo'
            WHEN nom_peril IN ('Chocs Mécaniques liés à l''action des Vagues', 'Raz de Marée')
                THEN 'Marin'
            WHEN nom_peril IN ('Secousse Sismique', 'Eruption Volcanique')
                THEN 'Sismique'
            WHEN nom_peril = 'Sécheresse' THEN 'Sécheresse'
            ELSE 'Autre'
        END AS type_catnat,
        IF(libelle_avis = 'Reconnue(sans impact sur la modulation)', 'Reconnue', libelle_avis) AS libelle_avis
    FROM
        {{ ref('ccr_details') }}
)

SELECT
    code_geo AS code_insee,
    annee_debut,
    date_debut,
    date_fin,
    type_catnat,
    IF(libelle_avis == 'Reconnue', True, False) AS is_reconnue
FROM table_catnat_preparation
