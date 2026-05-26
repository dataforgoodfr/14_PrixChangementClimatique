import { Commune } from "@/lib/types/communes";
import { StatCard } from "@/components/core/stat-card";

export function DebtCard({ commune }: { commune: Commune }) {
  if (!commune.ratio_dettes_depenses) return <div />;
  return (
    <StatCard
      title="TAUX D'ENDETTEMENT"
      currentValue={Math.round(commune.ratio_dettes_depenses * 10) / 10}
      unit="%"
    />
  );
}
