"use-client";
import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import Map from "./map";

const FifthSection: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-[48px] bg-rf-lime w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px]">
        <div className="text-rf-green-dark">
          <SectionTitle
            highlightVariant="tertiary"
            topLine={[
              {
                parts: [
                  { text: "Des " },
                  { text: "communes", bold: true },
                  { text: " face à des" },
                ],
              },
            ]}
            middleLine={[
              {
                highlight: true,
                parts: [
                  { text: "conditions d'" },
                  { text: "assurance", bold: true },
                ],
              },
            ]}
            bottomLine={[
              {
                parts: [{ text: "qui se " }, { text: "dégradent", bold: true }],
              },
            ]}
          />
        </div>

        <StatCallout
          value={"70%"}
          title={{ text: "", highlight: "d'augmentation" }}
          subtitle={
            <p>
              {
                "des dépenses d'assurance des communes françaises en moyenne entre 2020 et 2024"
              }
            </p>
          }
          variant="fullGreen"
        />
      </div>
      <Map />
    </div>
  );
};

export default FifthSection;
