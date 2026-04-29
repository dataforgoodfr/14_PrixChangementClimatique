"use-client";
import SectionTitle from "./section-title";
import Image from "next/image";

const SecondSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[24px] lg:gap-[48px] bg-[#F5F5DC] w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      <div className="flex flex-col gap-[20px] items-center text-center">
        <SectionTitle
          highlightVariant="secondary"
          topLine={[
            {
              highlight: true,
              parts: [
                { text: "Une exposition " },
                { text: "inégale", bold: false },
              ],
            },
          ]}
          bottomLine={[
            {
              parts: [
                { text: "aux " },
                { text: "évènements climatiques extrêmes", bold: true },
              ],
            },
          ]}
        />
        <h3 className="text-[14px] lg-[24px]">
          Le dérèglement climatique s'accélère et l'augmentation des émissions
          anthropiques de gaz à effet de serre entraîne une hausse de la
          fréquence et de l'intensité des évènements climatiques extrêmes. C'est
          donc un nombre croissant de communes qui sont sinistrées chaque année,
          avec une hausse de X% du nombre d'arrêtés cat-nat délivrés sur la
          période 2010-2024 par rapport aux 15 années précédentes. Un des
          principaux risques derrière cette tendance est celui lié aux RGA.
        </h3>
      </div>
      <div className="relative w-full aspect-[1440/960]">
        <Image
          src="/home-orders-increase-map.svg"
          alt="Augmentation des arrêtés"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default SecondSection;
