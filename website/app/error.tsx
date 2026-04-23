"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error("Global error boundary:", error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-rf-gray text-center mb-2">
          Une erreur est survenue
        </h2>

        <p className="text-gray-600 text-center mb-4">
          {error.message || "Une erreur inattendue s'est produite"}
        </p>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-rf-green-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="flex-1 bg-gray-100 text-rf-gray px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
