"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * A grid or list whose children arrive one after another instead of together.
 *
 * The stagger lives in a variants tree rather than per-child `delay` props: the
 * container owns the timing, so adding or removing a card never means
 * renumbering its siblings, and the children carry no index at all.
 *
 * ⚠️ Same rule as Reveal — below the fold only. `initial: { opacity: 0 }` is
 * what server-renders, so an above-fold Stagger is invisible until React
 * hydrates and stays invisible forever if the bundle fails. See the note on
 * Reveal for why that failure is specifically nasty on this site.
 */

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * `as` exists so a genuine list stays a list. Wrapping <li>s in animated <div>s
 * strips the list role, and a screen reader stops announcing "list, 8 items" —
 * which on a service page's "what this covers" is most of the information.
 */
type Tag = "div" | "ul" | "ol";

export function Stagger({
  children,
  className = "",
  stagger = 0.09,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Gap between consecutive children, in seconds. */
  stagger?: number;
  /** Held before the first child moves. */
  delay?: number;
  as?: Tag;
}) {
  const reducedMotion = useReducedMotion();
  const Plain = as;
  if (reducedMotion) return <Plain className={className}>{children}</Plain>;

  const M = motion[as];
  return (
    <M
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-8% 0px" }}
    >
      {children}
    </M>
  );
}

/**
 * One child of a Stagger. Renders a plain div when there is no animating
 * parent, so it is safe to use unconditionally — including under reduced
 * motion, where Stagger above has already collapsed to a plain div and the
 * variant names below simply resolve to nothing.
 */
export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Match the parent Stagger: "li" inside a "ul"/"ol". */
  as?: "div" | "li";
}) {
  const reducedMotion = useReducedMotion();
  const Plain = as;
  if (reducedMotion) return <Plain className={className}>{children}</Plain>;

  const M = motion[as];
  return (
    <M className={className} variants={item}>
      {children}
    </M>
  );
}
