import Link from "next/link";
import { SITE } from "@/content/site";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

/** Legal pages land in Phase 2 — linked ahead of time for the same reason
 *  SiteHeader links to unbuilt service pages: Next 404s at runtime rather
 *  than failing the build, so there's no cost to wiring the nav first. */
const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms & Conditions" },
  { href: "/legal/refunds", label: "Cancellation & Refunds" },
  { href: "/legal/shipping", label: "Shipping Policy" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-astral-gold/10 bg-void-black border-t px-6 py-14">
      <Stagger className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        <StaggerItem>
          <p className="font-cinzel text-parchment-white text-sm tracking-[0.2em] uppercase">
            {SITE.name}
          </p>
          <p className="text-parchment-white/55 font-inter mt-3 text-sm">
            {SITE.practitioner.name}
            <br />
            {SITE.practitioner.title}
          </p>
        </StaggerItem>

        <StaggerItem className="font-inter text-sm">
          <p className="text-astral-gold/75 tracking-[0.2em] uppercase text-xs">
            Contact
          </p>
          <ul className="text-parchment-white/70 mt-3 space-y-1.5">
            <li>
              <a href={`tel:${SITE.contact.phoneE164}`} className="focus-astral hover:text-parchment-white">
                {SITE.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.contact.email}`} className="focus-astral hover:text-parchment-white">
                {SITE.contact.email}
              </a>
            </li>
            {/*
              Society and city only, where /contact prints the full block. A
              footer is on every page and this is a home practice — the shorter
              line is enough to say "a real practice, in a real place" without
              repeating a residential address site-wide.

              TODO(address): still not a *registered* address — no unit, no
              confirmed PIN, both of which Razorpay needs for live keys. See
              contact.address in content/site.ts.
            */}
            <li className="pt-1.5">
              <Link
                href="/contact"
                className="focus-astral hover:text-parchment-white"
              >
                {SITE.contact.address.society},{" "}
                {SITE.contact.address.locality}
              </Link>
            </li>
          </ul>
        </StaggerItem>

        <StaggerItem className="font-inter text-sm">
          <p className="text-astral-gold/75 tracking-[0.2em] uppercase text-xs">
            Legal
          </p>
          <ul className="text-parchment-white/70 mt-3 space-y-1.5">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="focus-astral hover:text-parchment-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </StaggerItem>
      </Stagger>

      <p className="text-parchment-white/35 font-inter mt-12 text-center text-xs">
        © {year} {SITE.legalName}. All rights reserved.
      </p>
    </footer>
  );
}
