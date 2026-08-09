"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollProgress from "@/components/motion/ScrollProgress";

/**
 * A few of these routes don't exist yet — they land in later build phases
 * (see the site plan). Next doesn't fail the build over a Link to a route
 * that isn't there yet, it 404s at runtime, so this is safe to ship ahead of
 * the pages themselves rather than holding the whole header back for them.
 */
const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/**
 * Fixed, not sticky, not in flow. This is the header/hero invariant: a header
 * in normal document flow would push the hero's pinned 100svh stage down and
 * it would overflow its own section; a sticky one would overlap it correctly
 * but ends up promoted into its own stacking/scroll context in some browsers,
 * which is exactly the kind of ancestor scroll-container situation
 * globals.css already documents breaking `position: sticky` on the hero
 * itself. `fixed` adds no layout height and creates no scroll container —
 * Section's top padding is what actually reserves the space, see Section.tsx.
 *
 * z-40: above the hero's tooltip (z-20) and mobile CardSheet (z-30), so the
 * header is always the topmost, always-clickable layer regardless of what the
 * hero is doing underneath it.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="border-astral-gold/10 bg-void-black/30 fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="focus-astral font-cinzel text-parchment-white text-sm tracking-[0.2em] uppercase"
          onClick={() => setOpen(false)}
        >
          Shivoham Universal Sol
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-astral font-inter relative py-1 text-sm tracking-wide transition-colors ${
                  active
                    ? "text-astral-gold"
                    : "text-parchment-white/70 hover:text-parchment-white"
                }`}
              >
                {link.label}
                {/*
                  One underline shared by every link. `layoutId` means framer
                  treats the indicator under the old route and the one under the
                  new route as the same element and tweens between them, so it
                  slides across the nav instead of blinking out and in. Rendering
                  it per-link and hiding the inactive ones would give five
                  separate elements and no transition to animate.
                */}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-astral-gold absolute -bottom-0.5 left-0 h-px w-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile: a hamburger that owns its own open state, rather than a
            second `useIsMobile()` consumer — that hook already exists for the
            hero's layout math, this toggle has nothing to do with viewport
            width. */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="focus-astral text-parchment-white relative h-8 w-8 md:hidden"
        >
          <span
            className={`bg-parchment-white absolute left-1/2 h-px w-6 -translate-x-1/2 transition-transform ${
              open ? "top-1/2 rotate-45" : "top-[35%]"
            }`}
          />
          <span
            className={`bg-parchment-white absolute left-1/2 h-px w-6 -translate-x-1/2 transition-transform ${
              open ? "top-1/2 -rotate-45" : "top-[65%]"
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="border-astral-gold/10 bg-void-black/95 absolute inset-x-0 top-full flex flex-col gap-1 border-b px-6 py-4 backdrop-blur-md md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`focus-astral font-inter rounded-astral px-2 py-3 text-sm ${
                  pathname === link.href
                    ? "text-astral-gold"
                    : "text-parchment-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Sits on the header's own bottom border, so it reads as that border
          filling with gold rather than as a separate bar bolted underneath. */}
      <ScrollProgress />
    </header>
  );
}
