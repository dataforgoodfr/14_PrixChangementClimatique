"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Eye, EyeOff, Layers, X } from "lucide-react";

const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

function LayerControl({
  isVisible,
  onToggle,
  isMapLoaded,
}: {
  isVisible: boolean;
  onToggle: () => void;
  isMapLoaded: boolean;
}) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
        <Layers size={18} />
        <span>Couches</span>
      </div>
      <button
        onClick={onToggle}
        disabled={!isMapLoaded}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left ${
          isMapLoaded
            ? "hover:bg-gray-100 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        } ${isVisible ? "text-gray-800" : "text-gray-400"}`}
      >
        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        <span className="text-sm">Communes de France</span>
      </button>
    </div>
  );
}

function CommunesLayer({ isVisible }: { isVisible: boolean }) {
  const visibility = isVisible ? "visible" : "none";

  return (
    <Source
      id={COMMUNES_SOURCE_ID}
      type="vector"
      url={`pmtiles://${COMMUNES_PMTILES_URL}`}
      promoteId="code_insee"
    >
      <Layer
        id={COMMUNES_LAYER_ID}
        type="fill"
        source-layer="communes"
        layout={{ visibility }}
        paint={{
          "fill-color": [
            "step",
            ["coalesce", ["get", "indice_vulnerabilite_niveau"], 0],
            "#518F83",
            2,
            "#B2A052",
            3,
            "#FFB74B",
            4,
            "#EA580D",
            5,
            "#B91C1C",
          ],
          "fill-opacity": 0.7,
        }}
      />
      <Layer
        id={COMMUNES_BORDER_LAYER_ID}
        type="line"
        source-layer="communes"
        layout={{ visibility }}
        paint={{
          "line-color": "#191970",
          "line-width": 1,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
}

function CursorHandler() {
  const [map] = useState(() => null);
  void map;

  useEffect(() => {
    return;
  }, []);

  return null;
}

function FeaturePanel({
  properties,
  onClose,
}: {
  properties: Record<string, unknown>;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-10 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <div className="font-bold text-gray-900">
            {String(properties.nom_commune ?? "—")}
          </div>
          <div className="text-xs text-gray-500">
            Code INSEE: {String(properties.code_insee ?? "—")}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-4">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(properties).map(([key, value]) => (
              <tr key={key} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5 pr-3 text-xs text-gray-500 font-medium align-top w-1/2 break-all">
                  {key}
                </td>
                <td className="py-1.5 text-gray-800 align-top break-all">
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
      </div>
    </div>
  );
}

export function MapDemo() {
  const [isCommunesLayerVisible, setIsCommunesLayerVisible] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
  } | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleMouseMove = useCallback(
    (event: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const feature = event.features?.[0];
      if (feature) {
        setHoverInfo({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
          name: String(feature.properties?.nom_commune ?? "Sans nom"),
        });
      } else {
        setHoverInfo(null);
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const handleMapClick = useCallback(
    (event: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const feature = event.features?.[0];
      if (!feature) {
        setSelectedProperties(null);
        return;
      }
      setSelectedProperties(feature.properties as Record<string, unknown>);
    },
    [],
  );

  const handleCursorEnter = useCallback(
    (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      (e.target as maplibregl.Map).getCanvas().style.cursor = "pointer";
    },
    [],
  );

  const handleCursorLeave = useCallback(
    (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      (e.target as maplibregl.Map).getCanvas().style.cursor = "";
    },
    [],
  );

  const toggleCommunesLayerVisibility = useCallback(() => {
    setIsCommunesLayerVisible((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          Démo carte PMTiles local
        </h1>
      </div>
      <div className="relative flex-1 min-h-0">
        <Map
          initialViewState={{
            longitude: 2.3522,
            latitude: 46.5,
            zoom: 5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://api.protomaps.com/styles/v5/light/fr.json?key=72196f954acb1cae"
          interactiveLayerIds={[COMMUNES_LAYER_ID]}
          onLoad={handleLoad}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleMapClick}
          onMouseEnter={handleCursorEnter}
        >
          <NavigationControl position="top-right" />
          <CommunesLayer isVisible={isCommunesLayerVisible} />

          {hoverInfo && !selectedProperties && (
            <Popup
              longitude={hoverInfo.longitude}
              latitude={hoverInfo.latitude}
              closeButton={false}
              closeOnClick={false}
              offset={10}
            >
              <div className="text-sm font-medium text-gray-900 px-1">
                {hoverInfo.name}
              </div>
            </Popup>
          )}
        </Map>

        <LayerControl
          isVisible={isCommunesLayerVisible}
          onToggle={toggleCommunesLayerVisibility}
          isMapLoaded={isMapLoaded}
        />

        {selectedProperties && (
          <FeaturePanel
            properties={selectedProperties}
            onClose={() => setSelectedProperties(null)}
          />
        )}
      </div>
    </div>
  );
}
