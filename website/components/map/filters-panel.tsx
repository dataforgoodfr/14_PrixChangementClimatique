"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Panel } from "@/components/core/panel";
import { Button } from "@/components/ui/button";
import { KpiStatCard } from "@/components/core/rf-kpi-stat-card";
import { Legend } from "@/components/core/rf-legend";
import { KPISelector } from "@/components/core/rf-kpi-selector";
import { MapZoomControl } from "@/components/core/rf-map-zoom-control";
import { useMapContext, type KpiField } from "@/contexts/map-context";
import {
  IndiceVulnerabiliteNiveauIcon,
  ScoreGeorisqueIcon,
  IndiceVulnerabiliteIcon,
  ScoreEconomiqueIcon,
  ScoreAssuranceIcon,
  type IconComponent,
} from "@/components/icons";

// ─── KPI options ──────────────────────────────────────────────────────────────

const KPI_OPTIONS: { value: KpiField; label: string; Icon: IconComponent }[] = [
  {
    value: "indice_vulnerabilite_niveau",
    label: "Vulnérabilité",
    Icon: IndiceVulnerabiliteNiveauIcon,
  },
  { value: "score_georisque", label: "Exposition", Icon: ScoreGeorisqueIcon },
  {
    value: "indice_vulnerabilite",
    label: "Prévention",
    Icon: IndiceVulnerabiliteIcon,
  },
  {
    value: "score_economique",
    label: "Situation économique",
    Icon: ScoreEconomiqueIcon,
  },
  { value: "score_assurance", label: "Assurance", Icon: ScoreAssuranceIcon },
];
import { VulnerabiliteFilters } from "@/components/filters/kpi-filters/vulnerabilite-filters";
import { ExpositionFilters } from "@/components/filters/kpi-filters/exposition-filters";
import { PreventionFilters } from "@/components/filters/kpi-filters/prevention-filters";
import { EconomiqueFilters } from "@/components/filters/kpi-filters/economique-filters";
import { AssuranceFilters } from "@/components/filters/kpi-filters/assurance-filters";

// ─── Filter components map ────────────────────────────────────────────────────

const FILTER_COMPONENTS: Record<KpiField, React.ComponentType> = {
  indice_vulnerabilite_niveau: VulnerabiliteFilters,
  score_georisque: ExpositionFilters,
  indice_vulnerabilite: PreventionFilters,
  score_economique: EconomiqueFilters,
  score_assurance: AssuranceFilters,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FiltersPanel({ isOpen, onClose, onToggle }: FiltersPanelProps) {
  const { kpi, setKpi } = useMapContext();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const ActiveFilters = FILTER_COMPONENTS[kpi];

  return (
    <Panel isOpen={isOpen} onClose={onClose} dir="rtl">
      <Panel.Header size="small">
        <Panel.Title size="small">Paramètres</Panel.Title>
      </Panel.Header>

      <Panel.Content>
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-8 shadow-lg/5">
          <KpiStatCard label="Communes" value="2 252" total="36 529" />
          <KpiStatCard
            label="Habitants concernés"
            value="161 343"
            total="70M"
          />
        </div>

        {/* Exploration / KPI selector */}
        <div className="px-4 pt-5 pb-8 border-b-2 border-b-neutral-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Exploration
          </p>
          <div className="grid grid-cols-5 gap-2">
            {KPI_OPTIONS.map(({ value, label, Icon }) => (
              <KPISelector
                key={value}
                label={label}
                icon={Icon}
                active={kpi === value}
                onClick={() => setKpi(value)}
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
            Afficher 2 252 communes
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
          <MapZoomControl />
        </div>
        <Legend />
      </Panel.Controls>
    </Panel>
  );
}
