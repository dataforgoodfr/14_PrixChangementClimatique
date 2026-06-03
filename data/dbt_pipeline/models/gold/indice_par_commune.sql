/*
indice_par_commune.sql

Calcule l'indice de vulnérabilité par commune, par un score sur [0, 1],
puis le projette sur une échelle [0, 5] avec une décimale (indice_vulnerabilite_niveau).

───────────────────────────────────────────────────────────────────────────────
Dimensions et pondérations

score_exposition (poids 0,5)
    Exposition aux aléas climatiques :
    sécheresse, inondation, autres aléas, après réduction PPRN
    → voir score_exposition.sql

score_assurance (poids 0,4)
    Conditions assurantielles dégradées :
    évolution des primes, part dans le budget, arrêtés non reconnus, franchise
    → voir score_assurance.sql

score_economique (poids 0,1)
    Capacité financière de la commune :
    endettement et niveau de dépenses par habitant
    → voir score_economique.sql

───────────────────────────────────────────────────────────────────────────────
Agrégation

indice_vulnerabilite_brut =
    sqrt(
        0.5 * exposition² +
        0.4 * assurance² +
        0.1 * economique²
    )

L’agrégation quadratique (norme L2 pondérée) accentue les situations où
plusieurs vulnérabilités coexistent, par rapport à une moyenne simple.

───────────────────────────────────────────────────────────────────────────────
Normalisation finale

indice_vulnerabilite =
    (indice_vulnerabilite_brut - min) / (max - min)
    → normalisation min-max sur l’ensemble des communes
    → résultat dans [0, 1]

indice_vulnerabilite_niveau =
    round(indice_vulnerabilite * 5, 1)
    → projection sur une échelle lisible [0, 5]

───────────────────────────────────────────────────────────────────────────────

Sources :
    - Bronze :
        - opendatasoft_communes
    - Gold :
        - score_exposition
        - score_assurance
        - score_economique

Granularité :
    - une ligne par commune (code_geo)

*/


WITH combined AS (
    SELECT
        c.code_geo,
        c.nom_commune,
        c.code_departement,
        c.code_region,

        ex.score_secheresse,
        ex.score_inondation,
        ex.score_autres_risques_nat,
        ex.score_exposition,
        a.score_assurance,
        e.score_economique

    FROM {{ ref('opendatasoft_communes') }} AS c
    LEFT JOIN {{ ref('score_exposition') }} AS ex ON c.code_geo = ex.code_geo
    LEFT JOIN {{ ref('score_assurance') }} AS a ON c.code_geo = a.code_geo
    LEFT JOIN {{ ref('score_economique') }} AS e ON c.code_geo = e.code_geo
),

scores_bruts AS (
    SELECT
        *,
        sqrt(
            0.1 * power(score_economique, 2)
            + 0.4 * power(score_assurance, 2)
            + 0.5 * power(score_exposition, 2)
        ) AS indice_vulnerabilite_brut
    FROM combined
),

-- ── Normalisation min-max ─────────────────────────────────────────────────────
minmax_final AS (
    SELECT
        min(indice_vulnerabilite_brut) AS min_val,
        max(indice_vulnerabilite_brut) AS max_val
    FROM scores_bruts
),

normalized AS (
    SELECT
        s.*,
        CASE
            WHEN p.max_val = p.min_val THEN 0
            ELSE (s.indice_vulnerabilite_brut - p.min_val) / (p.max_val - p.min_val)
        END AS _indice_vulnerabilite
    FROM scores_bruts AS s
    CROSS JOIN minmax_final AS p
)

SELECT
    normalized.code_geo,

    round(score_economique, 2) AS score_economique,
    round(score_exposition, 2) AS score_exposition,
    round(score_assurance, 2) AS score_assurance,
    round(score_secheresse, 2) AS score_secheresse,
    round(score_inondation, 2) AS score_inondation,
    round(score_autres_risques_nat, 2) AS score_autres_risques_nat,

    round(_indice_vulnerabilite::numeric, 2) AS indice_vulnerabilite,

    -- 1-indexé [1-5]
    round((_indice_vulnerabilite * 5)::numeric, 1) AS indice_vulnerabilite_niveau

FROM normalized
