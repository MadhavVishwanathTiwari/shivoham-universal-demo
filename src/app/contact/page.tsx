import type { Metadata } from "next";
import { SITE } from "@/content/site";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Shivoham Universal Sol by WhatsApp, phone or email to discuss a consultation.",
};

/** wa.me takes the number without a leading + or any separators. */
const WHATSAPP_URL = `https://wa.me/${SITE.contact.whatsappE164.replace(/\D/g, "")}`;

/*
 * Direct contact rather than an enquiry form, deliberately: the form needs a
 * route handler and a mail provider (a later phase), and a form that silently
 * does nothing is worse than no form. Every method below works right now.
 */
const METHODS = [
  {
    label: "WhatsApp",
    value: SITE.contact.phoneDisplay,
    href: WHATSAPP_URL,
    note: "Usually the quickest way to reach her.",
    external: true,
  },
  {
    label: "Phone",
    value: SITE.contact.phoneDisplay,
    href: `tel:${SITE.contact.phoneE164}`,
    note: "India Standard Time.",
    external: false,
  },
  {
    label: "Email",
    value: SITE.contact.email,
    href: `mailto:${SITE.contact.email}`,
    note: "Best for detailed enquiries and Vastu plans.",
    external: false,
  },
];

export default function ContactPage() {
  return (
    <>
      <Section>
        <Eyebrow>Contact</Eyebrow>
        <div aria-hidden className="rule-astral mt-4 h-px w-32" />

        <Heading as="h1" className="mt-6">
          Tell me what you are facing
        </Heading>
        <p className="font-inter text-parchment-white/65 mt-5 max-w-2xl text-pretty">
          Share your situation and you will get a clear sense of what the work
          involves, and what it costs, before anything is committed. Consultations
          are held remotely, so distance is not an obstacle. Clients write in
          from across India and abroad.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {METHODS.map((m) => (
            <a
              key={m.label}
              href={m.href}
              {...(m.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="surface-astral focus-astral hover:border-astral-gold/35 block p-6 transition-colors"
            >
              <p className="font-inter text-astral-gold/75 text-xs tracking-[0.2em] uppercase">
                {m.label}
              </p>
              {/* Inter, not Cinzel: phone numbers and email addresses are data,
                  not display type — the serif renders them as small-caps and
                  breaks the address mid-domain. */}
              <p className="font-inter text-parchment-white mt-3 text-sm break-all">
                {m.value}
              </p>
              <p className="font-inter text-parchment-white/45 mt-2 text-xs">
                {m.note}
              </p>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="ethereal" className="!pt-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="font-cinzel text-astral-gold text-lg">
              What to include
            </h2>
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
