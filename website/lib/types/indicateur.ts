export const INDICATEUR_VALUES = [
  "indice_vulnerabilite_niveau",
  "score_georisque",
  "indice_vulnerabilite",
  "score_economique",
  "score_assurance",
] as const;

export type IndicateurField = (typeof INDICATEUR_VALUES)[number];

export const DEFAULT_INDICATEUR: IndicateurField = "indice_vulnerabilite_niveau";
