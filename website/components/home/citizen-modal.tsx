"use client";

import { useState } from "react";
import { ArrowRight, Mail, Instagram, Copy, Check, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RFButton } from "@/components/core/rf-button";
import SectionTitle from "./section-title";

const MAIL_TEMPLATE = `Madame la Maire / Monsieur le Maire,

En consultant le site « Assurer ma ville », j'ai découvert que notre commune figure parmi les territoires exposés à des difficultés croissantes en matière d'assurance face aux risques climatiques.

Selon les données présentées sur la plateforme, notre commune obtient un score de vulnérabilité de [SCORE]. Ce score s'appuie notamment sur l'exposition aux catastrophes naturelles, l'évolution des conditions d'assurance des collectivités et leur situation financière.

C'est pourquoi je souhaitais porter cette initiative à votre connaissance et vous inviter à consulter les informations disponibles sur le site : assurermaville.fr.

Cette situation m'interpelle en tant qu'habitant(e). Partout en France, de plus en plus de collectivités font face à des augmentations importantes de primes, à des franchises plus élevées, à des résiliations de contrats ou à des appels d'offres qui ne reçoivent aucune réponse. Ces difficultés peuvent avoir des conséquences directes sur les finances locales et sur la capacité des communes à protéger leurs équipements et services publics.

Reclaim Finance appelle le gouvernement à mettre en place des solutions d'assurance justes et abordables pour les collectivités territoriales. Pour que ces solutions répondent aux réalités du terrain, il est essentiel que les maires et les élus locaux puissent faire entendre leur expérience et leurs besoins.

J'espère que notre commune pourra s'intéresser à cette démarche et, le cas échéant, contribuer aux réflexions visant à garantir un accès durable à l'assurance pour l'ensemble des collectivités.

Je vous remercie pour votre attention et vous prie d'agréer, Madame la Maire / Monsieur le Maire, l'expression de mes salutations respectueuses.

[Nom]
[Commune]
`;

export function CitizenModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MAIL_TEMPLATE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Notre commune est vulnérable");
    const body = encodeURIComponent(MAIL_TEMPLATE);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleInstagram = () => {
    window.open(
      "https://www.instagram.com/reclaimfinance/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <RFButton
        as="button"
        title="Agir maintenant"
        variant="tertiary"
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
        onClick={() => setOpen(true)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-4xl scrollbar-hide gap-0 overflow-hidden overflow-y-auto bg-white p-0 max-h-[90dvh]"
        >
          {/* Header with topographic background */}
          <div className="relative flex flex-col items-center gap-4 bg-[linear-gradient(to_bottom,rgba(200,240,105,0.15)_0%,rgba(255,255,255,0.95)_100%),url('/contact-background.svg')] bg-cover bg-top p-8 text-center">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-8 top-8 text-rf-green-dark transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>

            <DialogTitle className="sr-only">Je suis citoyen.ne</DialogTitle>
            {/* Title — mirrors SectionTitle style but centered */}
            <SectionTitle
              highlightVariant="secondary"
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

            <p className="text-base leading-relaxed text-rf-gray">
              Aidez-nous en alertant sur la situation de votre commune et en
              partageant l&apos;initiative à vos élu·e·s pour protéger
              l&apos;assurabilité des communes françaises
            </p>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8">
            {/* Email card */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rf-green-dark">
                <Mail className="h-8 w-8 text-rf-lime" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-tight text-rf-green-dark">
                  <span className="text-rf-green-light">1.</span> Contacter ma
                  mairie
                </p>
                <p className="text-xs leading-relaxed text-rf-gray-lightest">
                  Aidez-nous en partageant la situation de votre commune
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-gray-200 px-3 py-2 text-xs text-rf-gray transition-colors hover:bg-gray-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
                {copied ? "Copié !" : "Copier le mail type"}
              </button>

              <RFButton
                as="button"
                title="Ecrire un mail"
                variant="quaternary"
                icon={<Mail className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleEmail}
              />
            </div>

            {/* Instagram card */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rf-lime">
                <Instagram className="h-8 w-8 text-rf-green-dark" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-tight text-rf-green-dark">
                  <span className="text-rf-green-light">2.</span> Tagger votre
                  mairie en commentaires
                </p>
                <p className="text-xs leading-relaxed text-rf-gray-lightest">
                  Aidez-nous en partageant la situation de votre commune
                </p>
              </div>

              <div className="mt-auto">
                <RFButton
                  as="button"
                  title="Ouvrir Instagram"
                  variant="quaternary"
                  icon={<Instagram className="h-4 w-4" />}
                  iconPosition="left"
                  onClick={handleInstagram}
                />
              </div>
            </div>
          </div>

          {/* L'affaire du siècle section */}
          {/* TODO: replace logo-assurer-ma-ville.svg with the actual L'affaire du siècle logo once added to /public */}
          <div className="flex flex-col items-center gap-3 px-8 pb-8 text-center">
            <Image
              src="/logo-laffaire-du-siecle.png"
              alt="L'affaire du siècle"
              width={80}
              height={40}
              className="object-contain"
            />
            <p className="text-sm leading-relaxed text-rf-green-dark">
              <strong>Vous vous trouvez dans une commune</strong>{" "}
              particulièrement <strong>exposée ?</strong>
              <br />
              Vérifiez si vous êtes vous-même sinistré-e climatique et
              interpellez l&apos;Etat pour qu&apos;il assure votre protection
            </p>
            <span className="inline-flex cursor-not-allowed items-center px-5 py-2 text-base font-bold text-rf-green-dark opacity-80 bg-rf-lime">
              Disponible le 9 juillet 2026
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
