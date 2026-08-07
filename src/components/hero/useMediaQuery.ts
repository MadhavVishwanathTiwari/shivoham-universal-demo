"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query. Starts false on the server and during hydration, then
 * settles on the first client effect — the deck reads it as a plain boolean, so
 * the worst case is one frame of the desktop layout on a phone.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** The hero's breakpoint: below this the wave becomes a touch fan. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
