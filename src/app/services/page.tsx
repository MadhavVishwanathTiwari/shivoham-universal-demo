import type { Metadata } from "next";
import { SERVICES } from "@/content/services";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import ServiceCard from "@/components/service/ServiceCard";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Vastu consultancy, tarot reading, numerological study and relationship fitness. Practical occult guidance from Priya Swaroop Tripathi.",
};

export default function ServicesPage() {
  return (
    <Section>
      <Eyebrow>What we do</Eyebrow>
      <div aria-hidden className="rule-astral mt-4 h-px w-32" />

      <Heading as="h1" className="mt-6">
        Four ways of reading the same question
      </Heading>
      <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
        Numerology reads the person, Vastu reads the space they live in, tarot
        reads the moment, and relationship fitness works on what happens between
        two people. Most situations are clearest when more than one is brought
        to bear.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {SERVICES.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Section>
  );
}
