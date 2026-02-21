WITH dette AS (
    SELECT * FROM {{ ref('01_en_cours_de_dette') }}
),

epargne AS (
    SELECT * FROM {{ ref('02_epargne_brute') }}
)

SELECT
    d."Exercice",
    d."Code Insee 2024 Région",
    d."Nom 2024 Région",
    d."Code Insee 2024 Département",
    d."Nom 2024 Département",
    d."Code Siren 2024 EPCI",
    d."Nom 2024 EPCI",
    d."Code Insee 2024 Commune",
    d."Nom 2024 Commune",
    d."Code Siren Collectivité",
    d."Code Insee Collectivité",
    d."Siret Budget",
    d."Libellé Budget",
    d."Population totale",
    d."Montant en € par habitant"                AS dette_par_habitant,
    e."Montant en € par habitant"                AS epargne_brute_par_habitant,
    CASE
        WHEN e."Montant en € par habitant" IS NULL
          OR e."Montant en € par habitant" = 0   THEN NULL
        ELSE d."Montant en € par habitant" / e."Montant en € par habitant"
    END                                          AS delai_desendettement
FROM dette  d
JOIN epargne e
    ON  d."Exercice"      = e."Exercice"
    AND d."Siret Budget"  = e."Siret Budget"
