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
  ratio_dettes_depenses?: RangeFilter;
  impots_locaux?: RangeFilter;
  impots_locaux_evolution?: RangeFilter;

  // --- Assurance ---
  prime_assurance_2024?: RangeFilter;
  evolution_prime_assurance?: RangeFilter;
  part_prime_budget?: RangeFilter;
}

//TODO: à définir
export const DEFAULT_FILTERS: CommuneFilters = {};

export const FILTER_BOUNDS = {
  indice_vulnerabilite_niveau: { min: 1, max: 5 },
  population: { min: 0, max: 10_000 },
  depenses_per_pop: { min: 0, max: 10_000 },
  indicateur_rga: { min: 0, max: 100 },
  indicateur_tri: { min: 0, max: 100 },
  nb_total_arretes_recon: { min: 0, max: 50 },
  ratio_dettes_depenses: { min: 0, max: 20 },
  impots_locaux: { min: 0, max: 5_000_000 },
  impots_locaux_evolution: { min: -1, max: 5 },
  prime_assurance_2024: { min: 0, max: 500_000 },
  evolution_prime_assurance: { min: -1, max: 10 },
  part_prime_budget: { min: 0, max: 1 },
} as const satisfies Record<string, RangeFilter>;
