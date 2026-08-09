"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A heading that rises out from behind its own baseline.
 *
 * The mask is a plain `overflow: hidden` wrapper; the text inside starts one
 * full box-height below and slides up. No word or character splitting — that
 * would mean rebuilding the text as a pile of spans, which breaks `text-balance`
 * (the whole reason these headings wrap nicely), breaks text selection, and
 * hands a screen reader a heading it may read one fragment at a time.
 *
 * `padding-bottom` on the mask with a matching negative margin is doing real
 * work: Cinzel's descenders (the 'y' in "energy") overflow the line box, and a
 * tight `overflow: hidden` shears their tails off for the entire life of the
 * page, not just during the animation.
 */
export default function TextReveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <>{children}</>;

  return (
    <span className="-mb-[0.18em] block overflow-hidden pb-[0.18em]">
      <motion.span
        className="block"
        initial={{ y: "108%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
