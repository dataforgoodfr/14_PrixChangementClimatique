import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import { Info } from "lucide-react";
import Map from "./map";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ThirdSection: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-[48px] bg-rf-green-dark w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px] text-white lg:max-w-[530px]">
        <SectionTitle
          highlightVariant="primary"
          topLine={[
            {
              parts: [{ text: "Des " }, { text: "dispositifs", bold: true }],
            },
          ]}
          bottomLine={[
            {
              highlight: true,
              parts: [
                { text: "de prévention " },
                { text: "insuffisants", bold: true },
              ],
            },
          ]}
        />

        <StatCallout
          value={"64%"}
          title={{ text: "des", highlight: "communes" }}
          subtitle={
            <>
              <p className="pb-4">
                ont été reconnues au moins une fois en état de catastrophe
                naturelle depuis 1982, pour laquelle l’État n’a toujours pas mis
                en place de Plan de prévention des risques naturels (
                <span className="inline-flex items-center gap-[4px] align-middle">
                  PPRN
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 shrink-0 cursor-pointer text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <>
                          Il s'agit d'un document réalisé par les services de
                          l'État et élaboré sous la responsabilité du préfet.
                          Les PPRN sont élaborés sur des communes qui présentent
                          une vulnérabilité importante vis-à-vis des risques.
                          L'objet du PPRN est d'identifier les risques
                          prévisibles qui constituent une menace pour la
                          population et les biens, de délimiter les zones
                          exposées directement ou indirectement à ces risques,
                          d'y réglementer l'utilisation des sols et de
                          déterminer les mesures de construction applicables.
                        </>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </span>
                ). La prescription de ce dispositif de prévention relève
                pourtant de ses compétences. Ce chiffre atteint plus de 85% pour
                les communes reconnues en état de catastrophe naturelle au titre
                du risque de retrait gonflement des argiles.{" "}
              </p>
              <p className="pb-4">
                Alors que le réassureur public français (CCR) prévoit une
                multiplication par deux du risque de retrait gonflement des
                argiles d’ici à 2050, il devient urgent pour les communes
                exposées de disposer d’un PPRN.
              </p>
              <p>
                À l'échelle nationale, près de 12 000 communes disposent au
                moins d’un Plan de prévention des risques naturels (PPRN
                inondation ou RGA). Beaucoup sont cependant obsolètes et
                nécessitent une mise à jour : en moyenne, les PPRN inondations
                dont disposent les communes françaises ont été mis en place il y
                a plus de 16 ans. Les PPRN RGA ont été mis en place il y a plus
                de 14 ans en moyenne.
              </p>
            </>
          }
          variant="secondary"
        />
      </div>
      <Map />
    </div>
  );
};

export default ThirdSection;
