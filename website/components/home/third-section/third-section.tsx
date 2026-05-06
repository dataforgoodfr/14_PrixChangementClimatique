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
              <p>
                ayant été reconnues au moins une fois en état de catastrophe
                naturelle depuis 1982 ne bénéficient pas d’un Plan de prévention
                des risques naturels (
                <span className="inline-flex items-center gap-[4px] align-middle">
                  PPRN
                  <Info size={14} className="inline-block" />
                </span>
                ). La mise en place de ce dispositif relève des compétences de
                l'État.{" "}
              </p>
              <p>
                <span className="inline-block">A l'échelle nationale,</span>{" "}
                près de 12600 communes disposent d’un Plan de prévention des
                risques naturels (
                <span className="inline-flex items-center gap-[4px] align-middle">
                  PPRN
                  <Info size={14} className="inline-block" />
                </span>
                ). Pourtant depuis 1982, plus de 17000 communes ont été
                reconnues au moins 5 fois en état de catastrophe naturelle. De
                plus, la moitié des PPR inondations actifs datent de plus de 10
                ans.
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
