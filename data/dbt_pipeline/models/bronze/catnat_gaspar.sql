SELECT
    cod_nat_catnat,
    cod_commune,
    lib_commune,
    num_risque_jo,
    lib_risque_jo,
    dat_deb,
    dat_fin,
    dat_pub_arrete,
    dat_pub_jo,
    dat_maj
FROM 'pipeline_inputs/catnat_gaspar.csv'
