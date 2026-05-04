import { FilterRangeKey } from "@/lib/types/filters/filters-actions";
import { ChartRangeFilter } from "../chart-range-filter";
import { VulnerabiliteRangeFilter } from "../vulnerability-filter";

export function VulnerabiliteFilters() {
  return (
    <div className="py-2 text-sm text-gray-400">
      <VulnerabiliteRangeFilter />
      <ChartRangeFilter
        title={"Nombre d'habitants"}
        filterKey={FilterRangeKey.POPULATION}
      />
      {/* TODO: clarify how to filter by the council’s budget? depenses_per_pop / impots_locaux / ratio_dettes_depenses / part_prime_budget ? */}
      <ChartRangeFilter
        title={"Budget de la commune"}
        filterKey={FilterRangeKey.DEPENSES_PER_POP}
      />
    </div>
  );
}
