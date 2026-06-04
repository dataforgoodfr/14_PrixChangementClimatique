"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Rectangle,
} from "recharts";
import { DownloadCsvButton } from "@/components/core/download-csv-button";
import { CatnatResponse } from "@/lib/types/catnat";
import { useMemo } from "react";

const chartConfig = {
  count: {
    label: "Événements",
  },
} satisfies ChartConfig;

// Couleurs pour chaque barre (ordre décroissant)
const BAR_COLORS = [
  "var(--color-rf-graph-1)",
  "var(--color-rf-graph-2)",
  "var(--color-rf-graph-3)",
  "var(--color-rf-graph-4)",
];

interface CustomBarProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const CustomBar = (props: CustomBarProps) => {
  const { fill, x, y, width, height } = props;

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={[0, 4, 4, 0]}
    />
  );
};

const TYPE_LABELS: Record<string, string> = {
  Inondation: "Inondations et coulées de boue",
  "Mouvement de Terrain": "Mouvements de terrain",
  Sécheresse:
    "Mouvements de terrain consécutifs à la sécheresse / réhydratation des sols",
  Météo: "Tempêtes / phénomènes météorologiques",
  Marin: "Événements marins",
  Sismique: "Événements sismiques",
  Autre: "Autres catastrophes",
};

export function CatnatTypesChart({
  data,
  hideTitle,
}: {
  data: CatnatResponse[];
  hideTitle?: boolean;
}) {
  const aggregatedData = useMemo(() => {
    const typeCount = data.reduce(
      (acc, event) => {
        acc[event.type_catnat] = (acc[event.type_catnat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const chartData = useMemo(
    () =>
      aggregatedData.map((item, index) => ({
        ...item,
        displayName: TYPE_LABELS[item.type] || item.type,
        fill: BAR_COLORS[index % BAR_COLORS.length],
      })),
    [aggregatedData],
  );

  const maxCount = Math.max(...aggregatedData.map((item) => item.count));
  const xAxisTicks = Array.from({ length: maxCount + 1 }, (_, i) => i);

  const csvData = [
    ["Type de catastrophe", "Nombre d'événements"],
    ...chartData.map((item) => [item.displayName, item.count]),
  ];

  return (
    <Card className="w-full">
      {!hideTitle && (
        <CardHeader>
          <CardTitle>Types de catastrophe naturelle</CardTitle>
          <CardDescription>
            Dans les demandes de reconnaissance de l’état de catastrophe
            naturelle
          </CardDescription>
          <CardAction>
            <DownloadCsvButton
              data={csvData}
              filename="types-catastrophes-naturelles"
              className="gap-1.5"
            />
          </CardAction>
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              horizontal={false}
            />
            <XAxis
              type="number"
              ticks={xAxisTicks}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={340}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 16,
                fontFamily: "inter",
                fontWeight: 400,
                textAnchor: "start",
                dx: -330,
                fill: "var(--color-rf-gray-light)",
              }}
            />
            <Bar dataKey="count" shape={CustomBar} barSize={16} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
