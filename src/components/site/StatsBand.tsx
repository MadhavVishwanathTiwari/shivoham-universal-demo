"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * ⚠️ EVERY FIGURE BELOW IS INVENTED. ⚠️
 *
 * Same release gate as PRICES_ARE_PLACEHOLDER in content/services.ts, and a
 * sharper one: an invented price is a commercial mistake, but "3,400
 * consultations" is a factual claim about a real business that could be read as
 * advertising. Get the real numbers from her, or drop the band, before launch.
 *
 * Grep this constant to find every affected surface.
 */
export const STATS_ARE_PLACEHOLDER = true;

interface Stat {
  /** The number to count to. Kept numeric so the count-up has something to
   *  interpolate — the rendered string is assembled from the parts below. */
  value: number;
  /** Thousands separator is authored via toLocaleString("en-IN") at render.
   *  See the note on that call — it is safe here in a way it isn't for money. */
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 12, suffix: "+", label: "Years of practice" },
  { value: 3400, suffix: "+", label: "Consultations given" },
  { value: 1200, suffix: "+", label: "Clients guided" },
  { value: 9, label: "Countries served" },
];

/**
 * en-IN grouping (1,200 / 3,400 here, but 1,20,000 above a lakh) is the correct
 * convention for this audience. Unlike PriceTag's authored `displayINR`, this is
 * safe to derive: the count-up rewrites the text on the client anyway, so the
 * value is never frozen into the SSR output as a hydration-critical string.
 */
const format = (n: number) => Math.round(n).toLocaleString("en-IN");

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (!inView || reducedMotion) return;

    /*
     * Starts from 0 only once the band is actually on screen. The server
     * renders the final figure, so no-JS and first paint both show the truth —
     * the reset to 0 happens below the fold where nobody sees it snap.
     */
    const controls = animate(0, stat.value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reducedMotion, stat.value]);

  return (
    <span
      ref={ref}
      className="font-cinzel text-astral-gold text-glow-gold text-4xl md:text-5xl"
    >
      {/* tabular-nums stops the column jittering sideways while it counts. */}
      <span className="tabular-nums">{format(display)}</span>
      {stat.suffix}
    </span>
  );
}

/**
 * The band directly under the hero. Full-bleed and flush — no top margin — so
 * it arrives as the deck dissolves rather than after a gap of black. The hero's
 * exit fade is built for exactly this handoff; see the comment on
 * `exitProgress` in HeroSection.tsx.
 */
export default function StatsBand() {
  return (
    <section
      aria-label="The practice in numbers"
      className="border-astral-gold/10 bg-ethereal-gray/20 border-y"
    >
      {/*
        Hairline dividers between cells, not around the block. `divide-x` can't
        do this on a grid — it targets `* + *`, so on the two-column mobile
        layout the third cell (first of its row) would get a stray left rule.
        Instead every cell draws its own top+left rule and is pulled back a
        pixel, and the container clips the first row's and first column's — one
        rule per seam, none on the perimeter, at any column count.
      */}
      <dl className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden sm:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border-astral-gold/10 -mt-px -ml-px flex flex-col-reverse items-start gap-3 border-t border-l px-6 py-10 sm:px-8 md:py-14"
          >
            {/* flex-col-reverse: the label reads second but sits below the
                figure, and <dt> still precedes its <dd> in source order. */}
            <dt className="font-inter text-parchment-white/45 text-[10px] tracking-[0.28em] uppercase md:text-[11px]">
              {stat.label}
            </dt>
            <dd>
              <Counter stat={stat} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
