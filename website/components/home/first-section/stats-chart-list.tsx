import type { ReactNode } from "react";
import StatsChart from "./stats-chart";
import type { DataPoint } from "./warming-stripes";

type Stats = {
  id: number;
  caption: string;
  data: DataPoint[];
  colors: string[];
  unit?: string;
  annotation?: ReactNode;
};

type Props = {
  items: Stats[];
};

const StatsChartList: React.FC<Props> = ({ items }) => {
  return (
    <div className="flex flex-col gap-[32px] lg:gap-[56px]">
      {items.map((item) => (
        <StatsChart
          key={item.id}
          caption={item.caption}
          data={item.data}
          colors={item.colors}
          unit={item.unit}
          annotation={item.annotation}
        />
      ))}
    </div>
  );
};

export default StatsChartList;
