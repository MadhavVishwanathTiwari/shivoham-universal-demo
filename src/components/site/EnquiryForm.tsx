"use client";

import { useRef, useState } from "react";
import { SITE } from "@/content/site";
import { SERVICES } from "@/content/services";
import Button from "@/components/ui/Button";

/**
 * The enquiry form.
 *
 * NO BACKEND, AND THAT IS THE DESIGN — not a stub waiting for one. There is no
 * route handler and no mail provider on this project yet, and the failure mode
 * of a form that POSTs into nothing is the worst one available: the client
 * believes they have been in touch and waits, and nobody ever knows they wrote.
 *
 * So the form composes what you typed into a message and hands it to a channel
 * that already exists and that she already reads — WhatsApp, with email as the
 * fallback. Nothing is claimed to have been sent, because the send happens in
 * her app, in front of the user, with the message in view.
 *
 * The day a provider is wired up, `submitTo` is the only thing that changes;
 * the fields, the labels and the composed body all stay.
 */

/** wa.me takes the number bare — no +, no spaces. */
const WA_NUMBER = SITE.contact.whatsappE164.replace(/\D/g, "");

const FIELD =
  "focus-astral font-inter border-astral-gold/20 bg-void-black/40 text-parchment-white placeholder:text-parchment-white/30 hover:border-astral-gold/35 w-full rounded-astral border px-3.5 py-2.5 text-sm transition-colors";

const LABEL =
  "font-inter text-parchment-white/70 mb-1.5 block text-xs tracking-[0.12em] uppercase";

/**
 * `<input type="date">` always hands back ISO (1990-04-02) whatever the field
 * displayed, and 04-02 is genuinely ambiguous to whoever reads the message —
 * this is a birth date going to an Indian practitioner, where 02/04 is the
 * reading. Rewritten by hand rather than via toLocaleDateString: parsing an
 * ISO date string into a Date shifts it by the local UTC offset, which can move
 * a birthday to the day before.
 */
function formatDob(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

/**
 * The message body, as plain text.
 *
 * Labelled lines rather than prose: this lands in a WhatsApp thread that is
 * also her working inbox, and "Date of birth: 1988-04-02" is scannable months
 * later in a way a paragraph is not. Optional fields that were left blank drop
 * out entirely instead of leaving "Place of birth: —" behind.
 */
function compose(form: HTMLFormElement) {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "").trim();

  const details = [
    ["Name", get("name")],
    ["Reach me on", get("contact")],
    ["Interested in", get("service")],
    ["Date of birth", formatDob(get("dob"))],
    ["Place of birth", get("birthplace")],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  // Blank lines are structure here, so this is assembled rather than filtered —
  // a .filter(Boolean) over the whole thing would strip the separators too.
  return [
    `Enquiry from ${SITE.domain}`,
    "",
    ...details,
    "",
    get("message"),
  ].join("\n");
}

export default function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  /** Which channel the details were handed to, so the confirmation can name it
   *  rather than saying a vague "sent" — which would be the exact lie this
   *  component exists to avoid. */
  const [handedTo, setHandedTo] = useState<"WhatsApp" | "email" | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = compose(event.currentTarget);
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setHandedTo("WhatsApp");
  };

  const handleEmail = () => {
    const form = formRef.current;
    // Same required-field checks the submit button gets. Without this the email
    // route is a hole straight through the validation.
    if (!form || !form.reportValidity()) return;

    const body = compose(form);
    const subject = `Consultation enquiry — ${
      new FormData(form).get("name") || "website"
    }`;
    /* location.href, not window.open: a mailto: in a new tab leaves an orphan
       blank tab behind in most browsers once the mail client takes over. */
    window.location.href = `mailto:${SITE.contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setHandedTo("email");
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={FIELD}
            placeholder="Priya Sharma"
          />
        </div>

        <div>
          {/*
            One field for phone-or-email, not two. Everyone reaching a practice
            like this has a preferred channel and resents being made to hand
            over the other one — and since the message is delivered by hand
            through WhatsApp or a mail client, the site never needs a
            machine-readable address anyway. `type="text"`, deliberately: the
            email/tel types would reject whichever half of the pair they aren't.
          */}
          <label htmlFor="contact" className={LABEL}>
            Phone or email
          </label>
          <input
            id="contact"
            name="contact"
            required
            className={FIELD}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className={LABEL}>
          What you are looking for
        </label>
        <select id="service" name="service" defaultValue="" className={FIELD}>
          {/* Not required, and "Not sure yet" is a first-class answer: a lot of
              people arrive knowing the problem and not which of the four
              readings addresses it. Forcing a pick would make them guess, and a
              wrong guess is worse than no answer. */}
          <option value="">Not sure yet</option>
          {SERVICES.map((service) => (
            <option key={service.slug} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Both optional. Numerology and tarot want them, Vastu does not, and a
          required birth date on first contact reads as intrusive from a
          practice you have not decided to trust yet. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="dob" className={LABEL}>
            Date of birth <span className="normal-case opacity-50">optional</span>
          </label>
          <input id="dob" name="dob" type="date" className={FIELD} />
        </div>

        <div>
          <label htmlFor="birthplace" className={LABEL}>
            Place of birth{" "}
            <span className="normal-case opacity-50">optional</span>
          </label>
          <input
            id="birthplace"
            name="birthplace"
            className={FIELD}
            placeholder="Lucknow"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          What you are facing
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${FIELD} resize-y`}
          placeholder="A few lines about the situation — what has been going on, and what you would like to be different."
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
        <Button type="submit">Send on WhatsApp</Button>
        <button
          type="button"
          onClick={handleEmail}
          className="focus-astral font-inter text-parchment-white/60 hover:text-astral-gold text-sm underline-offset-4 transition-colors hover:underline"
        >
          or send it by email
        </button>
      </div>

      {/*
        Says what the button does BEFORE it is pressed. The whole arrangement
        only stays honest if nobody is surprised by the app switch — a "Send"
        that turns out to open WhatsApp feels like a trick even though it is the
        more reliable path.
      */}
      <p className="font-inter text-parchment-white/45 text-xs text-pretty">
        This opens WhatsApp with your details already written out. Nothing
        leaves your device until you press send there.
      </p>

      {handedTo && (
        // aria-live: the confirmation appears without a navigation, so a screen
        // reader gets no page change to announce and would otherwise miss it.
        <p
          role="status"
          aria-live="polite"
          className="font-inter text-astral-gold border-astral-gold/25 bg-astral-gold/5 rounded-astral border px-4 py-3 text-sm text-pretty"
        >
          {handedTo === "WhatsApp"
            ? "WhatsApp should have opened in a new tab with your message ready. If it did not, your browser may have blocked the pop-up — send it by email instead."
            : "Your mail app should have opened with the message ready to send."}
        </p>
      )}
    </form>
  );
}
