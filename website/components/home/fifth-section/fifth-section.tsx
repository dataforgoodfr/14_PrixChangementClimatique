import SectionTitle from "../section-title";
import StatCallout from "../statCallout";
import Map from "./map";

const FifthSection: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-[48px] bg-rf-lime w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px] lg:max-w-[528px]">
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
          value={"x2"}
          title={{ text: "", highlight: "" }}
          subtitle={
            <p>
              {
                "Les dépenses d’assurance multirisque ont été multipliées par 2 en moyenne pour les communes françaises entre 2020 et 2024. L’augmentation des dépenses d’assurance multirisque pour les communes n’est pas leur seule préoccupation. Elles sont nombreuses à voir leurs conditions d’assurance se dégrader (e.g. augmentation des franchises, réduction des niveaux de couverture) : en 2024, 18% des communes ont vu leurs dépenses d’assurance multirisque baisser. D’après L’Observatoire des finances et de la gestion publique locales (OFGL), cette baisse provient en général d’une diminution des équipements assurés voire d’une suspension de contrat. Dans les cas les plus extrêmes, certaines communes se retrouvent donc sans assureur pour protéger leurs biens face aux événements climatiques extrêmes."
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
