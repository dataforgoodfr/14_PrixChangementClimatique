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
import { MapFeature, MapProvider, useMapContext } from "@/contexts/map-context";
import {
  RFCommuneSearchBox,
  SearchCommuneResult,
} from "@/components/core/rf-commune-searchbox";

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
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0,
            6,
            0,
            8,
            0.5,
            11,
            1,
          ],
        }}
      />
    </Source>
  );
}

// ─── Map Canvas: Here is the main map canvas component that renders the map and handles interactions.  ──────────────

function MapCanvas({ isFiltersPanelOpen }: { isFiltersPanelOpen: boolean }) {
  const { mapRef, viewState, setViewState, selectFeature } = useMapContext();

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
      if (f) {
        const map = mapRef.current?.getMap();
        const { lon, lat } = JSON.parse(f.properties.geo_point_2_d);
        if (map) {
          map.flyTo({
            center: [lon, lat],
            zoom: 12,
            offset: [400, 0],
          });
        }
        selectFeature(f.properties as MapFeature);
      }
    },
    [selectFeature, mapRef],
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

function MainMap() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { mapRef, selectFeature, clearSelectedFeature, selectedFeature } =
    useMapContext();

  const selectCommune = useCallback(
    (result: SearchCommuneResult | undefined) => {
      if (!result) {
        clearSelectedFeature();
        return;
      }
      const map = mapRef.current?.getMap();
      if (!map) return;

      const [lng, lat] = result.centre.coordinates;

      // 1. Fly vers la commune pour charger les tuiles
      map.flyTo({ center: [lng, lat], zoom: 12, offset: [400, 0] });

      // 2. Une fois les tuiles chargées, query par code_geo
      const onIdle = () => {
        map.off("idle", onIdle);

        const features = map.querySourceFeatures("communes-source", {
          sourceLayer: "communes",
          filter: ["==", ["get", "code_geo"], result.code],
        });

        if (features.length > 0) {
          selectFeature(features[0].properties as MapFeature);
        }
      };
      map.on("idle", onIdle);
    },
    [mapRef, selectFeature, clearSelectedFeature],
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* Map wrapper and canvas that fills the full area */}
      <div className="absolute inset-0">
        <MapCanvas isFiltersPanelOpen={filtersOpen} />
      </div>

      <div className="absolute top-8 left-8">
        <RFCommuneSearchBox
          filterValue={selectedFeature?.nom_commune}
          onAddressFilter={selectCommune}
          className="w-100 z-50"
        />
      </div>

      {/* Left: commune detail panel – reads selectedFeature from context */}
      <FeatureDetailPanel />

      {/* Right: filter panel – toggle button rendered via Panel.Controls */}
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
