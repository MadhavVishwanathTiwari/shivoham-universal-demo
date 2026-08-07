"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

/** Linear map with both ends clamped. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = inMax === inMin ? 1 : (value - inMin) / (inMax - inMin);
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return outMin + (outMax - outMin) * clamped;
}

/**
 * Write a scroll-derived style onto an element ourselves.
 *
 * `useScroll` -> `useTransform` -> `<motion.div style={{ opacity }}>` looks like
 * the idiomatic answer, but framer-motion promotes that chain to a native
 * scroll-driven WAAPI animation. Where that timeline does not advance, the
 * animation pins the property at one end of its range *and* framer stops writing
 * the inline style, so the element is stuck — in this hero that left the whole
 * canvas at opacity 0. Subscribing to the MotionValue and setting the style
 * directly keeps the fades exact and independent of that optimisation.
 *
 * MotionValues still work perfectly as *data* — the deck reads scroll progress
 * inside useFrame — so this is only needed where scroll drives the DOM.
 */
export function useScrollStyle<T extends HTMLElement>(
  progress: MotionValue<number>,
  apply: (element: T, progress: number) => void,
) {
  const ref = useRef<T>(null);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    const run = (value: number) => {
      if (ref.current) applyRef.current(ref.current, value);
    };
    run(progress.get());
    return progress.on("change", run);
  }, [progress]);

  return ref;
}
