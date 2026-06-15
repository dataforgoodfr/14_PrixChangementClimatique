import SectionTitle from "../section-title";
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
        <p className="text-lg text-[#7C7AA1]">
          Pour 3 % des communes françaises, les dépenses d’assurance multirisque
          représentent plus de 5 % de leur dépenses annuelles.
        </p>
        <p className="text-lg text-[#7C7AA1]">
          Les petites communes (budget annuel inférieur à 200K €) sont les plus
          impactées par le coût de leurs couvertures d’assurance multirisque :
          pour 7,5 % d’entre elles, ces dépenses représentent plus de 5 % de
          leur budget annuel.
        </p>
      </div>
      <Chart />
    </div>
  );
};

export default FourthSection;
