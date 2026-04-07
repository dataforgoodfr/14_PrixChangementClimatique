"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  Suspense,
  type ReactNode,
  type RefObject,
} from "react";
import type { MapRef, ViewState } from "@vis.gl/react-maplibre";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { CommuneProperties } from "@/lib/types/communes";
import { removeArrayBrackets, removeDoubleQuotes } from "@/lib/map-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapContextValue {
  /** Ref to the underlying MapLibre instance. */
  mapRef: RefObject<MapRef | null>;
  /** Current camera view state (lng, lat, zoom, bearing, pitch). */
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  /** The commune selected by the user (map click or URL param), or null. */
  selectedCommune: CommuneProperties | null;
  selectCommune: (commune: CommuneProperties) => void;
  clearSelectedCommune: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within <MapProvider>");
  return ctx;
}

// ─── Initial state ────────────────────────────────────────────────────────────

/** Initial view state: France métropolitaine */
export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 2.3522,
  latitude: 46.5,
  zoom: 5,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

// ─── URL sync ─────────────────────────────────────────────────────────────────
//
// Rendered inside MapProvider so it can access context directly.
// Wrapped in <Suspense> by MapProvider because useSearchParams() requires it
// in Next.js App Router for static-rendering compatibility.
//
// Two effects, no intermediate state:
//   1. Bootstrap (mount-only): fetch commune from ?code_commune, populate context.
//   2. URL sync (ongoing): keep ?code_commune in sync with selectedCommune.

function MapUrlSync() {
  const { selectedCommune, selectCommune } = useMapContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const codeFromUrl = searchParams.get("code_commune");
  const selectedCode = selectedCommune?.code_geo ?? null;

  // Ref: true once bootstrap has resolved.
  // Prevents URL sync from clearing ?code_commune during  bootstrap step,
  // and prevents re-fetching after the user closes the panel.
  const bootstrappedRef = useRef(false);

  // 1. Bootstrap — runs once on mount.
  useEffect(() => {
    const code = codeFromUrl; // capture at mount

    if (!code) {
      bootstrappedRef.current = true;
      return;
    }

    const cleanCode = removeDoubleQuotes(removeArrayBrackets(code.trim()));
    let cancelled = false;

    fetch(`/api/communes/${cleanCode}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          toast.error(`Commune introuvable : ${code}`, {
            position: "top-center",
          });
          router.replace(pathname, { scroll: false });
        } else if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          toast.error(
            (json as { error?: string }).error ?? "Erreur lors du chargement",
            { position: "top-center" },
          );
          router.replace(pathname, { scroll: false });
        } else {
          selectCommune((await res.json()) as CommuneProperties);
        }
        bootstrappedRef.current = true;
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Erreur lors du chargement", { position: "top-center" });
        router.replace(pathname, { scroll: false });
        bootstrappedRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. URL sync — keep ?code_commune in sync with selectedCommune.
  useEffect(() => {
    if (!bootstrappedRef.current) return; // bootstrap step: don't touch URL
    if (selectedCode === codeFromUrl) return; // already in sync: don't do anything

    const params = new URLSearchParams(searchParams.toString());
    if (selectedCode) {
      params.set("code_commune", selectedCode);
    } else {
      params.delete("code_commune");
    }
    const newSearch = params.toString();
    router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, {
      scroll: false,
    });
  }, [selectedCode, codeFromUrl, searchParams, pathname, router]);

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [selectedCommune, setSelectedCommune] =
    useState<CommuneProperties | null>(null);

  const selectCommune = useCallback(
    (commune: CommuneProperties) => setSelectedCommune(commune),
    [],
  );

  const clearSelectedCommune = useCallback(() => setSelectedCommune(null), []);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        viewState,
        setViewState,
        selectedCommune,
        selectCommune,
        clearSelectedCommune,
      }}
    >
      <Suspense>
        <MapUrlSync />
      </Suspense>
      {children}
    </MapContext.Provider>
  );
}
