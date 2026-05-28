import { Commune } from "@/lib/types/communes";
import { StatCard } from "@/components/core/stat-card";

export function DebtCard({ commune }: { commune: Commune }) {
  if (!commune.ratio_dettes_depenses) return <div />;
  return (
    <StatCard
      title="TAUX D'ENDETTEMENT"
      currentValue={Math.round(commune.ratio_dettes_depenses * 100 * -1)}
      unit="%"
      tooltip="Le taux d'endettement permet d'évaluer la dette d'une commune en fonction de son budget de fonctionnement annuel"
    />
  );
}
