import { Commune } from "@/lib/types/communes";
import { SectionTitle } from "./section-title";
import { InsuranceEvolutionChart } from "../core/insurance-evolution-chart";

export const InsuranceCoverage = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
  return (
    <div className="p-4 space-y-10">
      <SectionTitle
        title="Couverture d'assurances"
        subTitle="Base de données GASPAR"
      />
      <InsuranceEvolutionChart data={selectedCommuneData} />
    </div>
  );
};
