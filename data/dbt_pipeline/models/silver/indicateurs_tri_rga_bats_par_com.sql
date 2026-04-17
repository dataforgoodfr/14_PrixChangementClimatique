-- PREMIERE ETAPE : faire les calculs pour l'indicateur TRI
-- Ici il s'agit à chaque fois de diviser les nombres divers de bâtiments (pondérés au risque) de la commune
-- par le pire scenario TRI (tous les bâtiments de la commune ont un risque élevé)
WITH table_tri AS (
    SELECT
        code_geo,
        (
            nb_bats_agri_risque_faible + 3 * nb_bats_agri_risque_moyen + 5 * nb_bats_agri_risque_fort
            + nb_bats_resid_risque_faible + 3 * nb_bats_resid_risque_moyen + 5 * nb_bats_resid_risque_fort
            + nb_bats_service_risque_faible + 3 * nb_bats_service_risque_moyen + 5 * nb_bats_service_risque_fort
            + nb_bats_indus_risque_faible + 3 * nb_bats_indus_risque_moyen + 5 * nb_bats_indus_risque_fort
            + nb_bats_autres_risque_faible + 3 * nb_bats_autres_risque_moyen + 5 * nb_bats_autres_risque_fort
        ) / (nb_bats_total * 5) AS indicateur_tri
    FROM
        {{ ref('tri_bats_communes') }}
),

-- DEUXIEME ETAPE : faire les calculs pour l'indicateur RGA
-- Ici il s'agit à chaque fois de diviser les nombres de diverses maisons
-- (pondérées au risque et à sa période de construction) de la commune
-- par le pire scenario RGA (toutes les maisons de la commune ont un risque élevé et
-- ont été construites sur la période 1976-2020)
table_rga AS (
    SELECT
        code_geo,
        (
            0.5
            * (
                nb_maisons_1945_1975_risque_faible
                + nb_maisons_1945_1975_risque_moyen * 5
                + nb_maisons_1945_1975_risque_fort * 10
            )
            + (
                nb_maisons_1976_2020_risque_faible
                + nb_maisons_1976_2020_risque_moyen * 5
                + nb_maisons_1976_2020_risque_fort * 10
            )
            + 0.5
            * (
                nb_maisons_post_2020_risque_faible
                + nb_maisons_post_2020_risque_moyen * 5
                + nb_maisons_post_2020_risque_fort * 10
            )
            + 0.5
            * (
                nb_maisons_inconnu_risque_faible
                + nb_maisons_inconnu_risque_moyen * 5
                + nb_maisons_inconnu_risque_fort * 10
            )
        ) / (nb_maisons_total * 10) AS indicateur_rga
    FROM
        {{ ref('rga_bats_communes') }}
)

-- TROISIEME ETAPE : joindre les deux tables pour avoir la table finale
-- (étant donné qu'il n'y a pas les DROMs pour le RGA, la valeur d'indicateur rga sera null pour ces communes)
SELECT
    table_tri.*,
    table_rga.indicateur_rga
FROM table_tri
LEFT JOIN table_rga
    ON table_tri.code_geo = table_rga.code_geo
