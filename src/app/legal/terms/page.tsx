import type { Metadata } from "next";
import { SITE } from "@/content/site";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p className="text-astral-gold/80">
        Placeholder: this page needs real, reviewed copy before launch.
      </p>
      <p>
        Consultations offered by {SITE.legalName} are guidance services. They
        are intended to support your own decision-making and are not a
        substitute for professional medical, legal, financial or psychological
        advice. No particular outcome is promised or guaranteed.
      </p>
      <p>
        Remedies and suggestions are offered in good faith. Whether to act on
        them is entirely your decision, and responsibility for those decisions
        remains yours.
      </p>
      <p>
        Sessions are held remotely by call or video unless otherwise agreed. You
        are asked to attend at the agreed time; a session missed without notice
        may be treated as delivered.
      </p>
    </LegalPage>
  );
}
