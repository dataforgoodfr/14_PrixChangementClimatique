SELECT
    code_geo,
    (
      nb_bats_agri_risque_faible + 3 * nb_bats_agri_risque_moyen + 5 * nb_bats_agri_risque_fort
      + nb_bats_resid_risque_faible + 3 * nb_bats_resid_risque_moyen + 5 * nb_bats_resid_risque_fort
      + nb_bats_service_risque_faible + 3 * nb_bats_service_risque_moyen + 5 * nb_bats_service_risque_fort
      + nb_bats_indus_risque_faible + 3 * nb_bats_indus_risque_moyen + 5 * nb_bats_indus_risque_fort
      + nb_bats_autres_risque_faible + 3 * nb_bats_autres_risque_moyen + 5 * nb_bats_autres_risque_fort
    ) / (nb_bats_total * 5) AS indicateur_tri
    
FROM {{ ref('tri_bats_communes') }}