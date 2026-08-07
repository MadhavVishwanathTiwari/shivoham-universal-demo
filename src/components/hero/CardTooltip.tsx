"use client";

import { AnimatePresence, motion, type MotionValue } from "framer-motion";
import type { TarotCard } from "./cardData";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function Keywords({ words }: { words: string[] }) {
  if (!words.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {words.map((word) => (
        <li
          key={word}
          className="border-astral-gold/30 text-astral-gold/85 rounded-full border px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase"
        >
          {word}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ desktop hover */

export interface CardTooltipProps {
  card: TarotCard | null;
  /** Canvas-space anchor written by TarotDeck3D each frame. */
  x: MotionValue<number>;
  y: MotionValue<number>;
}

/**
 * The hover readout, centred under the focused card.
 *
 * Position comes from motion values the deck writes during useFrame, so the
 * tooltip tracks the card at 60fps without React re-rendering it — only a change
 * of *card* re-renders, and that is what AnimatePresence keys on.
 */
export function CardTooltip({ card, x, y }: CardTooltipProps) {
  return (
    <motion.div
      style={{ x, y }}
      className="pointer-events-none absolute top-0 left-0 hidden md:block"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="border-astral-gold/45 bg-ethereal-gray/80 w-64 -translate-x-1/2 rounded-xl border px-5 py-4 text-center shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md"
          >
            <p className="text-astral-gold/70 font-inter text-[10px] tracking-[0.28em] uppercase">
              {card.arcana}
              {card.number ? ` · ${card.number}` : ""}
            </p>
            <h2 className="font-cinzel text-parchment-white text-glow-gold mt-1.5 text-xl leading-tight">
              {card.name}
            </h2>
            <p className="font-inter text-parchment-white/65 mt-2 text-xs leading-relaxed">
              {card.essence}
            </p>
            <div className="flex justify-center">
              <Keywords words={card.keywords} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------------------------------------------------------- mobile drawer */

export interface CardSheetProps {
  card: TarotCard | null;
  onClose: () => void;
}

/**
 * The touch equivalent: a bottom sheet that slides up under the inspected card.
 * Draggable downward to dismiss, which is the gesture a thumb already expects.
 */
export function CardSheet({ card, onClose }: CardSheetProps) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.55 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 90 || info.velocity.y > 550) onClose();
          }}
          className="border-astral-gold/35 bg-ethereal-gray/90 pointer-events-auto absolute inset-x-0 bottom-0 z-30 rounded-t-3xl border-t px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
          role="dialog"
          aria-label={card.name}
        >
          <div className="bg-astral-gold/40 mx-auto mb-4 h-1 w-10 rounded-full" />

          <p className="text-astral-gold/70 font-inter text-[10px] tracking-[0.28em] uppercase">
            {card.arcana}
            {card.number ? ` · ${card.number}` : ""}
          </p>
          <h2 className="font-cinzel text-parchment-white mt-1 text-2xl leading-tight">
            {card.name}
          </h2>
          <p className="font-inter text-parchment-white/70 mt-2 text-sm leading-relaxed">
            {card.essence}
          </p>
          <Keywords words={card.keywords} />

          <button
            type="button"
            onClick={onClose}
            className="border-astral-gold/30 text-astral-gold/80 font-inter mt-5 w-full rounded-full border py-2.5 text-xs tracking-[0.2em] uppercase"
          >
            Return to the deck
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CardTooltip;
