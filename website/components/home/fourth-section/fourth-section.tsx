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
        <p className="text-[14px] md:text-[20px] lg:text-[24px] text-[#7C7AA1] font-[400]">
          Face au changement climatique, toutes les communes ne sont pas égales,
          et celles qui possèdent un petit budget sont les premières à avoir des
          difficultés à financer la réparation des dommages et la prévention des
          risques de catastrophes naturelles.
        </p>
      </div>
      <Chart />
    </div>
  );
};

export default FourthSection;
