"use client";

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from "react";
import type { ExpressionSpecification } from "maplibre-gl";
import { CommuneFilters, DEFAULT_FILTERS } from "@/lib/types/filters/filters";
import { buildMaplibreFilter } from "@/lib/buildMaplibreFilter";
import { FiltersAction } from "@/lib/types/filters/filters-actions";
import { filtersReducer } from "./filter-reducer";

interface FiltersContextValue {
  filters: CommuneFilters;
  dispatch: React.Dispatch<FiltersAction>;
  maplibreFilter: ExpressionSpecification;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS);

  const maplibreFilter = useMemo(() => buildMaplibreFilter(filters), [filters]);

  return (
    <FiltersContext.Provider value={{ filters, dispatch, maplibreFilter }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  const context = useContext(FiltersContext);
  if (!context)
    throw new Error("useFilters must be used inside FiltersProvider");
  return context;
}
