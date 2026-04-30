import { Commune } from "@/lib/types/communes";
import { StatCard } from "../core/stat-card";
import { SectionTitle } from "./section-title";

export const EconomicalSituation = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
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

        {selectedCommuneData.part_impots_locaux && (
          <StatCard
            title="IMPOTS LOCAUX / BUDGET"
            currentValue={
              Math.round(selectedCommuneData.part_impots_locaux * 100) / 100
            }
            unit="%"
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
