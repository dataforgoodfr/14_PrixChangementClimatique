import type { Metadata } from "next";
import SectionTitle from "@/components/home/section-title";
import { RFButton } from "@/components/core/rf-button";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Méthodologie | Assurer ma ville",
  description:
    "Découvrez la méthodologie d'analyse des risques climatiques utilisée par Reclaim Finance.",
};

const sectionClass = "px-[16px] lg:px-[104px] flex flex-col gap-6";

const bodyClass = "text-[#7C7AA1] text-lg";

const highlightClass = "text-[#7C7AA1] text-lg font-bold";

const placeholderText1 =
  "Les dépenses d'assurance (primes d'assurance) de Toulouse atteignent X en 2024, soit une évolution de +/- X % depuis 2020. Au niveau national, les dépenses d'assurance des communes françaises ont augmenté de X % entre 2020 et 2024.";

const placeholderText2 =
  "Ces dépenses d'assurance représentent X % du budget annuel de Toulouse. Au niveau national, les dépenses d'assurance des communes françaises représentent X % de leur budget annuel.";

export default function MethodologiePage() {
  return (
    <main>
      {/* ── 1. HERO ── */}
      <section className="overflow-hidden text-center bg-[#FDF7EE] bg-[linear-gradient(to_bottom,#FDF7EE22_10%,#FDF7EE66_60%,#FFFFFF_100%),url('/home-background.svg')] bg-cover bg-top px-[16px] lg:px-[104px] pt-14 pb-24">
        <div className="max-w-[1200px] flex flex-col items-center gap-6">
          <h1 className="font-sans font-bold text-rf-green-dark leading-[110%] tracking-[0] text-4xl  lg:text-6xl">
            Méthodologie
          </h1>
        </div>
      </section>

      {/* ── 2. INTRODUCTION ── */}
      <section className={sectionClass}>
        <p className={bodyClass}>
          Reclaim Finance et Data for Good ont créé un indice de vulnérabilité
          des communes françaises face aux risques climatiques et assurantiels.
          Cet indice repose sur 4 piliers : Exposition aux catastrophes
          naturelles, Prévention, Situation économique et Assurance.
        </p>
        {/* TODO: remplacer par l'URL réelle du PDF */}
        <div className="flex justify-center">
          <RFButton
            title="Télécharger la méthodologie complète"
            path="/methodologie-pcc.pdf"
            variant="secondary"
            icon={<Download className="w-5 h-5" />}
            iconPosition="right"
            download="methodologie-pcc.pdf"
          />
        </div>
      </section>
      <div className="flex flex-col gap-[40px] w-full px-[16px] lg:px-[104px] pt-[40px] mb-[72px]">
        <div className="flex flex-col gap-[20px]">
          <SectionTitle
            highlightVariant="secondary"
            topLine={[
              {
                parts: [{ text: "Exposition aux" }],
              },
            ]}
            bottomLine={[
              {
                highlight: true,
                parts: [{ text: "catastrophes naturelles", bold: true }],
              },
            ]}
          />
          <p className={bodyClass}>
            Ce premier pilier mesure l’exposition d’une commune face aux aléas
            climatiques définis dans le cadre du régime Cat-Nat français.
          </p>
          <p className={bodyClass}>
            Le calcul du score de vulnérabilité aux catastrophes naturelles
            repose sur :
          </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Un score de vulnérabilité à la sécheresse (retrait gonflement des
              argiles)
            </li>
            <li>Un score de vulnérabilité aux inondations</li>
            <li>
              Le nombre d’arrêtés Cat-Nat total (hors sécheresse et inondation)
            </li>
          </ul>
          <p className={highlightClass}>
            Calcul du score de vulnérabilité à la sécheresse :
          </p>
          <p className={bodyClass}>
            Le calcul du score de vulnérabilité à la sécheresse prend en compte
            1. le nombre de jours (en 2050) cumulés par an avec un indice
            d’humidité des sols particulièrement faible (SWI&lt;0,4), 2. le
            nombre d’arrêtés de catastrophes naturelles “sécheresse” enregistrés
            pour la commune et 3. un indice de risque calculé à partir de
            l’exposition théorique de chaque maison de la commune au risque de
            retrait gonflement des argiles.
          </p>
          <p className={highlightClass}>
            Calcul du score de vulnérabilité aux inondations :
          </p>
          <p className={bodyClass}>
            Le calcul du score de vulnérabilité aux inondations prend en compte
            1. le nombre de jours (en 2050) cumulés par an avec un indice de
            précipitation élevé (&gt;50mm), 2. le nombre d’arrêtés de
            catastrophes naturelles “inondation” enregistrés pour la commune et
            3. un indice de risque calculé à partir de l’exposition théorique de
            chaque bâtiment de la commune au risque d’inondation.
          </p>
          <p className={highlightClass}>
            Calcul du score final d’exposition aux catastrophes naturelles :
          </p>
          <p className={bodyClass}>
            Pour chaque commune, ces trois métriques sont agrégées pour obtenir
            un score d’exposition aux évènements climatiques extrêmes. Au final,
            plus une commune est exposée au risque de catastrophes naturelles
            (sécheresse, inondations, autre), plus son score est élevé.
          </p>
          <p className={bodyClass}>
            Les communes dans les territoires dits d’outre-mer, le score est
            calculé uniquement en fonction du score de vulnérabilité aux
            inondations et du nombre d’arrêtés Cat-Nat total (score de
            vulnérabilité aux RGA non calculé).
          </p>
          <p className={highlightClass}>Sources des données utilisées : </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Liste des arrêtés de catastrophes naturelles consultables sur{" "}
              <a
                href="https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/
              </a>{" "}
              et récupérés par l&apos;API de la CCR (2026-02) :{" "}
              <a
                href="https://www.ccr.fr/wp-admin/admin-ajax.php"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.ccr.fr/wp-admin/admin-ajax.php
              </a>
            </li>
            <li>
              Scénario d’évolutions climatiques à 2050 mis à disposition par
              Météo France sur le portail DRIAS (2026-03) :{" "}
              <a
                href="https://www.drias-climat.fr/drias_prod/accueil/okapiWebDrias/index.jsp?iddrias=climat"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.drias-climat.fr/drias_prod/accueil/okapiWebDrias/index.jsp?iddrias=climat
              </a>
            </li>
            <li>
              Exposition des zones géographique aux risques de
              retrait-gonflement des argiles (RGA) disponible sur la base
              nationale Géorisques (2026) :{" "}
              <a
                href="https://www.georisques.gouv.fr/donnees/bases-de-donnees/retrait-gonflement-des-argiles-version-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.georisques.gouv.fr/donnees/bases-de-donnees/retrait-gonflement-des-argiles-version-2026
              </a>
            </li>
            <li>
              Exposition des zones géographique aux risques de
              retrait-gonflement des argiles (RGA) disponible sur la base
              nationale Géorisques (2026) :{" "}
              <a
                href="https://www.georisques.gouv.fr/donnees/bases-de-donnees/retrait-gonflement-des-argiles-version-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.georisques.gouv.fr/donnees/bases-de-donnees/retrait-gonflement-des-argiles-version-2026
              </a>
            </li>
            <li>
              Exposition des zones géographiques aux risques d’inondation (2020)
              :{" "}
              <a
                href="https://www.data.gouv.fr/datasets/territoire-a-risque-dinondation-tri-du-sig-directive-inondation-france-metropolitaine-rapportage-2020-241"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.data.gouv.fr/datasets/territoire-a-risque-dinondation-tri-du-sig-directive-inondation-france-metropolitaine-rapportage-2020-241
              </a>
            </li>
            <li>
              Base de données nationale des bâtiments (2025-07) :{" "}
              <a
                href="https://www.data.gouv.fr/api/1/datasets/r/ad4bb2f6-0f40-46d2-a636-8d2604532f74"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.data.gouv.fr/api/1/datasets/r/ad4bb2f6-0f40-46d2-a636-8d2604532f74
              </a>
            </li>
            <li>
              Référentiel géographique des communes françaises Opendatasoft
              (2026-03) :{" "}
              <a
                href="https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-[20px]">
          <SectionTitle
            highlightVariant="secondary"
            topLine={[]}
            bottomLine={[
              {
                highlight: true,
                parts: [{ text: "Prévention", bold: true }],
              },
            ]}
          />
          <p className={bodyClass}>
            En France, certaines communes disposent d’un plan de prévention des
            risques naturels (PPRN). Il s'agit d'un document réalisé par les
            services de l'État et élaboré sous la responsabilité du préfet. Les
            PPRN sont élaborés sur des communes qui présentent une vulnérabilité
            importante vis-à-vis des risques naturels. L'objet du PPRN est
            d'identifier les risques prévisibles qui constituent une menace pour
            la population et les biens, de délimiter les zones exposées
            directement ou indirectement à ces risques, d'y réglementer
            l'utilisation des sols et de déterminer les mesures de construction
            applicables ({""}
            <a
              href="https://www.manche.gouv.fr/contenu/telechargement/52805/364972/file/plaquette_PPRN.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              pour en savoir plus
            </a>
            )
          </p>
          <p className={bodyClass}>
            Afin de tenir compte de la prévention, qui reste l’outil principal
            des communes pour réduire leur vulnérabilité aux risques
            climatiques, le score de vulnérabilité aux catastrophes naturelles
            (inondations et RGA) de chaque commune à été ajusté en fonction de
            l’existence d’un PPRN sur son territoire. Cet ajustement dépend
            notamment de la date de mise en place du PPRN.
          </p>
          <p className={bodyClass}>Sources des données utilisées :</p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Fichier PPRN de la base nationale GASPAR (Gestion ASsistée des
              Procédures Administratives relatives aux Risques) (2025-12) :{" "}
              <a
                href="http://files.georisques.fr/GASPAR/gaspar.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                http://files.georisques.fr/GASPAR/gaspar.zip
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-[20px]">
          <SectionTitle
            highlightVariant="secondary"
            topLine={[]}
            bottomLine={[
              {
                highlight: true,
                parts: [
                  { text: "Situation " },
                  { text: "économique", bold: true },
                ],
              },
            ]}
          />
          <p className={bodyClass}>
            Ce pilier mesure la capacité des communes à faire face aux risques
            climatiques, ainsi qu’à mettre en place des mesures collectives de
            prévention. Le calcul du score économique repose sur :
          </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>Le montant des dépenses de la commune par habitant.</li>
            <li>L’endettement de la commune par rapport à ses dépenses.</li>
          </ul>
          <p className={bodyClass}>
            Ces deux métriques permettent d’avoir un score de premier niveau de
            la capacité financière des communes à faire face aux risques
            climatiques, tant sur le plan de la réparation des dommages que de
            la prévention de ces risques. Sources des données utilisées :
          </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Balance comptable des communes mise à disposition par le Ministère
              de l’Economie et des Finances (années 2022 à 2024) :{" "}
              <a
                href="https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024
              </a>
            </li>
            <li>
              Base de données gouvernementales / INSEE de la population des
              communes françaises (2026-01) :{" "}
              <a
                href="https://www.data.gouv.fr/api/1/datasets/r/be303501-5c46-48a1-87b4-3d198423ff49"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.data.gouv.fr/api/1/datasets/r/be303501-5c46-48a1-87b4-3d198423ff49
              </a>{" "}
              &amp;{" "}
              <a
                href="https://www.insee.fr/fr/statistiques/5392668?sommaire=2120838"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.insee.fr/fr/statistiques/5392668?sommaire=2120838
              </a>{" "}
              (Mayotte)
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-[20px]">
          <SectionTitle
            highlightVariant="secondary"
            topLine={[]}
            bottomLine={[
              {
                highlight: true,
                parts: [{ text: "Assurance", bold: true }],
              },
            ]}
          />
          <p className={bodyClass}>
            Ce dernier pilier mesure l’exposition des communes à la dégradation
            des conditions d’assurance multirisques en France. Le calcul du
            score assurance repose sur :
          </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              La part des dépenses d’assurance multirisques (compte 6161 de la
              balance comptable) dans le budget de la commune,
            </li>
            <li>
              L’augmentation des dépenses d’assurance multirisques (compte 6161
              de la balance comptable) des communes entre 2020 et 2024,
            </li>
            <li>La franchise légale Cat-Nat en vigueur,</li>
            <li>
              La part des arrêtés demandés par la commune et non reconnus par
              l'État.
            </li>
          </ul>
          <p className={bodyClass}>Sources des données utilisées :</p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Balance comptable des communes mise à disposition par le Ministère
              de l&apos;Economie et des Finances (années 2020 à 2024) :{" "}
              <a
                href="https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://data.economie.gouv.fr/explore/dataset/balances-comptables-des-communes-en-2024
              </a>
            </li>
            <li>
              Liste des arrêtés de catastrophes naturelles consultables sur{" "}
              <a
                href="https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/
              </a>{" "}
              et récupérés par l&apos;API de la CCR (2026-02) :{" "}
              <a
                href="https://www.ccr.fr/wp-admin/admin-ajax.php"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://www.ccr.fr/wp-admin/admin-ajax.php
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-[20px]">
          <SectionTitle
            highlightVariant="secondary"
            topLine={[
              {
                parts: [{ text: "Calcul de" }],
              },
            ]}
            bottomLine={[
              {
                highlight: true,
                parts: [
                  { text: "l’indice de " },
                  { text: "vulnérabilité", bold: true },
                ],
              },
            ]}
          />
          <p className={bodyClass}>
            L’indice de vulnérabilité final combine les trois sous-scores en
            accordant un poids de 50 % au score d’exposition (incluant le bonus
            prévention si nécessaire), 40 % au score de vulnérabilité
            assurantielle et 10 % au score de vulnérabilité économique. Cette
            pondération reflète l’hypothèse selon laquelle la vulnérabilité
            d’une commune dépend avant tout de son niveau d’exposition aux
            évènements climatiques extrêmes et de sa situation assurantielle,
            tout en tenant compte de sa capacité financière à absorber les
            conséquences de ces risques. Le score obtenu est enfin ramené sur
            une échelle comprise entre 0 et 5 afin de faciliter les comparaisons
            entre communes.
          </p>
          <p className={bodyClass}>
            Les catégories de vulnérabilité sont les suivantes :
          </p>
          <ul
            className={`${bodyClass} list-disc list-inside flex flex-col gap-1`}
          >
            <li>
              Score de vulnérabilité entre 0 et 1 : Catégorie 1 &ldquo;Commune
              très peu vulnérable&rdquo;
            </li>
            <li>
              Score de vulnérabilité entre 1 et 2 : Catégorie 2 &ldquo;Commune
              peu vulnérable&rdquo;
            </li>
            <li>
              Score de vulnérabilité entre 2 et 3 : Catégorie 3 &ldquo;Commune
              vulnérable&rdquo;
            </li>
            <li>
              Score de vulnérabilité entre 3 et 4 : Catégorie 4 &ldquo;Commune
              très vulnérable&rdquo;
            </li>
            <li>
              Score de vulnérabilité entre 4 et 5 : Catégorie 5 &ldquo;Commune
              très fortement vulnérable&rdquo;
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
