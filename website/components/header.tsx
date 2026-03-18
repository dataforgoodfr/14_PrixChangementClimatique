"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RFButton as Button } from "@/components/core/rf-button";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/carte", label: "Carte" },
  { href: "/methodologies", label: "Méthodologie" },
  { href: "/analyses", label: "Analyses" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 gap-6 z-50 relative">
      <Link href="/" className="shrink-0">
        <Image
          src="/logo-rf.png"
          alt="Reclaim Finance"
          width={140}
          height={40}
          className="h-10 w-auto"
        />
      </Link>

      <nav className="flex-1 flex items-center justify-center gap-8">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm pb-1 border-b-2 transition-colors ${
                isActive
                  ? "font-semibold text-rf-green-dark border-rf-lime"
                  : "font-normal text-rf-gray border-transparent hover:text-rf-green-dark"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0">
        <Button title="Nous contacter" path="/" />
      </div>
    </header>
  );
}
