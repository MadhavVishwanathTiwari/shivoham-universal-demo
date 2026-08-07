import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Shivoham Universal Sol",
  description:
    "Seventy-eight archetypes rendered in three dimensions. Draw one.",
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
        {children}
      </body>
    </html>
  );
}
