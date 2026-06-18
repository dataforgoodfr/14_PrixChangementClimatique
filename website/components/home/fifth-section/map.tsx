import Image from "next/image";

const Map: React.FC = () => {
  return (
    <div className="flex flex-col gap-[16px] w-full min-width-[550px]">
      <div className="flex flex-col gap-[4px] text-center ">
        <p className="text-2xl font-bold">
          Variations des dépenses d’assurance multirisques par commune
        </p>
        <p className="text-rf-gray/80">Période 2020 - 2024</p>
      </div>
      <div className="flex gap-[20px]">
        <Image
          src={"/home-insurance-map.png"}
          alt={
            "Variations des dépenses d’assurance multirisque par commune entre 2020 et 2024 - Carte"
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
