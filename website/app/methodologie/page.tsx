import type { Metadata } from "next";
import SectionTitle from "@/components/home/section-title";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Méthodologie | Assurer ma ville",
  description:
    "Découvrez la méthodologie d'analyse des risques climatiques utilisée par Reclaim Finance.",
};

const sectionClass = "max-w-[1200px] mx-auto px-5 pb-10 flex flex-col gap-6";
const bodyClass = "text-rf-body text-lg leading-relaxed";
const h2Class =
  "font-sans font-bold text-rf-green-dark text-2xl lg:text-3xl mt-2";
const h3Class = "font-sans font-semibold text-rf-green-dark text-xl";
const ulClass = "list-disc pl-6 flex flex-col gap-1 text-rf-body text-lg";

function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-rf-green-dark underline underline-offset-2 hover:text-rf-green-light transition-colors break-all"
    >
      {children}
    </a>
  );
}

export default function MethodologiePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-6 pt-14 pb-24">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[110%] tracking-[0] text-4xl lg:text-6xl">
            Méthodologie
          </h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className={`${sectionClass} pt-10`}>
        <p className={bodyClass}>
          Reclaim Finance et Data for Good ont créé un indice de vulnérabilité
          des communes françaises face aux risques climatiques et assurantiels.
          Cet indice repose sur 4 piliers : Exposition aux catastrophes
          naturelles, Prévention, Situation économique et Assurance.
        </p>
        <div>
          <a
            href="/methodologie.pdf"
            target="_blank"
            className="inline-flex items-center gap-2 bg-rf-green-dark text-rf-lime font-semibold text-lg px-6 py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 shrink-0"
            >
              <path d="M12 15V3" />
              <path d="m8 11 4 4 4-4" />
              <path d="M20 21H4" />
            </svg>
            Découvrir la méthodologie complète
          </a>
        </div>
      </section>

      {/* ── PILIER 1 : EXPOSITION ── */}
      <section className={sectionClass}>
        <h2 className={h2Class}>Exposition aux catastrophes naturelles</h2>
        <p className={bodyClass}>
          Ce premier pilier mesure l'exposition d'une commune face aux aléas
          climatiques définis dans le cadre du régime Cat-Nat français.
        </p>
        <p className={bodyClass}>
          Le calcul du score de vulnérabilité aux catastrophes naturelles repose
          sur :
        </p>
        <ul className={ulClass}>
          <li>
            Un score de vulnérabilité à la sécheresse (retrait gonflement des
            argiles)
          </li>
          <li>Un score de vulnérabilité aux inondations</li>
          <li>
            Le nombre d'arrêtés Cat-Nat total (hors sécheresse et inondation)
          </li>
        </ul>

        <h3 className={h3Class}>
          Calcul du score de vulnérabilité à la sécheresse
        </h3>
        <p className={bodyClass}>
          Le calcul du score de vulnérabilité à la sécheresse prend en compte 1.
          le nombre de jours (en 2050) cumulés par an avec un indice d'humidité
          des sols particulièrement faible (SWI&lt;0,4), 2. le nombre d'arrêtés
          de catastrophes naturelles "sécheresse" enregistrés pour la commune et
          3. un indice de risque calculé à partir de l'exposition théorique de
          chaque maison de la commune au risque de retrait gonflement des
          argiles.
        </p>

        <h3 className={h3Class}>
          Calcul du score de vulnérabilité aux inondations
        </h3>
        <p className={bodyClass}>
          Le calcul du score de vulnérabilité aux inondations prend en compte 1.
          le nombre de jours (en 2050) cumulés par an avec un indice de
          précipitation élevé (&gt;50mm), 2. le nombre d'arrêtés de catastrophes
          naturelles "inondation" enregistrés pour la commune et 3. un indice de
          risque calculé à partir de l'exposition théorique de chaque bâtiment
          de la commune au risque d'inondation.
        </p>

        <h3 className={h3Class}>
          Calcul du score final d'exposition aux catastrophes naturelles
        </h3>
        <p className={bodyClass}>
          Pour chaque commune, ces trois métriques sont agrégées pour obtenir un
          score d'exposition aux évènements climatiques extrêmes. Au final, plus
          une commune est exposée au risque de catastrophes naturelles
          (sécheresse, inondations, autre), plus son score est élevé.
        </p>
        <p className={bodyClass}>
          Les communes dans les territoires dits d'outre-mer, le score est
          calculé uniquement en fonction du score de vulnérabilité aux
          inondations et du nombre d'arrêtés Cat-Nat total (score de
          vulnérabilité aux RGA non calculé).
        </p>

        <h3 className={h3Class}>Sources des données utilisées</h3>
        <ul className={ulClass}>
          <li>
            <SourceLink href="https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/">
              Liste des arrêtés de catastrophes naturelles consultables sur
              ccr.fr
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.drias-climat.fr/drias_prod/accueil/okapiWebDrias/index.jsp?iddrias=climat">
              Scénario d'évolutions climatiques à 2050 mis à disposition par
              Météo France sur le portail DRIAS (2026-03)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.georisques.gouv.fr/donnees/bases-de-donnees/retrait-gonflement-des-argiles-version-2026">
              Exposition des zones géographique aux risques de
              retrait-gonflement des argiles (RGA) disponible sur la base
              nationale Géorisques (2026)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.data.gouv.fr/datasets/territoire-a-risque-dinondation-tri-du-sig-directive-inondation-france-metropolitaine-rapportage-2020-241">
              Exposition des zones géographiques aux risques d'inondation (2020)
              sur data.gouv.fr
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.data.gouv.fr/api/1/datasets/r/ad4bb2f6-0f40-46d2-a636-8d2604532f74">
              Base de données nationale des bâtiments (2025-07) sur data.gouv.fr
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson">
              Référentiel géographique des communes françaises Opendatasoft
            </SourceLink>
          </li>
        </ul>
      </section>

      {/* ── PILIER 2 : PRÉVENTION ── */}
      <section className={sectionClass}>
        <h2 className={h2Class}>Prévention</h2>
        <p className={bodyClass}>
          En France, certaines communes disposent d'un plan de prévention des
          risques naturels (PPRN). Il s'agit d'un document réalisé par les
          services de l'État et élaboré sous la responsabilité du préfet. Les
          PPRN sont élaborés sur des communes qui présentent une vulnérabilité
          importante vis-à-vis des risques naturels. L'objet du PPRN est
          d'identifier les risques prévisibles qui constituent une menace pour
          la population et les biens, de délimiter les zones exposées
          directement ou indirectement à ces risques, d'y réglementer
          l'utilisation des sols et de déterminer les mesures de construction
          applicables (
          <SourceLink href="https://www.manche.gouv.fr/contenu/telechargement/52805/364972/file/plaquette_PPRN.pdf">
            Pour en savoir plus
          </SourceLink>
          ).
        </p>
        <p className={bodyClass}>
          Afin de tenir compte de la prévention, qui reste l'outil principal des
          communes pour réduire leur vulnérabilité aux risques climatiques, le
          score de vulnérabilité aux catastrophes naturelles (inondations et
          RGA) de chaque commune à été ajusté en fonction de l'existence d'un
          PPRN sur son territoire. Cet ajustement dépend notamment de la date de
          mise en place du PPRN.
        </p>

        <h3 className={h3Class}>Sources des données utilisées</h3>
        <ul className={ulClass}>
          <li>
            <SourceLink href="http://files.georisques.fr/GASPAR/gaspar.zip">
              Fichier PPRN de la base nationale GASPAR (Gestion ASsistée des
              Procédures Administratives relatives aux Risques) (2025-12)
            </SourceLink>
          </li>
        </ul>
      </section>

      {/* ── PILIER 3 : SITUATION ÉCONOMIQUE ── */}
      <section className={sectionClass}>
        <h2 className={h2Class}>Situation économique</h2>
        <p className={bodyClass}>
          Ce pilier mesure la capacité des communes à faire face aux risques
          climatiques, ainsi qu'à mettre en place des mesures collectives de
          prévention.
        </p>
        <p className={bodyClass}>Le calcul du score économique repose sur :</p>
        <ul className={ulClass}>
          <li>Le montant des dépenses de la commune par habitant.</li>
          <li>L'endettement de la commune par rapport à ses dépenses.</li>
        </ul>
        <p className={bodyClass}>
          Ces deux métriques permettent d'avoir un score de premier niveau de la
          capacité financière des communes à faire face aux risques climatiques,
          tant sur le plan de la réparation des dommages que de la prévention de
          ces risques.
        </p>

        <h3 className={h3Class}>Sources des données utilisées</h3>
        <ul className={ulClass}>
          <li>
            <SourceLink href="https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024">
              Balance comptable des communes mise à disposition par le Ministère
              de l'Economie et des Finances (années 2022 à 2024)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.data.gouv.fr/datasets/population-municipale-des-communes-france-entiere">
              Population municipale des communes françaises (2026-01) sur
              data.gouv.fr
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.insee.fr/fr/statistiques/5392668?sommaire=2120838">
              Populations de référence de Mayotte sur le site de l'INSEE
            </SourceLink>
          </li>
        </ul>
      </section>

      {/* ── PILIER 4 : ASSURANCE ── */}
      <section className={sectionClass}>
        <h2 className={h2Class}>Assurance</h2>
        <p className={bodyClass}>
          Ce dernier pilier mesure l'exposition des communes à la dégradation
          des conditions d'assurance multirisques en France.
        </p>
        <p className={bodyClass}>Le calcul du score assurance repose sur :</p>
        <ul className={ulClass}>
          <li>
            La part des dépenses d'assurance multirisques (compte 6161 de la
            balance comptable) dans le budget de la commune,
          </li>
          <li>
            L'augmentation des dépenses d'assurance multirisques (compte 6161 de
            la balance comptable) des communes entre 2020 et 2024,
          </li>
          <li>La franchise légale Cat-Nat en vigueur,</li>
          <li>
            La part des arrêtés demandés par la commune et non reconnus par
            l'État.
          </li>
        </ul>

        <h3 className={h3Class}>Sources des données utilisées</h3>
        <ul className={ulClass}>
          <li>
            <SourceLink href="https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024">
              Balance comptable des communes mise à disposition par le Ministère
              de l'Economie et des Finances (années 2020 à 2024)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/">
              Liste des arrêtés de catastrophes naturelles consultables sur
              ccr.fr
            </SourceLink>
          </li>
        </ul>
      </section>

      {/* ── CALCUL DE L'INDICE ── */}
      <section className={`${sectionClass} mb-16`}>
        <h2 className={h2Class}>Calcul de l'indice de vulnérabilité</h2>
        <p className={`${bodyClass} font-semibold`}>
          L'indice de vulnérabilité final combine les trois sous-scores en
          accordant un poids de 50 % au score d'exposition (incluant le bonus
          prévention si nécessaire), 40 % au score de vulnérabilité
          assurantielle et 10 % au score de vulnérabilité économique. Cette
          pondération reflète l'hypothèse selon laquelle la vulnérabilité d'une
          commune dépend avant tout de son niveau d'exposition aux évènements
          climatiques extrêmes et de sa situation assurantielle, tout en tenant
          compte de sa capacité financière à absorber les conséquences de ces
          risques. Le score obtenu est enfin ramené sur une échelle comprise
          entre 0 et 5 afin de faciliter les comparaisons entre communes.
        </p>

        <p className={bodyClass}>
          Les catégories de vulnérabilité sont les suivantes :
        </p>
        <ul className="flex flex-col gap-2">
          {[
            {
              range: "0 – 1",
              cat: "1",
              label: "Commune très peu vulnérable",
              color: "bg-rf-vulnerability-level-1",
            },
            {
              range: "1 – 2",
              cat: "2",
              label: "Commune peu vulnérable",
              color: "bg-rf-vulnerability-level-2",
            },
            {
              range: "2 – 3",
              cat: "3",
              label: "Commune vulnérable",
              color: "bg-rf-vulnerability-level-3",
            },
            {
              range: "3 – 4",
              cat: "4",
              label: "Commune très vulnérable",
              color: "bg-rf-vulnerability-level-4",
            },
            {
              range: "4 – 5",
              cat: "5",
              label: "Commune très fortement vulnérable",
              color: "bg-rf-vulnerability-level-5",
            },
          ].map(({ range, cat, label, color }) => (
            <li key={cat} className="flex items-center gap-3">
              <span className={`${color} w-4 h-4 rounded-full shrink-0`} />
              <span className="text-rf-body text-lg">
                Score entre {range} :{" "}
                <span className="font-semibold text-rf-green-dark">
                  Catégorie {cat}
                </span>{" "}
                "{label}"
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
