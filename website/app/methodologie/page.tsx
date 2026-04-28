import type { Metadata } from "next";
import SectionTitle from "@/components/home/section-title";

export const metadata: Metadata = {
  title: "Méthodologie | Reclaim Finance",
  description:
    "Découvrez la méthodologie d'analyse des risques climatiques utilisée par Reclaim Finance.",
};

const sectionClass =
  "max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 py-12 flex flex-col gap-6";

const bodyClass =
  "font-sans font-normal text-[#7C7AA1] text-[14px] md:text-[20px] lg:text-[24px]";

const placeholderText1 =
  "Les dépenses d'assurance (primes d'assurance) de Toulouse atteignent X en 2024, soit une évolution de +/- X % depuis 2020. Au niveau national, les dépenses d'assurance des communes françaises ont augmenté de X % entre 2020 et 2024.";

const placeholderText2 =
  "Ces dépenses d'assurance représentent X % du budget annuel de Toulouse. Au niveau national, les dépenses d'assurance des communes françaises représentent X % de leur budget annuel.";

export default function MethodologiePage() {
  return (
    <main>
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-6 pt-14 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[110%] tracking-[0] text-[36px] md:text-[48px] lg:text-[64px]">
            Méthodologie
          </h1>
          <p className="font-sans font-normal text-rf-subtitle text-[18px] md:text-[24px] leading-[120%] tracking-[-0.034em]">
            Sous-titre qui introduit les informations affichées sur cet écran
          </p>
        </div>
      </section>

      {/* ── 2. EXPOSITION AUX CATASTROPHES NATURELLES ── */}
      <section className={sectionClass}>
        <SectionTitle
          highlightVariant="secondary"
          topLine={[{ parts: [{ text: "Exposition aux" }] }]}
          bottomLine={[
            {
              highlight: true,
              parts: [{ text: "catastrophes naturelles" }],
            },
          ]}
        />
        <p className={bodyClass}>{placeholderText1}</p>
        <p className={bodyClass}>{placeholderText2}</p>
      </section>

      {/* ── 3. PRÉVENTION ── */}
      <section className={sectionClass}>
        <SectionTitle
          highlightVariant="secondary"
          topLine={[{ highlight: true, parts: [{ text: "Prévention" }] }]}
          bottomLine={[]}
        />
        <p className={bodyClass}>{placeholderText1}</p>
        <p className={bodyClass}>{placeholderText2}</p>
      </section>

      {/* ── 4. SITUATION ÉCONOMIQUE ── */}
      <section className={sectionClass}>
        <SectionTitle
          highlightVariant="secondary"
          topLine={[
            { highlight: true, parts: [{ text: "Situation économique" }] },
          ]}
          bottomLine={[]}
        />
        <p className={bodyClass}>{placeholderText1}</p>
        <p className={bodyClass}>{placeholderText2}</p>
      </section>

      {/* ── 5. ASSURANCE ── */}
      <section className={`${sectionClass} pb-24`}>
        <SectionTitle
          highlightVariant="secondary"
          topLine={[{ highlight: true, parts: [{ text: "Assurance" }] }]}
          bottomLine={[]}
        />
        <p className={bodyClass}>{placeholderText1}</p>
        <p className={bodyClass}>{placeholderText2}</p>
      </section>
    </main>
  );
}
