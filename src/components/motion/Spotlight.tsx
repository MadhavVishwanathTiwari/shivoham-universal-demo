"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A gold bloom that follows the cursor across a card's surface.
 *
 * Implemented with two CSS custom properties written straight onto the node
 * (`--spot-x` / `--spot-y`) rather than React state. A pointermove handler that
 * calls setState re-renders the whole card on every mouse sample — at 120Hz
 * that is a render storm for a decorative highlight. Writing the variables
 * bypasses React entirely and the compositor does the rest.
 *
 * The bloom itself is a `::before` in globals.css (`.spotlight`), so no extra
 * DOM node is created and nothing needs pointer-events management.
 *
 * ⚠️ The element is chosen by `href` and a string `as`, never by passing a
 * component in. An earlier version took `as={Link}`, which threw at runtime the
 * moment a Server Component used it: "Functions cannot be passed directly to
 * Client Components". Component references are not serialisable across the RSC
 * boundary, and TypeScript cannot see that — it type-checked clean and failed
 * in the browser. Strings survive the boundary; `Link` is imported here, inside
 * the client bundle, where it is just a local value.
 */
type Tag = "div" | "figure" | "li";

type Props = {
  className?: string;
  children: ReactNode;
  /** Present → renders a next/link. Absent → renders `as`. */
  href?: string;
  as?: Tag;
};

export default function Spotlight({
  className = "",
  children,
  href,
  as = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  }, []);

  // Reduced motion keeps the card, drops the tracking. The bloom is pure
  // decoration and the hover border-colour change already signals the target.
  const cls = reducedMotion ? className : `spotlight ${className}`;
  const handlers = reducedMotion ? {} : { onPointerMove };

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        {...handlers}
      >
        {children}
      </Link>
    );
  }

  const As = as;
  return (
    <As ref={ref as React.Ref<never>} className={cls} {...handlers}>
      {children}
    </As>
  );
}
