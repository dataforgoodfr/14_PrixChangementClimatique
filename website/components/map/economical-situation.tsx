import { Commune } from "@/lib/types/communes";
import { StatCard } from "../core/stat-card";
import { SectionTitle } from "./section-title";

const formatCurrencyAmount = (
  value: number,
): { value: number; unit: string } => {
  if (value >= 1000000000) {
    return {
      value: Math.round((value / 1000000000) * 10) / 10,
      unit: "Md€",
    };
  }
  if (value >= 1000000) {
    return {
      value: Math.round(value / 1000000),
      unit: "M€",
    };
  }
  return {
    value: Math.round(value),
    unit: "€",
  };
};

export const EconomicalSituation = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
  const localTaxes = selectedCommuneData.impots_locaux
    ? formatCurrencyAmount(selectedCommuneData.impots_locaux)
    : null;

  return (
    <div className="p-4 space-y-5">
      <SectionTitle title="Situation économique" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {selectedCommuneData.ratio_dettes_depenses && (
          <StatCard
            title="TAUX D'ENDETTEMENT"
            currentValue={
              Math.round(selectedCommuneData.ratio_dettes_depenses * 10) / 10
            }
            unit="%"
          />
        )}

        {selectedCommuneData.depenses_per_pop && (
          <StatCard
            title="BUDGET PAR HABITANT"
            currentValue={Math.round(selectedCommuneData.depenses_per_pop)}
            unit="€"
          />
        )}

        {localTaxes && (
          <StatCard
            title="IMPOTS LOCAUX"
            currentValue={localTaxes.value}
            unit={localTaxes.unit}
            variationPercentage={
              selectedCommuneData.impots_locaux_evolution &&
              Math.round(selectedCommuneData.impots_locaux_evolution * 10) / 10
            }
            comparisonText="2020 vs 2024"
          />
        )}
      </div>
    </div>
  );
};
