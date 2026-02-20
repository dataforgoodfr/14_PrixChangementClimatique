"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Map,
  NavigationControl,
  Popup,
  Layer,
  Source,
  useMap,
} from "@vis.gl/react-maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Eye, EyeOff, Layers } from "lucide-react";
import { stringToColor } from "@/lib/map-utils";

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
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
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

function CommunesColorUpdater() {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const updateFeatureColors = () => {
      const source = map.getSource(COMMUNES_SOURCE_ID);
      if (!source) return;

      const features = map.querySourceFeatures(COMMUNES_SOURCE_ID, {
        sourceLayer: "communes",
      });

      const seenIds = new Set<string>();
      for (const feature of features) {
        const id = feature.id;
        if (id === undefined || seenIds.has(String(id))) continue;
        seenIds.add(String(id));

        const comName = feature.properties?.com_name || "";
        const color = stringToColor(comName);

        map.setFeatureState(
          { source: COMMUNES_SOURCE_ID, sourceLayer: "communes", id },
          { color },
        );
      }
    };

    map.on("sourcedata", updateFeatureColors);
    map.on("moveend", updateFeatureColors);
    updateFeatureColors();

    return () => {
      map.off("sourcedata", updateFeatureColors);
      map.off("moveend", updateFeatureColors);
    };
  }, [map]);

  return null;
}

function CommunesLayer({ isVisible }: { isVisible: boolean }) {
  const visibility = isVisible ? "visible" : "none";

  return (
    <Source
      id={COMMUNES_SOURCE_ID}
      type="vector"
      url={`pmtiles://${COMMUNES_PMTILES_URL}`}
      promoteId="com_code"
    >
      <Layer
        id={COMMUNES_LAYER_ID}
        type="fill"
        source-layer="communes"
        layout={{ visibility }}
        paint={{
          "fill-color": ["coalesce", ["feature-state", "color"], "#F5DEB3"],
          "fill-opacity": 0.6,
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
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("mouseenter", COMMUNES_LAYER_ID, handleMouseEnter);
    map.on("mouseleave", COMMUNES_LAYER_ID, handleMouseLeave);

    return () => {
      map.off("mouseenter", COMMUNES_LAYER_ID, handleMouseEnter);
      map.off("mouseleave", COMMUNES_LAYER_ID, handleMouseLeave);
    };
  }, [map]);

  return null;
}

export function MapDemo() {
  const [isCommunesLayerVisible, setIsCommunesLayerVisible] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
    code: string;
  } | null>(null);

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
        const properties = feature.properties;
        setHoverInfo({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
          name: properties.com_name || "Sans nom",
          code: properties.com_code || "",
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
            latitude: 48.8566,
            zoom: 12,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://api.protomaps.com/styles/v5/light/fr.json?key=72196f954acb1cae"
          interactiveLayerIds={[COMMUNES_LAYER_ID]}
          onLoad={handleLoad}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <NavigationControl position="top-right" />
          <CommunesLayer isVisible={isCommunesLayerVisible} />
          <CommunesColorUpdater />
          <CursorHandler />

          {hoverInfo && (
            <Popup
              longitude={hoverInfo.longitude}
              latitude={hoverInfo.latitude}
              closeButton={false}
              closeOnClick={false}
              className="commune-popup"
            >
              <div className="font-semibold text-gray-900">
                {hoverInfo.name}
              </div>
              {hoverInfo.code && (
                <div className="text-sm text-gray-600">
                  Code INSEE: {hoverInfo.code}
                </div>
              )}
            </Popup>
          )}
        </Map>

        <LayerControl
          isVisible={isCommunesLayerVisible}
          onToggle={toggleCommunesLayerVisibility}
          isMapLoaded={isMapLoaded}
        />
      </div>
    </div>
  );
}
