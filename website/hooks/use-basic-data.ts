"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommuneRow } from "@/lib/types/communes";

export function useBasicData(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const [data, setData] = useState<CommuneRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/load-basic-data");
      if (!res.ok) throw new Error("Échec du chargement");
      const json: CommuneRow[] = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Échec du chargement"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
