import type { Metadata } from "next";
import { Suspense } from "react";
import MainMapLayout from "@/components/map/main-map";

export const metadata: Metadata = {
  title: "Carte | Assurer ma ville",
  description:
    "Explorez la carte interactive des risques climatiques par commune en France.",
};

export default function CartePage() {
  return (
    <Suspense>
      <MainMapLayout />
    </Suspense>
  );
}
