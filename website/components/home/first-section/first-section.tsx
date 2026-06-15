import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import StatsChartList from "./stats-chart-list";
import { desktopStats } from "./stats.data";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
          value={"17300"}
          title={{ text: "", highlight: "communes" }}
          subtitle={
            "ont demandé la reconnaissance d'état de catastrophe naturelle depuis 2020, soit environ la moitié des communes françaises. En France, entre 1989 et 2019, les inondations ont représenté environ 40% des dommages assurés causés par les catastrophes naturelles, contre 20% pour le retrait-gonflement des argiles. D’içi à 2050, la part des dommages assurés causés par le retrait-gonflement des argiles risque fortement d’augmenter, avec des coûts assurés estimés à plus de 40 milliards d’euros."
          }
          variant="grayLight"
        />
      </div>

      <div className="block">
        <div className="flex flex-col gap-[4px] text-center text-2xl font-bold pb-12">
          Evolution du nombre d&apos;évènements ayant donné lieu à une
          reconnaissance d&apos;état de catastrophe naturelle (1984-2025)
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 shrink-0 cursor-pointer text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                Les communes touchées par un événement climatique extrême
                peuvent demander une reconnaissance de l'état de catastrophe
                naturelle auprès du préfet dans un délai maximum de 24 mois
                après l'événement. Cette requête remonte alors jusqu'au
                gouvernement, seul habilité à reconnaître cette situation.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <StatsChartList items={desktopStats} />
        <div className="text-right pt-[20px]">
          Source: CCR (Caisse Centrale de Réassurance)
        </div>
      </div>
    </div>
  );
};

export default FirstSection;
