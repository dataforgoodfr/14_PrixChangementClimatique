import { Commune } from "@/lib/types/communes";
import { SectionTitle } from "./section-title";
import { DebtCard } from "@/components/map/debt-card";
import { BudgetCard } from "@/components/map/budget-card";
import { TaxesCard } from "@/components/map/taxes-card";

export const EconomicalSituation = ({
  selectedCommuneData,
}: {
  selectedCommuneData: Commune;
}) => {
  return (
    <div className="space-y-5">
      <SectionTitle title="Situation économique" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DebtCard commune={selectedCommuneData} />
        <BudgetCard commune={selectedCommuneData} />
        <TaxesCard commune={selectedCommuneData} />
      </div>
    </div>
  );
};
