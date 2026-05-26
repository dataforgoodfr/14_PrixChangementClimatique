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
    />
  );
}
