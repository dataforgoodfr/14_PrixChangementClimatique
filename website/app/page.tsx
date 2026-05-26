import Home from "@/components/home/home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assurer ma ville",
  description:
    "Reclaim Finance et Data For Good analysent l'impact économique du changement climatique en France commune par commune.",
};

export default function Page() {
  return <Home />;
}
