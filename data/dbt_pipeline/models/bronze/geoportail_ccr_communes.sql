-- geoportail_ccr.sql
-- Use alias to respect naming convention : snake_case

SELECT
    INSEE_COM AS code_geo,
    INSEE_DEP AS code_departement,
    NOM AS nom_commune,
    
    -- Coûts Cumulés
    cla_cout_tout AS cout_cumul_tout,
    cla_cout_tout_ino AS cout_cumul_tout_ino,
    cla_cout_icb AS cout_cumul_icb,
    cla_cout_irn AS cout_cumul_irn,
    cla_cout_sub AS cout_cumul_sub,
    cla_cout_sec AS cout_cumul_sec,
    cla_cout_mvt AS cout_cumul_mvt,
    cla_cout_sei AS cout_cumul_sei,
    cla_cout_ava AS cout_cumul_ava,
    cla_cout_vcy AS cout_cumul_vcy, 
    cla_cout_aut AS cout_cumul_aut, 

    -- Coûts Moyen
    cla_cout_moy_tout AS cout_moy_tout, 
    cla_cout_moy_tout_ino AS cout_moy_tout_ino,
    cla_cout_moy_icb AS cout_moy_icb,
    cla_cout_moy_irn AS cout_moy_irn,
    cla_cout_moy_sub AS cout_moy_sub,
    cla_cout_moy_sec AS cout_moy_sec,
    cla_cout_moy_mvt AS cout_moy_mvt,
    cla_cout_moy_sei AS cout_moy_sei,
    cla_cout_moy_ava AS cout_moy_ava,
    cla_cout_moy_vcy AS cout_moy_vcy,
    cla_cout_moy_aut AS cout_moy_aut,

    -- Frequence
    cla_freq_tout AS freq_tout,
    cla_freq_tout_ino AS freq_tout_ino,
    cla_freq_icb AS freq_icb,
    cla_freq_irn AS freq_irn,
    cla_freq_sub AS freq_sub,
    cla_freq_sec AS freq_sec,
    cla_freq_mvt AS freq_mvt,
    cla_freq_sei AS freq_sei,
    cla_freq_ava AS freq_ava,
    cla_freq_vcy AS freq_vcy,
    cla_freq_aut AS freq_aut,

    -- Risques
    cla_nb_risque_part AS nb_risque_part,
    cla_nb_risque_pro AS nb_risque_pro,
    cla_nb_risque_tot AS nb_risque_tot,

    -- Primes
    cla_prime_part AS prime_part,
    cla_prime_pro AS prime_pro,
    cla_prime_tot AS prime_tot,

    -- Valeurs Assurées 
    cla_va_part AS va_part,
    cla_va_pro AS va_pro,
    cla_va_tot AS va_tot,

    -- S/P 
    cla_sp_tout AS sp_tout,
    cla_sp_tout_ino AS sp_tout_ino,
    cla_sp_icb AS sp_icb,
    cla_sp_irn AS sp_irn,
    cla_sp_sub AS sp_sub,
    cla_sp_sec AS sp_sec,
    cla_sp_mvt AS sp_mvt,
    cla_sp_sei AS sp_sei,
    cla_sp_ava AS sp_ava,
    cla_sp_vcy AS sp_vcy,
    cla_sp_aut AS sp_aut
FROM 
    'pipeline_inputs/geoportail_ccr_communes.csv'