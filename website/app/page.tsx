import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil | Reclaim Finance",
  description:
    "Reclaim Finance analyse l'impact économique du changement climatique en France commune par commune.",
};

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-rf-gray">Accueil</h1>
    </div>
  );
}
