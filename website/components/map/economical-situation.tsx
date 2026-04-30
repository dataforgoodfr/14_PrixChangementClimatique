import { Commune } from "@/lib/types/communes";
import { useMemo } from "react";
import { StatCard } from "../core/stat-card";
import { SectionTitle } from "./section-title";

export const EconomicalSituation = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
  const statCards = useMemo(() => {
    const stat = [];
    if (selectedCommuneData.ratio_dettes_depenses) {
      stat.push({
        title: "TAUX D'ENDETTEMENT",
        currentValue:
          Math.round(selectedCommuneData.ratio_dettes_depenses * 10) / 10,
        unit: "%",
      });
    }
    if (selectedCommuneData.depenses_per_pop) {
      stat.push({
        title: "BUDGET PAR HABITANT",
        currentValue: Math.round(selectedCommuneData.depenses_per_pop),
        unit: "€",
      });
    }
    if (selectedCommuneData.part_impots_locaux) {
      stat.push({
        title: "IMPOTS LOCAUX / BUDGET",
        currentValue: Math.round(selectedCommuneData.part_impots_locaux * 100) / 100,
        unit: "%",
        variation:
          selectedCommuneData.impots_locaux_evolution &&
          Math.round(selectedCommuneData.impots_locaux_evolution * 10) / 10,
        comparisonText: "2020 vs 2024",
      });
    }
    return stat;
  }, [selectedCommuneData]);

  return (
    <div className="p-4 space-y-5">
      <SectionTitle title="Situation économique" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.length > 0 ? (
          statCards.map((statcard) => (
            <StatCard
              key={statcard.title}
              title={statcard.title}
              currentValue={statcard.currentValue}
              unit={statcard.unit}
              variationPercentage={statcard.variation}
              comparisonText={statcard.comparisonText}
            />
          ))
        ) : (
          <p>Chargement ...</p>
        )}
      </div>
    </div>
  );
};
