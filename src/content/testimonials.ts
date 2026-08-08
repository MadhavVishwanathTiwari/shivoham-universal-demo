import type { Service } from "./services";

/**
 * Client testimonials, recovered from the 2021 site's successstories.php.
 *
 * The quotes are stored VERBATIM, including their original phrasing and minor
 * typos. These are real people's words about a real person: tightening them is
 * a decision for her and for them, not a formatting pass. If they are to be
 * copy-edited, edit them here deliberately and knowingly.
 *
 * `excerpt` mirrors what the old homepage showed behind a "Read More" — it is
 * authored, not truncated at render, so a cut never lands mid-word or mid-idea.
 */
export interface Testimonial {
  id: string;
  name: string;
  /** "Homeowner, Pune" — role and/or place. Authored, never derived. */
  context: string;
  /** Short pull quote for cards and the homepage. */
  excerpt: string;
  /** The full text, where there is more than the excerpt. */
  full?: string;
  /** Typed to the catalogue, so renaming a service slug breaks the build
   *  instead of silently orphaning a testimonial. */
  serviceSlug: Service["slug"];
  /** Path under /public. */
  avatar?: string;
  /**
   * These are identifiable, named people on a public site. All three were
   * already published on the 2021 site, so consent is established for those —
   * but the field is a literal `true` so that adding a new testimonial forces
   * you to state it rather than default into it.
   */
  consentedToPublish: true;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "barkha-surat",
    name: "Barkha",
    context: "Surat, India",
    excerpt:
      "Me and my family were going through a rough time, all doors were closed. Then I explained my problems to Priya, she was very patient and understanding, she suggested some remedies which we followed for 50 days, her remedies are very easy to follow and effective. Not just we were out of that situation but also got what we desired. She is a real friend and guide.",
    serviceSlug: "numerology",
    avatar: "/testimonials/barkha-surat.jpg",
    consentedToPublish: true,
  },
  {
    id: "pallavi-ajman",
    name: "Pallavi",
    context: "Ajman, UAE",
    excerpt:
      "I consulted Priya in the month of March, 2019. I was facing relationship issues with my father and job instability. She did the Numero of me and my husband along with the Vastu analysis of our house. Her remedies were so effective it worked like magic, both of us got the job we were looking for quiet some time but the miracle was that she helped me mend my relationship with my Father. She is so supportive and positive, by just talking to her all my problems vanish.",
    serviceSlug: "vastu",
    avatar: "/testimonials/pallavi-ajman.jpg",
    consentedToPublish: true,
  },
  {
    id: "bella-karachi",
    name: "Bella",
    context: "Karachi, Pakistan",
    excerpt:
      "What I appreciate most about her is that she will get to the bottom of the problem through a series of questions, which allows her to go deeper into the problem and allows me to open up without any hesitation. She is a genuine professional and doesn't pull punches and says what needs to be heard.",
    full: `"Priya" means dearly loved, this is how I express my feelings for her. It was a dark night and I was extremely upset on few very important matters of my life and nearly got hopeless, prayed that Allah plz send me someone who can help me to get over with this phase, and I got the best surprise of my life (which I was unable to understand initially) He sent me an angel in the face of Priya. Just very next morning I got a friend request from Priya Tripathi, I usually don't accept requests but don't know how I messaged her and asked if I know her by any chance, and those words melted my heart, and I couldn't stop my self to share everything with her, and she listened to me very calmly for hours. It was the first day we connected and bonded, till today I feel it was gods way of helping me by sending her in my life.

Priya's ability to connect, through her intuitions are tremendous, she don't only connect through tarot but directly with the person is amazing. What I appreciate most about her is that she will get to the bottom of the problem through a series of questions, which allows her to go deeper into the problem and allows me to open up without any hesitation.

She is a genuine professional and doesn't pull punches and says what needs to be heard, she gives excellent solutions to the problem which is effective and gives result quickly.

Most of all the way Priya talks and pay attention whole heartedly on the matters can make one relaxed in just few minutes, and the very important thing here is that the solutions she gives have never been temporary but permanent.

She is not just a professional tarot card reader or Vastu expert but the best counsellor who heals your heart and mind. I must say I am very lucky that the universe connected us.`,
    serviceSlug: "tarot",
    avatar: "/testimonials/bella-karachi.jpg",
    consentedToPublish: true,
  },
];

export const byService = (slug: Service["slug"]): Testimonial[] =>
  TESTIMONIALS.filter((t) => t.serviceSlug === slug);
