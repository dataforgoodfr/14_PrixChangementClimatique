"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { Eye, EyeOff, Layers } from "lucide-react";

// Source PMTiles locale - Communes de France
const COMMUNES_PMTILES_URL = "/pmtiles/communes.pmtiles";
const COMMUNES_LAYER_ID = "communes-fill";
const COMMUNES_BORDER_LAYER_ID = "communes-border";
const COMMUNES_SOURCE_ID = "communes-source";

export function MapDemo() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isCommunesLayerVisible, setIsCommunesLayerVisible] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Enregistrer le protocole PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.protomaps.com/styles/v5/light/fr.json?key=72196f954acb1cae`,
      center: [2.3522, 48.8566], // Paris
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    const communesPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "commune-popup",
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Ajouter la source PMTiles Communes (locale)
      map.current.addSource(COMMUNES_SOURCE_ID, {
        type: "vector",
        url: `pmtiles://${COMMUNES_PMTILES_URL}`,
      });

      // Ajouter la couche de remplissage des communes (fond beige transparent)
      map.current.addLayer({
        id: COMMUNES_LAYER_ID,
        type: "fill",
        source: COMMUNES_SOURCE_ID,
        "source-layer": "communes",
        paint: {
          "fill-color": "#F5DEB3", // Beige (wheat)
          "fill-opacity": 0.4,
        },
      });

      // Ajouter la couche de bordure des communes (bleu nuit)
      map.current.addLayer({
        id: COMMUNES_BORDER_LAYER_ID,
        type: "line",
        source: COMMUNES_SOURCE_ID,
        "source-layer": "communes",
        paint: {
          "line-color": "#191970", // Bleu nuit (Midnight Blue)
          "line-width": 1,
          "line-opacity": 0.8,
        },
      });

      // Événements de survol pour les communes
      map.current.on("mouseenter", COMMUNES_LAYER_ID, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", COMMUNES_LAYER_ID, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
        communesPopup.remove();
      });

      map.current.on("mousemove", COMMUNES_LAYER_ID, (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const properties = feature.properties;

        const name = properties.com_name || "Sans nom";
        const code = properties.com_code || "";

        let html = `<div class="font-semibold text-gray-900">${name}</div>`;
        if (code) {
          html += `<div class="text-sm text-gray-600">Code INSEE: ${code}</div>`;
        }

        communesPopup.setLngLat(e.lngLat).setHTML(html).addTo(map.current);
      });

      setIsMapLoaded(true);
    });

    return () => {
      maplibregl.removeProtocol("pmtiles");
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const toggleCommunesLayerVisibility = () => {
    if (!map.current || !isMapLoaded) return;

    const newVisibility = !isCommunesLayerVisible;
    map.current.setLayoutProperty(
      COMMUNES_LAYER_ID,
      "visibility",
      newVisibility ? "visible" : "none",
    );
    map.current.setLayoutProperty(
      COMMUNES_BORDER_LAYER_ID,
      "visibility",
      newVisibility ? "visible" : "none",
    );
    setIsCommunesLayerVisible(newVisibility);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          Démo carte PMTiles local
        </h1>
      </div>
      <div className="relative flex-1 min-h-0">
        <div ref={mapContainer} className="h-full w-full" />

        {/* Contrôle de visibilité des couches */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
            <Layers size={18} />
            <span>Couches</span>
          </div>
          <button
            onClick={toggleCommunesLayerVisibility}
            disabled={!isMapLoaded}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left ${
              isMapLoaded
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            } ${isCommunesLayerVisible ? "text-gray-800" : "text-gray-400"}`}
          >
            {isCommunesLayerVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">Communes de France</span>
          </button>
        </div>
      </div>
    </div>
  );
}
