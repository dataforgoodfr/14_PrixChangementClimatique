import { Commune } from "@/lib/types/communes";
import { StatCard } from "@/components/core/stat-card";
import * as React from "react";

const formatCurrencyAmount = (
  value: number,
): { value: number; unit: string } => {
  if (value >= 1000000000) {
    return {
      value: Math.round((value / 1000000000) * 10) / 10,
      unit: "Md€",
    };
  }
  if (value >= 1000000) {
    return {
      value: Math.round(value / 1000000),
      unit: "M€",
    };
  }
  return {
    value: Math.round(value),
    unit: "€",
  };
};

export function TaxesCard({ commune }: { commune: Commune }) {
  const localTaxes = commune.impots_locaux
    ? formatCurrencyAmount(commune.impots_locaux)
    : null;
  if (!localTaxes) return <div />;
  return (
    <StatCard
      title="IMPOTS LOCAUX"
      currentValue={localTaxes.value}
      unit={localTaxes.unit}
      variationPercentage={
        commune.impots_locaux_evolution &&
        Math.round(commune.impots_locaux_evolution * 10) / 10
      }
      comparisonText="2020 vs 2024"
    />
  );
}
