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
                { text: "inégales", bold: false },
              ],
            },
          ]}
          bottomLine={[
            {
              parts: [
                { text: "aux " },
                { text: "catastrophes naturelles", bold: true },
              ],
            },
          ]}
        />
        <h3 className="text-[14px] lg-[24px]">
          Certaines communes sont bien plus <br className="lg:hidden" />
          exposées que d&apos;autres
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
