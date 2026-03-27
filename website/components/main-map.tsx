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
import { SlidersHorizontal, X } from "lucide-react";
import { MapPanelFilters } from "@/components/map-panel-filters";

// ─── Map constants (same as map-pmtile.tsx) ───────────────────────────────────

const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

// ─── Communes layer (same coloring as MapDemo in map-pmtile.tsx) ──────────────

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

// ─── Map canvas: MapDemo behaviour without the built-in FeaturePanel ──────────

function MapCanvas({
  onFeatureSelect,
}: {
  onFeatureSelect: (properties: Record<string, unknown>) => void;
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

  const handleCursorLeave = useCallback((e: MapMouseEvent) => {
    (e.target as maplibregl.Map).getCanvas().style.cursor = "";
  }, []);

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
      <NavigationControl position="top-left" style={{ marginTop: "56px" }} />
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

// ─── Feature detail panel (same slide-in pattern as MapFiltersSidebar) ────────

function FeatureDetailPanel({
  isOpen,
  onClose,
  properties,
}: {
  isOpen: boolean;
  onClose: () => void;
  properties: Record<string, unknown> | null;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`absolute top-0 right-0 h-full w-[360px] bg-white shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <p className="font-semibold text-gray-900">
            {String(properties?.nom_commune ?? "Commune")}
          </p>
          {!!properties?.code_geo && (
            <p className="text-xs text-gray-500">
              Code INSEE : {String(properties.code_geo)}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {properties ? (
          <table className="w-full">
            <tbody>
              {Object.entries(properties).map(([key, value]) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-1.5 pr-3 text-xs text-gray-500 font-medium align-top w-1/2 break-all">
                    {key}
                  </td>
                  <td className="py-1.5 text-xs text-gray-800 align-top break-all">
                    {value === null || value === undefined ? (
                      <span className="text-gray-300">—</span>
                    ) : typeof value === "object" ? (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      String(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 text-center mt-8">
            Cliquez sur une commune pour afficher ses données.
          </p>
        )}
      </div>
    </div>
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
      {/* Map fills the full area */}
      <div className="absolute inset-0">
        <MapCanvas onFeatureSelect={handleFeatureSelect} />
      </div>

      {/* Left: filter sidebar */}
      <MapPanelFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />

      {/* Left: filter toggle button – slides right when sidebar is open */}
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        title={filtersOpen ? "Fermer les filtres" : "Ouvrir les filtres"}
        className="absolute top-4 z-30 bg-rf-green-dark hover:bg-rf-green-dark/90 text-white p-2.5 rounded-md shadow-md transition-all duration-300"
        style={{ left: filtersOpen ? "calc(360px + 1rem)" : "1rem" }}
      >
        <SlidersHorizontal size={18} />
      </button>

      {/* Right: commune detail panel */}
      <FeatureDetailPanel
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        properties={selectedFeature}
      />
    </div>
  );
}
