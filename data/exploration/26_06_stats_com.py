import duckdb

con = duckdb.connect(database="dev.duckdb", read_only=True)


# 0. Nombre de communes par catégorie (1 à 5)
query0 = """
WITH communes_avec_categorie AS (
    SELECT
        code_insee,
        indice_vulnerabilite_niveau,
        CASE
            WHEN indice_vulnerabilite_niveau IS NULL THEN NULL
            WHEN indice_vulnerabilite_niveau < 1 THEN 1
            WHEN indice_vulnerabilite_niveau < 2 THEN 2
            WHEN indice_vulnerabilite_niveau < 3 THEN 3
            WHEN indice_vulnerabilite_niveau < 4 THEN 4
            ELSE 5
        END AS categorie
    FROM
        main_serving.resultats_website_par_commune
)
SELECT
    categorie,
    COUNT(*) AS nb_communes
FROM
    communes_avec_categorie
GROUP BY
    categorie
ORDER BY
    categorie;
"""
df0 = con.sql(query0).df()
print('0. Nombre de communes par catégorie (1 à 5)')
print(df0)




# 1. Nombre de communes en catégorie 3 à 5 (indice >= 2)
query1 = """
SELECT
    COUNT(*) AS nb_communes_cat_3_a_5
FROM
    main_serving.resultats_website_par_commune
WHERE
    indice_vulnerabilite_niveau >= 2;
"""
df1 = con.sql(query1).df()
print('\n1. Nombre de communes en catégorie 3 à 5 (indice >= 2)')
print(df1.values[0][0])


# 2. Top 5 des départements avec le plus de communes en catégorie 5 (indice >= 4)
query2 = """
SELECT
    code_departement,
    departement,
    COUNT(*) AS nb_communes_cat_5
FROM
    main_serving.resultats_website_par_commune
WHERE
    indice_vulnerabilite_niveau >= 4
GROUP BY
    code_departement, departement
ORDER BY
    nb_communes_cat_5 DESC
LIMIT 5;
"""
df2 = con.sql(query2).df()
print('\n2. Top 5 des départements avec le plus de communes en catégorie 5 (indice >= 4)')
print(df2)


# 3. Top 5 des départements avec le plus de communes en catégorie 3 à 5 (indice >= 2)
query3 = """
SELECT
    code_departement,
    departement,
    COUNT(*) AS nb_communes_cat_3_a_5
FROM
    main_serving.resultats_website_par_commune
WHERE
    indice_vulnerabilite_niveau >= 2
GROUP BY
    code_departement, departement
ORDER BY
    nb_communes_cat_3_a_5 DESC
LIMIT 5;
"""
df3 = con.sql(query3).df()
print('\n3. Top 5 des départements avec le plus de communes en catégorie 3 à 5 (indice >= 2)')
print(df3)


# 4. Part des communes DROM en catégorie 3 à 5 (indice >= 2)
query4 = """
WITH communes_drom AS (
    SELECT
        COUNT(*) AS total_communes_drom
    FROM
        main_serving.resultats_website_par_commune
    WHERE
        code_departement IN ('971', '972', '973', '974', '976')
),
communes_drom_cat_3_a_5 AS (
    SELECT
        COUNT(*) AS nb_communes_drom_cat_3_a_5
    FROM
        main_serving.resultats_website_par_commune
    WHERE
        code_departement IN ('971', '972', '973', '974', '976')
        AND indice_vulnerabilite_niveau >= 2
)
SELECT
    ROUND(
        (nb_communes_drom_cat_3_a_5 * 100.0 / total_communes_drom),
        2
    ) AS part_communes_drom_cat_3_a_5
FROM
    communes_drom, communes_drom_cat_3_a_5;
"""
df4 = con.sql(query4).df()
print('\n4. Part des communes DROM (971, 972, 973, 974, 976) en catégorie 3 à 5 (indice >= 2) en prenant en compte les communes sans indice calculé dans le total')
print(f"{df4.values[0][0]}%")


con.close()