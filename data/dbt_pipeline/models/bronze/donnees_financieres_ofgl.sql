SELECT
    annee_join AS annee,
    com_code AS code_geo,
    com_name AS nom_commune,
    agregat,
    montant,
    ptot AS population_totale,
    euros_par_habitant
FROM read_csv_auto('pipeline_inputs/donnees_financieres_ofgl.csv', delim=',')
