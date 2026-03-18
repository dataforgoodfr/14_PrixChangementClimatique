import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Méthodologie | Reclaim Finance",
  description:
    "Découvrez la méthodologie d'analyse des risques climatiques utilisée par Reclaim Finance.",
};

export default function MethodologiesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-rf-gray">Méthodologie</h1>
    </div>
  );
}
