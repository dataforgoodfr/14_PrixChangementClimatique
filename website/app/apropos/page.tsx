import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "À propos | Assurer ma ville",
  description:
    "En savoir plus sur Reclaim Finance et notre mission de lutte contre le changement climatique.",
};

const sectionClass = "max-w-[1200px] mx-auto px-5 pb-10 flex flex-col gap-6";

const bodyClass = "text-[#7C7AA1] text-lg";

export default function AProposPage() {
  return (
    <main>
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-6 pt-14 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[100%] tracking-[-0.034em] text-4xl  lg:text-6xl">
            À propos
          </h1>
        </div>
      </section>

      {/* ── 2. INTRODUCTION ── */}
      <section className={sectionClass}>
        <p className={bodyClass}>
          La France dispose depuis 1982 d’un régime permettant aux particuliers,
          entreprises et collectivités locales d’être couverts contre les
          risques dits de “catastrophes naturelles”. Malgré ce régime, connu
          pour être l’un des plus protecteurs au monde, les collectivités voient
          leurs conditions d’accès à l’assurance se dégrader (augmentation des
          tarifs, hausse des franchises, difficulté de renouvellement des
          contrats). Dans les cas les plus préoccupants, les communes en
          viennent à assumer seules la réparation des dommages causés par les
          événements climatiques extrêmes, faute d’assureur.
        </p>
        <p className={bodyClass}>
          Pour mieux comprendre la situation des communes françaises, Reclaim
          Finance et Data4Good ont développé une cartographie permettant
          d’évaluer la vulnérabilité des communes françaises aux événements
          climatiques extrêmes.
        </p>
        <p className={bodyClass}>
          Cette cartographie inédite regroupe de nombreuses données publiques
          sur l’exposition des communes françaises aux catastrophes naturelles,
          la mise en place de plans de prévention, leur situation
          socio-économique et leurs contrats d’assurance.
        </p>
      </section>

      {/* ── 3. DATA FOR GOOD ── */}
      <section className={sectionClass}>
        <Image
          src="/logo-d4g.svg"
          alt="Data for Good"
          width={200}
          height={56}
          className="h-12 w-auto object-contain object-left"
        />
        <p className={bodyClass}>
          Data for Good c&apos;est avant tout une communauté de plus de
          8&nbsp;000 bénévoles qui se rassemblent autour de deux modes
          d&apos;action&nbsp;:
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li className={bodyClass}>
            Bâtir&nbsp;: faire des projets concrets, main dans la main avec des
            ONG de terrain.
          </li>
          <li className={bodyClass}>
            Plaidoyer&nbsp;: lutter pour un numérique d&apos;intérêt général, et
            contre une vision hégémonique de la tech.
          </li>
        </ul>
        <p className={bodyClass}>
          Des bénévoles partout en France&nbsp;— Bordeaux, Nantes, Grenoble,
          Paris, Pays Basque, Lille, Lyon, Provence et Toulouse, les antennes
          locales sont bien lancées et se développent aussi en Bretagne, Caen,
          Cherbourg, Chambéry, Montpellier, Nice… Rejoignez les canaux #antenne
          pour rencontrer Data for Good autour de chez vous.
        </p>
        <p className={bodyClass}>
          Déjà plus de 8&nbsp;000&nbsp;— Notre communauté rassemble plus de
          8&nbsp;000 bénévoles qui mettent leurs compétences au service de
          l&apos;intérêt général.
        </p>
      </section>

      {/* ── 4. RECLAIM FINANCE ── */}
      <section className={`${sectionClass} pb-24`}>
        <Image
          src="/Reclaim-Finance.png"
          alt="Reclaim Finance"
          width={300}
          height={173}
          className=""
        />
        <p className={bodyClass}>
          Reclaim Finance est une ONG de recherche et de plaidoyer 100 % dédiée
          aux questions liant finance, justice sociale et climatique. Fondée en
          2020, Reclaim Finance s&apos;est rapidement imposée comme une
          référence sur les enjeux finance/climat auprès d&apos;autres ONG, des
          journalistes, des représentants politiques, des responsables
          gouvernementaux et des parties prenantes du secteur financier.
        </p>
        <p className={bodyClass}>
          Nous poursuivons trois objectifs : mettre fin aux services financiers
          dirigés vers des secteurs intrinsèquement incompatibles avec
          l’objectif de limiter le réchauffement climatique à 1,5 °C ; utiliser
          la finance comme levier pour accélérer la décarbonation des secteurs
          essentiels à la transition ; et transformer en profondeur le
          fonctionnement du secteur financier afin qu’il réponde aux impératifs
          sociaux et environnementaux.
        </p>
        <p className={bodyClass}>
          Notre équipe, composée d’environ quarante personnes, est présente en
          France, à Berlin, Bristol, Amsterdam, Singapour et San Francisco.
        </p>
      </section>
      <Footer />
    </main>
  );
}
