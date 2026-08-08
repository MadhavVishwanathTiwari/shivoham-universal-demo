import type { Metadata } from "next";
import { TESTIMONIALS } from "@/content/testimonials";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import TestimonialCard from "@/components/service/TestimonialCard";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Clients in India, the UAE and Pakistan on working with Priya Swaroop Tripathi.",
};

export default function TestimonialsPage() {
  return (
    <>
      <Section>
        <Eyebrow>Success stories</Eyebrow>
        <div aria-hidden className="rule-astral mt-4 h-px w-32" />

        <Heading as="h1" className="mt-6">
          In their words
        </Heading>
        <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
          These are published as written, unedited.
        </p>

        {/* One column: these are long-form and personal, and a two-column grid
            would truncate the one that is most worth reading. */}
        <div className="mt-12 space-y-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} full />
          ))}
        </div>
      </Section>

      <Section tone="ethereal" className="!pt-16 text-center">
        <Heading as="h2">Start your own</Heading>
        <div className="mt-8">
          <Button href="/contact">Get in touch</Button>
        </div>
      </Section>
    </>
  );
}
