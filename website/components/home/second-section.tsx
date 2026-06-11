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
        <h3 className="text-lg text-left">
          L’Europe se réchauffe 2 fois plus vite que la moyenne mondiale, et la
          France ne fait pas exception. Pourtant, certains territoires sont plus
          touchés que d’autres.
        </h3>
        <h3 className="text-lg text-left">
          Les communes françaises de l’hexagone sont particulièrement exposées
          au risque de retrait-gonflement des argiles. Selon le nouveau zonage
          publié en janvier 2026, 55 % du territoire est classé en exposition
          moyenne ou forte, particulièrement en Occitanie, en
          Provence-Alpes-Côte d’Azur ou encore dans le Centre-Val-de-Loire. Les
          territoires dits d’outre-mer sont à l’inverse de plus en confrontés à
          l’augmentation de la fréquence des vents cycloniques.
        </h3>
      </div>
      <div className="flex flex-col gap-[16px] w-full">
        <div className="flex flex-col gap-[4px] text-center ">
          <p className="text-2xl font-bold">
            Augmentation de la fréquence annuelle de reconnaissance de l’état de
            catastrophe naturelle
          </p>
          <p className="text-rf-gray/80">Période avant 2010 / après 2010 </p>
        </div>
      </div>
      <div className="relative w-full aspect-[1440/960]">
        <Image
          src="/home-orders-increase-map.png"
          alt="Augmentation des arrêtés"
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
};

export default SecondSection;
