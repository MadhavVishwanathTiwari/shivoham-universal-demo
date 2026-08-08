import type { ReactNode } from "react";

/** Only heading levels are legal here — this isn't a general polymorphic
 *  component, and a full `ElementType` makes TS collapse `children` to
 *  `never` when combined with a plain `className` prop under strict mode. */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The site's display type, lifted from the hero's <h1> so every page shares
 * one scale instead of each inventing its own. Smaller than the hero's
 * headline by design — that one is the single largest thing on the site and
 * every other heading should read as subordinate to it.
 */
export default function Heading({
  as,
  children,
  className = "",
}: {
  as?: HeadingTag;
  children: ReactNode;
  className?: string;
}) {
  const As = as ?? "h2";
  return (
    <As
      className={`font-cinzel text-parchment-white text-2xl leading-[1.15] font-semibold text-balance sm:text-3xl md:text-4xl ${className}`}
    >
      {children}
    </As>
  );
}
