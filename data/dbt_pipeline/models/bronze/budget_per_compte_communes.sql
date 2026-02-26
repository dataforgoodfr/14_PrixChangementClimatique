WITH transformed AS (SELECT
    -- Transformation du code département (transformer les Outre-mer de type 10X en 97)
    CASE
        WHEN LENGTH(NDEPT) = 3
             AND SUBSTR(NDEPT, 1, 2) = '10'
        THEN '97'
        ELSE LPAD(NDEPT, 2, '0')
        END AS code_departement,

    -- Transformation du code INSEE (Pour les Outre-mer de type 97X mettre le premier chiffre comme premier chiffre du code INSEE)
    CASE
        WHEN SUBSTR(NDEPT, 1, 2) = '97'
        THEN SUBSTR(NDEPT, -1, 1) || LPAD(INSEE, 2, '0')
        ELSE LPAD(INSEE, 3, '0')
    END AS code_insee,
    IDENT AS siret,
    SUBSTR(IDENT, 1, 9) AS siren,
    EXER AS annee,
    CREGI AS code_region,
    type_compte AS type_compte,
    SD AS solde_debiteur,
    SC AS solde_crediteur
FROM read_csv(
    'pipeline_inputs/budget_per_compte_communes_clean.csv',
    types = {'NDEPT': 'VARCHAR', 'INSEE': 'VARCHAR', 'IDENT': 'VARCHAR'}
))

SELECT
    t.code_departement,
    t.code_insee,
    t.siret,
    t.siren,
    t.annee,
    t.code_region,
    t.type_compte,
    t.code_departement || t.code_insee AS code_geo,
    s.insee AS code_geo_from_siren ,
    s.nom_com,
    SUM(t.solde_debiteur) AS solde_debiteur,
    SUM(t.solde_crediteur) AS solde_crediteur,
    SUM(t.solde_debiteur - t.solde_crediteur) AS solde
FROM transformed t
LEFT JOIN read_csv('pipeline_inputs/table_siren_insee.csv', types = {'siren':'VARCHAR'}) AS s
    ON t.siren = s.siren
GROUP BY
    t.code_departement,
    t.code_insee,
    t.siret,
    t.siren,
    t.annee,
    t.code_region,
    t.type_compte,
    s.insee,
    s.nom_com
