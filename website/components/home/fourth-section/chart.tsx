"use-client";
import Image from "next/image";
import Caption from "./caption";
import { Info } from "lucide-react";

const FourthSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[16px] w-full p-[16px] border rounded-2xl">
      <div className="flex flex-col gap-[4px]">
        <p className="text-[14px]  md:text-[20px] md:text-[22px] font-[600] text-[#1E1B39]">
          Répartition de la part des primes d’assurance dans les budgets des
          communes 2024
        </p>
        <div className="flex gap-[4px] text-[12px] md:text-[16px] text-rf-gray italic">
          Depuis 2020 <Info size={14} />
        </div>
      </div>
      <Image
        src={"/home-graph-insurance-premium.svg"}
        alt={"Part des primes d’assurance - Graph"}
        width={311}
        height={250}
        className="w-full lg:hidden max-w-[500px] self-center"
      />
      <Image
        src={"/home-graph-insurance-premium-desktop.svg"}
        alt={"Part des primes d’assurance - Graph"}
        width={1136}
        height={380}
        className="hidden lg:block self-center"
      />
      <Caption />
    </div>
  );
};

export default FourthSection;
