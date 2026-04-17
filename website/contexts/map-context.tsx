"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { MapRef } from "@vis.gl/react-maplibre";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapFeature {
  code_insee: string;
  nom_commune?: string;
  departement?: string;
  region?: string;
  code_departement?: string;
  code_region?: string;
  geo_point_2_d?: string;

  // Indices
  score_economique?: number;
  score_georisque?: number;
  score_assurance?: number;
  indice_vulnerabilite?: number;
  indice_vulnerabilite_niveau?: number;

  // TRI / RGA
  indicateur_tri?: number;
  indicateur_rga?: number;

  // Scénario 2050
  swi_04_d_abs?: number;
  rr_50_d_abs?: number;
  pxcwd_abs?: number;
  tx_35_d_abs?: number;

  // Budget
  ratio_dettes_depenses?: number;
  depenses_per_pop?: number;

  // CCR
  nb_total_arretes_recon?: number;
  nb_total_arretes?: number;
  nb_total_arretes_ino?: number;
  nb_total_arretes_sec?: number;
  multiple_franchise_last?: number;

  // Primes assurance
  prime_assurance_2024?: number;
  prime_assurance_2023?: number;
  prime_assurance_2022?: number;
  prime_assurance_2021?: number;
  prime_assurance_2020?: number;

  // PPRN
  pprn_rga?: boolean;
  pprn_ino?: boolean;
  date_approbation_rga?: string;
  date_approbation_ino?: string;

  // Population & ratios
  population?: number;
  part_prime_budget?: number;
  evolution_prime_assurance?: number;
}

type Map = ReturnType<MapRef["getMap"]>;

export interface MapContextValue {
  map: Map | null;
  setMap: (map: Map) => void;
  /** Getter: The city feature the user last clicked on, or null if none. */
  selectedFeature: MapFeature | null;
  /** Setters for the map instance selected feature */
  selectFeature: (properties: MapFeature) => void;
  clearSelectedFeature: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  /** Negative space programming is the way! */
  if (!ctx) throw new Error("useMapContext must be used within <MapProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null,
  );

  const selectFeature = useCallback(
    (properties: MapFeature) => setSelectedFeature(properties),
    [],
  );

  const clearSelectedFeature = useCallback(() => setSelectedFeature(null), []);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        selectedFeature,
        selectFeature,
        clearSelectedFeature,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
