import type { Metadata } from "next";
import SectionTitle from "@/components/home/section-title";

export const metadata: Metadata = {
  title: "Méthodologie | Assurer ma ville",
  description:
    "Découvrez la méthodologie d'analyse des risques climatiques utilisée par Reclaim Finance.",
};

const sectionClass = "max-w-[1200px] mx-auto px-5 pb-10 flex flex-col gap-6";

const bodyClass = "text-[#7C7AA1] text-lg";

const placeholderText1 =
  "Les dépenses d'assurance (primes d'assurance) de Toulouse atteignent X en 2024, soit une évolution de +/- X % depuis 2020. Au niveau national, les dépenses d'assurance des communes françaises ont augmenté de X % entre 2020 et 2024.";

const placeholderText2 =
  "Ces dépenses d'assurance représentent X % du budget annuel de Toulouse. Au niveau national, les dépenses d'assurance des communes françaises représentent X % de leur budget annuel.";

export default function MethodologiePage() {
  return (
    <main>
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-6 pt-14 pb-24">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[110%] tracking-[0] text-4xl  lg:text-6xl">
            Méthodologie
          </h1>
          <p className="font-sans font-normal text-rf-subtitle text-3xl leading-[120%] tracking-[-0.034em]">
            Disponible le 1er juillet 2026
          </p>
        </div>
      </section>
    </main>
  );
}
