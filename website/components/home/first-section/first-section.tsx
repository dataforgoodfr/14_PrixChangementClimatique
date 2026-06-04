import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import StatsChartList from "./stats-chart-list";
import { desktopStats } from "./stats.data";

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
          value={"90%"}
          title={{ text: "des", highlight: "communes" }}
          subtitle={
            "touchées au moins une fois par une catastrophe naturelle depuis 1982"
          }
        />
      </div>

      <div className="block">
        <div className="flex flex-col gap-[4px] text-center text-[21px] font-[600] pb-12">
          Evolution du nombre d&apos;évènements ayant donné lieu à une
          reconnaissance d&apos;état de catastrophe naturelle (1984-2025)
        </div>
        <StatsChartList items={desktopStats} />
        <div className="text-right text-[12px] pt-[20px]">
          Source: CCR (Caisse Centrale de Réassurance)
        </div>
      </div>
    </div>
  );
};

export default FirstSection;
