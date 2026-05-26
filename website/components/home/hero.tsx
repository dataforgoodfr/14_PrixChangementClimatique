import { RFButton as Button } from "../core/rf-button";
import StatCallout from "./statCallout";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const Hero: React.FC = () => {
  return (
    <div className="relative px-[16px] pt-[60px] lg:pt-[74px] lg:pr-[88px] lg:pl-[104px]">
      {/* image desktop - absolute position behind text */}
      <div className="hidden lg:block absolute right-0 top-[10%] -translate-y-1/2 w-[clamp(400px,50vw,771px)] max-h-[10vh] -z-10">
        <Image
          src="/carte_score_vulnerabilite.png"
          alt="Map"
          width={735}
          height={746}
          className="w-full"
          unoptimized
        />
      </div>

      <div className="relative flex flex-col max-w-[800px] md:items-start m-auto lg:mx-0">
        <div className="flex flex-col gap-[24px] lg:gap-[56px] relative z-10">
          <h1 className="text-[28px] md:text-[40px]  lg:text-[64px] tracking-[-0.034em] text-rf-green-dark font-[700] leading-[100%]">
            Les communes françaises <br /> face aux évènements <br />
            climatiques extrêmes
          </h1>
          <div className="lg:max-w-[500px] relative z-10">
            <StatCallout
              value={"1/4"}
              title={{ text: "des", highlight: "communes" }}
              subtitle={
                <p>
                  {
                    "sont aujourd’hui vulnérables face aux conséquences du changement climatiques et au durcissement des conditions d’accès à l’assurance."
                  }
                </p>
              }
              variant="fullGreen"
            />
          </div>
          <Button
            title="Ma commune est-elle vulnérable ?"
            path="/carte"
            variant="secondary"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          />
        </div>

        <div className="mt-10 relative z-10">
          <div className="lg:hidden relative items:center max-w-[650px] mx-auto">
            <Image
              src="/carte_score_vulnerabilite.png"
              alt="Map"
              className="w-full"
              width={335}
              height={338}
            />
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
