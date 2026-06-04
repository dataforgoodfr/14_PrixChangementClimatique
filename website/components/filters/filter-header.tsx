import { Info } from "lucide-react";
import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  title: string;
  moyenne?: number;
  caption?: string;
};

const FilterHeader: FC<Props> = ({ title, moyenne, caption }) => {
  return (
    <div className="flex items-center justify-between my-5">
      <div className="flex items-center gap-1.5 text-sm text-gray-700">
        <span>{title}</span>
        {caption && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="cursor-pointer text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>{caption}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {moyenne !== undefined && (
        <span className="text-sm text-gray-400">Moy: {moyenne}</span>
      )}
    </div>
  );
};

export default FilterHeader;
