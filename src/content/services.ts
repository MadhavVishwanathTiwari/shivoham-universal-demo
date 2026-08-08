/**
 * The service catalogue. Typed the same way cardData.ts types the deck:
 * interfaces plus derived selectors, imported not fetched, so a missing field
 * is a build error rather than a broken page.
 *
 * Copy recovered from the 2021 PHP site (Vaastu.php, Tarot Reading.php,
 * numerological.php, RelationshipFitnessGuide.php) and lightly edited for
 * grammar. Two things were deliberately NOT carried over:
 *
 *   - Outcome guarantees ("we guarantee success within 60 days"). Promising a
 *     result you cannot control is a consumer-protection exposure and the kind
 *     of claim payment-gateway underwriting flags.
 *   - "Diseases and their cure", which appeared in the old FAQ. In India the
 *     Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954
 *     specifically targets advertising remedies that claim to cure disease.
 *
 * Both need a lawyer's view, not mine — but the safe default is to omit them.
 */

/**
 * A price the site can charge without a conversation.
 *
 * `amountPaise` is an integer because that is the unit Razorpay's Orders API
 * takes — ₹2,500 is 250000. Every float rupee value is a rounding bug waiting
 * to be found by an accountant.
 *
 * `displayINR` is authored rather than derived. Formatting with
 * Intl.NumberFormat at render time is a hydration-mismatch class of bug: Node
 * and the browser can disagree on ICU data, and the server HTML then differs
 * from the client's first paint.
 */
export type Pricing =
  | { kind: "fixed"; amountPaise: number; displayINR: string }
  | { kind: "quote"; startingFromINR?: string };

export interface ServiceFaq {
  q: string;
  a: string;
}

interface ServiceBase {
  /** URL segment AND the join key carried in Razorpay order notes. Renaming a
   *  slug breaks the link between a payment and the thing that was bought. */
  slug: string;
  name: string;
  /** The one-line epigraph each service page led with on the old site. */
  tagline: string;
  /** Used as the meta description and the card blurb, so keep it ~155 chars. */
  summary: string;
  /** Body copy as paragraphs. A string[] rather than one blob so the renderer
   *  never has to parse anything. */
  body: string[];
  /** The bulleted "what this covers" list every old service page carried. */
  includes: string[];
  faqs: ServiceFaq[];
  /** Indicative session length. Also invented — see PRICES_ARE_PLACEHOLDER. */
  durationMinutes: number;
}

export type Service = ServiceBase & { pricing: Pricing };

/**
 * ⚠️ EVERY PRICE BELOW IS INVENTED. ⚠️
 *
 * The 2021 site published no prices at all — its FAQ said fees "vary, check in
 * person with the team" — so there is no real number to recover. These exist so
 * the demo reads as a finished site rather than one with holes in it.
 *
 * They are safe only because nothing charges anyone yet: checkout is not built.
 * Wiring up payments while this flag is still true would take real money at a
 * made-up price, so treat it as a release gate, not a note.
 *
 * Grep this constant to find every affected surface.
 */
export const PRICES_ARE_PLACEHOLDER = true;

