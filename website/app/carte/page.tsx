import type { Metadata } from "next";
import { MapDemo } from "@/components/map-pmtile";

export const metadata: Metadata = {
  title: "Carte | Reclaim Finance",
  description:
    "Explorez la carte interactive des risques climatiques par commune en France.",
};

export default function CartePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-rf-gray">Carte</h1>
      <MapDemo />
    </div>
  );
}
