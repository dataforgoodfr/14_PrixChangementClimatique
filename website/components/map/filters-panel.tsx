"use client";

import { SlidersHorizontal } from "lucide-react";
import { Panel } from "@/components/core/panel";
import { SkeletonFilter } from "@/components/core/skeleton";

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
        <SkeletonFilter />
        <SkeletonFilter />
        <SkeletonFilter />
      </Panel.Content>

      <Panel.Footer>
        <Panel.Actions>
          <button
            onClick={clearAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Tout effacer
          </button>
          <button className="bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-green-800 transition-colors">
            Afficher 1000 communes
          </button>
        </Panel.Actions>
      </Panel.Footer>

      <Panel.Controls>
        <button
          onClick={onToggle}
          title={isOpen ? "Fermer les filtres" : "Ouvrir les filtres"}
          className="bg-rf-green-dark hover:bg-rf-green-dark/90 text-white p-2.5 rounded-md shadow-md"
        >
          <SlidersHorizontal size={18} />
        </button>
      </Panel.Controls>
    </Panel>
  );
}
