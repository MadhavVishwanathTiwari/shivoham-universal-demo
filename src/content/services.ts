/**
 * The service catalogue. Typed the same way cardData.ts types the deck:
 * interfaces plus derived selectors, imported not fetched, so a missing field
 * is a build error rather than a broken page.
 *
 * Copy recovered from the 2021 PHP site (Vaastu.php, Tarot Reading.php,
 * numerological.php) and lightly edited for grammar. Fees and the `includes`
 * lists come from a later source — her own package sheet, see
 * PRICES_ARE_PLACEHOLDER. Two things were deliberately NOT carried over:
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
  | {
      kind: "fixed";
      amountPaise: number;
      displayINR: string;
      /** What the amount buys, where it is not one session — tarot is billed
       *  "per question". Omitted means the price is for the consultation. */
      unit?: string;
    }
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
  /** Indicative session length. Still invented — the package sheet gives fees
   *  and scope but says nothing about duration. */
  durationMinutes: number;
  /** How the session is held, where she states it. Only numerology does. */
  delivery?: string;
}

export type Service = ServiceBase & { pricing: Pricing };

/**
 * The prices below are REAL as of 2026-08-09.
 *
 * They were placeholders until then — the 2021 site published none, its FAQ
 * only said fees "vary, check in person with the team". They now come from the
 * practitioner's own package sheet (tarotpackages.xlsx), which is also the
 * source for every `includes` list further down.
 *
 * Two things this flag no longer covers, so don't read it as blanket approval:
 *   - `durationMinutes` is still invented on every service.
 *   - Nothing charges anyone yet. Checkout is not built, and taking money still
 *     needs the Razorpay work in content/site.ts (registered address, GST).
 *
 * Grep this constant to find every affected surface.
 */
export const PRICES_ARE_PLACEHOLDER = false;

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
      "Vastu for home",
      "Vastu for office",
      "Vastu for factories and industries",
      "Vastu for shops and showrooms",
      "Vastu for hotels and restaurants",
      "Vastu for hospitals",
      "Vastu for schools and colleges",
      "Vastu for temples and religious places",
    ],
    faqs: [
      {
        q: "Why is Vastu quoted rather than fixed-price?",
        a: "Because the work scales with the property. A one-bedroom flat and a factory floor are not the same survey, and a published flat fee would either overcharge the first or underprice the second. The fee starts at ₹10,000; share the property details and you get a real number before anything is booked.",
      },
    ],
    durationMinutes: 90,
    pricing: { kind: "quote", startingFromINR: "₹10,000" },
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
      "Relationship consultation",
      "Job and career consultation",
      "Health consultation",
      "Money consultation",
      "Marriage and love consultation",
      "Future consultation",
      "A specific person's reading",
      "Past, present and future consultation",
    ],
    faqs: [
      {
        q: "Will you tell me my future?",
        a: "Not as a fortune teller would. This is a systematic, analytical practice, but with years of meditation and intuition behind it a tarot reading can speak to where a situation is heading and what is shaping it.",
      },
      {
        q: "What counts as one question?",
        a: "One situation you want read — the cards are drawn and interpreted for that. Follow-ups that open a different situation are a new question. If you are not sure whether what you are bringing is one thing or three, ask before you book and you will be told plainly.",
      },
    ],
    durationMinutes: 45,
    pricing: {
      kind: "fixed",
      amountPaise: 110000,
      displayINR: "₹1,100",
      unit: "per question",
    },
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
      "Overall analysis of your date of birth",
      "Name spelling corrections",
      "Baby name spellings",
      "Business name spellings",
      "Product and brand name spellings",
      "Lucky mobile number",
      "Lucky car number",
      "Matchmaking",
      "Best suited career option",
      "Best delivery date",
      "Future trends",
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
    delivery: "Telephonic, video conferencing or in person",
    pricing: { kind: "fixed", amountPaise: 1100000, displayINR: "₹11,000" },
  },

  /*
   * No 2021 source exists for this one — the old site never sold it as a
   * pillar. Written from the package sheet's five sub-services, deliberately in
   * the register of the other three: what the session is, what it is not, and
   * no claim that any of it treats an illness. See the header note on the Drugs
   * and Magic Remedies Act — this is the service where that line is easiest to
   * cross by accident.
   */
  {
    slug: "healing-meditation",
    name: "Healing & Meditation",
    tagline: "Where the work is on the energy rather than the question.",
    summary:
      "Chakra balancing, Reiki, crystal healing, dowsing and switch words — energy work for when you are carrying something you cannot name.",
    body: [
      "Not every situation arrives as a question. Sometimes there is nothing to read and nothing to calculate — just a heaviness that has settled and will not lift, and a sense of being out of step with your own life.",
      "This is the part of the practice that works on that directly. Chakra balancing locates where the heaviness is sitting; dowsing tests what is actually going on rather than what you assume is; Reiki and crystal healing are the hands-on work; switch words are what you take away and keep using on your own.",
      "It is calming, deliberate work, and it pairs naturally with the other three. A numerology or Vastu remedy tells you what to change; this is about being in a state to actually change it. Sessions are held one to one, and you leave with a short practice to continue at home.",
      "It is complementary work and nothing here treats a medical condition. If something needs a doctor, see a doctor — that advice is free and it comes first.",
    ],
    includes: [
      "Chakra balancing",
      "Dowsing",
      "Switch words",
      "Reiki",
      "Crystal healing",
      "Guided meditation practice to continue at home",
    ],
    faqs: [
      {
        q: "Will this cure an illness?",
        a: "No, and anyone telling you otherwise is selling something. This is complementary work — it sits alongside medical care, never in place of it. What clients most often report is feeling settled enough to deal with what is in front of them.",
      },
      {
        q: "Do I need to have had a reading first?",
        a: "Not at all. Some people come here first and never take a reading. Others come after a numerology or Vastu consultation, because a remedy is easier to keep up when you are not exhausted.",
      },
      {
        q: "Why does this start at ₹3,700 rather than a flat fee?",
        a: "Because a single chakra balancing session and a course of Reiki over several weeks are not the same commitment. The starting figure is one session; anything longer is quoted once it is clear what you actually need.",
      },
    ],
    durationMinutes: 60,
    pricing: { kind: "quote", startingFromINR: "₹3,700" },
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
