import Caption from "./caption";
import { Info } from "lucide-react";
import ChartContent from "./chart-content";

const FourthSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[16px] w-full p-[16px] border rounded-2xl">
      <div className="flex flex-col gap-[4px]">
        <p className="text-2xl font-bold text-[#1E1B39]">
          Répartition de la part des dépenses d&apos;assurance dans le budget
          des communes en 2024
        </p>
        <div className="flex gap-[4px] text-rf-gray italic">
          Depuis 2020 <Info size={14} />
        </div>
      </div>

      <ChartContent />

      <Caption />
    </div>
  );
};

export default FourthSection;
