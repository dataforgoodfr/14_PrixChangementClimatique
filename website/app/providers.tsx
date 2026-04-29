"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "Une erreur est survenue lors du chargement des données",
    );
    throw error;
  }

  return res.json();
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onError: (error, key) => {
          // Log errors pour debug
          console.error(`SWR Error [${key}]:`, error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
