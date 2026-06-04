"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DataPoint = { year: number; value: number };

type Props = {
  data: DataPoint[];
  colors: string[];
  unit?: string;
};

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function interpolateColor(colors: string[], t: number): string {
  if (colors.length === 1) return colors[0];
  const scaled = t * (colors.length - 1);
  const i = Math.min(Math.floor(scaled), colors.length - 2);
  const f = scaled - i;
  const [r1, g1, b1] = hexToRgb(colors[i]);
  const [r2, g2, b2] = hexToRgb(colors[i + 1]);
  return `rgb(${Math.round(r1 + (r2 - r1) * f)}, ${Math.round(g1 + (g2 - g1) * f)}, ${Math.round(b1 + (b2 - b1) * f)})`;
}

const WarmingStripes: React.FC<Props> = ({ data, colors, unit }) => {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <TooltipProvider>
      <div className="flex w-full h-[100px] lg:h-[163px] rounded-[16px] overflow-hidden">
        {data.map((point) => {
          const t = (point.value - min) / range;
          const color = interpolateColor(colors, t);
          return (
            <Tooltip key={point.year}>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 h-full cursor-default"
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                {point.year}&nbsp;: {point.value}
                {unit ? ` ${unit}` : ""}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default WarmingStripes;
