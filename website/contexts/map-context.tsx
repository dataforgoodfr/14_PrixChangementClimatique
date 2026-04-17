"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type RefObject,
} from "react";
import type { MapRef, ViewState } from "@vis.gl/react-maplibre";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KpiField =
  | "indice_vulnerabilite_niveau"
  | "score_georisque"
  | "indice_vulnerabilite"
  | "score_economique"
  | "score_assurance";

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

export interface MapContextValue {
  /** Ref to maplibre instance (will be usefull for accessing map methods) */
  mapRef: RefObject<MapRef | null>;
  /** view state for the map instance (lng, lat, zoom, bearing, pitch) */
  viewState: ViewState;
  /** Setter for the map instance view state  */
  setViewState: (vs: ViewState) => void;
  /** Getter: The city feature the user last clicked on, or null if none. */
  selectedFeature: MapFeature | null;
  /** Setters for the map instance selected feature */
  selectFeature: (properties: MapFeature) => void;
  clearSelectedFeature: () => void;
  /** Currently active KPI field displayed on the map */
  kpi: KpiField;
  setKpi: (kpi: KpiField) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  /** Negative space programming is the way! */
  if (!ctx) throw new Error("useMapContext must be used within <MapProvider>");
  return ctx;
}

// ─── Initial state ────────────────────────────────────────────────────────────

/** Initial is set to display all the France Métropolitaine
 * (TODO: add rapid navigation to other french colonies, oups.. territories) */
export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 2.3522,
  latitude: 46.5,
  zoom: 5,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null,
  );
  const [kpi, setKpi] = useState<KpiField>("indice_vulnerabilite_niveau");

  const selectFeature = useCallback(
    (properties: MapFeature) => setSelectedFeature(properties),
    [],
  );

  const clearSelectedFeature = useCallback(() => setSelectedFeature(null), []);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        viewState,
        setViewState,
        selectedFeature,
        selectFeature,
        clearSelectedFeature,
        kpi,
        setKpi,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
