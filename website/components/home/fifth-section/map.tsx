"use-client";
import Image from "next/image";

const Map: React.FC = () => {
  return (
    <div className="flex flex-col gap-[16px] w-full min-width-[550px] lg:max-w-[500px]">
      <div className="flex flex-col gap-[4px] text-center ">
        <p className="text-[14px] md:text-[21px] font-[600] text-rf-gray">
          Evolution des dépenses d'assurance multirisques par commune
        </p>
        <p className="text-[12px] md:text-[16px] text-rf-gray/80">
          Période 2020 - 2024
        </p>
      </div>
      <div className="flex gap-[20px]">
        <Image
          src={"/home-insurance-map.png"}
          alt={
            "Evolution des dépenses d'assurance multirisques par commune entre 2020 et 2024 - Carte"
          }
          width={331}
          height={340}
          className="w-full max-w-[600px] mx-auto"
        />
        <Image
          src={"/home-gauge-map.svg"}
          alt={"Légendes"}
          width={54}
          height={326}
          className="w-full max-w-[40px] mx-auto"
        />
      </div>
    </div>
  );
};

export default Map;
