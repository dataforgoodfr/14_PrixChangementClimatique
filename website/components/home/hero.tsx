"use-client";

import { RFButton as Button } from "../core/rf-button";
import StatCallout from "./statCallout";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const Hero: React.FC = () => {
  return (
    <div className="relative  bg-[linear-gradient(to_bottom,#FDF7EE55_10%,#FFF9F377_70%,#FFFFFF_100%),url('/home-background.svg')] px-[16px] pt-[60px] lg:pt-[74px] lg:pr-[88px] lg:pl-[104px]">
      {/* image desktop - absolute position  */}
      <div className="hidden lg:block absolute right-0  top-[70%] -translate-y-1/2 w-[clamp(400px,50vw,771px)] max-h-[70vh]">
        <Image
          src="/carte_score_vulnerabilite.png"
          alt="Map"
          width={735}
          height={746}
          className="w-full"
          unoptimized
        />
        <div className="absolute bottom-0 w-full h-[200px] bg-[linear-gradient(207.6deg,rgba(254,251,247,0)_10.58%,#FFFFFF_52.37%)] blur-[54px]"></div>
      </div>

      <div className=" flex flex-col max-w-[800px] md:items-start m-auto lg:mx-0">
        <div className="flex flex-col gap-[24px] lg:gap-[56px]">
          <h1 className="text-[28px] md:text-[40px]  lg:text-[64px] tracking-[-0.034em] text-rf-green-dark font-[700] leading-[100%]">
            Les communes françaises <br /> face aux évènements <br />
            climatiques extrêmes
          </h1>
          <div className="lg:max-w-[500px]">
            <StatCallout
              value={"1/4"}
              title={{ text: "des", highlight: "communes" }}
              subtitle={
                <p>
                  {
                    "est aujourd'hui trés vulnérable face aux conséquences du changement climatique"
                  }
                </p>
              }
              variant="fullGreen"
            />
          </div>
          <Button
            title="Accéder à la cartographie interactive"
            path="/carte"
            variant="secondary"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          />
        </div>

        <div className="mt-10">
          <div className="lg:hidden relative items:center max-w-[650px] mx-auto">
            <Image
              src="/home-hero-map.svg"
              alt="Map"
              className="w-full"
              width={335}
              height={338}
            />
            <div className="absolute bottom-0 w-full h-[120px] bg-[linear-gradient(207.6deg,rgba(254,251,247,0)_10.58%,#FFFFFF_52.37%)] blur-[54px]"></div>
          </div>

          <div className="relative mt-5 lg:max-w-[550px] lg:mt-[25px]">
            <h2 className="text-[18px] tracking-[-0.034em] font-[700] leading-[100%] text-rf-green-dark md:text-[26px] lg:text-[30px]">
              Pourquoi une
              <span className="mx-1 text-rf-green-light">
                cartographie de vulnérabilité
              </span>
              des communes face aux impacts du
              <span className="mx-1 text-rf-green-light">
                changement climatique ?
              </span>
            </h2>
            <div className="w-[53px] h-[76px] absolute right-[30%]">
              <Image src="/home-arrow.svg" alt="Arrow" width={53} height={76} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
