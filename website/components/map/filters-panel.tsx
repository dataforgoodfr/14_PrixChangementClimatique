"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Panel } from "@/components/core/panel";
import { Button } from "@/components/ui/button";

import { IndicatorSelector } from "@/components/core/rf-indicator-selector";
import { MapZoomControl } from "@/components/core/rf-map-zoom-control";
import type { Map as MaplibreMap } from "maplibre-gl";
import { type IndicatorField, DEFAULT_INDICATOR } from "@/lib/types/indicator";
import { useIndicator } from "@/hooks";
import {
  IndiceVulnerabiliteNiveauIcon,
  ScoreExpositionIcon,
  PreventionIcon,
  ScoreEconomiqueIcon,
  ScoreAssuranceIcon,
  type IconComponent,
} from "@/components/icons";
import { ChartRangeFilter } from "@/components/filters/chart-range-filter";
import { VulnerabiliteRangeFilter } from "@/components/filters/vulnerability-filter";
import { ToggleFilter } from "@/components/filters/toggle-filter";
import {
  FilterRangeKey,
  FilterToggleKey,
} from "@/lib/types/filters/filters-actions";
import { useFilters } from "@/components/filters/filter-context";
import { FilterActionType } from "@/lib/types/filters/filters-actions";

// ─── Indicator options ────────────────────────────────────────────────────────

