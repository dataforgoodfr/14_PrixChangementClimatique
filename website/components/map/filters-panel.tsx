"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Panel } from "@/components/core/panel";
import { Button } from "@/components/ui/button";
import { IndicatorStatCard } from "@/components/core/rf-indicator-stat-card";
import { Legend } from "@/components/core/rf-legend";
import { IndicatorSelector } from "@/components/core/rf-indicator-selector";
import { MapZoomControl } from "@/components/core/rf-map-zoom-control";
import type { Map as MaplibreMap } from "maplibre-gl";
import { type IndicatorField, DEFAULT_INDICATOR } from "@/lib/types/indicator";
import { useIndicator } from "@/hooks";
import {
  IndiceVulnerabiliteNiveauIcon,
  ScoreClimatiqueIcon,
  PreventionIcon,
  ScoreEconomiqueIcon,
  ScoreAssuranceIcon,
  type IconComponent,
} from "@/components/icons";
import { VulnerabiliteFilters } from "@/components/filters/kpi-filters/vulnerabilite-filters";
import { ExpositionFilters } from "@/components/filters/kpi-filters/exposition-filters";
import { PreventionFilters } from "@/components/filters/kpi-filters/prevention-filters";
import { EconomiqueFilters } from "@/components/filters/kpi-filters/economique-filters";
import { AssuranceFilters } from "@/components/filters/kpi-filters/assurance-filters";

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
  { value: "score_climatique", label: "Exposition", Icon: ScoreClimatiqueIcon },
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

// ─── Filter components map ────────────────────────────────────────────────────

const FILTER_COMPONENTS: Record<IndicatorField, React.ComponentType> = {
  indice_vulnerabilite_niveau: VulnerabiliteFilters,
  score_climatique: ExpositionFilters,
  prevention: PreventionFilters,
  score_economique: EconomiqueFilters,
  score_assurance: AssuranceFilters,
};

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

  const ActiveFilters = FILTER_COMPONENTS[indicator];

  return (
    <Panel isOpen={isOpen} onClose={onClose} dir="rtl">
      <Panel.Header size="small">
        <Panel.Title size="small">Paramètres</Panel.Title>
      </Panel.Header>

      <Panel.Content>
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-8 shadow-lg/5">
          <IndicatorStatCard label="Communes" value="2 252" total="36 529" />
          <IndicatorStatCard
            label="Habitants concernés"
            value="161 343"
            total="70M"
          />
        </div>

        {/* Indicator selector */}
        <div className="px-4 pt-5 pb-8 border-b-2 border-b-neutral-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Exploration
          </p>
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
          {filtersOpen && <ActiveFilters />}
        </div>
      </Panel.Content>

      <Panel.Footer>
        <Panel.Actions>
          <Button variant="ghost" size="lg">
            Tout effacer
          </Button>
          <Button size="lg" disabled>
            Appliquer les filtres
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
        <Legend />
      </Panel.Controls>
    </Panel>
  );
}
