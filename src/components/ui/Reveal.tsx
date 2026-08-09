"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A below-the-fold entrance. Wrap a block, it rises into place once as it
 * scrolls in.
 *
 * ⚠️ NEVER wrap a page's first Section, its <h1>, or anything else above the
 * fold. `initial: { opacity: 0 }` is what server-renders, so if the client
 * bundle fails to load the wrapped content stays invisible forever — that is
 * exactly the "headline invisible, gold rule visible, canvas black" state
 * CLAUDE.md documents, and it is indistinguishable from a rendering bug. Below
 * the fold the same failure is survivable because the page has already proved
 * it hydrated by the time you get there.
 *
 * Under reduced motion this renders a plain <div>, not an instant animation:
 * the global rule in globals.css collapses durations, but a motion element with
 * a whileInView target still depends on the viewport observer firing.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger siblings by hand rather than with a variants tree — there are
   *  only ever two or three of these per page. */
  delay?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
