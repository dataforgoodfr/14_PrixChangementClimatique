SELECT
    cod_nat_azi,
    lib_azi,
    lib_bassin_risque,
    list_risques,
    cod_commune,
    lib_commune,
    dat_program_deb,
    dat_program_fin,
    dat_etu_deb,
    dat_etu_fin,
    dat_info_deb,
    dat_info_fin,
    dat_realisation,
    dat_diffusion,
    dat_pub_net AS dat_maj
FROM 'pipeline_inputs/azi_gaspar.csv'
