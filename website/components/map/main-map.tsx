"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Map,
  NavigationControl,
  Popup,
  Layer,
  Source,
} from "@vis.gl/react-maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FiltersPanel } from "@/components/map/filters-panel";
import { FeatureDetailPanel } from "@/components/map/feature-detail-panel";

// ─── Map constants (same as map-pmtile.tsx) ───────────────────────────────────

const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

// ─── Map Layers: Communes ──────────────

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

// ─── Map Canvas: Here is the main map canvas component that renders the map and handles interactions.  ──────────────

function MapCanvas({
  onFeatureSelect,
  isFiltersPanelOpen,
}: {
  onFeatureSelect: (properties: Record<string, unknown>) => void;
  isFiltersPanelOpen: boolean;
}) {
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
      if (f) onFeatureSelect(f.properties as Record<string, unknown>);
    },
    [onFeatureSelect],
  );

  const handleCursorEnter = useCallback((e: MapMouseEvent) => {
    (e.target as maplibregl.Map).getCanvas().style.cursor = "pointer";
  }, []);

  // NOTE: Not used now, but could usefull later on
  // const handleCursorLeave = useCallback((e: MapMouseEvent) => {
  //   (e.target as maplibregl.Map).getCanvas().style.cursor = "";
  // }, []);

  return (
    <Map
      initialViewState={{ longitude: 2.3522, latitude: 46.5, zoom: 5 }}
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

export default function MainMapLayout() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Record<
    string,
    unknown
  > | null>(null);

  const handleFeatureSelect = useCallback(
    (properties: Record<string, unknown>) => {
      setSelectedFeature(properties);
      setDetailsOpen(true);
    },
    [],
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* Map wrapper and canvas thats fills the full area; could be refactored followin React slot patterns (same as Panel) */}
      <div className="absolute inset-0">
        <MapCanvas
          onFeatureSelect={handleFeatureSelect}
          isFiltersPanelOpen={filtersOpen}
        />
      </div>

      {/* Left: commune detail panel (panel width can be directly controlled via props; see component implementation) */}
      <FeatureDetailPanel
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        properties={selectedFeature}
      />

      {/* Right: filter panel – toggle button rendered via Panel.Controls | TODO: move MapLibre navigation control inside Panel.Controls */}
      <FiltersPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onToggle={() => setFiltersOpen((v) => !v)}
      />
    </div>
  );
}
