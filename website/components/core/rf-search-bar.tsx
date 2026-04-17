"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={16}
      />
      <input
        type="text"
        placeholder="Rechercher une commune (nom, code postal)"
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
      />
    </div>
  );
}
