import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "À propos | Reclaim Finance",
  description:
    "En savoir plus sur Reclaim Finance et notre mission de lutte contre le changement climatique.",
};

const sectionClass =
  "max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 py-12 flex flex-col gap-6";

const bodyClass =
  "font-sans font-normal text-rf-body text-[14px] md:text-[20px] lg:text-[24px]";

export default function AProposPage() {
  return (
    <main>
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-6 pt-14 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[100%] tracking-[-0.034em] text-[36px] md:text-[48px] lg:text-[64px]">
            À propos
          </h1>
          <p className="font-sans font-normal text-rf-subtitle text-[18px] md:text-[24px] leading-[120%] tracking-[-0.034em]">
            Sous-titre qui introduit les informations affichées sur cet écran
          </p>
        </div>
      </section>

      {/* ── 2. INTRODUCTION ── */}
      <section className={sectionClass}>
        <p className={bodyClass}>
          Face à l&apos;intensification des évènements climatiques extrêmes, les
          communes françaises sont de plus en plus exposées au risque de
          catastrophes naturelles. S&apos;ajoutant à cette pression croissante,
          les collectivités voient leur assurabilité se dégrader petit à
          petit&nbsp;: hausse des primes, hausses des franchises, ou encore
          résiliation unilatérale de leur contrat par leur assureur.
        </p>
        <p className={bodyClass}>
          Reclaim Finance et Data for Good ont donc souhaité travailler ensemble
          à un projet inédit de cartographie permettant de visualiser ces
          difficultés sur l&apos;ensemble du territoire français.
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
          src="/logo-rf.svg"
          alt="Reclaim Finance"
          width={200}
          height={56}
          className="h-12 w-auto object-contain object-left"
        />
        <p className={bodyClass}>
          Reclaim Finance est une ONG de recherche et de plaidoyer 100 % dédiée
          aux questions liant finance, justice sociale et climatique. Fondée en
          2020, Reclaim Finance s'est rapidement imposée comme une référence sur
          les enjeux finance/climat auprès d'autres ONG, des journalistes, des
          représentants politiques, des responsables gouvernementaux et des
          parties prenantes du secteur financier.
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
    </main>
  );
}
