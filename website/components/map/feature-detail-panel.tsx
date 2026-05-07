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
      <Panel.Header className="flex flex-col gap-4 relative md:min-h-72 bg-panel-header">
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
        {selectedCommune?.indice_vulnerabilite_niveau && (
          <RfVulnerabilityIndex
            className="hidden md:block absolute w-70 h-60 right-8 top-8"
            value={selectedCommune.indice_vulnerabilite_niveau}
            mode="discrete"
          />
        )}
      </Panel.Header>

      <Panel.Content>
        {selectedCommune && (
          <div className="space-y-10 mt-10">
            <VulnerabilityFactors commune={selectedCommune} />
            <div className="space-y-10 p-4">
              {selectedCommune?.indice_vulnerabilite_niveau && (
                <RfVulnerabilityIndex
                  className="block md:hidden"
                  value={selectedCommune.indice_vulnerabilite_niveau}
                  mode="discrete"
                />
              )}
              <EconomicalSituation selectedCommuneData={selectedCommune} />
              <CatNatHistory communeCode={commune} />
              <InsuranceCoverage selectedCommuneData={selectedCommune} />
            </div>
          </div>
        )}
      </Panel.Content>
    </Panel>
  );
}
