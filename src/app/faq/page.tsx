import type { Metadata } from "next";
import { GENERAL_FAQS, SERVICES } from "@/content/services";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Faq from "@/components/ui/Faq";
import Button from "@/components/ui/Button";
import Rule from "@/components/motion/Rule";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about numerology, Vastu, tarot, remedies, fees and how long the work takes.",
};

export default function FaqPage() {
  return (
    <>
      <Section>
        <Eyebrow>Questions</Eyebrow>
        <Rule className="mt-4" />

        <Heading as="h1" className="mt-6">
          Frequently asked
        </Heading>

        <div className="mt-10">
          <Faq items={GENERAL_FAQS} />
        </div>
      </Section>

      {/* The per-service questions repeated here, so someone who lands on the
          FAQ from search doesn't have to visit four pages to find them. */}
      <Section tone="ethereal" className="!pt-16">
        <Heading as="h2" reveal>
          By service
        </Heading>
        <div className="mt-8 space-y-10">
          {SERVICES.filter((s) => s.faqs.length > 0).map((service) => (
            <div key={service.slug}>
              <h3 className="font-cinzel text-astral-gold mb-3 text-lg">
                {service.name}
              </h3>
              <Faq items={service.faqs} />
            </div>
          ))}
        </div>
      </Section>

      <Section className="!pt-16 text-center">
        <Heading as="h2" reveal>
          Still wondering?
        </Heading>
        <div className="mt-8">
          <Button href="/contact">Ask directly</Button>
        </div>
      </Section>
    </>
  );
}
