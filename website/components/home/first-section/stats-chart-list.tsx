import StatsChart from "./stats-chart";

type Stats = {
  id: number;
  caption: string;
  url: string;
  alt: string;
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
          url={item.url}
          alt={item.alt}
        />
      ))}
    </div>
  );
};

export default StatsChartList;
