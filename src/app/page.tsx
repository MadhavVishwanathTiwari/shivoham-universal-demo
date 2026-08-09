import HeroSection from "@/components/hero/HeroSection";
import { SERVICES } from "@/content/services";
/* Real testimonials plus invented filler for the marquee. Swap this import for
   `{ TESTIMONIALS } from "@/content/testimonials"` and delete
   content/testimonials.demo.ts to strip every fabricated quote. */
import { MARQUEE_TESTIMONIALS } from "@/content/testimonials.demo";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Rule from "@/components/motion/Rule";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import PractitionerNote from "@/components/site/PractitionerNote";
import StatsBand from "@/components/site/StatsBand";
import ServiceCard from "@/components/service/ServiceCard";
import TestimonialMarquee from "@/components/service/TestimonialMarquee";

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

      {/* Flush against the hero, no gap. The hero's exit fade is built to have
          the next block already arriving as the deck dissolves — a margin here
          reintroduces the screen of dead black that fade exists to kill. */}
      <StatsBand />

      {/* Who she is, before what she sells — the hero hands straight off to
          this rather than to a price grid. */}
      <PractitionerNote />

      {/* The hero's own section supplies the top spacing, so this block
          doesn't need to clear the fixed header the way inner pages do. */}
      {/*
        ONE services block, not two. This briefly carried the card grid and then
        a separate fee table underneath, which listed the same four services a
        second time — the only thing the table added was the sub-services, and
        those now sit on the card itself. The price was always on both.
      */}
      <Section className="!pt-20">
        <Eyebrow>What we do</Eyebrow>
        <Rule className="mt-4" />

        <Heading as="h2" className="mt-6" reveal>
          Four ways of reading the same question
        </Heading>
        <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
          Numerology reads the person, Vastu reads the space they live in, tarot
          reads the moment, and healing works on the state you are carrying
          while you deal with all three. Fees are published, not quoted on
          request — tarot is billed per question, so a single question is a real
          option.
        </p>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <StaggerItem key={service.slug}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/*
        Not a <Section>: the marquee has to run edge to edge, and Section
        clamps its child to max-w-5xl with 1.5rem of padding — which is exactly
        right for the heading either side of it and exactly wrong for the row
        itself. So the tone and vertical rhythm are reproduced here, and only
        the copy is re-clamped.
      */}
      <section className="bg-ethereal-gray/20 overflow-hidden py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Eyebrow>Success stories</Eyebrow>
          {/* Not a count. The row is padded with demo entries (see
              content/testimonials.demo.ts) and any number here goes stale the
              moment that file is deleted before launch. */}
          <Heading as="h2" className="mt-4" reveal>
            Clients across India, the Gulf and beyond
          </Heading>
        </div>

        <Reveal className="mt-6">
          <TestimonialMarquee testimonials={MARQUEE_TESTIMONIALS} />
        </Reveal>

        <div className="mx-auto mt-10 max-w-5xl px-6">
          <Button href="/testimonials" variant="ghost">
            Read them in full
          </Button>
        </div>
      </section>

      {/* A pure closing call to action. Her name and vision used to be repeated
          here, but PractitionerNote now carries both further up the page. */}
      <Section className="!pt-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Heading as="h2" reveal>
            Where would you like to begin?
          </Heading>
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
        </Reveal>
      </Section>
    </main>
  );
}
