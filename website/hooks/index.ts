import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  INDICATOR_VALUES,
  DEFAULT_INDICATOR,
  type IndicatorField,
} from "@/lib/types/indicator";

export function useIndicator(): [
  IndicatorField,
  (value: IndicatorField | null) => Promise<URLSearchParams>,
] {
  return useQueryState(
    "indicateur",
    parseAsStringLiteral(INDICATOR_VALUES).withDefault(DEFAULT_INDICATOR),
  );
}
