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
import { formatCurrency } from "@/utils/format";

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
    const yearData = [];

    if (data.prime_assurance_2020) {
      yearData.push({ year: "2020", expenses: data.prime_assurance_2020 });
    }
    if (data.prime_assurance_2021) {
      yearData.push({ year: "2021", expenses: data.prime_assurance_2021 });
    }
    if (data.prime_assurance_2022) {
      yearData.push({ year: "2022", expenses: data.prime_assurance_2022 });
    }
    if (data.prime_assurance_2023) {
      yearData.push({ year: "2023", expenses: data.prime_assurance_2023 });
    }
    if (data.prime_assurance_2024) {
      yearData.push({ year: "2024", expenses: data.prime_assurance_2024 });
    }

    return yearData;
  }, [data]);

  if (chartData.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Evolution des dépenses d&apos;assurance</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const csvData = [
    ["Année", "Dépenses d'assurance (€)"],
    ...chartData.map((item) => [item.year, item.expenses]),
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolution des dépenses d&apos;assurance</CardTitle>
        <CardDescription>Depuis {chartData[0].year}</CardDescription>
        <CardAction>
          <DownloadCsvButton
            data={csvData}
            filename="evolution-depenses-assurance"
            className="gap-1.5"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-100 w-full">
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
                  const millions = value / 1000000;
                  return `${millions.toFixed(1)}M`;
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
