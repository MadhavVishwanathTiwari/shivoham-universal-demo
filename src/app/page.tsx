import HeroSection from "@/components/hero/HeroSection";
import { SERVICES } from "@/content/services";
import { TESTIMONIALS } from "@/content/testimonials";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PractitionerNote from "@/components/site/PractitionerNote";
import ServiceCard from "@/components/service/ServiceCard";
import TestimonialCard from "@/components/service/TestimonialCard";

export default function Home() {
  return (
    <main className="bg-void-black min-h-screen">
      {/*
        Imported directly, never through dynamic(..., { ssr: false }). The
        hero's DOM shell — headline, gold rule, scroll cue — server-renders and
        is the LCP element; disabling SSR would blank it, which is exactly the
        "headline invisible, canvas black" failure state CLAUDE.md documents.
        The App Router already code-splits this per route, so it costs other
        pages nothing.
      */}
      <HeroSection />

      {/* Who she is, before what she sells — the hero hands straight off to
          this rather than to a price grid. */}
      <PractitionerNote />

      {/* The hero's own section supplies the top spacing, so this block
          doesn't need to clear the fixed header the way inner pages do. */}
      <Section className="!pt-20">
        <Eyebrow>What we do</Eyebrow>
        <div aria-hidden className="rule-astral mt-4 h-px w-32" />

        <Heading as="h2" className="mt-6">
          Four ways of reading the same question
        </Heading>
        <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
          Numerology reads the person, Vastu reads the space they live in, tarot
          reads the moment, and relationship fitness works on what happens
          between two people.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      <Section tone="ethereal" className="!pt-16">
        <Eyebrow>Success stories</Eyebrow>
        <Heading as="h2" className="mt-5">
          Clients across three countries
        </Heading>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>

        <div className="mt-10">
          <Button href="/testimonials" variant="ghost">
            Read them in full
          </Button>
        </div>
      </Section>

      {/* A pure closing call to action. Her name and vision used to be repeated
          here, but PractitionerNote now carries both further up the page. */}
      <Section className="!pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h2">Where would you like to begin?</Heading>
          <p className="font-inter text-parchment-white/65 mt-5 text-pretty">
            Share your situation and you will get a clear sense of what the work
            involves before anything is committed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Request a consultation</Button>
            <Button href="/services" variant="ghost">
              See all services
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
