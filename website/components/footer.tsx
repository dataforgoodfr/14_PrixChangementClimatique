import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-rf-green-dark">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[120px] py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link
            href="https://reclaimfinance.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/Reclaim-Finance.png"
              alt="Reclaim Finance"
              width={120}
              height={69}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <Link
            href="https://dataforgood.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/dataforgood_condensed_white.png"
              alt="Data for Good"
              width={100}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-white/70 text-sm">
          <span>Publié le 1er juillet 2026</span>
          <span className="hidden md:block text-white/30">·</span>
          <span>
            Hébergé gracieusement par{" "}
            <Link
              href="https://www.clever-cloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-rf-lime transition-colors"
            >
              Clever Cloud
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
