import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Shipping Policy",
  robots: { index: false },
};

/**
 * Yes, a shipping policy for a business that ships nothing. Razorpay's account
 * activation checklist requires the page regardless of whether the business is
 * physical, so the honest version is a short page saying exactly that.
 */
export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy">
      <p className="text-astral-gold/80">
        Placeholder: this page needs real, reviewed copy before launch.
      </p>
      <p>
        All services are delivered remotely. Nothing is physically shipped.
      </p>
      <p>
        Consultations are held by phone or video call at the agreed time.
        Written reports, remedies and Vastu recommendations, where they form
        part of the service, are delivered by email, typically within a few
        working days of the session.
      </p>
      <p>
        There are no delivery charges, and no physical address is required to
        receive anything.
      </p>
    </LegalPage>
  );
}
