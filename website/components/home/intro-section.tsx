import SectionTitle from "./section-title";
import { RFButton } from "@/components/core/rf-button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import {
  VulnerabiliteIcon,
  ExpositionIcon,
  PreventionIcon,
  EconomiqueIcon,
  AssuranceIcon,
  type IconComponent,
} from "@/components/icons";

type DimensionItem = {
  label: string;
  icon: IconComponent;
  active?: boolean;
};

const dimensions: DimensionItem[] = [
  {
    label: "Vulnérabilité",
    icon: VulnerabiliteIcon,
    active: true,
  },
  {
    label: "Exposition",
    icon: ExpositionIcon,
  },
  {
    label: "Prévention",
    icon: PreventionIcon,
  },
  {
    label: "Situation\néconomique",
    icon: EconomiqueIcon,
  },
  {
    label: "Assurance",
    icon: AssuranceIcon,
  },
];

const IntroSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-[40px] w-full px-[16px] lg:px-[104px] pt-[40px] pb-[72px]">
      {/* Titre + description */}
      <div className="flex flex-col gap-[20px]">
        <p className="text-[13px] md:text-[15px] lg:text-[16px] text-[#7C7AA1] font-[400]">
          <span className="mx-1 text-rf-green-light font-[700]">
            Le territoire français subit depuis plusieurs années la hausse de la
            fréquence et de l’intensité des événements climatiques extrêmes.
          </span>
          <br />
          Les communes françaises sont en première ligne et voient naître de
          nouvelles difficultés, notamment pour s’assurer contre ces phénomènes.
          Pour mieux comprendre la vulnérabilité des communes française, Reclaim
          Finance et Data4good ont développé un{" "}
          <span className="font-[700]">indice de vulnérabilité</span> reposant
          sur quatre facteurs: Exposition aux évènements climatiques extrêmes,
          prévention des risques, situation économique et dépenses d’assurance.
        </p>
      </div>

      {/* Les 5 dimensions */}
      <div className="flex flex-wrap justify-center gap-[24px]">
        {dimensions.map((dim, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-[12px] lg:gap-[16px]"
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-[20px] w-[70px] h-[70px] lg:w-[90px] lg:h-[90px] border-2",
                dim.active ? "border-rf-green-dark" : "border-[#E0DFF0]",
              )}
            >
              <dim.icon
                color={
                  dim.active
                    ? "var(--color-rf-green-light)"
                    : "var(--color-rf-gray-light)"
                }
                className="w-9 h-9 lg:w-12 lg:h-12"
              />
            </div>
            <span
              className={cn(
                "text-[12px] lg:text-[16px] text-center font-[600] whitespace-pre-line",
                dim.active ? "text-rf-green-dark" : "text-[#9E9DB8]",
              )}
            >
              {dim.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bas de section : texte + CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          <p className="text-[13px] md:text-[15px] text-[#7C7AA1] font-[400] lg:max-w-[700px]">
            “Assurer ma ville” est une cartographie pensée comme un outil pour
            les élus locaux et leurs citoyens. Cet outil offre une vision locale
            et nationale des difficultés vécues par les communes françaises face
            aux impacts des évènements climatiques extrêmes.
          </p>
          <p className="text-[13px] md:text-[15px] text-[#7C7AA1] font-[400] lg:max-w-[700px]">
            Incluant pour la première fois les dépenses d’assurance des
            communes, cette cartographie illustre la nécessité de se mobiliser
            pour protéger les communes françaises et leur permettre d’accéder à
            des conditions d’assurance justes et abordables.
          </p>
          <p className="text-[13px] md:text-[15px] text-[#7C7AA1] font-[700] lg:max-w-[700px]">
            Citoyens, élus locaux, chacun peut agir. Reclaim Finance en fait une
            de ses priorités. Rejoignez l’initiative pour en savoir plus et
            agir.{" "}
            <span className="mx-1 text-rf-green-light font-[700]">
              Mobilisons-nous !
            </span>
          </p>
        </div>
        <RFButton
          title="Agissez pour protéger votre commune"
          path="/#contact"
          variant="secondary"
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        />
      </div>
    </div>
  );
};

export default IntroSection;
