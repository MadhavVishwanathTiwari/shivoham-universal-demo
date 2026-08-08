import type { Pricing } from "@/content/services";
import { SITE } from "@/content/site";

/**
 * The only place the fixed/quote distinction surfaces in the UI, so the two
 * never drift into looking like different concepts on different pages.
 *
 * Reads SITE.GST_REGISTERED rather than hardcoding a tax line: showing "incl.
 * GST" while unregistered is a compliance problem, not a cosmetic one.
 */
export default function PriceTag({
  pricing,
  className = "",
}: {
  pricing: Pricing;
  className?: string;
}) {
  const taxNote = SITE.GST_REGISTERED ? " incl. GST" : "";

  if (pricing.kind === "fixed") {
    return (
      <span className={`font-cinzel text-astral-gold text-2xl ${className}`}>
        {pricing.displayINR}
        {taxNote && (
          <span className="font-inter text-parchment-white/45 ml-2 text-xs">
            {taxNote}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`font-cinzel text-astral-gold text-2xl ${className}`}>
      {pricing.startingFromINR ? (
        <>
          <span className="font-inter text-parchment-white/45 mr-1.5 text-xs tracking-wide uppercase">
            from
          </span>
          {pricing.startingFromINR}
        </>
      ) : (
        <span className="text-xl">On enquiry</span>
      )}
    </span>
  );
}
