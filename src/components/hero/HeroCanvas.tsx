"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, Preload } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import NebulaBackground from "./NebulaBackground";

/** Matches --color-void-black; the canvas clears to it so there is no seam. */
const VOID_BLACK = "#0B0C10";
const ASTRAL_GOLD = "#D4AF37";
const PARCHMENT = "#F8F9FA";
/** The nebula's own body colour. Keep in step with --color-nebula-indigo in
 *  globals.css and C_INDIGO in NebulaBackground — see FOG_NEAR below. */
const NEBULA_INDIGO = "#1A1440";
/** The violet fill. Sits in the +z hemisphere because at rest the cards show
 *  their *backs* (wavePose sets ry ≈ PI), so their visible normals face the
 *  camera — a light behind the deck would contribute essentially nothing. */
const NEBULA_VIOLET = "#7A5CE0";

/*
 * Depth haze. Linear fog rather than FogExp2 because the cards occupy a very
 * narrow band — 6.35 to 8.45 units from the camera — and an exp2 density subtle
 * enough not to wash them gives about 1% of front-to-back difference across it.
 *
 * three's linear fog is smoothstep(near, far, -mvPosition.z), and the camera is
 * axis-aligned at z=7.4 with no rotation, so fog depth is exactly 7.4 - worldZ:
 *
 *   nearest card centre  pz +0.55 -> 12%     farthest card centre pz -0.55 -> 28%
 *   gathered stack       pz  0.00 -> 19%     focused card         pz +1.85 ->  1%
 *
 * Two things fall out of that. A single card's own near and far corners differ
 * by ~7 points, which is the atmospheric perspective *within* each card that
 * sells the effect. And the focus pull is a ~26-point clear, so hovering
 * literally lifts a card out of the haze.
 *
 * Deliberately not branched for mobile: the fan is shallower (a near-flat 15-19%
 * wash, which unifies it with the backdrop) but FOCUS_Z_MOBILE is deeper and
 * lands a tapped card at ~0%. Two constants beat four.
 *
 * INVARIANT: the fog colour must equal what the nebula renders directly behind
 * the ribbon. NebulaBackground's composition puts C_INDIGO there — not the
 * violet wisps — which is why this is NEBULA_INDIGO and not a guess. Too dark
 * and the far cards read as silhouettes cut out of the backdrop; too bright and
 * they read as haloed.
 */
const FOG_NEAR = 5.0;
const FOG_FAR = 13.5;

export interface HeroCanvasProps {
  children: ReactNode;
  /** Scroll progress. Passed through to the nebula, which dims as the deck
   *  re-stacks; read as data inside useFrame, never bound to the DOM. */
  gather: MotionValue<number>;
  isMobile: boolean;
  reducedMotion: boolean;
  /** Raised while a card is focused, so the pointer reads as interactive. */
  interactive?: boolean;
  className?: string;
}

/**
 * The R3F stage: camera, lighting, backdrop, and nothing else. The deck is
 * passed in as children so this file owns rendering concerns and TarotDeck3D
 * owns motion.
 *
 * Performance guardrails: DPR is capped at 2 (a 3x phone would otherwise render
 * ~2.5x the pixels for no visible gain), there are no post-processing passes and
 * no render targets — the nebula is a scene object costing one draw call — and
 * `frameloop` stays on "always" because every phase is time-driven.
 */
export default function HeroCanvas({
  children,
  gather,
  isMobile,
  reducedMotion,
  interactive = false,
  className,
}: HeroCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.4], fov: 42, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // A fallback, not the backdrop: the nebula quad covers every pixel, so
        // this is only ever seen if its program fails to compile.
        scene.background = new THREE.Color(VOID_BLACK);
      }}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      {/* attach is required — R3F only auto-attaches geometries and materials,
          so without it this mounts as a child object and silently does nothing. */}
      <fog attach="fog" args={[NEBULA_INDIGO, FOG_NEAR, FOG_FAR]} />

      {/* Outside the Suspense below on purpose. The deck suspends on a GLB and
          two texture atlases; from in there, the hero would show flat black for
          the whole load instead of the backdrop from the first frame. */}
      <NebulaBackground
        gather={gather}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
      />

      {/* Soft fill so the void never reads as pure black. Lowered from 0.75 now
          that the vignette carries the mood: the directional key does the face
          lighting, so this costs ~9% of face brightness and buys the contrast
          the focused card reads against. */}
      <ambientLight intensity={0.5} color={PARCHMENT} />
      {/* ...and one key light aimed at the centre, which is what carves the
          wave's depth: cards further round the sine catch it at a shallower
          angle and fall off into the background. */}
      <directionalLight
        position={[3.5, 5.5, 6]}
        intensity={2.1}
        color={PARCHMENT}
      />

      <Suspense fallback={null}>
        {children}

        {/*
          The card rim is metallic 1.0 (see tools/card_mesh.py) and metal with
          nothing to reflect renders black — the gold edge would simply not
          exist under lights alone. These lightformers are baked into a 128px
          cubemap once, on mount: no HDR download, no per-frame cost.

          Gold used to come from both sides; the right-hand one is now the
          nebula's violet, giving a warm-key / cool-fill split that reads as
          "lit by the backdrop". World +x is screen-right, which is also where
          the nebula's bright mass sits, so the light and the backdrop agree.
          Gold stays dominant: gold at 1.6 is ~0.72 linear luminance against
          violet's ~0.38. The intensity is 2.2 rather than 1.6 because violet's
          luminance is a third of gold's at equal intensity — matching the
          number it replaced would have made it nearly invisible.
        */}
        <Environment resolution={128} frames={1}>
          <Lightformer
            intensity={2.4}
            color={PARCHMENT}
            position={[0, 3, 5]}
            scale={[10, 5, 1]}
          />
          <Lightformer
            intensity={1.6}
            color={ASTRAL_GOLD}
            position={[-5, 0.5, 3]}
            scale={[4, 8, 1]}
          />
          <Lightformer
            intensity={2.2}
            color={NEBULA_VIOLET}
            position={[5, -1, 3]}
            scale={[4, 8, 1]}
          />
          <Lightformer
            intensity={0.6}
            color="#1F2833"
            position={[0, -4, 2]}
            scale={[10, 4, 1]}
          />
        </Environment>

        <Preload all />
      </Suspense>
    </Canvas>
  );
}
