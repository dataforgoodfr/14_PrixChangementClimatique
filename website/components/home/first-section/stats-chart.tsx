"use-client";

import { InfoIcon } from "lucide-react";
import Image from "next/image";

type Props = {
  caption: string;
  url: string;
  alt: string;
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
      <Image
        src={url}
        alt={alt}
        width={1200}
        height={163}
        className="w-full max-w-[700px] lg:max-w-[1200px]"
      />
    </div>
  );
};

export default StatsChart;
