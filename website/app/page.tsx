import Hero from "@/components/home/hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil | Reclaim Finance",
  description:
    "Reclaim Finance analyse l'impact économique du changement climatique en France commune par commune.",
};

export default function Page() {
  return <Hero />;
}
