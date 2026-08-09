import { SITE } from "@/content/site";

/**
 * The floating WhatsApp button, mounted once in the root layout.
 *
 * Not a Link — wa.me is an external origin, and next/link's client router has
 * nothing to offer for a target="_blank" hop off the site.
 *
 * The z-index is split, and that split is the whole point. On desktop it sits
 * at z-40, level with SiteHeader — always on top, always reachable.
 *
 * On mobile it drops to z-20 so the hero's CardSheet (z-30) covers it while a
 * card is being read. The sheet's "Return to the deck" button is full-width and
 * runs along its bottom edge, exactly where this button floats: at z-40 the FAB
 * lands on top of that button's right end and eats the tap that dismisses the
 * sheet. z-20 still clears everything else on the page — the hero's tint layers
 * are z-10, and nothing in the content sections is stacked at all.
 */

/*
 * wa.me takes bare digits — the E.164 leading "+" produces a 404 rather than an
 * error, which is the worst kind of bug to ship on a contact button. Derived
 * from SITE so the number is never written twice.
 */
const WA_NUMBER = SITE.contact.whatsappE164.replace(/\D/g, "");
const WA_TEXT = encodeURIComponent(
  `Hello! I found ${SITE.name} online and would like to know more about a consultation.`,
);
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WA_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="focus-astral group fixed right-5 bottom-5 z-20 flex h-14 w-14 md:z-40 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 active:scale-95"
    >
      {/* A ring that breathes, so the button reads as live without moving the
          button itself. motion-reduce kills it; the target never moves either
          way, so nothing is lost. */}
      <span
        aria-hidden
        className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/35 motion-reduce:hidden"
        style={{ animationDuration: "2.6s" }}
      />

      {/* Inline rather than an icon package — nothing of the sort is installed
          and one glyph does not justify a dependency. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="currentColor"
        className="relative h-7 w-7 text-white"
      >
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24Z" />
      </svg>
    </a>
  );
}
