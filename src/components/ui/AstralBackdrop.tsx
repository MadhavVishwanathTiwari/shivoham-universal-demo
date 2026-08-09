/**
 * The ambient field behind a section — the hero's nebula, restated for flat
 * content: drifting violet/indigo blooms, a two-layer starfield, a gold wash
 * along one edge, and a vignette to sink the corners back into the page.
 *
 * Deliberately *not* the hero's treatment repeated. The hero's light comes up
 * from the bottom centre, under the deck; this one comes from the sides, so a
 * section that carries a photograph and a column of text is lit around its
 * content rather than behind it, and the two blocks don't read as the same
 * screen twice.
 *
 * No "use client", no JS, nothing in the bundle: every moving part is a CSS
 * animation on `transform` (see the astral-field block in globals.css, which
 * documents why it may only ever be transform). Reduced motion is handled
 * globally — the keyframes are built to settle on their own first frame.
 *
 * USAGE: the host section must be `relative isolate overflow-hidden`.
 *   - `relative` — this is `absolute inset-0` and needs that as its containing
 *     block, not some ancestor further up.
 *   - `isolate` — this sits at `-z-10` so section content paints over it
 *     without every caller having to raise its own z-index. Without a stacking
 *     context on the section, -z-10 escapes and hides behind the section's
 *     background instead, and the whole field disappears.
 *   - `overflow-hidden` — the blooms are intentionally oversized and bleed past
 *     every edge.
 */
export default function AstralBackdrop({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/*
        The starfields are inset *negatively* by more than their own travel
        (320px and 460px respectively). A layer that only covered inset-0 would
        drag its own edge into frame as it drifts, and you would watch the sky
        run out in the corner it moves toward.

        Masked to a soft ellipse so the stars are densest behind the copy and
        gone by the frame edge — a starfield that reaches the section's border
        draws a rectangle, which is the one thing a night sky must not do.
      */}
      <div
        className="astral-stars astral-stars--far -inset-[520px] opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]"
      />
      <div
        className="astral-stars astral-stars--near -inset-[380px] opacity-60 [mask-image:radial-gradient(65%_55%_at_50%_50%,black,transparent)]"
      />

      {/*
        Three blooms, each on its own period (38s / 52s / 30s) with no common
        factor, so the composition never visibly repeats — they beat against
        each other instead of returning to a pose you can learn.

        The anchors sit outside the box on purpose: only the falloff of each
        circle is ever on screen, never its centre, so there is no bright core
        to catch the eye and give the trick away.

        Sized `max(vw, px)`, and the pixel floor is the part that matters. On a
        phone this section is at its *tallest* (portrait and copy stack) while
        vw is at its smallest — plain vw sizing put three small discs in the
        corners of a very long box with nothing in between, which reads as three
        stains rather than as a field. The floors only ever bind below ~750px
        wide; every desktop width takes the vw value unchanged.
      */}
      <div className="astral-bloom astral-bloom--a top-[-30%] left-[-15%] h-[max(70vw,520px)] w-[max(70vw,520px)] bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-nebula-violet)_22%,transparent),transparent_65%)]" />
      <div className="astral-bloom astral-bloom--b right-[-20%] bottom-[-35%] h-[max(75vw,560px)] w-[max(75vw,560px)] bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-nebula-indigo)_55%,transparent),transparent_68%)]" />
      <div className="astral-bloom astral-bloom--c top-[15%] right-[10%] h-[max(40vw,300px)] w-[max(40vw,300px)] bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-astral-gold)_9%,transparent),transparent_62%)]" />

      {/* Static, and the only static layer here. It is the floor the moving
          parts sit on: a low gold wash off the left edge behind the portrait,
          then a vignette over everything so the section still meets its
          neighbours in near-black and the seams stay invisible. */}
      <div className="absolute inset-0 bg-[radial-gradient(45%_60%_at_0%_50%,color-mix(in_srgb,var(--color-astral-gold)_7%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,transparent_35%,color-mix(in_srgb,var(--color-nebula-void)_60%,transparent)_100%)]" />
    </div>
  );
}
