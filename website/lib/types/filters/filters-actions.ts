import { RangeFilter, ToggleFilter } from "./filters";

export enum FilterActionType {
  SET_RANGE = "SET_RANGE",
  CLEAR_RANGE = "CLEAR_RANGE",
  SET_TOGGLE = "SET_TOGGLE",
  CLEAR_TOGGLE = "CLEAR_TOGGLE",
  RESET = "RESET",
}

export enum FilterRangeKey {
  INDICE_VULNERABILITE_NIVEAU = "indice_vulnerabilite_niveau",
  POPULATION = "population",
  DEPENSES_PER_POP = "depenses_per_pop",
  INDICATEUR_RGA = "indicateur_rga",
  INDICATEUR_TRI = "indicateur_tri",
  NB_TOTAL_ARRETES_RECON = "nb_total_arretes_recon",
  TAUX_ENDETTEMENT = "taux_endettement",
  IMPOTS_LOCAUX_2024 = "impots_locaux_2024",
  IMPOTS_LOCAUX_EVOLUTION = "impots_locaux_evolution",
  PRIME_ASSURANCE_2024 = "prime_assurance_2024",
  EVOLUTION_PRIME_ASSURANCE = "evolution_prime_assurance",
  PART_PRIME_BUDGET_2024 = "part_prime_budget_2024",
}

export enum FilterToggleKey {
  PPRN_RGA = "pprn_rga",
  PPRN_INO = "pprn_ino",
}

export type FiltersAction =
  | {
      type: FilterActionType.SET_RANGE;
      key: FilterRangeKey;
      payload: RangeFilter;
    }
  | { type: FilterActionType.CLEAR_RANGE; key: FilterRangeKey }
  | {
      type: FilterActionType.SET_TOGGLE;
      key: FilterToggleKey;
      payload: ToggleFilter;
    }
  | { type: FilterActionType.CLEAR_TOGGLE; key: FilterToggleKey }
  | { type: FilterActionType.RESET };
