import { Slider } from "@/components/ui/slider";
import { RangeFilter } from "@/lib/types/filters/filters";
import { FC } from "react";

type Props = {
  bounds: RangeFilter;
  step?: number;
  activeRange: [number, number];
  onChange: (v: number[]) => void;
};

const FilterSlider: FC<Props> = ({ bounds, step, activeRange, onChange }) => {
  return (
    <div className="border-b border-gray-200 pb-5">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={step ?? 1}
        value={activeRange}
        onValueChange={onChange}
        className="my-3"
      />

      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>Minimum</span>
        <span>Maximum</span>
      </div>

      <div className="flex justify-between gap-2">
        <div className="w-fit text-center py-2 px-4 rounded-xl border border-gray-200 text-sm text-gray-700">
          {activeRange[0]}
        </div>
        <div className="w-fit text-center py-2 px-4 rounded-xl border border-gray-200 text-sm text-gray-700">
          {activeRange[1]}
        </div>
      </div>
    </div>
  );
};

export default FilterSlider;
