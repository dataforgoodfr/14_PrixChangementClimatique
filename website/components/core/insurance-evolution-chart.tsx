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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DownloadCsvButton } from "@/components/core/download-csv-button";
import { useMemo } from "react";

const chartConfig = {
  expenses: {
    label: "Dépenses",
    color: "var(--color-rf-gray-light)",
  },
} satisfies ChartConfig;

interface InsuranceData {
  prime_assurance_2020?: number;
  prime_assurance_2021?: number;
  prime_assurance_2022?: number;
  prime_assurance_2023?: number;
  prime_assurance_2024?: number;
}

interface InsuranceEvolutionChartProps {
  data: InsuranceData;
}

interface TooltipPayload {
  value: number;
  payload: {
    year: string;
    expenses: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-black/75 p-3 ">
        <div className="text-base font-bold text-rf-gray-lightest">
          DÉPENSES {payload[0].payload.year}
        </div>
        <div className="text-base font-medium text-white">
          {formatCurrency(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
};

export function InsuranceEvolutionChart({
  data,
}: InsuranceEvolutionChartProps) {
  const chartData = useMemo(() => {
    return [
      { year: "2020", expenses: data.prime_assurance_2020 || 0 },
      { year: "2021", expenses: data.prime_assurance_2021 || 0 },
      { year: "2022", expenses: data.prime_assurance_2022 || 0 },
      { year: "2023", expenses: data.prime_assurance_2023 || 0 },
      { year: "2024", expenses: data.prime_assurance_2024 || 0 },
    ];
  }, [data]);

  const csvData = [
    ["Année", "Dépenses d'assurance (€)"],
    ...chartData.map((item) => [item.year, item.expenses]),
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolution des dépenses d&apos;assurance</CardTitle>
        <CardDescription>Depuis 2020</CardDescription>
        <CardAction>
          <DownloadCsvButton
            data={csvData}
            filename="evolution-depenses-assurance"
            className="gap-1.5"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rf-graph-2)" />
                <stop
                  offset="95%"
                  stopColor="var(--color-rf-graph-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeWidth={2} />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 14,
                fontFamily: "inter",
                fill: "var(--color-rf-gray-light)",
                dy: 10,
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 14,
                fontFamily: "inter",
                fill: "var(--color-rf-gray-light)",
              }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                strokeWidth: 2,
                strokeDasharray: "5 5",
              }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-rf-gray-light)"
              strokeWidth={3}
              fill="url(#colorExpenses)"
              dot={{
                r: 6,
                fill: "var(--color-rf-gray-light)",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 8,
                fill: "var(--color-rf-gray-light)",
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
