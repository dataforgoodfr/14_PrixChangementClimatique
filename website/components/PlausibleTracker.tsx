"use client";

import { useEffect } from "react";

export function PlausibleTracker() {
  useEffect(() => {
    import("@plausible-analytics/tracker").then(({ init }) => {
      console.log("Plausible init");
      init({
        domain: "assurermaville.fr",
        endpoint: "https://plausible.services.dataforgood.fr/api/event",
      });
    });
  }, []);

  return null;
}
