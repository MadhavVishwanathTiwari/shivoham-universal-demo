import { TESTIMONIALS, type Testimonial } from "./testimonials";
import type { Service } from "./services";

/**
 * ⚠️ EVERY PERSON IN THIS FILE IS INVENTED. ⚠️
 *
 * They exist so the homepage marquee has enough cards to read as a marquee
 * rather than three quotes sliding past. Nobody named here is real.
 *
 * This is a separate module, not extra entries in testimonials.ts, and the type
 * below is why. `Testimonial.consentedToPublish` is the literal `true` — a guard
 * that forces you to state consent for every real, named person on the site. A
 * fabricated person cannot consent, so a fake entry either lies in that field or
 * breaks the type. `DemoTestimonial` resolves it honestly: the consent field is
 * dropped, and `fictional: true` takes its place.
 *
 * TO REMOVE BEFORE LAUNCH: delete this file, and change the marquee's import in
 * app/page.tsx from MARQUEE_TESTIMONIALS to TESTIMONIALS. Nothing else reads it.
 * The build will point at the one line that needs changing.
 */
export const TESTIMONIALS_ARE_PLACEHOLDER = true;

/** A testimonial that is not from a real person. Structurally distinct from
 *  `Testimonial` so the two can never be confused at a call site. */
export type DemoTestimonial = Omit<Testimonial, "consentedToPublish"> & {
  fictional: true;
};

/** What a renderer that handles both needs to accept. */
export type AnyTestimonial = Testimonial | DemoTestimonial;

/** Narrowing helper, in case a surface ever needs to badge or exclude these. */
export const isFictional = (t: AnyTestimonial): t is DemoTestimonial =>
  "fictional" in t;

/*
 * Deliberately first-name-and-city only, and no `avatar`. A full name plus a
 * face is what makes an invented endorsement look like a real identifiable
 * person, and these will be on a public page for as long as the demo is up.
 * Kept to two or three sentences each so the cards clamp evenly.
 */
const DEMO: Omit<DemoTestimonial, "fictional">[] = [
  {
    id: "demo-anjali-mumbai",
    name: "Anjali",
    context: "Mumbai, India",
    excerpt:
      "I came in with one question about a job offer and left understanding why I had been hesitating for months. The reading was direct without being blunt, which I did not expect.",
    serviceSlug: "tarot",
  },
  {
    id: "demo-rohit-bengaluru",
    name: "Rohit",
    context: "Bengaluru, India",
    excerpt:
      "We had the name of the company narrowed to three options and no way to choose. The numerology work settled it, and two years on I have no regrets about which one we registered.",
    serviceSlug: "numerology",
  },
  {
    id: "demo-farah-dubai",
    name: "Farah",
    context: "Dubai, UAE",
    excerpt:
      "The Vastu survey of our apartment was far more thorough than I was expecting — room by room, with reasons. Half the remedies cost nothing, which told me she was not upselling.",
    serviceSlug: "vastu",
  },
  {
    id: "demo-meera-pune",
    name: "Meera",
    context: "Pune, India",
    excerpt:
      "I was sceptical about the chakra work and said so. She did not argue, she just asked me to try it for a month. I sleep properly now, and I have stopped trying to explain why.",
    serviceSlug: "healing-meditation",
  },
  {
    id: "demo-sandeep-london",
    name: "Sandeep",
    context: "London, UK",
    excerpt:
      "Video consultation across five time zones and it never once felt remote. She was patient with how much I had to unload before I could get to the actual question.",
    serviceSlug: "numerology",
  },
  {
    id: "demo-nisha-ahmedabad",
    name: "Nisha",
    context: "Ahmedabad, India",
    excerpt:
      "I asked about my marriage and got an answer I did not want to hear, put kindly. That honesty is the reason I went back for the follow-up rather than looking for a second opinion.",
    serviceSlug: "tarot",
  },
  {
    id: "demo-vikram-singapore",
    name: "Vikram",
    context: "Singapore",
    excerpt:
      "The office Vastu changes were small and we made them over a weekend. The shift in how the team used the space was obvious within a fortnight, whatever the mechanism is.",
    serviceSlug: "vastu",
  },
  {
    id: "demo-lakshmi-chennai",
    name: "Lakshmi",
    context: "Chennai, India",
    excerpt:
      "The switch words felt silly for about a week and then became the thing I reach for when I am spiralling. Simple, portable, and it costs nothing to keep doing.",
    serviceSlug: "healing-meditation",
  },
];

export const DEMO_TESTIMONIALS: DemoTestimonial[] = DEMO.map((t) => ({
  ...t,
  fictional: true,
}));

/**
 * Real ones first, so the genuine quotes are the ones on screen when the
 * marquee starts and the invented ones are what fills the tail.
 *
 * `serviceSlug` is typed `Service["slug"]`, which is just `string` — so a stale
 * slug here will NOT fail the build the way testimonials.ts's comment implies.
 * The assertion below closes that gap for this file at least: every demo entry
 * must name a service that exists.
 */
export const MARQUEE_TESTIMONIALS: AnyTestimonial[] = [
  ...TESTIMONIALS,
  ...DEMO_TESTIMONIALS,
];

const KNOWN_SLUGS: Service["slug"][] = [
  "vastu",
  "tarot",
  "numerology",
  "healing-meditation",
];

if (process.env.NODE_ENV !== "production") {
  const orphan = DEMO_TESTIMONIALS.find(
    (t) => !KNOWN_SLUGS.includes(t.serviceSlug),
  );
  if (orphan) {
    throw new Error(
      `testimonials.demo.ts: "${orphan.id}" points at unknown service "${orphan.serviceSlug}"`,
    );
  }
}
