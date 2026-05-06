"use client";

import {
  FilterActionType,
  FilterToggleKey,
} from "@/lib/types/filters/filters-actions";
import { useFilters } from "./filter-context";

interface ToggleFilterProps {
  label: string;
  filterKey: FilterToggleKey;
}

export function ToggleFilter({ label, filterKey }: ToggleFilterProps) {
  const { filters, dispatch } = useFilters();
  const active = filters[filterKey] === true;

  function handleToggle() {
    if (active) {
      dispatch({ type: FilterActionType.CLEAR_TOGGLE, key: filterKey });
    } else {
      dispatch({
        type: FilterActionType.SET_TOGGLE,
        key: filterKey,
        payload: true,
      });
    }
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer py-2 border-b border-gray-200 last:border-0">
      <input
        type="checkbox"
        checked={active}
        onChange={handleToggle}
        className="rounded border-gray-300 accent-green-700"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
