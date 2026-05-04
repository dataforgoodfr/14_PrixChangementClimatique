-- indice_par_commune.sql
-- Gold layer: Table des scores et indices par commune
-- Source: Bronze layer opendatasoft_communes + scores


WITH combined AS (
    SELECT
        c.code_geo,

        -- Scores intermédiaires
        cl.score_exposition,
        a.score_assurance,
        e.score_economique,

        -- Score final pondéré
        {{ var('poids_score_eco',        0.2) }} * e.score_economique
        + {{ var('poids_score_assurance',  0.4) }} * a.score_assurance
        + (1 - {{ var('poids_score_eco', 0.2) }} - {{ var('poids_score_assurance', 0.4) }})
        * cl.score_exposition
            AS indice_vulnerabilite

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('score_exposition') }} AS cl ON c.code_geo = cl.code_geo
    LEFT JOIN {{ ref('score_assurance') }} AS a ON c.code_geo = a.code_geo
    LEFT JOIN {{ ref('score_economique') }} AS e ON c.code_geo = e.code_geo
),

discretized AS (
    SELECT
        *,

        -- Score discret 1-5 par découpage des seuils (bins Python : 0, 0.2, 0.3, 0.4, 0.5, 1)
        CASE
            WHEN indice_vulnerabilite <= 0.2 THEN 1
            WHEN indice_vulnerabilite <= 0.3 THEN 2
            WHEN indice_vulnerabilite <= 0.4 THEN 3
            WHEN indice_vulnerabilite <= 0.5 THEN 4
            ELSE 5
        END AS indice_vulnerabilite_niveau,

        -- Niveaux bas/moyen/haut pour la méthode combinatoire alternative
        CASE WHEN score_economique < 0.3 THEN 'bas' WHEN score_economique < 0.5 THEN 'moyen' ELSE 'haut' END
            AS niveau_eco,
        CASE WHEN score_assurance < 0.3 THEN 'bas' WHEN score_assurance < 0.5 THEN 'moyen' ELSE 'haut' END
            AS niveau_assurance,
        CASE WHEN score_exposition < 0.3 THEN 'bas' WHEN score_exposition < 0.5 THEN 'moyen' ELSE 'haut' END
            AS niveau_exposition

    FROM combined
),

-- Méthode combinatoire (matrice Python) — score discret alternatif
final AS (
    SELECT
        *,
        CASE
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'bas' AND niveau_exposition = 'bas') THEN 1
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'bas' AND niveau_exposition = 'bas') THEN 1
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'moyen' AND niveau_exposition = 'bas') THEN 1
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'bas' AND niveau_exposition = 'moyen') THEN 1
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'bas' AND niveau_exposition = 'bas') THEN 2
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'haut' AND niveau_exposition = 'bas') THEN 2
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'bas' AND niveau_exposition = 'haut') THEN 2
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'moyen' AND niveau_exposition = 'bas') THEN 2
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'bas' AND niveau_exposition = 'moyen') THEN 2
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'moyen' AND niveau_exposition = 'moyen') THEN 2
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'moyen' AND niveau_exposition = 'moyen') THEN 3
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'moyen' AND niveau_exposition = 'bas') THEN 3
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'bas' AND niveau_exposition = 'moyen') THEN 3
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'haut' AND niveau_exposition = 'moyen') THEN 3
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'haut' AND niveau_exposition = 'bas') THEN 3
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'moyen' AND niveau_exposition = 'haut') THEN 3
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'bas' AND niveau_exposition = 'haut') THEN 3
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'haut' AND niveau_exposition = 'bas') THEN 4
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'bas' AND niveau_exposition = 'haut') THEN 4
            WHEN (niveau_eco = 'bas' AND niveau_assurance = 'haut' AND niveau_exposition = 'haut') THEN 4
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'moyen' AND niveau_exposition = 'moyen') THEN 4
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'haut' AND niveau_exposition = 'moyen') THEN 4
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'moyen' AND niveau_exposition = 'haut') THEN 4
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'haut' AND niveau_exposition = 'moyen') THEN 5
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'moyen' AND niveau_exposition = 'haut') THEN 5
            WHEN (niveau_eco = 'moyen' AND niveau_assurance = 'haut' AND niveau_exposition = 'haut') THEN 5
            WHEN (niveau_eco = 'haut' AND niveau_assurance = 'haut' AND niveau_exposition = 'haut') THEN 5
        END AS indice_vulnerabilite_niveau_combinatoire

    FROM discretized
)

SELECT * FROM final
