"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type PanInfo,
} from "framer-motion";
import HeroCanvas from "./HeroCanvas";
import TarotDeck3D from "./TarotDeck3D";
import { CardTooltip, CardSheet } from "./CardTooltip";
import { heroCards } from "./cardData";
import { useIsMobile } from "./useMediaQuery";
import { mapRange, useScrollStyle } from "./useScrollStyle";

/** Fraction of the screen a thumb must travel to fan the deck fully open. */
const FAN_TRAVEL = 0.55;
const FLICK_VELOCITY = 260;

/**
 * The mobile deck opens itself a beat after the hero lands, so the spread is
 * the state you arrive in rather than something you have to discover. Scroll
 * takes it back to the stack, same as desktop — `gather` owns that, not `fan`,
 * which is why this only ever runs once.
 */
const OPEN_DELAY = 1;
const OPEN_DURATION = 1.3;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion() ?? false;

  const cards = useMemo(() => heroCards(isMobile), [isMobile]);

  // Desktop focuses on hover, touch focuses on tap — one of the two is live at
  // a time, so the deck only ever needs the resolved index.
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const activeIndex = isMobile ? selected : hovered;
  const activeCard = activeIndex === null ? null : (cards[activeIndex] ?? null);
  /** A card is being read on a phone: the sheet is up and the copy gets out. */
  const inspecting = isMobile && selected !== null;

  /*
   * The section is 200svh with a pinned 100svh stage, so the gather animation
   * plays across a full screen of scrolling instead of sliding away while it
   * runs. "end end" puts progress = 1 exactly where the stage unpins.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Read as data inside useFrame — that path is unaffected by the DOM issue
  // useScrollStyle exists to work around.
  const gather = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  // The canvas holds until the deck has re-stacked, then goes.
  const stageRef = useScrollStyle<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0.74, 1, 1, 0));
  });
  const copyRef = useScrollStyle<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0, 0.28, 1, 0));
    el.style.transform = `translateY(${mapRange(p, 0, 0.28, 0, -40)}px)`;
  });
  const cueRef = useScrollStyle<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0, 0.28, 1, 0));
  });
  // The readout leaves with its card rather than hanging over an empty stage.
  const tipRef = useScrollStyle<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0, 0.18, 1, 0));
  });

  // Screen-space anchor for the tooltip, written by the deck inside useFrame.
  const tipX = useMotionValue(0);
  const tipY = useMotionValue(0);

  // Mobile: horizontal drag drives the fan.
  const fan = useMotionValue(0);
  const fanAtStart = useRef(0);
  const didPan = useRef(false);

  // Stops the auto-open. Held in a ref rather than state so a gesture can take
  // the fan over mid-flight without re-rendering the canvas under the finger.
  const stopOpening = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isMobile) return;
    // Reduced motion still needs to arrive at the spread — it just skips the
    // travel, the same way the desktop deal does.
    if (reducedMotion) {
      fan.set(1);
      return;
    }

    const open = animate(fan, 1, {
      delay: OPEN_DELAY,
      duration: OPEN_DURATION,
      ease: [0.22, 1, 0.36, 1],
    });
    const cancel = () => {
      open.stop();
      stopOpening.current = null;
    };
    stopOpening.current = cancel;
    return cancel;
  }, [fan, isMobile, reducedMotion]);

  const handlePanStart = useCallback(() => {
    stopOpening.current?.();
    fanAtStart.current = fan.get();
  }, [fan]);

  const handlePan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      // A vertical swipe is the page scrolling, not the deck fanning.
      if (Math.abs(info.offset.x) <= Math.abs(info.offset.y)) return;
      didPan.current = true;
      const travel = window.innerWidth * FAN_TRAVEL;
      fan.set(clamp01(fanAtStart.current + info.offset.x / travel));
    },
    [fan],
  );

  const handlePanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const target =
        info.velocity.x > FLICK_VELOCITY
          ? 1
          : info.velocity.x < -FLICK_VELOCITY
            ? 0
            : fan.get() > 0.45
              ? 1
              : 0;
      animate(fan, target, { type: "spring", stiffness: 130, damping: 20 });
      // Cleared on the next tick so the tap handler, which runs inside this same
      // pointerup, still sees that a drag happened.
      setTimeout(() => {
        didPan.current = false;
      }, 0);
    },
    [fan],
  );

  const handleTap = useCallback(
    (index: number | null) => {
      if (didPan.current || !isMobile) return;
      stopOpening.current?.();
      setSelected((current) => (current === index ? null : index));
    },
    [isMobile],
  );

  const panProps = isMobile
    ? {
        onPanStart: handlePanStart,
        onPan: handlePan,
        onPanEnd: handlePanEnd,
      }
    : {};

  return (
    <section ref={sectionRef} className="bg-void-black relative h-[200svh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.div {...panProps} className="absolute inset-0">
          <div ref={stageRef} className="h-full w-full">
            <HeroCanvas interactive={!isMobile && hovered !== null}>
              <TarotDeck3D
                activeIndex={activeIndex}
                onHover={setHovered}
                onTap={handleTap}
                gather={gather}
                fan={fan}
                tipX={tipX}
                tipY={tipY}
                isMobile={isMobile}
                reducedMotion={reducedMotion}
              />
            </HeroCanvas>
          </div>
        </motion.div>

        {/* A gold wash bottom-left, so the void has some depth behind the deck */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(60%_50%_at_50%_115%,rgba(212,175,55,0.12),transparent_70%)]"
        />

        {/* ---------------------------------------------------------- copy */}
        {/*
          Two nested fades that must not fight over one style property: the
          outer one clears the copy out of the way of an inspected card (the
          canvas sits below this layer, so the headline would otherwise print
          straight over the card art), the inner one is the scroll fade.
        */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-[7svh] text-center transition-opacity duration-500 md:pt-[12svh] ${
            inspecting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div ref={copyRef} className="flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-astral-gold/75 font-inter text-[11px] tracking-[0.4em] uppercase"
            >
              Shivoham Universal Sol
            </motion.p>

            <div aria-hidden className="rule-astral mt-4 h-px w-32" />

            <motion.h1
              initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-cinzel text-parchment-white text-glow-gold mt-5 text-[1.75rem] leading-[1.15] font-semibold text-balance sm:text-5xl md:mt-6 md:text-6xl"
            >
              Seventy-eight archetypes,
              {/* the line break is a composition choice, not a sentence break —
                  on a phone the headline needs to reflow on its own */}
              <br className="hidden sm:block" /> rendered in three dimensions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
              className="font-inter text-parchment-white/55 mt-5 max-w-md text-sm text-pretty md:text-base"
            >
              {isMobile
                ? "Tap a card to read it."
                : "Move across the spread. Each card turns to meet you."}
            </motion.p>
          </div>
        </div>

        {/* ---------------------------------------------------- scroll cue */}
        <div
          ref={cueRef}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-parchment-white/35 font-inter text-[10px] tracking-[0.3em] uppercase">
              Scroll to gather
            </span>
            <div
              aria-hidden
              className="from-astral-gold/60 h-8 w-px bg-gradient-to-b to-transparent"
            />
          </div>
        </div>

        <div
          ref={tipRef}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <CardTooltip card={isMobile ? null : activeCard} x={tipX} y={tipY} />
        </div>
        <CardSheet
          card={isMobile ? activeCard : null}
          onClose={() => setSelected(null)}
        />

        {/* The canvas is opaque to assistive tech; name the spread for it. */}
        <ul className="sr-only">
          {cards.map((card) => (
            <li key={card.id}>
              {card.name} — {card.essence}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
