import { CommuneFilters, DEFAULT_FILTERS } from "@/lib/types/filters/filters";
import {
  FilterActionType,
  FiltersAction,
} from "@/lib/types/filters/filters-actions";

export function filtersReducer(
  state: CommuneFilters,
  action: FiltersAction,
): CommuneFilters {
  switch (action.type) {
    case FilterActionType.SET_RANGE:
      return { ...state, [action.key]: action.payload };

    case FilterActionType.CLEAR_RANGE: {
      const next = { ...state };
      delete next[action.key];
      return next;
    }

    case FilterActionType.SET_TOGGLE:
      return { ...state, [action.key]: action.payload };

    case FilterActionType.CLEAR_TOGGLE: {
      const next = { ...state };
      delete next[action.key];
      return next;
    }

    case FilterActionType.RESET:
      return DEFAULT_FILTERS;

    default:
      return state;
  }
}
