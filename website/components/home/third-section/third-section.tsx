"use-client";
import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import { Info } from "lucide-react";
import Map from "./map";

const ThirdSection: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-[48px] bg-rf-green-dark w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px] text-white lg:max-w-[528px]">
        <SectionTitle
          highlightVariant="primary"
          topLine={[
            {
              parts: [{ text: "Des " }, { text: "communes", bold: true }],
            },
          ]}
          bottomLine={[
            {
              highlight: true,
              parts: [
                { text: "pas toutes " },
                { text: "préparées", bold: true },
              ],
            },
          ]}
        />

        <StatCallout
          value={"75%"}
          title={{ text: "Des", highlight: "communes" }}
          subtitle={
            <p>
              ayant été reconnues au moins une fois en état de catastrophes
              naturelles depuis 1982 n’ont pas mis en place de plan de
              prévention des risques naturels prévisibles (
              <span className="inline-flex items-center gap-[4px] align-middle">
                PPRN
                <Info size={14} className="inline-block" />
              </span>
              ). A l’échelle nationale, près de X communes (X %) sur les X en
              France disposent d’un PPRN.
            </p>
          }
          variant="secondary"
        />
      </div>
      <Map />
    </div>
  );
};

export default ThirdSection;
