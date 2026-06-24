import SectionTitle from "./section-title";
import { RFButton } from "@/components/core/rf-button";
import { ArrowRight } from "lucide-react";

const ContactSection: React.FC = () => {
  return (
    <section id="contact">
      {/* Header with background pattern */}
      <div className="px-[16px] lg:px-[104px] py-16 bg-[linear-gradient(to_bottom,rgba(200,240,105,0.15)_0%,rgba(255,255,255,0.95)_100%),url('/contact-background.svg')] bg-cover bg-top flex flex-col items-center gap-4 text-center">
        <div className="max-w-[1200px] text-rf-green-dark mx-auto flex flex-col items-center">
          <h1 className="font-sans font-bold leading-[110%] tracking-[0] text-4xl  lg:text-6xl">
            Contactez-nous
          </h1>
          <p className="font-sans font-normal text-3xl leading-[120%] tracking-[-0.034em]">
            pour agir dès maintenant
          </p>
        </div>
        <p className="text-[#4E4E5C] text-lg max-w-[600px]">
          Vous êtes citoyen ou élu, contactez-nous dès maintenant pour en savoir
          plus
        </p>
      </div>

      {/* Content section */}
      <div className="flex flex-col gap-10 px-[16px] lg:px-[104px] pb-12">
        <SectionTitle
          topLine={[
            {
              parts: [{ text: "L'assurabilité des communes" }],
              highlight: true,
            },
          ]}
          bottomLine={[
            {
              parts: [
                { text: "françaises est un " },
                { text: "enjeu national", bold: true },
              ],
            },
          ]}
          highlightVariant="secondary"
        />

        <div className="flex flex-col gap-5 text-lg text-[#7C7AA1]">
          <p>
            Car aujourd&apos;hui, maires, élus et citoyens sont déjà confrontés
            à la dégradation des conditions d&apos;assurance de leur commune
            (augmentation des tarifs, des franchises, résiliations unilatérales,
            appels d&apos;offre sans réponse, etc.).
          </p>
          <p>
            <strong>Reclaim Finance appelle le gouvernement</strong> à mettre en
            place des{" "}
            <strong>solutions d&apos;assurance justes et abordables</strong>{" "}
            pour les collectivités territoriales en France. Pour défendre ces
            solutions auprès du gouvernement et des assureurs français,{" "}
            <strong>nous avons besoin de vous !</strong>
          </p>
          <p>
            <strong>
              Citoyens, maires et élus, chacun peut avoir un impact, alors
              rejoignez l&apos;initiative pour en savoir plus et agir.
            </strong>
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {/* Citoyen card */}
          <div className="bg-rf-green-dark text-white rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
            <SectionTitle
              highlightVariant="primary"
              topLine={[
                {
                  parts: [{ text: "Je suis" }],
                },
              ]}
              bottomLine={[
                {
                  highlight: true,
                  parts: [{ text: "citoyen.ne", bold: true }],
                },
              ]}
            />
            <p className="text-white/80 text-base text-lg leading-relaxed">
              Aidez-nous en partageant la situation de votre commune, et en
              alertant vos élus de notre initiative pour protéger
              l&apos;assurabilité des communes françaises.
            </p>
            <RFButton
              title="Agir maintenant"
              path="/#contact"
              variant="tertiary"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            />
          </div>

          {/* Maire / Élu card */}
          <div className="bg-rf-lime rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
            <SectionTitle
              highlightVariant="tertiary"
              topLine={[
                {
                  parts: [{ text: "Je suis" }],
                },
              ]}
              bottomLine={[
                {
                  highlight: true,
                  parts: [{ text: "maire, élu.e", bold: true }],
                },
              ]}
            />
            <p className="text-rf-green-dark/80 text-lg text-base leading-relaxed">
              Construisons des solutions justes et abordables ensemble, afin de
              protéger l&apos;assurabilité des communes françaises.
            </p>
            <RFButton
              title="Agir maintenant"
              path="/#contact"
              variant="quaternary"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
