import type { Metadata } from "next";
import { SERVICES } from "@/content/services";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import ServiceCard from "@/components/service/ServiceCard";
import Rule from "@/components/motion/Rule";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Vastu consultancy, tarot reading, numerological study, and healing and meditation. Practical occult guidance from Priya Swaroop Tripathi, with published fees.",
};

export default function ServicesPage() {
  return (
    <Section>
      <Eyebrow>What we do</Eyebrow>
      <Rule className="mt-4" />

      <Heading as="h1" className="mt-6">
        Four ways of reading the same question
      </Heading>
      <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
        Numerology reads the person, Vastu reads the space they live in, tarot
        reads the moment, and healing works on the state you are carrying while
        you deal with all three. Most situations are clearest when more than one
        is brought to bear.
      </p>

      {/* One block. The fee table that used to follow this grid repeated all
          four services purely to show their sub-services and price; the card
          carries both now. */}
      <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
        {SERVICES.map((service) => (
          <StaggerItem key={service.slug}>
            <ServiceCard service={service} />
          </StaggerItem>
        ))}
      </Stagger>

      <p className="font-inter text-parchment-white/45 mt-10 max-w-2xl text-sm text-pretty">
        Fees are published rather than quoted on request. Vastu and healing
        start from the figure shown because the scope genuinely varies; the
        other two are the fee.
      </p>
    </Section>
  );
}
