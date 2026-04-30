"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Info } from "lucide-react";
import { Bar, BarChart, BarShapeProps, Rectangle } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  FilterActionType,
  FilterRangeKey,
} from "@/lib/types/filters/filters-actions";
import { useFilters } from "./filter-context";
import { FILTER_BOUNDS } from "@/lib/types/filters/filters";

const HISTOGRAM_DATA: { bin: string; count: number }[] = [
  { bin: "0–5", count: 3 },
  { bin: "5–10", count: 7 },
  { bin: "10–15", count: 14 },
  { bin: "15–20", count: 24 },
  { bin: "20–25", count: 38 },
  { bin: "25–30", count: 54 },
  { bin: "30–35", count: 68 },
  { bin: "35–40", count: 78 },
  { bin: "40–45", count: 82 },
  { bin: "45–50", count: 80 },
  { bin: "50–55", count: 70 },
  { bin: "55–60", count: 55 },
  { bin: "60–65", count: 38 },
  { bin: "65–70", count: 24 },
  { bin: "70–75", count: 14 },
  { bin: "75–80", count: 7 },
  { bin: "80–85", count: 3 },
  { bin: "85–90", count: 1 },
];

const CHART_CONFIG = {
  count: { label: "Communes", color: "#15803d" },
} satisfies ChartConfig;

function getBarColor(
  props: BarShapeProps,
  activeStart: number,
  activeEnd: number,
): string {
  return props.index >= activeStart && props.index < activeEnd
    ? "#15803d"
    : "#d1d5db";
}

export interface ChartRangeFilterProps {
  title: string;
  filterKey: FilterRangeKey;
}

export function ChartRangeFilter({ title, filterKey }: ChartRangeFilterProps) {
  const { filters, dispatch } = useFilters();
  const [filterExpanded, setFilterExpanded] = useState<boolean>(true);

  // Les bornes du slider viennent de FILTER_BOUNDS //TODO - à voir si on garde
  const bounds = FILTER_BOUNDS[filterKey];

  const activeRange: [number, number] = [
    filters[filterKey]?.min ?? bounds.min,
    filters[filterKey]?.max ?? bounds.max,
  ];

  const binCount = HISTOGRAM_DATA.length;
  const activeStart = Math.round(
    ((activeRange[0] - bounds.min) / (bounds.max - bounds.min)) * binCount,
  );
  const activeEnd = Math.round(
    ((activeRange[1] - bounds.min) / (bounds.max - bounds.min)) * binCount,
  );

  const MyCustomRectangle = (props: BarShapeProps) => (
    <Rectangle {...props} fill={getBarColor(props, activeStart, activeEnd)} />
  );

  function handleChange(v: number[]) {
    const [min, max] = v as [number, number];

    // Si retour aux bornes max → on supprime le filtre (undefined)
    if (min === bounds.min && max === bounds.max) {
      dispatch({ type: FilterActionType.CLEAR_RANGE, key: filterKey });
    } else {
      dispatch({
        type: FilterActionType.SET_RANGE,
        key: filterKey,
        payload: { min, max },
      });
    }
  }

  return (
    <div className="border-b border-gray-200">
      <Button
        onClick={() => setFilterExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 my-2"
        size="lg"
        variant="ghost"
      >
        <span className="font-semibold gap-1.5 text-sm text-gray-900">
          {title}
        </span>
        {filterExpanded ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </Button>

      {filterExpanded && (
        <div className="px-4 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <span>{title}</span>
              <Info size={14} className="text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Distribution des communes
          </p>

          <ChartContainer config={CHART_CONFIG} className="h-16 w-full mb-0">
            <BarChart
              data={HISTOGRAM_DATA}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap={1}
            >
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    formatter={(value) => [`${value} communes`, ""]}
                  />
                }
              />
              <Bar
                dataKey="count"
                radius={[2, 2, 0, 0]}
                shape={MyCustomRectangle}
              />
            </BarChart>
          </ChartContainer>

          <Slider
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={activeRange}
            onValueChange={handleChange}
            className="mt-3 mb-3"
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>{activeRange[0]}</span>
            <span>{activeRange[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
