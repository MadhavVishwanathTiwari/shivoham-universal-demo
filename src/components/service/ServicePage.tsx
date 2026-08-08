import type { Service } from "@/content/services";
import { byService } from "@/content/testimonials";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";
import Faq from "@/components/ui/Faq";
import PriceTag from "@/components/ui/PriceTag";
import TestimonialCard from "./TestimonialCard";

/**
 * One renderer for all four service pages. The pages themselves stay ten-line
 * files that pick a Service out of the catalogue and hand-author their own
 * `metadata` — which is the whole reason the route map uses literal folders
 * rather than a [slug] segment.
 */
export default function ServicePage({ service }: { service: Service }) {
  const testimonials = byService(service.slug);

  return (
    <>
      <Section>
        <Eyebrow>{service.name}</Eyebrow>
        <div aria-hidden className="rule-astral mt-4 h-px w-32" />

        <Heading as="h1" className="mt-6">
          {service.tagline}
        </Heading>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <PriceTag pricing={service.pricing} />
          <span className="font-inter text-parchment-white/45 text-sm">
            Approx. {service.durationMinutes} minutes
          </span>
        </div>

        {/* Everything routes to /contact for now — booking and payment are
            later phases, and a dead checkout button is worse than an honest
            enquiry link. */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/contact">Request a consultation</Button>
          <Button href="/services" variant="ghost">
            All services
          </Button>
        </div>

        <Prose paragraphs={service.body} className="mt-12" />
      </Section>

      <Section tone="ethereal" className="!pt-16">
        <Heading as="h2">What this covers</Heading>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {service.includes.map((item) => (
            <li
              key={item}
              className="font-inter text-parchment-white/70 flex items-start gap-3 text-sm"
            >
              <span aria-hidden className="text-astral-gold mt-0.5">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {testimonials.length > 0 && (
        <Section className="!pt-16">
          <Heading as="h2">In their words</Heading>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      {service.faqs.length > 0 && (
        <Section tone="ethereal" className="!pt-16">
          <Heading as="h2">Questions</Heading>
          <div className="mt-8">
            <Faq items={service.faqs} />
          </div>
        </Section>
      )}

      <Section className="!pt-16 text-center">
        <Heading as="h2">Ready to begin?</Heading>
        <p className="font-inter text-parchment-white/60 mx-auto mt-4 max-w-xl text-pretty">
          Share your situation and you will get a clear sense of what the work
          involves before anything is committed.
        </p>
        <div className="mt-8">
          <Button href="/contact">Get in touch</Button>
        </div>
      </Section>
    </>
  );
}
