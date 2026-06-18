// ─── Types ────────────────────────────────────────────────────────────────────

export interface Commune {
  code_insee: string;
  nom_commune?: string;
  departement?: string;
  region?: string;
  code_departement?: string;
  code_region?: string;
  geo_point_2_d?: string;

  // Indices
  score_economique?: number;
  score_exposition?: number;
  score_assurance?: number;
  score_inondation?: number;
  score_secheresse?: number;
  indice_vulnerabilite_niveau?: number;

  // TRI / RGA
  indicateur_tri?: number;
  indicateur_rga?: number;

  // Scénario 2050
  swi_04_d_abs?: number;
  rr_50_d_abs?: number;
  pxcwd_abs?: number;
  tx_35_d_abs?: number;

  // Budget
  taux_endettement?: number;
  depenses_per_pop: number;
  part_impots_locaux?: number;
  impots_locaux_evolution?: number;
  impots_locaux_2024?: number;

  // CCR
  nb_total_arretes_recon?: number;
  nb_total_arretes?: number;
  nb_total_arretes_ino?: number;
  nb_total_arretes_sec?: number;
  multiple_franchise_last?: number;

  // Primes assurance
  prime_assurance_2024?: number;
  prime_assurance_2023?: number;
  prime_assurance_2022?: number;
  prime_assurance_2021?: number;
  prime_assurance_2020?: number;
  rank_part_prime_budget?: number;
  rank_evolution_prime?: number;
  rank_part_arretes_non_reconnus?: number;
  rank_ratio_dettes_depenses?: number;
  rank_depenses_per_pop?: number;

  // PPRN
  pprn_rga?: boolean;
  pprn_ino?: boolean;
  date_approbation_rga?: string;
  date_approbation_ino?: string;

  // Population & ratios
  population?: number;
  part_prime_budget_2024?: number;
  part_prime_budget_2023?: number;
  part_prime_budget_2022?: number;
  part_prime_budget_2021?: number;
  part_prime_budget_2020?: number;
  taux_evolution_prime_assurance?: number;
}
