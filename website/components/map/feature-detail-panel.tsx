"use client";

import { Panel } from "@/components/core/panel";
import { RfVulnerabilityIndex } from "@/components/core/rf-vulnerability-index";
import { MapPinIcon, UserIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect } from "react";
import { Commune } from "@/lib/types/communes";
import { CatNatHistory } from "./cat-nat-history";
import { safeFormatNumber } from "@/utils/format";
import { EconomicalSituation } from "./economical-situation";
import { InsuranceCoverage } from "./insurance-coverage";
import { VulnerabilityFactors } from "./vulnerability-factors";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RFButton } from "../core/rf-button";

export function FeatureDetailPanel({
  selectedCommune,
}: {
  selectedCommune: Commune | null;
}) {
  const [commune, setCommune] = useQueryState("commune");

  const onClose = useCallback(() => {
    setCommune(null);
  }, [setCommune]);

  useEffect(() => {
    console.log("selected commune", selectedCommune);
  }, [selectedCommune]);

  return (
    <Panel
      isOpen={!!selectedCommune}
      onClose={onClose}
      dir="ltr"
      width={800}
      zIndex="z-30"
    >
      <Panel.Header className="flex flex-col gap-4 relative py-6 bg-panel-header">
        <div className="w-full">
          <Panel.Title className="pt-24 pb-4">
            {selectedCommune?.nom_commune}
          </Panel.Title>
          <Panel.Subtitle>
            <span className="flex gap-2">
              <MapPinIcon className="inline-block size-6" />
              <span>
                {selectedCommune?.region}, {selectedCommune?.departement},{" "}
                {selectedCommune?.code_departement}
              </span>
            </span>
          </Panel.Subtitle>
          <Panel.Subtitle>
            <span className="flex gap-2 pt-2">
              <UserIcon className="inline-block size-6" />
              <span>
                {safeFormatNumber(selectedCommune?.population)} habitants
              </span>
            </span>
          </Panel.Subtitle>
        </div>
        {selectedCommune?.indice_vulnerabilite_niveau ? (
          <RfVulnerabilityIndex
            className="hidden md:block absolute w-70 right-8 top-8"
            value={selectedCommune.indice_vulnerabilite_niveau}
          />
        ) : (
          <div className="hidden md:block absolute w-70 right-8 top-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Indice de vulnérabilité
                </CardTitle>
                <CardDescription>
                  Certaines données nécessaires au calcul sont manquantes,
                  l'indice de vulnérabilité n'est donc pas disponible pour cette
                  commune.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </Panel.Header>

      <Panel.Content>
        {selectedCommune && (
          <div className="space-y-10 mt-10">
            <div className="space-y-10 p-4">
              {selectedCommune?.indice_vulnerabilite_niveau ? (
                <RfVulnerabilityIndex
                  className="block md:hidden"
                  value={selectedCommune.indice_vulnerabilite_niveau}
                />
              ) : (
                <Card className="block md:hidden w-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Indice de vulnérabilité
                    </CardTitle>
                    <CardDescription>Aucune donnée disponible</CardDescription>
                  </CardHeader>
                </Card>
              )}
              <VulnerabilityFactors commune={selectedCommune} />
              <InsuranceCoverage selectedCommuneData={selectedCommune} />
              <EconomicalSituation selectedCommuneData={selectedCommune} />
              <CatNatHistory communeCode={commune} />
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">
                  Comment nous calculons ?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Reclaim Finance et Data For Good ont calculé un indice de
                  vulnérabilité par commune à partir de données publiques
                  disponibles à la date de réalisation de l&apos;analyse.
                  <br />
                  <br />
                  Certaines informations n&apos;ont pas pu être intégrées au
                  calcul (résiliation de contrat d&apos;assurance, augmentation
                  des franchises, etc.). Par ailleurs, cet indice repose en
                  partie sur des données déclarées par les communes ou
                  collectées auprès de sources publiques. Reclaim Finance et
                  Data For Good ne peuvent être tenus responsables
                  d&apos;éventuelles erreurs, omissions ou imprécisions
                  présentes dans ces données sources.
                  <br />
                  <br />
                  <b>
                    Si l&apos;indice de vulnérabilité calculé ne correspond pas
                    à la situation de votre commune, nous vous invitons à nous
                    contacter afin de partager des informations complémentaires
                    sur votre situation locale.
                  </b>
                </p>
                <RFButton
                  title="Nous contacter"
                  path="/#contact"
                  //variant="secondary"
                />
              </div>
            </div>
          </div>
        )}
      </Panel.Content>
    </Panel>
  );
}
