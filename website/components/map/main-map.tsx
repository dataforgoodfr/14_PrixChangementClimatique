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
  type ViewState,
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
import { useQueryState } from "nuqs";

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
      promoteId="code_insee"
    >
      <Layer
        id={COMMUNES_LAYER_ID}
        type="fill"
        source-layer="communes"
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

// ─── Map Canvas: Here is the main map canvas component that renders the map and handles interactions.  ──────────────

function MapCanvas({
  isFiltersPanelOpen,
  setCommune,
  onMapLoaded,
}: {
  isFiltersPanelOpen: boolean;
  setCommune: (value: string | null) => void;
  onMapLoaded: () => void;
}) {
  const { map, setMap, selectFeature } = useMapContext();
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const mapRef = useCallback(
    (node: MapRef | null) => {
      if (node !== null) setMap(node.getMap());
    },
    [setMap],
  );

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
        const { lon, lat } = JSON.parse(f.properties.geo_point_2_d);
        if (map) {
          map.flyTo({
            center: [lon, lat],
            zoom: 12,
            offset: [400, 0],
            duration: 1000,
          });
        }
        selectFeature(f.properties as MapFeature);
        setCommune(f.properties.code_insee);
      }
    },
    [map, setCommune, selectFeature],
  );

  const handleCursorEnter = useCallback((e: MapMouseEvent) => {
    (e.target as maplibregl.Map).getCanvas().style.cursor = "pointer";
  }, []);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={handleMove}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://api.protomaps.com/styles/v5/light/fr.json?key=72196f954acb1cae"
      interactiveLayerIds={[COMMUNES_LAYER_ID]}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverInfo(null)}
      onClick={handleClick}
      onMouseEnter={handleCursorEnter}
      onLoad={onMapLoaded}
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
  const { map, clearSelectedFeature, selectFeature, selectedFeature } =
    useMapContext();
  const [commune, setCommune] = useQueryState("commune");

  const onMapLoaded = useCallback(() => {
    if (!map || !commune) return;

    const features = map.querySourceFeatures("communes-source", {
      sourceLayer: "communes",
      filter: ["==", ["get", "code_insee"], commune],
    });
    if (features.length > 0) {
      selectFeature(features[0].properties as MapFeature);
      // 1. Fly vers la commune pour charger les tuiles
      const { lon, lat } = JSON.parse(features[0].properties.geo_point_2_d);
      map.flyTo({
        center: [lon, lat],
        zoom: 12,
        offset: [400, 0],
        duration: 1000,
      });
    }
  }, [map, selectFeature, commune]);

  const selectCommune = useCallback(
    (result: SearchCommuneResult | undefined) => {
      if (!map) return;
      if (!result) {
        setCommune(null);
        clearSelectedFeature();
      } else {
        const [lng, lat] = result.centre.coordinates;
        setCommune(result.code);
        selectFeature({ code_insee: result.code, nom_commune: result.nom });

        // 1. Fly vers la commune pour charger les tuiles
        map.flyTo({
          center: [lng, lat],
          zoom: 12,
          offset: [400, 0],
          duration: 1000,
        });
        const onIdle = () => {
          map.off("idle", onIdle);

          const features = map.querySourceFeatures("communes-source", {
            sourceLayer: "communes",
            filter: ["==", ["get", "code_insee"], result.code],
          });

          if (features.length > 0) {
            selectFeature(features[0].properties as MapFeature);
          }
        };
        map.on("idle", onIdle);
      }
    },
    [map, clearSelectedFeature, setCommune, selectFeature],
  );

  return (
    <div className="relative h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Map wrapper and canvas that fills the full area */}
      <MapCanvas
        isFiltersPanelOpen={filtersOpen}
        setCommune={setCommune}
        onMapLoaded={onMapLoaded}
      />

      <div className="absolute top-8 left-4">
        <RFCommuneSearchBox
          filterValue={selectedFeature?.nom_commune}
          onAddressFilter={selectCommune}
          className="w-100 z-40 max-w-[calc(100dvw-5rem)]"
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
