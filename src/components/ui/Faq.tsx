import type { ServiceFaq } from "@/content/services";

/**
 * <details>/<summary>, not a Framer Motion accordion. Zero JS, keyboard
 * accessible for free, the answers are in the DOM for crawlers, and it works
 * before hydration — which on this site's cold-start times is not academic.
 */
export default function Faq({ items }: { items: ServiceFaq[] }) {
  if (items.length === 0) return null;

  return (
    <div className="divide-astral-gold/10 border-astral-gold/10 divide-y border-y">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="focus-astral font-inter text-parchment-white marker:content-none flex cursor-pointer list-none items-start justify-between gap-6 text-left text-base">
            {item.q}
            <span
              aria-hidden
              className="text-astral-gold mt-0.5 shrink-0 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="font-inter text-parchment-white/65 mt-3 max-w-3xl text-sm leading-relaxed text-pretty">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
