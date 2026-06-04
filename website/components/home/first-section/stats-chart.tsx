import { InfoIcon } from "lucide-react";
import type { ReactNode } from "react";
import WarmingStripes, { type DataPoint } from "./warming-stripes";

type Props = {
  caption: string;
  data: DataPoint[];
  colors: string[];
  unit?: string;
  annotation?: ReactNode;
};

function getYearTicks(data: DataPoint[], count = 7): number[] {
  if (data.length === 0) return [];
  const startYear = data[0].year;
  const endYear = data[data.length - 1].year;
  return Array.from({ length: count }, (_, i) =>
    Math.round(startYear + (i / (count - 1)) * (endYear - startYear)),
  );
}

const YearsScale = ({ data }: { data: DataPoint[] }) => {
  const ticks = getYearTicks(data);
  return (
    <div className="w-full max-w-[700px] lg:max-w-[1200px]">
      <div className="flex justify-between font-bold text-xs lg:text-sm text-gray-700">
        {ticks.map((year) => (
          <span key={year}>{year}</span>
        ))}
      </div>
    </div>
  );
};

const StatsChart: React.FC<Props> = ({
  caption,
  data,
  colors,
  unit,
  annotation,
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start gap-[16px]">
        <div className="flex gap-[8px] items-center shrink-0">
          <span className="text-[16px] lg:text-[24px]">{caption}</span>
        </div>
      </div>
      {annotation && <div className="text-right">{annotation}</div>}
      <div className="w-full flex flex-col gap-[8px]">
        <div className="w-full">
          <WarmingStripes data={data} colors={colors} unit={unit} />
        </div>
        <YearsScale data={data} />
      </div>
    </div>
  );
};

export default StatsChart;
