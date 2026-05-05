"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Map,
  Popup,
  Layer,
  Source,
  AttributionControl,
  type ViewStateChangeEvent,
  type MapRef,
  type ViewState,
} from "@vis.gl/react-maplibre";
import { Protocol } from "pmtiles";
import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FiltersPanel } from "@/components/map/filters-panel";
import { FeatureDetailPanel } from "@/components/map/feature-detail-panel";
import {
  RFCommuneSearchBox,
  SearchCommuneResult,
} from "@/components/core/rf-commune-searchbox";
import { useQueryState } from "nuqs";
import { type IndicatorField } from "@/lib/types/indicator";
import { useIndicator } from "@/hooks";
import useSWR from "swr";
import { Commune } from "@/lib/types/communes";
import { ComparisonPanel } from "@/components/map/comparison-panel";
import { useFilters } from "../filters/filter-context";

// ─── Map constants (same as map-pmtile.tsx) ───────────────────────────────────

const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

// ─── Map Layers: Communes ──────────────

function buildFillColor(
  indicator: IndicatorField,
): maplibregl.ExpressionSpecification {
  if (indicator === "indice_vulnerabilite_niveau") {
    return [
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
    ];
  }
  if (indicator === "score_georisque") {
    return [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "score_georisque"], 0],
      0,
      "#FFF0EE",
      1,
      "#7F1D1D",
    ];
  }
  if (indicator === "prevention") {
    return [
      "case",
      [
        "all",
        ["==", ["get", "pprn_rga"], true],
        ["==", ["get", "pprn_ino"], true],
      ],
      "#032E15",
      ["==", ["get", "pprn_rga"], true],
      "#A66000",
      ["==", ["get", "pprn_ino"], true],
      "#075985",
      "#D8D8D0",
    ];
  }
  if (indicator === "score_economique") {
    return [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "score_economique"], 0],
      0,
      "#FFF7ED",
      1,
      "#7C2D12",
    ];
  }
  // score_assurance
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", "score_assurance"], 0],
    0,
    "#FEF2F2",
    1,
    "#1E3A5F",
  ];
}

function CommunesLayer() {
  const [indicator] = useIndicator();

  const { maplibreFilter } = useFilters();

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
        filter={maplibreFilter}
        paint={{
          "fill-color": buildFillColor(indicator),
          "fill-opacity": 0.7,
          "fill-outline-color": "transparent",
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
// ─── Map Attribution: Custom ──────────────

const CustomMapAttributions: string[] = [
  `<a href="https://reclaimfinance.org/site/">Reclaim Finance</a>`,
  `<a href="https://dataforgood.fr/">Data for Good</a>`,
];
// ─── Initial state ────────────────────────────────────────────────────────────

/** Initial is set to display all the France Métropolitaine
 * (TODO: add rapid navigation to DROMs) */
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
  setCommune,
  onMapLoaded,
}: {
  setCommune: (value: string | null) => void;
  onMapLoaded: (map: ReturnType<MapRef["getMap"]>) => void;
}) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const mapRef = useRef<MapRef | null>(null);

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
        setCommune(f.properties.code_insee);
      }
    },
    [setCommune],
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
      onLoad={() => onMapLoaded(mapRef.current!.getMap())}
      attributionControl={false}
    >
      <AttributionControl
        position="bottom-left"
        customAttribution={CustomMapAttributions}
        compact={true}
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
  const [commune, setCommune] = useQueryState("commune");
  const [compare] = useQueryState("comparaison");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isComparisonPanelOpen, setComparisonPanelOpen] = useState(!!compare);
  const [map, setMap] = useState<ReturnType<MapRef["getMap"]>>();

  const { data } = useSWR<Commune>(
    commune ? `/api/communes?code=${commune}` : null,
    { keepPreviousData: true },
  );

  const selectedCommune = commune && data ? data : null;

  useEffect(() => {
    if (!map || !selectedCommune?.geo_point_2_d) return;

    // 1. Fly vers la commune pour charger les tuiles
    const { lon, lat } = JSON.parse(selectedCommune.geo_point_2_d);
    map.flyTo({
      center: [lon, lat],
      zoom: 12,
      offset: [400, 0],
      duration: 1000,
    });
  }, [map, selectedCommune]);

  const selectCommune = useCallback(
    (result: SearchCommuneResult | undefined) => {
      setCommune(result?.code ?? null);
    },
    [setCommune],
  );

  return (
    <div className="relative h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Map wrapper and canvas that fills the full area */}
      <MapCanvas setCommune={setCommune} onMapLoaded={setMap} />

      {!isComparisonPanelOpen && (
        <div className="absolute top-8 left-4">
          <RFCommuneSearchBox
            filterValue={selectedCommune?.nom_commune}
            onAddressFilter={selectCommune}
            onCompare={() => setComparisonPanelOpen(true)}
            placeholder="Rechercher une commune par son nom"
            className="w-100 z-40 max-w-[calc(100dvw-5rem)]"
          />
        </div>
      )}

      {/* Left: commune detail panel */}
      <FeatureDetailPanel
        selectedCommune={isComparisonPanelOpen ? null : selectedCommune}
      />

      {/* Left: comparison panel */}
      <ComparisonPanel
        isOpen={isComparisonPanelOpen}
        onClose={() => setComparisonPanelOpen(false)}
        selectedCommune={selectedCommune}
      />

      {/* Right: filter panel – toggle button rendered via Panel.Controls */}
      <FiltersPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onToggle={() => setFiltersOpen((v) => !v)}
        map={map}
      />
    </div>
  );
}

export default function MainMapLayout() {
  return <MainMap />;
}
