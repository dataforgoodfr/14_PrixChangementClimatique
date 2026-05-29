import { Commune } from "@/lib/types/communes";
import { SectionTitle } from "./section-title";
import { InsuranceEvolutionChart } from "../core/insurance-evolution-chart";
import { RfFranchiseChart } from "@/components/core/rf-franchise-chart";

export const InsuranceCoverage = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
  return (
    <div className="space-y-10">
      <SectionTitle
        title="Conditions d’assurance"
        subTitle="Balance comptable des communes mise à disposition par le Ministère de l’Economie et des Finances"
      />
      <InsuranceEvolutionChart data={selectedCommuneData} />
      {selectedCommuneData.multiple_franchise_last && (
        <RfFranchiseChart value={selectedCommuneData.multiple_franchise_last} />
      )}
    </div>
  );
};
