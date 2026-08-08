import Image from "next/image";
import type { Testimonial } from "@/content/testimonials";

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
}: {
  testimonial: Testimonial;
  /** Show the long version where there is one — used on /testimonials. */
  full?: boolean;
}) {
  const body =
    full && testimonial.full ? testimonial.full : testimonial.excerpt;

  return (
    <figure className="surface-astral flex flex-col p-6">
      <blockquote className="font-inter text-parchment-white/75 flex-1 text-sm leading-relaxed text-pretty">
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
    </figure>
  );
}
