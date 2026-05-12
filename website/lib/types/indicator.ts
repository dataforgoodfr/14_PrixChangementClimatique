export const INDICATOR_VALUES = [
  "indice_vulnerabilite_niveau",
  "score_exposition",
  "prevention",
  "score_economique",
  "score_assurance",
] as const;

export type IndicatorField = (typeof INDICATOR_VALUES)[number];

export const DEFAULT_INDICATOR: IndicatorField = "indice_vulnerabilite_niveau";
