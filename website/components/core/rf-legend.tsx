"use client";

import { useMapContext, type KpiField } from "@/contexts/map-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiMeta {
  title: string;
  labelMin: string;
  labelMax: string;
  gradient: string;
  discrete?: { color: string }[];
}

const KPI_META: Record<KpiField, KpiMeta> = {
  indice_vulnerabilite_niveau: {
    title: "Niveau de vulnérabilité",
    labelMin: "Peu vulnérable",
    labelMax: "Très vulnérable",
    gradient: "",
    discrete: [
      { color: "#518F83" },
      { color: "#B2A052" },
      { color: "#FFB74B" },
      { color: "#EA580D" },
      { color: "#B91C1C" },
    ],
  },
  score_georisque: {
    title: "Exposition aux risques",
    labelMin: "Peu élevé",
    labelMax: "Très élevé",
    gradient: "linear-gradient(to right, #FFF0EE, #7F1D1D)",
  },
  indice_vulnerabilite: {
    title: "Indice de vulnérabilité",
    labelMin: "Peu élevé",
    labelMax: "Très élevé",
    gradient: "linear-gradient(to right, #FFF0EE, #7F1D1D)",
  },
  score_economique: {
    title: "Situation économique",
    labelMin: "Faible",
    labelMax: "Élevé",
    gradient: "linear-gradient(to right, #FFF7ED, #7C2D12)",
  },
  score_assurance: {
    title: "Exposition assurance",
    labelMin: "Faible",
    labelMax: "Élevé",
    gradient: "linear-gradient(to right, #FEF2F2, #1E3A5F)",
  },
};

export function Legend() {
  const { kpi } = useMapContext();
  const meta = KPI_META[kpi];

  return (
    <Card
      size="default"
      className="mx-auto w-full min-w-75 shadow-xl rounded-3xl border-none ring-0 focus:ring-0"
    >
      <CardHeader>
        <CardTitle>{meta.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {meta.discrete ? (
          <div className="flex rounded overflow-hidden h-3">
            {meta.discrete.map((seg, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: seg.color }}
              />
            ))}
          </div>
        ) : (
          <div className="h-3 rounded" style={{ background: meta.gradient }} />
        )}
        <div className="flex justify-between mt-1 gap-6">
          <span className="text-xs text-gray-500">{meta.labelMin}</span>
          <span className="text-xs text-gray-500">{meta.labelMax}</span>
        </div>
      </CardContent>
    </Card>
  );
}
