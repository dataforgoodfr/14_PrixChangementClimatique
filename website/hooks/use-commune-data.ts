"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommuneProperties } from "@/lib/types/communes";
import { removeArrayBrackets, removeDoubleQuotes } from "@/lib/map-utils";

/**
 * Fetches commune data from the API by INSEE code and returns it as CommuneProperties.
 * Handles loading, error states, and optional lazy-enable via the `enabled` flag.
 */
export function useCommuneData(params: {
  code: string | null | undefined;
  enabled?: boolean;
}) {
  const { code, enabled = true } = params;
  const hasCode =
    code !== null && code !== undefined && String(code).trim() !== "";
  const shouldFetch = hasCode && enabled;

  const [data, setData] = useState<CommuneProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(async () => {
    if (!hasCode) return;
    setLoading(true);
    setError(null);
    setData(null);
    setNotFound(false);
    try {
      // Sanitize code in case it comes from raw PMTiles properties (e.g. `["75056"]`)
      const cleanCode = removeDoubleQuotes(
        removeArrayBrackets(String(code).trim()),
      );
      const res = await fetch(`/api/communes/${cleanCode}`);
      const json: unknown = await res.json();

      // 404 = commune not found
      if (res.status === 404) {
        setData(null);
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        const message =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Erreur lors du chargement";
        throw new Error(message);
      }

      setData(json != null ? (json as CommuneProperties) : null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erreur lors du chargement"),
      );
    } finally {
      setLoading(false);
    }
  }, [code, hasCode]);

  useEffect(() => {
    if (shouldFetch) {
      refetch();
    } else {
      setData(null);
      setError(null);
      setNotFound(false);
      setLoading(false);
    }
  }, [shouldFetch, refetch]);

  return { data, loading, error, notFound, refetch };
}
