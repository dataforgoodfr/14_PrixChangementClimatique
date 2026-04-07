"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Map,
  NavigationControl,
  Popup,
  Layer,
  Source,
  type ViewStateChangeEvent,
  type MapRef,
} from "@vis.gl/react-maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FiltersPanel } from "@/components/map/filters-panel";
import { FeatureDetailPanel } from "@/components/map/feature-detail-panel";
import { MapProvider, useMapContext } from "@/contexts/map-context";
import type { CommuneProperties } from "@/lib/types/communes";

// ─── Map constants ────────────────────────────────────────────────────────────

const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

// ─── Map Layers: Communes ─────────────────────────────────────────────────────

function CommunesLayer() {
  return (
    <Source
      id={COMMUNES_SOURCE_ID}
      type="vector"
      url={`pmtiles://${COMMUNES_PMTILES_URL}`}
      promoteId="code_geo"
    >
      <Layer
        id={COMMUNES_LAYER_ID}
        type="fill"
        source-layer="communes"
        paint={{
          "fill-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "valeur"], 0],
            0,
            "#ffffcc",
            0.25,
            "#fed976",
            0.5,
            "#fd8d3c",
            0.75,
            "#e31a1c",
            1,
            "#800026",
          ],
          "fill-opacity": 0.7,
        }}
      />
      <Layer
        id={COMMUNES_BORDER_LAYER_ID}
        type="line"
        source-layer="communes"
        paint={{
          "line-color": "#191970",
          "line-width": 1,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
}

// ─── Map Canvas ───────────────────────────────────────────────────────────────

function MapCanvas({ isFiltersPanelOpen }: { isFiltersPanelOpen: boolean }) {
  const { mapRef, viewState, setViewState, selectCommune } = useMapContext();

  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => maplibregl.removeProtocol("pmtiles");
  }, []);

  const handleMove = useCallback(
    (e: ViewStateChangeEvent) => setViewState(e.viewState),
    [setViewState],
  );

  const handleMouseMove = useCallback(
    (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const f = e.features?.[0];
      if (f) {
        setHoverInfo({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          name: String(f.properties?.nom_commune ?? "Sans nom"),
        });
      } else {
        setHoverInfo(null);
      }
    },
    [],
  );

  const handleClick = useCallback(
    (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const f = e.features?.[0];
      if (f) selectCommune(f.properties as CommuneProperties);
    },
    [selectCommune],
  );

  const handleCursorEnter = useCallback((e: MapMouseEvent) => {
    (e.target as maplibregl.Map).getCanvas().style.cursor = "pointer";
  }, []);

  return (
    <Map
      ref={mapRef as React.RefObject<MapRef>}
      {...viewState}
      onMove={handleMove}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://api.protomaps.com/styles/v5/light/fr.json?key=72196f954acb1cae"
      interactiveLayerIds={[COMMUNES_LAYER_ID]}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverInfo(null)}
      onClick={handleClick}
      onMouseEnter={handleCursorEnter}
    >
      <NavigationControl
        position="top-right"
        style={{
          marginTop: "72px",
          marginRight: `${isFiltersPanelOpen ? "376px" : "16px"}`,
        }}
      />
      <CommunesLayer />
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          closeButton={false}
          closeOnClick={false}
        >
          <div className="text-sm font-medium">{hoverInfo.name}</div>
        </Popup>
      )}
    </Map>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function MainMap() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <MapCanvas isFiltersPanelOpen={filtersOpen} />
      </div>

      <FeatureDetailPanel />

      <FiltersPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onToggle={() => setFiltersOpen((v) => !v)}
      />
    </div>
  );
}

export default function MainMapLayout() {
  return (
    <MapProvider>
      <MainMap />
    </MapProvider>
  );
}
