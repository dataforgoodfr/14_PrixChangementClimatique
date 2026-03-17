"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-6 z-50 relative">
      <Link href="/" className="shrink-0">
        <Image
          src="/logo-rf.png"
          alt="Reclaim Finance"
          width={140}
          height={40}
          className="h-10 w-auto"
        />
      </Link>

      <div className="flex-1 flex justify-center">
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
      </div>

      <nav className="flex items-center gap-6 shrink-0">
        <Link
          href="/"
          className={`text-sm font-medium pb-0.5 border-b-2 ${
            pathname === "/"
              ? "border-red-500 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Accueil
        </Link>
        <Link
          href="#"
          className="text-sm text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
        >
          Notre approche
        </Link>
        <Link
          href="/composants"
          className={`text-sm font-medium pb-0.5 border-b-2 ${
            pathname === "/composants"
              ? "border-red-500 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Composants
        </Link>
        <Link
          href="#"
          className="text-sm text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
        >
          FAQ
        </Link>
      </nav>
    </header>
  );
}
