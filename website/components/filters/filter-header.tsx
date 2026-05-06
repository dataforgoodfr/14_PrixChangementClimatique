import { Info } from "lucide-react";
import { FC } from "react";

type Props = {
  title: string;
  moyenne?: number;
};

const FilterHeader: FC<Props> = ({ title, moyenne }) => {
  return (
    <div className="flex items-center justify-between my-5">
      <div className="flex items-center gap-1.5 text-sm text-gray-700">
        <span>{title}</span>
        <Info size={14} className="text-gray-400" />
      </div>
      {moyenne !== undefined && (
        <span className="text-sm text-gray-400">Moy: {moyenne}</span>
      )}
    </div>
  );
};

export default FilterHeader;
