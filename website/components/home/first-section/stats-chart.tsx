import { InfoIcon } from "lucide-react";
import Image from "next/image";

type Props = {
  caption: string;
  url: string;
  alt: string;
};

const YearsScale = () => {
  const years = [1982, 1990, 1997, 2004, 2011, 2018, 2025];

  return (
    <div className="w-full max-w-[700px] lg:max-w-[1200px]">
      <div className="flex justify-between font-bold text-xs lg:text-sm text-gray-700">
        {years.map((year) => (
          <span key={year}>{year}</span>
        ))}
      </div>
    </div>
  );
};

const StatsChart: React.FC<Props> = ({ caption, url, alt }) => {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex gap-[8px]">
        <span className="text-[14px] lg:text-[24px]">{caption}</span>
        <span>
          <InfoIcon size={16} color="grey" />
        </span>
      </div>
      <div className="flex flex-col gap-[8px]">
        <Image
          src={url}
          alt={alt}
          width={1200}
          height={163}
          className="w-full max-w-[700px] lg:max-w-[1200px]"
        />
        <YearsScale />
      </div>
    </div>
  );
};

export default StatsChart;
