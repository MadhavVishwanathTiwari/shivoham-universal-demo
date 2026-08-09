import { SITE } from "@/content/site";

const { address } = SITE.contact;

/**
 * `?output=embed` rather than the Maps Embed API. The Embed API is the
 * documented route but it requires a billing-enabled API key, and a key shipped
 * in an iframe src is a public key — it would have to be referrer-restricted per
 * deploy domain or it becomes someone else's quota. For a single static pin
 * that is a lot of operational surface for no extra capability.
 *
 * If this ever needs directions, Street View or styled tiles, that is the point
 * to switch: https://developers.google.com/maps/documentation/embed
 */
const EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  address.mapPin,
)}&z=${address.mapZoom}&output=embed`;

/** The documented, stable deep link — `/maps/search/?api=1` is the one Maps URL
 *  form Google guarantees won't change under us. */
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  address.mapQuery,
)}`;

/**
 * Display lines, assembled here rather than authored in content, because
 * `unit` is legitimately null (see the TODOs on SITE.contact.address) and the
 * block has to read correctly both now and on the day it is filled in.
 *
 * Indian postal order, which is not the same as the field order: the PIN
 * follows the state on the same line and the country stands alone. "201009
 * India" on one line is the American habit of putting the code last, and it
 * reads as a typo to anyone who posts letters here.
 */
const LINES = [
  [address.unit, address.society].filter(Boolean).join(", "),
  address.locality,
  [
    [address.district, address.state].filter(Boolean).join(", "),
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" "),
  address.country,
].filter(Boolean);

/**
 * The map beside the enquiry form on /contact.
 *
 * Stacked, not side by side, because this is now the narrow column of that
 * page's two-column layout — map first, because it is the thing you look at,
 * then the address it is a picture of.
 *
 * Server Component, no JS. The iframe is `loading="lazy"` so Google is not
 * contacted at all until the block is near the viewport.
 */
export default function LocationMap() {
  return (
    <div>
      {/*
        `map-dark` is what makes a stock Google tile survive on a near-black
        page — see the note on that utility in globals.css for why it is a
        filter, why it must sit on the iframe and not on this frame, and why it
        isn't a styled map.
      */}
      <div className="surface-astral relative overflow-hidden p-1.5">
        <iframe
          // Named, because to a screen reader this is an unlabelled frame full
          // of map furniture; without it the only announcement is "iframe".
          title={`Map showing ${address.unit}, ${address.society}, ${address.locality}`}
          src={EMBED_SRC}
          loading="lazy"
          // Google's own recommendation for Maps embeds: keeps the full referrer
          // on the https→https hop so the request is attributed correctly.
          referrerPolicy="no-referrer-when-downgrade"
          className="map-dark block h-[260px] w-full rounded-[calc(var(--radius-astral)-0.4rem)] lg:h-[300px]"
        />

        {/*
          Our own label, over the tile.

          The coordinate embed drops Google's place card — which is the point,
          it was printing a plot number that read as her flat — but it takes the
          society's name off the map with it. What is left is a pin surrounded
          by the labels of *neighbouring* societies (Raksha Addela, Radicon
          Vedantam), which is actively misleading: the one name a viewer must
          not read here is somebody else's address. Zooming does not fix it,
          because whether Google renders the "Palm Olympia" label at all depends
          on where the tile is centred, and centring on her tower pushes it off.

          So the naming is done here, where it is certain, in the site's own
          type. `pointer-events-none` keeps the map draggable underneath, and
          `aria-hidden` stops it being read twice — the iframe title and the
          address block below already say this.
        */}
        <div
          aria-hidden
          className="border-astral-gold/25 bg-void-black/80 font-inter text-parchment-white pointer-events-none absolute top-4 left-4 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-sm"
        >
          <span className="text-astral-gold">{address.unit}</span>
          <span className="text-parchment-white/35"> · </span>
          {address.society}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-cinzel text-astral-gold text-lg">Where she is</h2>

        {/*
          The disclaimer runs *above* the address, not under it. Everything else
          on this page tells you consultations are remote; an address and a map
          pin quietly say the opposite, and a client who reads the pin and not
          the paragraph turns up at a stranger's gate. Say it before the thing
          it qualifies, not after.
        */}
        <p className="font-inter text-parchment-white/65 mt-4 text-sm text-pretty">
          Consultations are held remotely by default — over WhatsApp, phone or
          video, wherever you are. Sessions in person are by prior appointment
          only.
        </p>

        <address className="font-inter text-parchment-white/80 mt-5 text-sm not-italic">
          {LINES.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-astral text-astral-gold hover:text-astral-gold/75 font-inter mt-5 inline-flex items-center gap-2 text-sm transition-colors"
        >
          Open in Google Maps
          {/* aria-hidden and no title: the link text already says where this
              goes, so the arrow would only be read out as noise. */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </div>
  );
}