export const SERVICES: Service[] = [
  {
    slug: "vastu",
    name: "Vastu Consultancy",
    tagline: "Vastu decides the happiness or sorrows you experience in your life.",
    summary:
      "Vastu analysis for homes, offices, factories and plots: 32 directions, five elements, and remedies drawn from the Puranas.",
    body: [
      "Vastu Shastra is described in Indian architecture in the Matsya Purana; the name means the science of studying architecture. It concerns design, layout, measurement and soil in relation to the work of the person living or working there, and the five tattvas: earth, water, fire, air and space.",
      "For most people a building has four directions. In Vastu we study thirty-two, covering every corner of every room: the five elements, the deity governing each zone, and the colours and metals that shift a zone's character.",
      "I work as a link between people and the study of Vastu from the Vedas, Puranas and Shastras. Most of the remedies here are drawn from the Matsya, Skanda, Agni, Garuda and Vishnu Puranas.",
      "Vastu addresses concerns around health, relationships, money, work, study, property and legal matters. Beyond solving problems, it aims at a settled and generous place to live.",
    ],
    includes: [
      "Home Vastu",
      "Office and shop Vastu",
      "Commercial complex Vastu",
      "Factories and mines Vastu",
      "Hotels and restaurants Vastu",
      "Hospitals and dispensary Vastu",
      "Educational institutions Vastu",
      "Cinema and studio Vastu",
      "Temple Vastu",
      "Vastu for plots",
      "Vastu Shanti Puja",
      "Trees, plants and colours of Vastu",
      "Vastu Muhurta",
    ],
    faqs: [
      {
        q: "Why is Vastu quoted rather than fixed-price?",
        a: "Because the work scales with the property. A one-bedroom flat and a factory floor are not the same survey, and a published flat fee would either overcharge the first or underprice the second. Share the property details and you get a real number before anything is booked.",
      },
    ],
    durationMinutes: 90,
    pricing: { kind: "quote", startingFromINR: "₹5,000" },
  },

  {
    slug: "tarot",
    name: "Tarot Reading",
    tagline: "Tarot reading is the intuitive analysis of past, present and future.",
    summary:
      "A guided tarot session for questions about work, money, relationships, health and timing, read as a sequence rather than a verdict.",
    body: [
      "Tarot is a study of intuition, feeling and belief. It is what happens when the voice of your inner self meets the sequence of cards drawn, and narrates an event of the past, present or future.",
      "The cards help you hear your own inner voice and take its messages seriously. Read well, they clarify what a situation is actually telling you, which is why tarot suits questions about relationships, money, healing and reconciliation better than most tools.",
    ],
    includes: [
      "Career and money",
      "Relationships, love and compatibility",
      "Health and wellness",
      "Weekly, monthly, quarterly and annual forecasts",
      "Past-life questions",
      "Study and examination questions",
      "Timing questions: when, and whether",
      "Reading another person's feelings and intentions",
    ],
    faqs: [
      {
        q: "Will you tell me my future?",
        a: "Not as a fortune teller would. This is a systematic, analytical practice, but with years of meditation and intuition behind it a tarot reading can speak to where a situation is heading and what is shaping it.",
      },
    ],
    durationMinutes: 45,
    pricing: { kind: "fixed", amountPaise: 250000, displayINR: "₹2,500" },
  },

  {
    slug: "numerology",
    name: "Numerological Study",
    tagline:
      "Numbers play a significant role in deciding your life path, success and failures.",
    summary:
      "Numerology from date, time and place of birth and the numeric value of your name, with practical remedies and, where it helps, name correction.",
    body: [
      "Numerology connects the mystical world to the sequence of events in a person's life. It reads the numerical value of each letter and derives a calculated total, and it studies name, date of birth, time of birth, place of birth and the planetary positions at that moment.",
      "It is a calculative practice rather than a predictive one. With the right remedies, practised sincerely, it is a tool for manifesting what you are actually working toward.",
      "My work combines several systems of number study rather than relying on one.",
    ],
    includes: [
      "Alphabetic systems",
      "Latin alphabet systems",
      "Pythagorean system",
      "Chaldean system",
      "Name correction and alignment",
      "Remedies for health, relationships, marriage, money and work",
    ],
    faqs: [
      {
        q: "What is numerology?",
        a: "The study of numbers calculated from date of birth, time, and name value, linked to planetary frequencies. It is calculative: it points at what can be changed with the least effort for the most benefit.",
      },
      {
        q: "Are numerology and astrology the same?",
        a: "No. Astrology studies the position of the planets at the time of birth. Numerology studies numbers derived from date of birth, time, and name calculation, and links those to planetary frequencies. Astrology reads what is indicated; numerology points at what can be adjusted.",
      },
      {
        q: "Does it work with Vastu?",
        a: "They reinforce each other. Numerology addresses the person, Vastu addresses the space they live and work in, and in practice the results are strongest when both are looked at together.",
      },
    ],
    durationMinutes: 60,
    pricing: { kind: "fixed", amountPaise: 350000, displayINR: "₹3,500" },
  },

  {
    slug: "relationship-fitness",
    name: "Relationship Fitness",
    tagline: "How blissful your life is with your partner.",
    summary:
      "A practical programme for couples: weekly habits and monthly acts that rebuild warmth, instead of reopening old arguments.",
    body: [
      "However rich or poor you are, relationships are what carry you through good times and bad. They are also where most people are struggling: modern schedules, nuclear families, individual goals and a great deal of screen time have left many of us walled off, out of practice at listening, at forgiving, at simply sitting with someone.",
      "The usual advice is to talk it through. Be open. Discuss the problem. In practice that often reopens the wound: the same memories, the same hurt, the same stress.",
      "So this takes a different route, and it is why the word is fitness. Rather than re-arguing the past, we build a series of small, repeatable acts: weekly habits that soften how you feel toward each other, and one monthly act that restores warmth. Practice, not litigation.",
    ],
    includes: [
      "Breaking destructive patterns of behaviour",
      "Moving on from hurt, disrespect and anger",
      "Becoming a team rather than two individuals",
      "Making decisions together",
      "Getting your own needs met",
      "Connecting with an emotionally absent partner",
      "Restoring honour, respect and intimacy",
      "Being heard, and learning to listen",
    ],
    faqs: [
      {
        q: "Is this couples counselling?",
        a: "It sits alongside it rather than replacing it. The emphasis is on practical habits rather than re-examining the history, which is why some people find it easier to start with. It is not a substitute for clinical therapy where that is what is needed.",
      },
    ],
    durationMinutes: 60,
    pricing: { kind: "quote", startingFromINR: "₹4,000" },
  },
];

/**
 * FAQs that belong to the practice rather than to any one service.
 *
 * The plan put FAQs inside each Service to avoid orphans, and that still holds
 * for service-specific questions. These are the genuine exceptions — the 2021
 * FAQ page asked them about the practice as a whole, and forcing them under one
 * service would misfile them.
 */
export const GENERAL_FAQS: ServiceFaq[] = [
  {
    q: "What kinds of problems do you work with?",
    a: "Money; love, relationships and emotions; marriage and commitment; recognition and success; peace of mind; work and business; difficulty with colleagues or seniors; compatibility; choosing an auspicious time for a marriage, partnership or business decision; and how to handle a difficult phase generally.",
  },
  {
    q: "What do the remedies actually involve?",
    a: "Mind remedies based on numerology, body remedies based on Vastu, and soul remedies based on astrology. Alongside those: name correction, EFT, switchwords, chakra and dowsing work, yantra, mantra and chants, and puja where appropriate. Training for staff or students is also available.",
  },
  {
    q: "What are the fees, and are there discounts?",
    a: "Fees vary by service, so check the pricing page or ask. There is a family discount when you take a consultation for the whole household, and a referral discount if you recommend the practice to friends or family.",
  },
  {
    q: "How long does it take to see a change?",
    a: "It depends on the nature of the problem and how long it has been running. Where a client shares openly and follows the remedies consistently, changes often begin within a few weeks. Nothing here is a guarantee, though, and anyone promising you one is selling something.",
  },
];

export const bySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

export const fixedPriceServices = (): Service[] =>
  SERVICES.filter((s) => s.pricing.kind === "fixed");

export const quoteServices = (): Service[] =>
  SERVICES.filter((s) => s.pricing.kind === "quote");
