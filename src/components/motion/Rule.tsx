"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The gold hairline under every section eyebrow, drawn rather than just
 * present.
 *
 * Replaces the `<div aria-hidden className="rule-astral mt-4 h-px w-32" />`
 * that was copy-pasted into six files. Same output, one definition, and it now
 * animates.
 *
 * `scaleX` from 0 with a left origin, not an animated `width`: width is a
 * layout property and animating it makes the browser reflow the section on
 * every frame. The gradient already fades both ends, so the growing edge reads
 * as ink spreading rather than as a bar extending.
 */
export default function Rule({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div aria-hidden className={`rule-astral h-px w-32 ${className}`} />;
  }

  return (
    <motion.div
      aria-hidden
      className={`rule-astral h-px w-32 origin-left ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
