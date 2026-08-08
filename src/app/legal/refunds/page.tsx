import type { Metadata } from "next";
import { SITE } from "@/content/site";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Cancellation & Refunds",
  robots: { index: false },
};

export default function RefundsPage() {
  return (
    <LegalPage title="Cancellation & Refunds">
      <p className="text-astral-gold/80">
        Placeholder: this page needs real, reviewed copy before launch. The
        windows and timelines below are examples, not agreed policy.
      </p>
      <p>
        A consultation may be rescheduled or cancelled up to 24 hours before the
        agreed time for a full refund. Inside 24 hours, the session is treated
        as delivered.
      </p>
      <p>
        Where a refund is due, it is returned to the original payment method
        within 5–7 business days.
      </p>
      <p>
        Because consultations are a personal service, a completed session cannot
        be refunded on the basis of the guidance given. If something has gone
        wrong, contact{" "}
        <a
          href={`mailto:${SITE.contact.email}`}
          className="focus-astral text-astral-gold hover:underline"
        >
          {SITE.contact.email}
        </a>{" "}
        and it will be looked at.
      </p>
    </LegalPage>
  );
}
