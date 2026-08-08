import Image from "next/image";
import { SITE } from "@/content/site";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";

/**
 * The homepage's second section: who she is, before what she sells.
 *
 * A practice like this is bought on trust in one person's judgement, and the
 * three testimonials on this page are all about *her* rather than about a
 * product. Meeting the offering first was the wrong order.
 *
 * Server Component on purpose — the content is static, so this ships no JS. A
 * scroll-triggered fade would force "use client" onto it for very little.
 */
export default function PractitionerNote() {
  return (
    <Section tone="ethereal">
      <div className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
        {/*
          A framed photograph rather than the alpha cut-out that was here first.
          The cut-out (still at public/priya-portrait.webp, one line away if this
          is ever reverted) sat directly on the page with no frame, which was
          distinctive — but it was only 418px wide, capping how large it could
          render, and it carried no context. This one is 1511px at source and
          puts her in a room full of books, which says "someone who studies"
          faster than any sentence could.
        */}
        <div className="relative mx-auto w-[300px] shrink-0 md:mx-0">
          {/*
            A violet bloom bleeding out past the frame, so the photograph
            belongs to the page instead of sitting on top of it.

            No negative z-index: this wrapper is `relative` with no z-index of
            its own, so it opens no stacking context, and `-z-10` sent the glow
            behind the Section's background and lost it entirely. Painting order
            handles it — glow absolute and first, frame after.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-nebula-violet)_30%,transparent),transparent_70%)] blur-2xl"
          />
          <div className="surface-astral relative overflow-hidden">
            <Image
              src="/priya-portrait-room.webp"
              alt={`${SITE.practitioner.name}, ${SITE.practitioner.title}`}
              width={1000}
              height={1333}
              sizes="300px"
              className="h-auto w-full"
            />
            {/*
              The photograph is a warm, brightly lit room — mean luma ~149 —
              dropped onto a near-black page. Untreated it reads as a lit
              rectangle and out-shouts everything near it. This vignette sinks
              the edges toward the page so only the centre keeps full
              brightness, which is also where her face is.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_58%_at_50%_36%,transparent,color-mix(in_srgb,var(--color-nebula-void)_80%,transparent))]"
            />
          </div>
        </div>

        <div>
          <Eyebrow>The practice</Eyebrow>
          <div aria-hidden className="rule-astral mt-4 h-px w-32" />

          <Heading as="h2" className="mt-6">
            {SITE.practitioner.name}
          </Heading>
          <p className="font-inter text-astral-gold/70 mt-3 text-sm tracking-[0.2em] uppercase">
            {SITE.practitioner.title}
          </p>

          <Prose paragraphs={SITE.blurb} className="mt-6" />

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/about" variant="ghost">
              Read her story
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
