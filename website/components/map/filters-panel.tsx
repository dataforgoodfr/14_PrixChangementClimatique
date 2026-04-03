"use client";

import { SlidersHorizontal } from "lucide-react";
import { Panel } from "@/components/core/panel";
import { ChartRangeFilter } from "@/components/filters/chart-range-filter";
import { Button } from "../ui/button";

interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function FiltersPanel({ isOpen, onClose, onToggle }: FiltersPanelProps) {
  const clearAll = () => {
    console.log("clearAll Filters");
  };

  return (
    <Panel isOpen={isOpen} onClose={onClose} dir="rtl">
      <Panel.Header>
        <Panel.Title>Filtres</Panel.Title>
      </Panel.Header>

      <Panel.Content>
        <ChartRangeFilter
          title="Exposition au risque"
          filterMin={0}
          filterMax={100}
        />
      </Panel.Content>

      <Panel.Footer>
        <Panel.Actions>
          <Button onClick={clearAll} variant="ghost" size="lg">
            Tout effacer
          </Button>
          <Button size="lg" disabled>
            Afficher 1000 communes
          </Button>
        </Panel.Actions>
      </Panel.Footer>

      <Panel.Controls>
        <Button
          onClick={onToggle}
          title={isOpen ? "Fermer les filtres" : "Ouvrir les filtres"}
          size="icon-lg"
          // className="bg-rf-green-dark hover:bg-rf-green-dark/90 text-white p-2.5 rounded-md shadow-md"
        >
          <SlidersHorizontal size={18} />
        </Button>
      </Panel.Controls>
    </Panel>
  );
}
