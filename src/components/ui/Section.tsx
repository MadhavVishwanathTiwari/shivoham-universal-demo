import type { ReactNode } from "react";

/**
 * The container every non-hero block of the site uses. Its top padding is
 * where the site-wide header/hero invariant actually lives:
 *
 * INVARIANT: --header-h must stay <= Section's top padding. SiteHeader is
 * `position: fixed` and contributes no layout height, so it never pushes
 * content down on its own — every Section's own top padding is what keeps
 * its content from starting underneath the header. The home page's hero opts
 * out deliberately (it renders full-bleed, with the header transparent over
 * it); every other page's first Section is this component.
 */
export interface SectionProps {
  children: ReactNode;
  /** `void` matches the page background exactly (invisible seam); `ethereal`
   *  is a faint lift, for alternating strata down a long page. */
  tone?: "void" | "ethereal";
  id?: string;
  className?: string;
}

const TONE_BG: Record<NonNullable<SectionProps["tone"]>, string> = {
  void: "bg-void-black",
  ethereal: "bg-ethereal-gray/20",
};

export default function Section({
  children,
  tone = "void",
  id,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${TONE_BG[tone]} px-6 pt-[calc(var(--header-h)+3rem)] pb-20 ${className}`}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
