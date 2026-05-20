import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { FiltersProvider } from "@/components/filters/filter-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Assurer ma ville",
  icons: {
    icon: "/logo-assurer-ma-ville.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={"font-sans antialiased"}>
        <Header />
        <Providers>
          <FiltersProvider>
            <NuqsAdapter>
              <TooltipProvider>{children}</TooltipProvider>
            </NuqsAdapter>
          </FiltersProvider>
        </Providers>
      </body>
    </html>
  );
}
