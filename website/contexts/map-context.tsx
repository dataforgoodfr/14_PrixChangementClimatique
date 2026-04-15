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

export interface MapFeature {
  code_geo: string;
  nom_commune: string;
  code_geo_actuel?: string;
  nom_commune_majuscule?: string;
  nom_commune_minuscule?: string;
  code_zone_superficie?: string;
  type_commune?: "commune";
  code_siren?: number;
  zone_montagne?: "Oui" | "Non";
  code_departement?: string;
  nom_departement?: string;
  code_region?: string;
  nom_region?: string;
  code_arrondissement_departemental?: string;
  nom_arrondissement_departemental?: string;
  code_epci?: number;
  nom_epci?: string;
  code_zone_emploi_2020?: string;
  nom_zone_emploi_2020?: string;
  code_bassin_vie_2022?: string;
  nom_bassin_vie_2022?: string;
  geo_point_2_d?: string; // "{\"lon\":-1.3812061983026563,\"lat\":47.400889786974449}",
  valeur?: number;
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
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
