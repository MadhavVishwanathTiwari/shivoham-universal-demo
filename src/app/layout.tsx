import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { TOP_ATLAS } from "@/components/hero/cardData";
import "./globals.css";

// Self-hosted by next/font. The CSS variables are consumed by the --font-*
// tokens in globals.css rather than being used directly.
// 400 and 600 only: those are the two weights the site actually renders (bare
// `font-cinzel` for 400, `font-semibold` on Heading and the hero h1 for 600).
// 500 and 700 were two more render-blocking font files nothing referenced.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
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
    "Vastu, numerology, tarot and energy healing from Priya Swaroop Tripathi. Practical remedies for health, work, money and relationships. Consultations held remotely, worldwide.",
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
      {/*
        The hero's face atlas, fetched at HTML parse instead of three round
        trips later. React hoists this into <head>.

        Without it the sheet sat at the end of a strictly serial chain — hydrate,
        create the WebGL context, fetch card.glb, and only then start the atlas,
        because useCardGeometry suspends before useDeckTexture is ever called.
        Measured on a cold load: card.glb began at 422ms and the atlas at 3763ms.

        `as="fetch"` and not `as="image"`, which looks wrong and is not: three's
        ImageBitmapLoader retrieves the sheet with fetch(), and a fetch request
        has destination "empty" while an as="image" preload has destination
        "image". The preload cache only matches on destination, so as="image"
        left the loader re-requesting the URL and falling back to the HTTP cache
        — measurably two entries, the second an avoidable revalidation.

        `crossOrigin` is required for the same reason and is not about CORS here:
        a preload with the attribute absent uses credentials mode "include",
        three's loader fetches with "same-origin" (it sets that whenever its
        crossOrigin is "anonymous", which is the default), and the preload cache
        matches on credentials mode too. Omit it and the match fails just as
        quietly as the wrong `as` did.

        `type` still earns its place: a browser must skip a preload whose type it
        cannot decode, so this costs nothing on the rare client with no AVIF that
        falls through to the WebP twin. That is also why there is no WebP preload
        beside it — a client supporting both would fetch both.
      */}
      {TOP_ATLAS.srcAvif && (
        <link
          rel="preload"
          as="fetch"
          type="image/avif"
          href={TOP_ATLAS.srcAvif}
          crossOrigin="anonymous"
          fetchPriority="high"
        />
      )}
      <body className="bg-void-black text-parchment-white font-inter antialiased">
        {/*
          Fixed, so it adds no layout height here — every page's own Section
          reserves the space for it (see the invariant in Section.tsx). The
          hero deliberately opts out and renders full-bleed underneath it.
        */}
        <SiteHeader />
        {children}
        <SiteFooter />
        {/* Last in the body so it paints over everything at equal z-index —
            it is fixed, so its position in the flow costs nothing. */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
