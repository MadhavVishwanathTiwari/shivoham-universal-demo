import type { ReactNode } from "react";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Rule from "@/components/motion/Rule";

/**
 * Shared shell for the legal pages.
 *
 * ⚠️ The copy in these pages is PLACEHOLDER. It exists so the footer links
 * resolve and the demo reads as complete — it is not reviewed legal text, and
 * Razorpay will not accept a live account on the strength of it. Each page
 * needs real copy (and ideally a lawyer's eye) before launch.
 */
export default function LegalPage({
  title,
  updated = "Not yet published",
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <Section>
      <Eyebrow>Legal</Eyebrow>
      <Rule className="mt-4" />

      <Heading as="h1" className="mt-6">
        {title}
      </Heading>
      <p className="font-inter text-parchment-white/40 mt-3 text-xs">
        Last updated: {updated}
      </p>

      <div className="font-inter text-parchment-white/70 mt-10 max-w-3xl space-y-4 leading-relaxed text-pretty">
        {children}
      </div>
    </Section>
  );
}
