"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The page transition.
 *
 * `template.tsx` rather than `layout.tsx` on purpose: a layout instance is
 * preserved across navigations, so a mount animation in one would fire exactly
 * once in a session. A template is remounted on every route change, which is
 * the entire behaviour this needs.
 *
 * Enter-only — there is no exit half. Playing one would mean holding the old
 * route on screen while the new one is already resolved, and App Router does
 * not give a template the "leaving" render to animate. A short fade in beats a
 * fake 300ms of latency on every click.
 *
 * Distances are small (10px) and the duration short (0.4s). This runs on every
 * navigation including back/forward, where anything longer stops reading as
 * polish and starts reading as the site being slow.
 *
 * ...but NOT on the first load, and that carve-out is a performance fix, not a
 * taste call. `initial` is server-rendered as an inline style, so on a cold load
 * this wrapper shipped the entire page — hero canvas included — as opacity: 0
 * and held it there until hydration. It then composited the whole 200svh
 * document at a fractional opacity for 400ms, concurrently with WebGL context
 * creation, shader compilation and the atlas upload. A transition nobody asked
 * for, paid for at the worst possible moment. A first load has nothing to
 * transition *from*, so there was never anything to see.
 */

/** Module scope on purpose: survives the remount a navigation causes, resets on
 *  a full page load. That is exactly the first-load/navigation distinction. */
let hasNavigated = false;

export default function Template({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  // Read once at mount. On the server and during hydration this is false, so
  // the markup matches and the page paints as soon as the HTML arrives.
  const [shouldAnimate] = useState(() => hasNavigated);
  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (reducedMotion || !shouldAnimate) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
