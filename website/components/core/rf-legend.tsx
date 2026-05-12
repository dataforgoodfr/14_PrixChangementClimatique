"use client";

import { useIndicator } from "@/hooks";
import { type IndicatorField } from "@/lib/types/indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiscreteSeg {
  color: string;
  label?: string;
}

interface IndicatorMeta {
  title: string;
  labelMin?: string;
  labelMax?: string;
  gradient?: string;
  discrete?: DiscreteSeg[];
}

const INDICATOR_META: Record<IndicatorField, IndicatorMeta> = {
  indice_vulnerabilite_niveau: {
    title: "Niveau de vulnérabilité",
    labelMin: "Peu vulnérable",
    labelMax: "Très vulnérable",
    discrete: [
      { color: "#518F83" },
      { color: "#B2A052" },
      { color: "#FFB74B" },
      { color: "#EA580D" },
      { color: "#B91C1C" },
    ],
  },
  score_exposition: {
    title: "Exposition aux risques climatiques",
    labelMin: "Peu élevé",
    labelMax: "Très élevé",
    gradient: "linear-gradient(to right, #FFF0EE, #7F1D1D)",
  },
  prevention: {
    title: "Prévention des risques (PPRN)",
    discrete: [
      { color: "#fed7aa", label: "Aucun PPRN" },
      { color: "#92400e", label: "Sécheresse" },
      { color: "#1d4ed8", label: "Inondation" },
      { color: "#2d7a3a", label: "Séch. + Inond." },
    ],
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
  const [indicator] = useIndicator();
  const meta = INDICATOR_META[indicator];

  const hasLabels = meta.discrete?.some((s) => s.label);

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
          hasLabels ? (
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${meta.discrete.length}, 1fr)`,
              }}
            >
              {meta.discrete.map((seg, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full h-3 rounded-sm"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-gray-500 text-center leading-tight">
                    {seg.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex rounded overflow-hidden h-3">
                {meta.discrete.map((seg, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: seg.color }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{meta.labelMin}</span>
                <span className="text-xs text-gray-500">{meta.labelMax}</span>
              </div>
            </>
          )
        ) : (
          <>
            <div
              className="h-3 rounded"
              style={{ background: meta.gradient }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{meta.labelMin}</span>
              <span className="text-xs text-gray-500">{meta.labelMax}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
