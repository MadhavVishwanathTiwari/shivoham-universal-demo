import type { Metadata } from "next";
import { SITE } from "@/content/site";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Rule from "@/components/motion/Rule";
import LocationMap from "@/components/site/LocationMap";
import EnquiryForm from "@/components/site/EnquiryForm";
import AstralBackdrop from "@/components/ui/AstralBackdrop";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Shivoham Universal Sol by WhatsApp, phone or email to discuss a consultation.",
};

/** wa.me takes the number without a leading + or any separators. */
const WHATSAPP_URL = `https://wa.me/${SITE.contact.whatsappE164.replace(/\D/g, "")}`;

/*
 * The direct channels, kept above the form rather than replaced by it. Plenty
 * of people would simply rather tap a number than fill anything in, and these
 * three are the shortest path for them.
 *
 * The form does not compete with this: it composes what you type and hands it
 * to the same WhatsApp thread. See the note in EnquiryForm — there is still no
 * route handler and no mail provider on this project, and a form that POSTs
 * into nothing is worse than no form.
 */
const METHODS = [
  {
    label: "WhatsApp",
    value: SITE.contact.phoneDisplay,
    href: WHATSAPP_URL,
    note: "Usually the quickest way to reach her.",
    external: true,
    /* Drawn inline rather than pulled from an icon package. Three glyphs do not
       justify a dependency, and these are stroked to match the gold hairlines
       already on the page — an icon set's filled shapes would sit on this
       palette like stickers.

       Hand-drawn glyphs share no common grid, so they have to be fitted to one
       by hand. The rule for all three: ink centred on (12, 12) of the viewBox,
       ink height ~15 units. The flexbox centres the 18px svg BOX on the label,
       so any offset between the box and the ink inside it lands on screen as a
       misaligned icon — and only the ink is visible.

       This one was the outlier: 17.1 units tall (vs the phone's 15) and centred
       at y=12.43, which rendered it 12.9px against a 9px cap height. It
       overshot the text band top and bottom and was the one glyph that broke
       the row. Rebuilt on the same construction — bubble r=7.1 at (12.4,
       11.75), tail tip at the same angle and radius ratio as before — giving
       ink of 14.9 x 14.7 centred on (12.08, 11.98). */
    icon: (
      <path d="M4.65 19.31l1.46-4.27A7.1 7.1 0 1 1 8.93 17.94L4.65 19.31zM9.78 8.62c-.34.86.09 1.97.86 2.82s1.97 1.37 2.82 1.03l1.03 1.03c-.51.68-1.63.86-2.57.51a6.84 6.84 0 0 1-3.68-3.68c-.34-.94-.17-2.05.51-2.57L9.78 8.62z" />
    ),
  },
  {
    label: "Phone",
    value: SITE.contact.phoneDisplay,
    href: `tel:${SITE.contact.phoneE164}`,
    note: "India Standard Time.",
    external: false,
    icon: (
      <path d="M4 5c0-.6.4-1 1-1h2.5c.5 0 .9.3 1 .8l.7 3c.1.4 0 .8-.4 1L7 10.2a12 12 0 0 0 5.8 5.8l1.4-1.8c.2-.3.6-.5 1-.4l3 .7c.5.1.8.5.8 1V18c0 .6-.4 1-1 1h-1C9.6 19 4 13.4 4 6.5V5z" />
    ),
  },
  {
    label: "Email",
    value: SITE.contact.email,
    href: `mailto:${SITE.contact.email}`,
    note: "Best for detailed enquiries and Vastu plans.",
    external: false,
    icon: <path d="M3 6.5h18v11H3zM3 7l9 6 9-6" />,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Same field the homepage's practitioner note sits on — see the USAGE
          contract on AstralBackdrop for what the three classes are holding up.
          This page is the end of the funnel and was the flattest on the site;
          it should feel like the same room as the hero. */}
      <Section className="relative isolate overflow-hidden">
        <AstralBackdrop />

        <Eyebrow>Contact</Eyebrow>
        <Rule className="mt-4" />

        <Heading as="h1" className="mt-6">
          Tell me what you are facing
        </Heading>
        <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
          Share your situation and you will get a clear sense of what the work
          involves, and what it costs, before anything is committed. Consultations
          are held remotely, so distance is not an obstacle. Clients write in
          from across India and abroad.
        </p>

        {/*
          The form and the map, side by side, directly under the page's own
          heading — the form IS the page now, so it gets the h1 and no heading
          of its own. It used to sit in a second section behind "Send an
          enquiry / Tell her what is going on", which read as a near-duplicate
          of the h1 two blocks above it.

          The ratio is not 1:1 on purpose: the form is the job of this page and
          the map is context for it, so the form takes the wider column.
          `items-start` matters — the default `stretch` would make the map
          column as tall as the form and leave the address block floating in the
          middle of its own dead space. One breakpoint, `lg`, not `md`: at
          tablet widths two columns leave the text inputs too narrow to type a
          paragraph into.

          NOTHING HERE IS WRAPPED IN Reveal, and that is the invariant on Reveal
          / Stagger rather than a style choice. Both server-render at
          `opacity: 0`. This block is now the first thing on the page and above
          the fold at any height, so if the client bundle ever failed to arrive
          the entire enquiry form would be invisible — the exact "content gone,
          page looks broken" state CLAUDE.md documents. It had a Reveal on it
          while it lived below the fold; moving it up is what retired that.
        */}
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <EnquiryForm />
          <LocationMap />
        </div>
      </Section>

      {/*
        The direct channels, now under the form rather than over it. Someone who
        already knows they would rather just message her does not read past the
        first screen to find out how — but they do scroll, and the three cards
        are unmissable when they get here. Someone who came to describe a
        situation gets the fields immediately instead of a wall of options.
      */}
      <Section tone="ethereal" className="!pt-16">
        <Eyebrow>Or reach her directly</Eyebrow>
        <Rule className="mt-4" />
        <Heading as="h2" className="mt-6" reveal>
          No form, if you would rather not
        </Heading>

        {/*
          A plain grid, NOT a Stagger. Same reasoning as the form above, and it
          survives the move down the page: these three are the only ways to
          contact her that work with no JavaScript at all, so they are the last
          thing on this site that should be conditional on a bundle loading. The
          hover bloom degrades to nothing instead.
        */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {METHODS.map((m) => (
            <div key={m.label} className="h-full">
              {/*
                `spotlight` without the cursor-tracking wrapper. The Spotlight
                component renders a next/link, which is wrong for tel:, mailto:
                and wa.me — those are protocol handoffs, not client-side
                navigations. The bare class still gets the ::before bloom, which
                parks at the card's centre because `--spot-x/y` are never
                written and the utility's own 50% fallbacks take over. A
                centred bloom on hover, no JS, no bundle.
              */}
              <a
                href={m.href}
                {...(m.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="surface-astral focus-astral spotlight hover:border-astral-gold/40 group flex h-full flex-col p-6 transition-colors duration-300"
              >
                <span className="flex items-center gap-3">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="text-astral-gold/60 group-hover:text-astral-gold h-[18px] w-[18px] shrink-0 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {m.icon}
                  </svg>
                  <span className="font-inter text-astral-gold/75 text-xs tracking-[0.2em] uppercase">
                    {m.label}
                  </span>
                </span>

                {/* Inter, not Cinzel: phone numbers and email addresses are data,
                    not display type — the serif renders them as small-caps and
                    breaks the address mid-domain. */}
                <span className="font-inter text-parchment-white mt-3 block text-sm break-all">
                  {m.value}
                </span>
                <span className="font-inter text-parchment-white/45 mt-2 block flex-1 text-xs">
                  {m.note}
                </span>
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section className="!pt-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            {/* Reframed once the form landed: the form now asks for all of this
                directly, so as a checklist it was redundant. It earns its place
                as a note for the people who skip the form and write to her on
                WhatsApp themselves — which, given the three cards at the top of
                this page, is most of them. */}
            <h2 className="font-cinzel text-astral-gold text-lg">
              Writing to her directly?
            </h2>
            <p className="font-inter text-parchment-white/55 mt-3 text-sm">
              If you skip the form, include:
            </p>
            <ul className="font-inter text-parchment-white/70 mt-4 space-y-2 text-sm">
              <li>Your full name, date of birth, and place of birth</li>
              <li>A short description of what you are dealing with</li>
              <li>For Vastu: the property type, and a floor plan if you have one</li>
            </ul>
          </Card>
          <Card>
            <h2 className="font-cinzel text-astral-gold text-lg">Follow along</h2>
            <ul className="font-inter mt-4 space-y-2 text-sm">
              <li>
                <a
                  href={SITE.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-astral text-parchment-white/70 hover:text-astral-gold"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-astral text-parchment-white/70 hover:text-astral-gold"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-astral text-parchment-white/70 hover:text-astral-gold"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </Card>
        </div>
      </Section>

    </>
  );
}
