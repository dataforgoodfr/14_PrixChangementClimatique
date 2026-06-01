-- indice_par_commune.sql
-- Score final :
--   score_final_raw = sqrt(0.1·eco² + 0.4·assurance² + 0.5·exposition²)
--   indice_vulnerabilite = score_final_raw / max(score_final_raw)   [Marimo : clip_minmax(q=0,1) = /max car min≈0]
--   indice sur 5 = floor(indice * 5).clip(0,4) + 1   [1-indexé]

WITH combined AS (
    SELECT
        c.code_geo,
        c.nom_commune,
        c.code_departement,
        c.code_region,

        ex.score_secheresse,
        ex.score_inondation,
        ex.score_secheresse_net,

        ex.score_inondation_net,
        ex.score_autres,
        a.indice_prime,
        a.prime_budget_indice,
        a.part_arretes_non_reco,
        a.franchise_indice,
        e.debt_indice,
        e.depenses_per_pop_indice,
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
        ) AS score_final_raw
    FROM combined
),

-- ── MinMaxScaler final (Marimo : clip_minmax(q_low=0, q_high=1) = min-max standard) ──
minmax_final AS (
    SELECT
        min(score_final_raw) AS min_val,
        max(score_final_raw) AS max_val
    FROM scores_bruts
),

normalized AS (
    SELECT
        s.*,
        CASE
            WHEN p.max_val = p.min_val THEN 0
            ELSE (s.score_final_raw - p.min_val) / (p.max_val - p.min_val)
        END AS indice_vulnerabilite
    FROM scores_bruts AS s
    CROSS JOIN minmax_final AS p
)

SELECT
    code_geo,
    nom_commune,
    code_departement,
    code_region,

    score_exposition,
    score_assurance,
    score_economique,
    score_secheresse,
    score_inondation,
    score_secheresse_net,
    score_inondation_net,
    score_autres,
    indice_prime,
    prime_budget_indice,
    part_arretes_non_reco,
    franchise_indice,
    debt_indice,
    depenses_per_pop_indice,

    round(indice_vulnerabilite::numeric, 4) AS indice_vulnerabilite,
    -- 1-indexé [1-5]
    least(5, greatest(
        1,
        floor(indice_vulnerabilite * 5)::int + 1
    )) AS indice_vulnerabilite_niveau,

    CASE least(5, greatest(1, floor(indice_vulnerabilite * 5)::int + 1))
        WHEN 1 THEN 'Très faible'
        WHEN 2 THEN 'Faible'
        WHEN 3 THEN 'Modéré'
        WHEN 4 THEN 'Élevé'
        WHEN 5 THEN 'Très élevé'
    END AS indice_vulnerabilite_label

FROM normalized
