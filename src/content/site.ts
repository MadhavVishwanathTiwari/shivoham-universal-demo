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
  /** Still true, and deliberately so even though `contact.address` is now
   *  populated. What is there locates the practice to a society; a *registered*
   *  address is a postal one, and it is missing both a unit number and a
   *  confirmed PIN. Razorpay will reject it in that state, and it is not enough
   *  to promote the JSON-LD from Organization to LocalBusiness either.
   *  See the TODOs on `contact.address`. */
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

    /**
     * Where the practice is based. Consultations are remote by default — this
     * is here so the business is locatable and so /contact has a map, NOT as an
     * invitation to turn up. Anything that renders it should say "by
     * appointment" in the same breath; see the location block on /contact.
     *
     * Society-level precision on purpose. This is a home practice, and a gated
     * society of a few thousand flats is a public landmark in a way a specific
     * door is not. Adding the unit number publishes a private residence to
     * every scraper on the internet — get her explicit sign-off before anyone
     * puts it here, and note that none of the uses below actually need it.
     *
     * TODO(address): one real gap left — `unit`. See the paragraph above; that
     * one is her call, not ours. It blocks Razorpay's live keys, so
     * MISSING.registeredAddress stays true until she fills it.
     */
    address: {
      /** Tower, not flat. She supplied the tower herself (a Maps share link to
       *  Tower 12); a tower holds a few hundred homes, so this narrows the
       *  approach without publishing a door. The flat number is still hers to
       *  give and nothing on the site needs it. */
      unit: "Tower 12",
      society: "Palm Olympia",
      /** Sector 16C is in Greater Noida *West* (Noida Extension), which is the
       *  half of the name people actually navigate by — Maps resolves the
       *  society far more reliably with it than without. */
      locality: "Sector 16C, Greater Noida West",
      district: "Gautam Buddha Nagar",
      state: "Uttar Pradesh",
      /**
       * Read off Google's own place record for Palm Olympia (visible in the
       * info card the /contact embed renders), not inferred from the sector.
       * That distinction matters here: Greater Noida West straddles more than
       * one PIN, so deriving it from "Sector 16C" would have been a guess, and
       * a wrong PIN fails a KYC check rather than merely looking untidy.
       *
       * Still worth one confirmation from her before it goes on anything
       * financial — Google's postal data for peri-urban NCR is good, not
       * authoritative.
       */
      postalCode: "201009",
      country: "India",
      /**
       * The map pin, as coordinates rather than a place query — and that is a
       * privacy decision, not a technical one.
       *
       * Searching "Palm Olympia" in an embed makes Google render its own place
       * card over the map, and that card prints Google's listing address for
       * the society: "Palm Olympia, 10/58, Greater Noida W Rd…". The 10/58 is a
       * plot number off Google's business record, not her flat — but it reads
       * exactly like a flat number to anyone looking at it, and it is not one
       * we can correct or suppress inside a cross-origin iframe. A coordinate
       * drops the card entirely and leaves the map showing the society, which
       * is all this was ever meant to show.
       *
       * Resolved from the Maps share link she sent for Tower 12
       * (maps.app.goo.gl/6KvVCus4QYyDnY388 → Tower 12, Palm Olympia), read off
       * the @lat,lng in the expanded URL. Not estimated off a sector boundary,
       * and not the society's own centroid — this is the tower.
       */
      mapPin: "28.6163979,77.4203518",
      /**
       * 16, checked against 17 in the browser rather than reasoned about. 17 is
       * tight enough to frame the tower but crops Google's own "Palm Olympia"
       * label out of a 300px-tall embed, leaving a pin in an unlabelled block
       * of rooftops — precise and unrecognisable. At 16 the society name is on
       * the tile, and the pin is still on the tower.
       */
      mapZoom: 16,
      /**
       * The deep link, which is a different job from the embed and so a
       * different value: this one is for someone who wants directions, and a
       * named place gives them a routable destination where a bare coordinate
       * gives them a dropped pin in a field. The card problem doesn't apply —
       * by then they are in Google's own app, looking at Google's own data.
       */
      mapQuery:
        "Tower 12, Palm Olympia, Sector 16C, Greater Noida West, Gautam Buddha Nagar",
    },
  },

  socials: {
    instagram: "https://www.instagram.com/priyaswarooptripathi/",
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
