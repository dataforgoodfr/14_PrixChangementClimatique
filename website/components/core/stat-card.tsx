import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/format";

export interface StatCardProps {
  title: string;
  currentValue: number;
  previousValue?: number;
  unit?: string;
  comparisonText?: string;
  className?: string;
}

interface VariationResult {
  formatted: string;
  color: string;
}

const getVariationColor = (value: number): string => {
  if (value > 0) return "bg-green-50 text-green-600";
  if (value < 0) return "bg-red-50 text-red-600";
  return "bg-gray-50 text-gray-600";
};

const getVariation = (
  current: number,
  previous?: number,
): VariationResult | null => {
  if (previous === undefined || previous === 0) return null;

  const percent = ((current - previous) / previous) * 100;
  const rounded = Math.round(percent);

  return {
    formatted: `${rounded > 0 ? "+" : ""}${rounded}%`,
    color: getVariationColor(rounded),
  };
};

export function StatCard({
  title,
  currentValue,
  previousValue,
  unit = "",
  comparisonText,
  className,
}: StatCardProps) {
  const variation = getVariation(currentValue, previousValue);

  const formattedValue = `${formatNumber(currentValue)}${unit ? ` ${unit}` : ""}`;

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400">
        {title}
      </h3>

      <div className="flex items-end justify-between">
        <p className="text-4xl font-bold text-gray-900">{formattedValue}</p>

        {variation && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-md px-2 py-1 text-sm font-semibold",
                variation.color,
              )}
            >
              {variation.formatted}
            </span>
            {comparisonText && (
              <span className="text-sm text-gray-500">{comparisonText}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
