"use-client";
import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import StatsChartList from "./stats-chart-list";
import { mobileStats, desktopStats } from "./stats.data";

const FirstSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[40px] lg:gap-[96px] w-full px-[16px] lg:px-[104px] mb-[72px]">
      <div className="flex flex-col gap-[20px]">
        <SectionTitle
          highlightVariant="secondary"
          topLine={[
            {
              parts: [{ text: "Des " }, { text: "communes", bold: true }],
            },
          ]}
          bottomLine={[
            {
              highlight: true,
              parts: [
                { text: "de plus en ", bold: false },
                { text: "plus", bold: true },
                { text: " exposées", bold: true },
              ],
            },
          ]}
        />
        <StatCallout
          value={"75%"}
          title={{ text: "des", highlight: "communes" }}
          subtitle={
            "touchées au moins une fois par une catastrophe naturelle depuis 1982"
          }
        />
      </div>

      <div className="lg:hidden">
        <StatsChartList items={mobileStats} />
      </div>

      <div className="hidden lg:block">
        <StatsChartList items={desktopStats} />
      </div>
    </div>
  );
};

export default FirstSection;
