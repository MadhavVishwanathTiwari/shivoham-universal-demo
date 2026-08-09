import Image from "next/image";
import type { AnyTestimonial } from "@/content/testimonials.demo";
import Spotlight from "@/components/motion/Spotlight";

/**
 * Plain, well-designed HTML — deliberately NOT marked up with schema.org
 * Review/AggregateRating. Google treats reviews about yourself published on
 * your own site as "self-serving" and ineligible for review rich results, and
 * marking them up anyway is the pattern that attracts a structured-data manual
 * action. These convert on the page, which is their job.
 */
export default function TestimonialCard({
  testimonial,
  full = false,
  compact = false,
  className = "",
}: {
  testimonial: AnyTestimonial;
  /** Show the long version where there is one — used on /testimonials. */
  full?: boolean;
  /** Clamp the quote to a fixed height. The marquee needs cards of one size;
   *  a ragged row of them reads as broken rather than as variety. */
  compact?: boolean;
  className?: string;
}) {
  const body =
    full && testimonial.full ? testimonial.full : testimonial.excerpt;

  return (
    <Spotlight
      as="figure"
      className={`surface-astral hover:border-astral-gold/30 flex flex-col p-6 transition-colors duration-300 ${className}`}
    >
      {/* Decorative in the markup sense — the rating lives in the aria-label,
          not in five repeated "star" announcements. Still no schema.org: see
          the note above on self-serving reviews. */}
      <div
        role="img"
        aria-label="Rated 5 out of 5"
        className="text-astral-gold/70 mb-4 flex gap-1"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M12 2.5l2.6 6.1 6.6.55-5 4.32 1.5 6.45L12 16.5l-5.7 3.42 1.5-6.45-5-4.32 6.6-.55L12 2.5z" />
          </svg>
        ))}
      </div>

      <blockquote
        className={`font-inter text-parchment-white/75 flex-1 text-sm leading-relaxed text-pretty ${
          compact ? "line-clamp-5" : ""
        }`}
      >
        {/* The long version carries its own paragraph breaks; the excerpt is
            a single paragraph. Splitting handles both without a branch. */}
        {body.split("\n\n").map((para, i) => (
          <p key={i} className={i > 0 ? "mt-3" : undefined}>
            {para}
          </p>
        ))}
      </blockquote>

      <figcaption className="border-astral-gold/10 mt-5 flex items-center gap-3 border-t pt-4">
        {testimonial.avatar && (
          <Image
            src={testimonial.avatar}
            alt=""
            width={40}
            height={40}
            className="border-astral-gold/25 h-10 w-10 rounded-full border object-cover"
          />
        )}
        <div>
          <p className="font-cinzel text-parchment-white text-sm">
            {testimonial.name}
          </p>
          <p className="font-inter text-parchment-white/45 text-xs">
            {testimonial.context}
          </p>
        </div>
      </figcaption>
    </Spotlight>
  );
}
