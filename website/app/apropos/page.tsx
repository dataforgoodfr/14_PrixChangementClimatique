import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | Reclaim Finance",
  description:
    "En savoir plus sur Reclaim Finance et notre mission de lutte contre le changement climatique.",
};

export default function AProposPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-rf-gray">À propos</h1>
    </div>
  );
}
