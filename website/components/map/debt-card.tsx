import { Commune } from "@/lib/types/communes";
import { StatCard } from "@/components/core/stat-card";

export function DebtCard({ commune }: { commune: Commune }) {
  if (!commune.taux_endettement) return <div />;
  return (
    <StatCard
      title="TAUX D'ENDETTEMENT"
      currentValue={commune.taux_endettement}
      unit="%"
    />
  );
}
