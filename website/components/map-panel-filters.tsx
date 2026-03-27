"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronUp, ChevronDown, Info } from "lucide-react";
import { Bar, BarChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";

// Normal-distribution histogram data for demo purposes
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

interface MapFiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
interface ChartRangeFilterProps {
  title: string;
  filterMin: number;
  filterMax: number;
}

function ChartRangeFilter({
  title = "Exposition au risque",
  filterMin = 0,
  filterMax = 100,
}: ChartRangeFilterProps) {
  const [filterExpanded, setFilterExpanded] = useState<boolean>(true);
  const [range, setRange] = useState<[number, number]>([filterMin, filterMax]);

  const binCount = HISTOGRAM_DATA.length;
  const activeStart = Math.round((range[0] / filterMax) * binCount);
  const activeEnd = Math.round((range[1] / filterMax) * binCount);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setFilterExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        {filterExpanded ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {filterExpanded && (
        <div className="px-4 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <span>Indice d&apos;exposition aux risques</span>
              <Info size={14} className="text-gray-400" />
            </div>
            <span className="text-sm text-gray-500">Moy: 45</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Distribution des communes
          </p>

          {/* Histogram chart */}
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
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {HISTOGRAM_DATA.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i >= activeStart && i < activeEnd ? "#15803d" : "#d1d5db"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Range slider */}
          <Slider
            min={filterMin}
            max={filterMax}
            step={1}
            value={range}
            onValueChange={(v) => setRange(v as [number, number])}
            className="mt-3 mb-3"
          />

          {/* Range value labels */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{range[0]}</span>
            <span>{range[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MapPanelFilters({ isOpen, onClose }: MapFiltersSidebarProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const clearAll = () => {
    console.log("clearAll Filters");
  };

  return (
    <div
      className={`absolute top-0 left-0 h-full w-[360px] bg-white shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          <span className="font-medium">Filtres</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <ChartRangeFilter
          title="Exposition au risque"
          filterMin={0}
          filterMax={100}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
        <button
          onClick={clearAll}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Tout effacer
        </button>
        <button className="bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-green-800 transition-colors">
          Afficher 1000 communes
        </button>
      </div>
    </div>
  );
}
