"use client";

import type { ReactNode } from "react";
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
 */
export default function Template({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <>{children}</>;

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
