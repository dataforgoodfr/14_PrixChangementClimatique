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

export interface MapContextValue {
  /** Ref to maplibre instance (will be usefull for accessing map methods) */
  mapRef: RefObject<MapRef | null>;
  /** view state for the map instance (lng, lat, zoom, bearing, pitch) */
  viewState: ViewState;
  /** Setter for the map instance view state  */
  setViewState: (vs: ViewState) => void;
  /** Getter: The city feature the user last clicked on, or null if none. */
  selectedFeature: Record<string, unknown> | null;
  /** Setters for the map instance selected feature */
  selectFeature: (properties: Record<string, unknown>) => void;
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
  const [selectedFeature, setSelectedFeature] = useState<Record<
    string,
    unknown
  > | null>(null);

  const selectFeature = useCallback(
    (properties: Record<string, unknown>) => setSelectedFeature(properties),
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
