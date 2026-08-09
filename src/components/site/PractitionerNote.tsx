import Image from "next/image";
import { SITE } from "@/content/site";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";
import Parallax from "@/components/motion/Parallax";
import Rule from "@/components/motion/Rule";
import AstralBackdrop from "@/components/ui/AstralBackdrop";

/**
 * The homepage's second section: who she is, before what she sells.
 *
 * A practice like this is bought on trust in one person's judgement, and the
 * three testimonials on this page are all about *her* rather than about a
 * product. Meeting the offering first was the wrong order.
 *
 * Still a Server Component. The motion primitives it now uses are client
 * components, but they receive this file's markup as `children` — so the JSX
 * is rendered on the server and passed through as a slot, and this module
 * itself never lands in the bundle.
 */
export default function PractitionerNote() {
  // relative/isolate/overflow-hidden are AstralBackdrop's stated contract, not
  // styling preference — see the USAGE note on that component for what each of
  // the three is holding up.
  return (
    <Section tone="ethereal" className="relative isolate overflow-hidden">
      <AstralBackdrop />

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
        {/* A slow drift against the text column as the section passes. Small
            enough that you register the photograph as sitting *in* the page
            rather than seeing it move. */}
        <Parallax className="relative mx-auto w-[300px] shrink-0 md:mx-0" distance={34}>
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
          <div className="surface-astral relative overflow-hidden border-astral-gold/25 p-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="relative overflow-hidden rounded-[calc(var(--radius-astral)-0.4rem)]">
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
                just the corners toward the page so the centre, including her
                face, stays close to source brightness.

                Ceiling dropped further (24%, from 42%) and the ellipse pulled
                in tighter (78% 68%) after the previous pass still read as dim
                across the lower two-thirds — the falloff now only reaches the
                frame's own corners instead of eating most of the shot.
              */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(78%_68%_at_50%_38%,transparent,color-mix(in_srgb,var(--color-nebula-void)_24%,transparent))]"
              />
            </div>
          </div>
        </Parallax>

        <div>
          <Eyebrow>The practice</Eyebrow>
          <Rule className="mt-4" />

          <Heading as="h2" className="mt-6" reveal>
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
