"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RFButton } from "@/components/core/rf-button";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/carte", label: "Carte" },
  { href: "/methodologie", label: "Méthodologie" },
  { href: "/apropos", label: "À propos" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full flex items-center justify-between px-8 gap-6 relative">
        <Link href="/" className="shrink-0 flex items-center gap-3">
          <Image
            src="/logo-assurer-ma-ville.svg"
            alt="Reclaim Finance"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
          <span className="hidden lg:block text-sm font-semibold text-rf-gray">
            Assurer ma ville
          </span>
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
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

        <div className="hidden md:block shrink-0">
          <RFButton
            path="/#contact"
            title="Agissez pour protéger votre commune"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          aria-labelledby="Menu Toggle Button"
          className="size-8 lg:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <XIcon className="size-6" />
          ) : (
            <MenuIcon className="size-6" />
          )}
        </Button>
      </div>
      <ul
        className={cn(
          "flex md:hidden z-50 items-center gap-8 bg-background flex-col fixed top-16 right-0 bottom-0 w-full p-8 transform transition-transform duration-300 ease-in-out",
          isMenuOpen && " translate-x-0",
          !isMenuOpen && "translate-x-full",
        )}
      >
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={toggleMenu}
                className={`text-sm pb-1 border-b-2 transition-colors ${
                  isActive
                    ? "font-semibold text-rf-green-dark border-rf-lime"
                    : "font-normal text-rf-gray border-transparent hover:text-rf-green-dark"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <RFButton
            path="/#contact"
            title="Nous contacter"
            onClick={toggleMenu}
          />
        </li>
      </ul>
    </header>
  );
}
