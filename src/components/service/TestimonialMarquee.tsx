"use client";

import type { AnyTestimonial } from "@/content/testimonials.demo";
import TestimonialCard from "./TestimonialCard";

/**
 * A single row of testimonials travelling right to left, forever.
 *
 * The loop is the whole trick: the list is rendered twice inside one track, and
 * the track translates exactly -50%. At that point the second copy sits where
 * the first started, so restarting the animation is invisible. Any other
 * distance produces a jump every cycle.
 *
 * The duplicate is aria-hidden — it is the same quotes a second time, and a
 * screen reader reading eleven testimonials twice is not a feature. The row is
 * also keyboard-reachable as a plain horizontal scroller, which is what the
 * reduced-motion path collapses it to.
 */
export default function TestimonialMarquee({
  testimonials,
}: {
  testimonials: AnyTestimonial[];
}) {
  const row = (ariaHidden: boolean) => (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-stretch gap-6 pr-6"
    >
      {testimonials.map((t) => (
        <li key={t.id} className="w-[320px] shrink-0 sm:w-[380px]">
          <TestimonialCard testimonial={t} compact className="h-full" />
        </li>
      ))}
    </ul>
  );

  return (
    /*
     * The mask fades both edges so cards dissolve instead of being guillotined
     * at the viewport edge. `marquee-viewport` (globals.css) carries it along
     * with the reduced-motion escape, because a media query can't live in a
     * utility class.
     */
    <div className="marquee-viewport group relative overflow-hidden py-2">
      {/* Pausing on hover is what makes a moving quote readable — you notice
          one, you stop, you read it. focus-within covers the keyboard path. */}
      <div className="marquee-track animate-marquee flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
