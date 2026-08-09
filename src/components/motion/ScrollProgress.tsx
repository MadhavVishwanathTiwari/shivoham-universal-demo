"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * A gold hairline across the bottom edge of the header that fills as the page
 * scrolls.
 *
 * Rendered inside SiteHeader rather than as its own fixed element, so it
 * inherits the header's stacking and can never drift out of alignment with the
 * border it sits on.
 *
 * `scaleX` with `transform-origin: left` rather than an animated `width`:
 * transforms are compositor-only, width is not, and this repaints on every
 * scroll frame of every page on the site.
 *
 * Unlike the hero's fades this CAN use a MotionValue straight through
 * `style` — the note in useScrollStyle is about framer promoting scroll-linked
 * *DOM* chains to native scroll timelines and then stranding them. That bit
 * hero elements inside a `position: sticky` stage; this element is in normal
 * flow in a fixed header, where the optimisation behaves.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();

  // Without the spring the bar tracks a trackpad's raw scroll jitter and reads
  // as nervous. Stiff enough that it never lags behind noticeably.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });

  // The bar is a progress indicator, not decoration, so reduced motion keeps
  // it — it just tracks scroll exactly instead of easing toward it.
  const value = reducedMotion ? scrollYProgress : scaleX;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: value }}
      className="via-astral-gold absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent to-transparent"
    />
  );
}
