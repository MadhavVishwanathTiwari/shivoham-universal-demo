"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Drifts its child vertically against the page as it scrolls through the
 * viewport.
 *
 * Deliberately small — `distance` defaults to 28px of total travel across a
 * full viewport of scrolling. Parallax reads as expensive when it is subtle
 * and as a gimmick the moment the reader can see the element sliding, and the
 * only thing it is doing here is stopping a large photograph from feeling
 * pasted onto the page.
 *
 * The offset is symmetric around the element's centre, so it sits exactly where
 * the layout puts it when it is centred in the viewport — the drift never
 * changes where the element ends up, only how it gets there.
 */
export default function Parallax({
  children,
  className = "",
  distance = 28,
}: {
  children: ReactNode;
  className?: string;
  /** Total travel in px across the element's full pass through the viewport. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Vestibular disorders are the reason prefers-reduced-motion exists, and
  // scroll-coupled parallax is the canonical trigger. This one is off entirely,
  // not merely shortened.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
