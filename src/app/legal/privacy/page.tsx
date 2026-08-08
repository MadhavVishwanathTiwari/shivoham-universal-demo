import type { Metadata } from "next";
import { SITE } from "@/content/site";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-astral-gold/80">
        Placeholder: this page needs real, reviewed copy before launch.
      </p>
      <p>
        {SITE.legalName} collects only the information needed to provide a
        consultation: your name, contact details, and the birth details or
        property information relevant to the work. Consultation details are
        treated as confidential.
      </p>
      <p>
        Information is not sold or shared with third parties for marketing.
        Where a service provider is used to process payments or deliver email,
        only the data necessary for that purpose is shared with them.
      </p>
      <p>
        To ask what is held about you, or to request its deletion, contact{" "}
        <a
          href={`mailto:${SITE.contact.email}`}
          className="focus-astral text-astral-gold hover:underline"
        >
          {SITE.contact.email}
        </a>
        .
      </p>
    </LegalPage>
  );
}
