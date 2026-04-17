"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommuneRow } from "@/lib/types/communes";
import { removeArrayBrackets, removeDoubleQuotes } from "@/lib/map-utils";

export function useCityData(params: {
  code: string | null | undefined;
  enabled?: boolean;
}) {
  const { code, enabled = true } = params;
  const hasCode =
    code !== null && code !== undefined && String(code).trim() !== "";
  const shouldFetch = hasCode && enabled;

  const [data, setData] = useState<CommuneRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!hasCode) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const cleanCode = removeDoubleQuotes(
        removeArrayBrackets(String(code).trim()),
      );
      const searchParams = new URLSearchParams();
      searchParams.set("commune", cleanCode);
      const res = await fetch(`/api/duckdb-demo?${searchParams.toString()}`);
      const json: CommuneRow[] | { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(
          (json as { error?: string }).error ?? "Erreur lors du chargement",
        );
      }
      const rows = Array.isArray(json) ? json : [];
      setData(rows[0] ?? null);
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
      setLoading(false);
    }
  }, [shouldFetch, refetch]);

  return { data, loading, error, refetch };
}
