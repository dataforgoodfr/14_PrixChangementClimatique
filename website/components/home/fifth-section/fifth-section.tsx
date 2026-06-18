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
          value={"82%"}
          title={{ text: "des", highlight: "communes" }}
          subtitle={
            <>
              <p className="pb-2">
                ont subi une hausse de leurs dépenses d’assurance multirisques
                entre 2020 et 2024. Parmi elles, certaines communes ont vu leurs
                dépenses d’assurance multirisques être multipliées par 6 sur la
                même période.
              </p>
              <p className="pb-2">
                L’augmentation des dépenses d’assurance multirisques pour les
                communes n’est pas leur seule préoccupation. Elles sont
                nombreuses à voir leurs conditions d’assurance se dégrader (e.g.
                augmentation des franchises, réduction des niveaux de
                couverture). Ainsi, si 18% des communes ont vu leur dépense
                d'assurance multirisques baisser, cela provient en général d'une
                diminution des équipements assurés voire d'une suspension de
                contrat (source : Observatoire des finances et de la gestion
                publique locales).
              </p>
              <p>
                Dans les cas les plus extrêmes, certaines communes se retrouvent
                donc sans assureur pour protéger leurs biens face aux événements
                climatiques extrêmes (écoles, églises, autres bâtiments
                publics).
              </p>
            </>
          }
          variant="fullGreen"
        />
      </div>
      <Map />
    </div>
  );
};

export default FifthSection;
