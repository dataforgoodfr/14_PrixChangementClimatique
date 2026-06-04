import { Panel } from "@/components/core/panel";
import {
  RFCommuneSearchBox,
  SearchCommuneResult,
} from "@/components/core/rf-commune-searchbox";
import { Commune } from "@/lib/types/communes";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { useCallback } from "react";
import { MapPinIcon, UserIcon } from "lucide-react";
import { safeFormatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import { RfVulnerabilityIndex } from "@/components/core/rf-vulnerability-index";
import * as React from "react";
import { RfFranchiseChart } from "@/components/core/rf-franchise-chart";
import { InsuranceEvolutionChart } from "@/components/core/insurance-evolution-chart";
import { SectionTitle } from "@/components/map/section-title";
import { CatNatHistory } from "@/components/map/cat-nat-history";
import { DebtCard } from "@/components/map/debt-card";
import { BudgetCard } from "@/components/map/budget-card";
import { TaxesCard } from "@/components/map/taxes-card";

type ComparisonPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedCommune: Commune | null;
};

function SectionSubtitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <p className={cn("font-medium text-rf-gray-darkest", className)}>{title}</p>
  );
}

function CommuneDescription({ commune }: { commune: Commune }) {
  return (
    <div>
      <p className="text-3xl font-bold text-rf-gray-darkest pb-3">
        {commune.nom_commune}
      </p>
      <div className="flex items-center gap-1 text-rf-gray-light">
        <MapPinIcon className="inline-block size-4" />
        <span>
          {commune.region}, {commune.departement}, {commune.code_departement}
        </span>
      </div>
      <div className="flex items-center gap-1 text-rf-gray-light">
        <UserIcon className="inline-block size-4" />
        <span>{safeFormatNumber(commune.population)} habitants</span>
      </div>
    </div>
  );
}

export function ComparisonPanel({
  isOpen,
  onClose,
  selectedCommune,
}: ComparisonPanelProps) {
  const [compare, setCompare] = useQueryState("comparaison");

  const { data } = useSWR<Commune>(
    compare ? `/api/communes?code=${compare}` : null,
    { keepPreviousData: true },
  );

  const comparedCommune = compare && data ? data : null;

  const selectCompare = useCallback(
    (result: SearchCommuneResult | undefined) => {
      setCompare(result?.code ?? null);
    },
    [setCompare],
  );

  if (!selectedCommune) return;
  return (
    <Panel
      isOpen={isOpen}
      onClose={() => {
        setCompare(null);
        onClose();
      }}
      dir="ltr"
      width={1232}
      zIndex="z-30"
      showCloseButton
    >
      <Panel.Header className="px-4 py-8">
        <div className="w-full grid grid-cols-3 gap-8 items-center">
          <Panel.Title>Comparatif</Panel.Title>
          <RFCommuneSearchBox
            className="grow"
            filterValue={selectedCommune.nom_commune}
            disabled
          />
          <RFCommuneSearchBox
            className="grow"
            filterValue={comparedCommune?.nom_commune}
            onAddressFilter={selectCompare}
            placeholder="Choisissez une commune à comparer"
          />
        </div>
      </Panel.Header>
      {selectedCommune && comparedCommune && (
        <Panel.Content>
          <div className="p-4 grid grid-cols-3 gap-8">
            <SectionTitle title="Villes" />
            <CommuneDescription commune={selectedCommune} />
            <CommuneDescription commune={comparedCommune} />
            <SectionTitle
              title="Facteurs de vulnérabilité"
              className="col-span-3"
            />
            <SectionSubtitle title="Indice de vulnérabilité" />
            {selectedCommune.indice_vulnerabilite_niveau ? (
              <RfVulnerabilityIndex
                mode="continuous"
                value={selectedCommune.indice_vulnerabilite_niveau}
              />
            ) : (
              <div />
            )}
            {comparedCommune.indice_vulnerabilite_niveau ? (
              <RfVulnerabilityIndex
                mode="continuous"
                value={comparedCommune.indice_vulnerabilite_niveau}
              />
            ) : (
              <div />
            )}
            <SectionTitle
              title="Caractéristiques socio-économiques"
              className="col-span-3"
            />
            <SectionSubtitle title="Budget par habitant" />
            <BudgetCard commune={selectedCommune} />
            <BudgetCard commune={comparedCommune} />
            <SectionSubtitle title="Taux d’dendettement" />
            <DebtCard commune={selectedCommune} />
            <DebtCard commune={comparedCommune} />
            <SectionSubtitle title="Impôts locaux" />
            <TaxesCard commune={selectedCommune} />
            <TaxesCard commune={comparedCommune} />
            <SectionTitle
              title="Historique catastrophes naturelles"
              subTitle="Base de données GASPAR"
              className="col-span-3"
            />
            <SectionSubtitle title="Demandes de reconnaissance de l’état de catastrophe naturelle" />
            <CatNatHistory hideTitle communeCode={selectedCommune.code_insee} />
            <CatNatHistory hideTitle communeCode={comparedCommune.code_insee} />
            <SectionSubtitle title="Conditions d’assurance" />
            <InsuranceEvolutionChart data={selectedCommune} />
            <InsuranceEvolutionChart data={comparedCommune} />
            <div />
            {selectedCommune.multiple_franchise_last && (
              <RfFranchiseChart
                size="sm"
                value={selectedCommune.multiple_franchise_last}
              />
            )}
            {comparedCommune.multiple_franchise_last && (
              <RfFranchiseChart
                size="sm"
                value={comparedCommune.multiple_franchise_last}
              />
            )}
          </div>
        </Panel.Content>
      )}
    </Panel>
  );
}
