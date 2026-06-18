import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import Chart from "./chart";

const FourthSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[48px] w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px]">
        <SectionTitle
          highlightVariant="primary"
          topLine={[
            {
              parts: [{ text: "Des " }, { text: "communes", bold: true }],
            },
          ]}
          middleLine={[
            {
              highlight: true,
              parts: [
                { text: "aux ressources " },
                { text: "financières", bold: true },
              ],
            },
          ]}
          bottomLine={[
            {
              parts: [{ text: "inégales", bold: true }],
            },
          ]}
        />

        <StatCallout
          value={"3%"}
          title={{ text: "des", highlight: "communes" }}
          subtitle={
            <>
              enregistrent des dépenses d’assurance multirisques représentant
              plus de 5 % de leur budget annuel.
            </>
          }
        />
        <p className="text-lg text-rf-gray">
          Les petites communes (budget annuel inférieur à 200 k€) sont les plus
          impactées par le coût de leurs couvertures d’assurance multirisques :
          pour 7,5 % d’entre elles, ces dépenses représentent plus de 5 % de
          leur budget annuel.
        </p>
      </div>
      <Chart />
    </div>
  );
};

export default FourthSection;
