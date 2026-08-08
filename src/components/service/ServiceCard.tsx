import Link from "next/link";
import type { Service } from "@/content/services";
import PriceTag from "@/components/ui/PriceTag";

/** The whole card is one link rather than a card with a button inside it —
 *  a bigger target, and it keeps the card from containing a nested
 *  interactive element that screen readers announce twice. */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="surface-astral focus-astral hover:border-astral-gold/35 group flex flex-col p-6 transition-colors"
    >
      <h3 className="font-cinzel text-parchment-white group-hover:text-astral-gold text-xl transition-colors">
        {service.name}
      </h3>
      <p className="font-inter text-parchment-white/45 mt-2 text-sm italic">
        {service.tagline}
      </p>
      <p className="font-inter text-parchment-white/70 mt-4 flex-1 text-sm leading-relaxed text-pretty">
        {service.summary}
      </p>

      <div className="border-astral-gold/10 mt-6 flex items-end justify-between border-t pt-4">
        <PriceTag pricing={service.pricing} />
        <span className="font-inter text-astral-gold/80 text-xs tracking-[0.2em] uppercase">
          Read more
        </span>
      </div>
    </Link>
  );
}
