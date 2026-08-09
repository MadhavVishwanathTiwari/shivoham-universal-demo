import type { Service } from "@/content/services";
import { byService } from "@/content/testimonials";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";
import Faq from "@/components/ui/Faq";
import PriceTag from "@/components/ui/PriceTag";
import Reveal from "@/components/ui/Reveal";
import Rule from "@/components/motion/Rule";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
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
        <Rule className="mt-4" />

        <Heading as="h1" className="mt-6">
          {service.tagline}
        </Heading>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <PriceTag pricing={service.pricing} />
          <span className="font-inter text-parchment-white/45 text-sm">
            Approx. {service.durationMinutes} minutes
          </span>
          {service.delivery && (
            <span className="font-inter text-parchment-white/45 text-sm">
              {service.delivery}
            </span>
          )}
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
        <Heading as="h2" reveal>
          What this covers
        </Heading>
        {/* A tighter stagger than the card grids: there are up to eleven of
            these and 0.09s each would take a full second to finish listing. */}
        <Stagger
          as="ul"
          className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2"
          stagger={0.045}
        >
          {service.includes.map((item) => (
            <StaggerItem
              key={item}
              as="li"
              className="font-inter text-parchment-white/70 flex items-start gap-3 text-sm"
            >
              <span aria-hidden className="text-astral-gold mt-0.5">
                ·
              </span>
              {item}
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {testimonials.length > 0 && (
        <Section className="!pt-16">
          <Heading as="h2" reveal>
            In their words
          </Heading>
          <Stagger className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <StaggerItem key={t.id}>
                <TestimonialCard testimonial={t} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {service.faqs.length > 0 && (
        <Section tone="ethereal" className="!pt-16">
          <Heading as="h2" reveal>
            Questions
          </Heading>
          <Reveal className="mt-8">
            <Faq items={service.faqs} />
          </Reveal>
        </Section>
      )}

      <Section className="!pt-16 text-center">
        <Heading as="h2" reveal>
          Ready to begin?
        </Heading>
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
