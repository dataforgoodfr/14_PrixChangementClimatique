import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyses | Reclaim Finance",
  description:
    "Retrouvez les analyses et rapports sur les risques climatiques en France réalisés par Reclaim Finance.",
};

export default function AnalysesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-rf-gray">Analyses</h1>
    </div>
  );
}
