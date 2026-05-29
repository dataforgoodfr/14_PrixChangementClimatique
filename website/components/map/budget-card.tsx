import { Commune } from "@/lib/types/communes";
import { StatCard } from "@/components/core/stat-card";
import * as React from "react";

export function BudgetCard({ commune }: { commune: Commune }) {
  if (!commune.depenses_per_pop) return <div />;
  return (
    <StatCard
      title="BUDGET PAR HABITANT"
      currentValue={Math.round(commune.depenses_per_pop)}
      unit="€"
      tooltip="Le budget par habitant est calculé à partir du budget de fonctionnement annuel des communes, divisé par le nombre d'habitants"
    />
  );
}
