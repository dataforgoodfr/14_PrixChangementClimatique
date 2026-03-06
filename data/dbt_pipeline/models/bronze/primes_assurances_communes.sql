WITH transformed AS (
    SELECT
        -- Transformation du code département
        "IDENT" AS siret,

        -- Transformation du code INSEE
        "EXER" AS annee,
        "CREGI" AS code_region,
        "COMPTE" AS compte,
        "SD" AS solde_debiteur,
        "SC" AS solde_crediteur,
        CASE
            WHEN
                LENGTH("NDEPT") = 3
                AND SUBSTR("NDEPT", 1, 2) = '10'
                THEN '97'
            ELSE LPAD("NDEPT", 2, '0')
        END AS code_departement,
        CASE
            WHEN SUBSTR("NDEPT", 1, 2) = '97'
                THEN SUBSTR("NDEPT", -1, 1) || LPAD("INSEE", 2, '0')
            ELSE LPAD("INSEE", 3, '0')
        END AS code_insee,
        SUBSTR("IDENT", 1, 9) AS siren
    FROM
        READ_CSV(
            'pipeline_inputs/primes_assurances_communes_clean.csv',
            types
            = { 'NDEPT': 'VARCHAR', 'INSEE': 'VARCHAR', 'IDENT': 'VARCHAR' }
        )
)

SELECT
    t.code_departement,
    t.code_insee,
    t.siret,
    t.siren,
    t.annee,
    t.code_region,
    t.compte,
    s.insee AS code_geo_from_siren,
    s.nom_com,
    t.solde_debiteur,
    t.solde_crediteur,
    t.code_departement || t.code_insee AS code_geo,
    t.solde_debiteur - t.solde_crediteur AS solde
FROM transformed AS t
LEFT JOIN
    READ_CSV(
        'pipeline_inputs/table_siren_insee.csv', types = { 'siren': 'VARCHAR' }
    ) AS s
    ON t.siren = s.siren