const INDICATOR_OPTIONS: {
  value: IndicatorField;
  label: string;
  Icon: IconComponent;
}[] = [
  {
    value: DEFAULT_INDICATOR,
    label: "Vulnérabilité",
    Icon: IndiceVulnerabiliteNiveauIcon,
  },
  { value: "score_exposition", label: "Exposition", Icon: ScoreExpositionIcon },
  {
    value: "prevention",
    label: "Prévention",
    Icon: PreventionIcon,
  },
  {
    value: "score_economique",
    label: "Situation économique",
    Icon: ScoreEconomiqueIcon,
  },
  { value: "score_assurance", label: "Assurance", Icon: ScoreAssuranceIcon },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  map?: MaplibreMap;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FiltersPanel({
  isOpen,
  onClose,
  onToggle,
  map,
}: FiltersPanelProps) {
  const [indicator, setIndicator] = useIndicator();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const { dispatch } = useFilters();

  function handleReset() {
    dispatch({ type: FilterActionType.RESET });
    setResetKey((k) => k + 1);
  }

  return (
    <Panel isOpen={isOpen} onClose={onClose} dir="rtl">
      <Panel.Header size="small">
        <Panel.Title size="small">Paramètres</Panel.Title>
      </Panel.Header>

      <Panel.Content>
        {/* Stat cards */}
        {/*<div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-8 shadow-lg/5">*/}
        {/*  <IndicatorStatCard label="Communes" value="2 252" total="36 529" />*/}
        {/*  <IndicatorStatCard*/}
        {/*    label="Habitants concernés"*/}
        {/*    value="161 343"*/}
        {/*    total="70M"*/}
        {/*  />*/}
        {/*</div>*/}

        {/* Indicator selector */}
        <div className="px-4 pt-5 pb-8 border-b-2 border-b-neutral-100">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-gray-700">Exploration</p>
            <a
              href="/methodologie"
              className="text-xs text-blue-700 hover:underline"
            >
              Lire la méthodologie
            </a>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {INDICATOR_OPTIONS.map(({ value, label, Icon }) => (
              <IndicatorSelector
                key={value}
                label={label}
                icon={Icon}
                active={indicator === value}
                onClick={() => setIndicator(value)}
              />
            ))}
          </div>
        </div>

        {/* Filters accordion */}
        <div className="px-4 pt-5 bg-neutral-50 h-full">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 mb-2"
          >
            <span>Filtres :</span>
            {filtersOpen ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>
          {filtersOpen && (
            <div key={resetKey} className="py-2 text-sm text-gray-400">
              <VulnerabiliteRangeFilter />
              <ChartRangeFilter
                title="Nombre d'habitants"
                filterKey={FilterRangeKey.POPULATION}
                step={500}
              />
              <ChartRangeFilter
                title="Exposition au retrait-gonflement des argiles"
                filterKey={FilterRangeKey.INDICATEUR_RGA}
                step={0.01}
              />
              <ChartRangeFilter
                title="Exposition aux inondations"
                filterKey={FilterRangeKey.INDICATEUR_TRI}
                step={0.01}
              />
              <ChartRangeFilter
                title="Arrêtés CatNat reconnus"
                filterKey={FilterRangeKey.NB_TOTAL_ARRETES_RECON}
                step={1}
              />
              <div className="px-4 pb-4 border-b border-gray-200">
                <ToggleFilter
                  label="Plan de prévention RGA (PPRN)"
                  filterKey={FilterToggleKey.PPRN_RGA}
                />
                <ToggleFilter
                  label="Plan de prévention inondation (PPRN)"
                  filterKey={FilterToggleKey.PPRN_INO}
                />
              </div>
              <ChartRangeFilter
                title="Budget par habitant (€)"
                filterKey={FilterRangeKey.DEPENSES_PER_POP}
                step={100}
                caption="Budget par habitant en 2024, calculé à partir du budget de fonctionnement annuel de la commune, divisé par le nombre d’habitants (€)"
              />
              <ChartRangeFilter
                title="Taux d’endettement (%)"
                filterKey={FilterRangeKey.TAUX_ENDETTEMENT}
                step={1}
                caption="Taux d'endettement de la commune en 2024, permettant d’évaluer la dette de la commune en fonction de son budget de fonctionnement annuel (%)"
              />
              <ChartRangeFilter
                title="Impôts locaux (€)"
                filterKey={FilterRangeKey.IMPOTS_LOCAUX_2024}
                caption="Impôts locaux collectés par la commune auprès de ses habitants en 2024 (€)"
                step={100_000}
              />
              <ChartRangeFilter
                title="Évolution des impôts locaux (%)"
                filterKey={FilterRangeKey.IMPOTS_LOCAUX_EVOLUTION}
                step={0.1}
                caption="Évolution des impôts locaux collectés par la commune auprès de ses habitants entre 2020 et 2024 (%)"
              />
              <ChartRangeFilter
                title="Prime d'assurance (€)"
                filterKey={FilterRangeKey.PRIME_ASSURANCE_2024}
                step={1_000}
                caption="Primes d'assurance multirisques payées par la commune en 2024 (€)"
              />
              <ChartRangeFilter
                title="Évolution des primes d'assurance (%)"
                filterKey={FilterRangeKey.TAUX_EVOLUTION_PRIME_ASSURANCE}
                caption="Évolution des primes d'assurance multirisques payées par la commune entre 2020 et 2024 (%)"
                step={1}
              />
              <ChartRangeFilter
                title="Part des primes dans le budget (%)"
                filterKey={FilterRangeKey.PART_PRIME_BUDGET_2024}
                step={0.001}
                caption="Part des primes d'assurance multirisques dans le budget de fonctionnement annuel de la commune en 2024 (%)"
              />
            </div>
          )}
        </div>
      </Panel.Content>

      <Panel.Footer>
        <Panel.Actions>
          <Button
            variant="secondary"
            size="lg"
            className="w-full cursor-pointer"
            onClick={handleReset}
          >
            Effacer les filtres
          </Button>
        </Panel.Actions>
      </Panel.Footer>

      <Panel.Controls>
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={onToggle}
            title={isOpen ? "Fermer les paramètres" : "Ouvrir les paramètres"}
            size="icon-lg"
            className="h-10 w-10"
          >
            <SlidersHorizontal className="size-5" />
          </Button>
          <MapZoomControl map={map} />
        </div>
      </Panel.Controls>
    </Panel>
  );
}
