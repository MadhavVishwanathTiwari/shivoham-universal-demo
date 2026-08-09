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
import Button from "@/components/ui/Button";
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

  /**
   * Whether the hero is anywhere near the viewport. Drives `frameloop`.
   *
   * Every phase of the deck is time-driven, so the canvas ran at "always" — and
   * kept running while the visitor read the rest of the page, which on a phone
   * is a 3D scene rendering at 60fps into a screen nobody is looking at. The
   * GPU eventually takes the context away, and a lost context on an `alpha:
   * false` canvas composites as a white rectangle.
   *
   * The margin is generous on purpose: resuming a frame early costs nothing,
   * whereas resuming late means scrolling back up to a hero that has not drawn
   * yet.
   */
  const [heroNearViewport, setHeroNearViewport] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setHeroNearViewport(entry.isIntersecting),
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /**
   * Bumped to remount the Canvas after the GL context was lost and restored.
   * Everything the old context held — programs, buffers, textures — died with
   * it, so the restored context draws an empty scene until the R3F root is
   * rebuilt from scratch. That is what made the blank hero survive a reload.
   */
  const [canvasGeneration, setCanvasGeneration] = useState(0);

  /*
   * The gather phase. "end end" puts progress = 1 exactly where the stage
   * unpins, so this range covers only the pinned scrolling.
   *
   * The section is shorter on desktop (150svh, so 50svh of pin) than on mobile
   * (200svh, 100svh of pin). Desktop pointers scroll in much larger increments
   * than a thumb does, and a full screen of pinned scrolling there reads as the
   * page being stuck rather than as an animation being played.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
   * The exit phase: 0 where the stage unpins, 1 where the section has fully
   * left the viewport. This is a separate scroll range because it covers the
   * stage's own height scrolling past, which `scrollYProgress` above has
   * already finished measuring.
   *
   * It exists to kill a full screen of dead black. A sticky 100svh stage still
   * takes 100svh of scrolling to clear after it unpins, so fading the canvas
   * out by the end of the gather left the deck invisible for that entire
   * stretch while the next section crawled up from the bottom. Fading across
   * the exit instead means the deck is still on screen as the content arrives,
   * and the two cross over instead of being separated by a void.
   */
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["end end", "end start"],
  });

  // Read as data inside useFrame — that path is unaffected by the DOM issue
  // useScrollStyle exists to work around.
  const gather = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  // Holds at full opacity through the whole gather, then goes as the section
  // scrolls away. Ends well before the exit completes so the last stretch is
  // clean content rather than a ghost of the deck.
  const stageRef = useScrollStyle<HTMLDivElement>(exitProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0, 0.55, 1, 0));
  });
  const copyRef = useScrollStyle<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(mapRange(p, 0, 0.28, 1, 0));
    el.style.transform = `translateY(${mapRange(p, 0, 0.28, 0, -40)}px)`;
    /*
     * The copy block gained a real button, and opacity alone does not retire
     * one. `visibility: hidden` is doing the work that `pointer-events: none`
     * cannot: it takes the link out of the tab order too, so a keyboard user
     * scrolling past the hero doesn't land on an invisible "Book a reading".
     * Both are applied at the exact point the fade reaches zero — earlier and
     * a still-visible button would go dead under the cursor.
     */
    const gone = p >= 0.28;
    el.style.pointerEvents = gone ? "none" : "";
    el.style.visibility = gone ? "hidden" : "";
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
  /**
   * Whether the current gesture has been resolved as a horizontal drag and has
   * taken ownership of `fan`.
   *
   * Framer fires onPanStart/onPanEnd for *any* pan, and a vertical swipe on a
   * phone is the page scrolling. Only onPan distinguished them, so the other two
   * acted on scrolls: onPanStart cancelled the auto-open and onPanEnd then
   * snapped `fan` to 0. Scroll hard within OPEN_DELAY of load and the deck stayed
   * stacked for the rest of the session, with the bare nebula behind it.
   */
  const fanTakeover = useRef(false);

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

  // Deliberately touches neither the auto-open nor `fan`: at this point the
  // gesture could still be a vertical scroll. The takeover happens in handlePan,
  // the only handler that knows the direction.
  const handlePanStart = useCallback(() => {
    fanTakeover.current = false;
  }, []);

  const handlePan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      // A vertical swipe is the page scrolling, not the deck fanning.
      if (Math.abs(info.offset.x) <= Math.abs(info.offset.y)) return;
      if (!fanTakeover.current) {
        fanTakeover.current = true;
        stopOpening.current?.();
        // Captured here rather than at onPanStart: the auto-open may have been
        // mid-flight until this instant, so the value at gesture start is stale.
        fanAtStart.current = fan.get();
      }
      didPan.current = true;
      const travel = window.innerWidth * FAN_TRAVEL;
      fan.set(clamp01(fanAtStart.current + info.offset.x / travel));
    },
    [fan],
  );

  const handlePanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      // The gesture never became a horizontal drag, so it was a scroll — leave
      // `fan` alone. Settling it here is what turned a flick of the page into a
      // deck that closed itself.
      if (!fanTakeover.current) return;
      fanTakeover.current = false;
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
    <section
      ref={sectionRef}
      className="bg-void-black relative h-[200svh] md:h-[150svh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.div {...panProps} className="absolute inset-0">
          <div ref={stageRef} className="h-full w-full">
            <HeroCanvas
              key={canvasGeneration}
              interactive={!isMobile && hovered !== null}
              paused={!heroNearViewport}
              onContextRestored={() => setCanvasGeneration((g) => g + 1)}
              gather={gather}
              isMobile={isMobile}
              reducedMotion={reducedMotion}
            >
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

        {/*
          Two full-bleed tints over the canvas. `pointer-events-none` on both is
          load-bearing, not hygiene: every deck interaction is an R3F pointer
          event on the canvas underneath, so a full-bleed div without it would
          swallow all of them.

          A gold wash bottom-left, so the void has some depth behind the deck...
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(60%_50%_at_50%_115%,rgba(212,175,55,0.12),transparent_70%)]"
        />
        {/* ...then the vignette last, so it is the outermost tint and knocks
            back the wash's bottom corners along with everything else. It needs
            no scroll fade: past p=0.74 the stage fades to bg-void-black and both
            of these are invisible against it. */}
        <div
          aria-hidden
          className="vignette-nebula pointer-events-none absolute inset-0 z-10"
        />

        {/* ---------------------------------------------------------- copy */}
        {/*
          Two nested fades that must not fight over one style property: the
          outer one clears the copy out of the way of an inspected card (the
          canvas sits below this layer, so the headline would otherwise print
          straight over the card art), the inner one is the scroll fade.
        */}
        <div
          /* Mobile padding is measured off the header rather than the viewport.
             7svh put the top of this block at ~62px on a typical phone, under a
             72px header — so the eyebrow was simply hidden behind it and the
             gold rule sat right against its edge. A percentage of viewport
             height cannot clear a fixed-pixel header at every screen size, so
             it is derived from the header's own token instead. */
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-[calc(var(--header-h)+1.5rem)] text-center transition-opacity duration-500 md:pt-[12svh] ${
            inspecting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div ref={copyRef} className="flex flex-col items-center">
            {/* Desktop only. On a phone the header's wordmark is a couple of
                centimetres above this, so it read as the company name printed
                twice in the same glance — and the fixed header cropped it
                besides. The gold rule below carries the same opening beat on
                its own. */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-astral-gold/75 font-inter hidden text-[11px] tracking-[0.4em] uppercase md:block"
            >
              Shivoham Universal Sol
            </motion.p>

            <div aria-hidden className="rule-astral mt-4 h-px w-32" />

            {/*
              The blur is on its own clock, and deliberately the shortest thing
              here. opacity and y are compositor properties — free. `filter` is
              not: every frame re-rasterizes the glyphs *and* the 24px
              text-glow-gold shadow beneath them, on the main thread, while
              Cinzel swaps in underneath (display: swap) and invalidates the
              raster again. Running that for the full second put ~1s of the most
              expensive paint on the page directly on top of the deck's WebGL
              init — context creation, shader compile, and an 8.8MP atlas
              upload. The burst dropped frames; the blur is what made them
              visible as a stutter. 0.45s clears the collision, and at this
              easing the soft focus-in reads the same.
            */}
            <motion.h1
              initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.1,
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
                filter: { delay: 0.1, duration: 0.45, ease: "easeOut" },
              }}
              /* No will-change here, deliberately. Promoting this to its own
                 compositor layer sat a filtered text layer directly under the
                 header's backdrop-blur and over the WebGL canvas, and on Android
                 that stack rasterized as white bands across the header and the
                 headline. The duration cut above is where the win actually was;
                 the layer promotion was a rounding error next to it. */
              className="font-cinzel text-parchment-white text-glow-gold mt-5 text-[1.4rem] leading-[1.15] font-semibold text-balance sm:text-4xl md:mt-6 md:text-5xl"
            >
              Unlock the answers written in your stars
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
              className="font-inter text-parchment-white/55 mt-5 max-w-sm text-sm text-pretty md:text-base"
            >
              Timeless insight for health, wealth, and relationships.
              {/* The instruction, not the pitch — it is the one sentence that
                  tells you the deck below is interactive, so it carries the
                  gold rather than blending into the blurb.

                  `block` rather than a trailing space: as an inline run it
                  wrapped mid-phrase at narrow widths ("Tap / your first card"),
                  which reads as a typo rather than an invitation. Its own line
                  also gives the pulse something to be — a glowing fragment at
                  the end of a paragraph just looks like a rendering fault.

                  The pulse lives on this span and not on the <p>: the paragraph
                  carries Framer's entrance, which writes an inline opacity, and
                  an inline opacity beats a CSS animation on the same element. */}
              <span className="invite-hint text-astral-gold animate-invite mt-2 block font-medium [animation-delay:1.3s]">
                {isMobile ? "Tap your first card." : "Draw your first card."}
              </span>
            </motion.p>

            {/*
              pointer-events-auto is required and narrowly scoped: the wrapper
              two levels up is pointer-events-none so the copy layer doesn't
              swallow the R3F pointer events the deck runs on. This button is
              the only thing in that subtree allowed to take a click — and it
              gives the ground back while a card is being read on mobile, since
              the sheet renders below this layer.
            */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8, ease: "easeOut" }}
              className={`mt-6 ${inspecting ? "pointer-events-none" : "pointer-events-auto"}`}
            >
              <Button
                href="/contact"
                variant="ghost"
                /* The backdrop is not decoration: this button lands on top of
                   the card wave, and a bare gold hairline disappears against
                   the lit cards on the left of the spread. */
                className="bg-void-black/45 !px-5 !py-2 !text-[11px] tracking-[0.25em] uppercase backdrop-blur-sm"
              >
                Book a reading
              </Button>
            </motion.div>
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
