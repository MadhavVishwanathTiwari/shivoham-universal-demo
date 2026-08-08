/**
 * Business facts — the single source for anything that identifies the practice.
 *
 * Consumed by the footer, /contact, the legal pages, JSON-LD, and the email
 * templates. It lives in one module because these are exactly the values that
 * drift when they are copy-pasted: a phone number updated in the footer but not
 * in the structured data is worse than no structured data at all.
 *
 * Recovered from the 2021 PHP site's include/footer.php and index.php.
 */

/** Fields we do not have yet. Grep TODO before going live — several of these
 *  block Razorpay's live keys, not just polish. */
export const MISSING = {
  /** Razorpay requires a published registered address before issuing live keys.
   *  The old site never had one. Also decides LocalBusiness vs Organization
   *  in the JSON-LD. */
  registeredAddress: true,
  /** Decides whether prices carry a tax line at all — see PriceTag. */
  gstStatus: true,
} as const;

export const SITE = {
  name: "Shivoham Universal Sol",
  /** The old site used "Shivoham Universal" in page titles and "Shivoham
   *  Universal Sol" in the domain. The domain spelling wins. */
  legalName: "Shivoham Universal Sol",
  domain: "shivohamuniversalsol.com",

  practitioner: {
    name: "Priya Swaroop Tripathi",
    /** Her own styling on the 2021 site. Kept because it is distinctive and
     *  describes the actual practice better than "astrologer" would. */
    title: "Numero-Vastu Consultant",
    /** Self-described on the old site; not independently verified. Worth
     *  confirming before it appears as a credential in JSON-LD. */
    credentials: [
      "Master's and Grand Master in Numerology",
      "Tarot Reading",
      "Vastu Shastra",
      "Relationship Fitness",
      "Chakra Healing",
      "Dowsing",
    ],
  },

  contact: {
    /** E.164 for tel: links, and a separate display string — never derive one
     *  from the other at render time. The 2021 site shipped `tel:+8527018222`
     *  with no country code, which silently fails from outside India. */
    phoneE164: "+918527018222",
    phoneDisplay: "+91 85270 18222",
    whatsappE164: "+918527018222",
    /** Two inboxes existed on the old site. `services@` is the one printed for
     *  enquiries; `priya@` is personal. Route form submissions to services@. */
    email: "services@shivohamuniversalsol.com",
    personalEmail: "priya@shivohamuniversalsol.com",
    /** TODO(address): required by Razorpay for live keys. */
    address: null,
  },

  socials: {
    instagram: "https://www.instagram.com/priyaa_tripathii/",
    facebook:
      "https://www.facebook.com/profile.php?id=100021775871823",
    linkedin: "http://linkedin.com/in/priya-tripathi-727b6923",
  },

  /**
   * Flip to true only once she is actually GST-registered, and fill GSTIN.
   * Showing a GST line while unregistered is a compliance problem, not a
   * cosmetic one — PriceTag, the footer, and the email templates all read this.
   */
  GST_REGISTERED: false as boolean,
  GSTIN: null as string | null,

  /**
   * The homepage introduction, in her own voice. Deliberately short: this is a
   * handshake, not the biography — /about carries the full story, and the note
   * ends by pointing there.
   */
  blurb: [
    "I came to this work the long way round. A Masters in Human Resources, years inside corporates and MNCs, and a childhood spent quietly certain that numbers and cards were telling me something the adults around me had stopped listening for.",
    "Eventually I stopped arguing with it. Today I hold Master's and Grand Master qualifications in Numerology, Tarot, Vastu Shastra and Relationship Fitness, and I work with people across India and abroad on the things that actually keep them awake: health, money, work, and the people they love.",
  ],

  vision:
    "To be a trusted consultant in creating a happy and blissful life for every living soul through simple and practical occult solutions.",
  mission:
    "To effectively understand, guide and develop mankind by providing professional Numero-Vastu guidance and solutions, so that individuals can overcome challenging situations and live a blissful life.",
} as const;
