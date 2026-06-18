// ExpositionCheckboxes supprimé — c'est de l'UI, pas des filtres

export type RangeFilter = {
  min: number;
  max: number;
};

export type ToggleFilter = true | false;

export interface CommuneFilters {
  // --- Vulnérabilité ---
  indice_vulnerabilite_niveau?: RangeFilter;
  population?: RangeFilter;
  depenses_per_pop?: RangeFilter;

  // --- Exposition ---
  indicateur_rga?: RangeFilter;
  indicateur_tri?: RangeFilter;
  nb_total_arretes_recon?: RangeFilter;

  // --- Prévention ---
  pprn_rga?: ToggleFilter;
  pprn_ino?: ToggleFilter;

  // --- Situation économique ---
  taux_endettement?: RangeFilter;
  impots_locaux_2024?: RangeFilter;
  impots_locaux_evolution?: RangeFilter;

  // --- Assurance ---
  prime_assurance_2024?: RangeFilter;
  taux_evolution_prime_assurance?: RangeFilter;
  part_prime_budget_2024?: RangeFilter;
}

//TODO: à définir
export const DEFAULT_FILTERS: CommuneFilters = {};

export const FILTER_BOUNDS = {
  indice_vulnerabilite_niveau: { min: 0, max: 5 },
  population: { min: 0, max: 30_000 },
  depenses_per_pop: { min: 0, max: 5_000 },
  indicateur_rga: { min: 0, max: 1 },
  indicateur_tri: { min: 0, max: 1 },
  nb_total_arretes_recon: { min: 0, max: 65 },
  taux_endettement: { min: 0, max: 500 },
  impots_locaux_2024: { min: 0, max: 25_000_000 },
  impots_locaux_evolution: { min: -1, max: 3 },
  prime_assurance_2024: { min: 0, max: 200_000 },
  taux_evolution_prime_assurance: { min: -100, max: 500 },
  part_prime_budget_2024: { min: 0, max: 0.1 },
} as const satisfies Record<string, RangeFilter>;
