"use-client";
import Image from "next/image";
import Caption from "./caption";

const Map: React.FC = () => {
  return (
    <div className="flex flex-col gap-[16px] w-full min-width-[550px]">
      <div className="flex flex-col gap-[4px] text-center ">
        <p className="text-[14px] md:text-[21px] font-[600] text-white">
          Exposition du territoire métropolitain au retrait-Gonflement des
          argiles (RGA)
        </p>
        <p className="text-[12px] md:text-[16px] text-white/70">
          Corrélation spatiale avec l&apos;existence d&apos;un PPRN
        </p>
      </div>
      <Image
        src={"/home-clays-map.svg"}
        alt={"Retrait gonflement des argiles - Carte"}
        width={331}
        height={340}
        className="w-full max-w-[500px] mx-auto"
      />
      <Caption />
    </div>
  );
};

export default Map;
