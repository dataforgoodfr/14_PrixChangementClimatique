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
  variationPercentage?: number;
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

const getVariation = (variation?: number): VariationResult | null => {
  if (!variation) return null;

  return {
    formatted: `${variation > 0 ? "+" : ""}${variation}%`.replace(".", ","),
    color: getVariationColor(variation),
  };
};

export function StatCard({
  title,
  currentValue,
  unit = "",
  comparisonText,
  className,
  variationPercentage,
}: StatCardProps) {
  const variation = getVariation(variationPercentage);

  const formattedValue = `${formatNumber(currentValue)}${unit ? ` ${unit}` : ""}`;

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400">
        {title}
      </h3>

      <div className="flex flex-col items-start justify-between gap-1">
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
