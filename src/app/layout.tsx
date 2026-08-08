import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import "./globals.css";

// Self-hosted by next/font. The CSS variables are consumed by the --font-*
// tokens in globals.css rather than being used directly.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--ff-inter",
  display: "swap",
});

/*
 * The old description ("Seventy-eight archetypes rendered in three
 * dimensions") described the hero, not the business — a lovely line and a
 * useless search snippet for a consultancy. Replaced.
 *
 * TODO(seo): metadataBase needs the real production origin before launch —
 * without it every Open Graph image URL resolves relative and breaks on every
 * social platform. Left unset rather than guessed, since a wrong absolute
 * origin is worse than none.
 */
export const metadata: Metadata = {
  title: {
    default: "Shivoham Universal Sol | Vastu, Numerology & Tarot Consultancy",
    template: "%s · Shivoham Universal Sol",
  },
  description:
    "Vastu, numerology, tarot and relationship guidance from Priya Swaroop Tripathi. Practical remedies for health, work, money and relationships. Consultations held remotely, worldwide.",
};

export const viewport: Viewport = {
  themeColor: "#0B0C10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="bg-void-black text-parchment-white font-inter antialiased">
        {/*
          Fixed, so it adds no layout height here — every page's own Section
          reserves the space for it (see the invariant in Section.tsx). The
          hero deliberately opts out and renders full-bleed underneath it.
        */}
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
