import type { Metadata } from "next";
import MainMapLayout from "@/components/map/main-map";

export const metadata: Metadata = {
  title: "Carte | Reclaim Finance",
  description:
    "Explorez la carte interactive des risques climatiques par commune en France.",
};

export default function CartePage() {
  return <MainMapLayout />;
}
