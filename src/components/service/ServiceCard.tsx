import type { Service } from "@/content/services";
import PriceTag from "@/components/ui/PriceTag";
import Spotlight from "@/components/motion/Spotlight";

/** How many sub-services to name before summarising the rest. Three fits one
 *  line at the card's narrowest breakpoint. */
const NAMED = 3;

/** The whole card is one link rather than a card with a button inside it —
 *  a bigger target, and it keeps the card from containing a nested
 *  interactive element that screen readers announce twice. */
export default function ServiceCard({ service }: { service: Service }) {
  const rest = service.includes.length - NAMED;

  return (
    <Spotlight
      href={`/services/${service.slug}`}
      className="surface-astral focus-astral hover:border-astral-gold/35 group flex h-full flex-col p-6 transition-colors duration-300"
    >
      <h3 className="font-cinzel text-parchment-white group-hover:text-astral-gold text-xl transition-colors">
        {service.name}
      </h3>
      <p className="font-inter text-parchment-white/45 mt-2 text-sm italic">
        {service.tagline}
      </p>
      <p className="font-inter text-parchment-white/70 mt-4 text-sm leading-relaxed text-pretty">
        {service.summary}
      </p>

      {/*
        The covered-work line. This used to be a separate fee table below the
        card grid, which meant the page listed all four services twice — once
        as cards and once as rows, differing only in whether they showed the
        sub-services. Folded in here so there is one services block per page.
      */}
      <p className="font-inter text-parchment-white/40 mt-4 flex-1 text-xs leading-relaxed text-pretty">
        {service.includes.slice(0, NAMED).join(" · ")}
        {rest > 0 && (
          <span className="text-parchment-white/30"> · and {rest} more</span>
        )}
      </p>

      <div className="border-astral-gold/10 mt-6 flex items-end justify-between border-t pt-4">
        <PriceTag pricing={service.pricing} />
        <span className="font-inter text-astral-gold/80 text-xs tracking-[0.2em] uppercase transition-transform duration-300 group-hover:translate-x-0.5">
          Read more →
        </span>
      </div>
    </Spotlight>
  );
}
