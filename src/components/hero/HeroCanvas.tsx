"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, Preload } from "@react-three/drei";
import * as THREE from "three";

/** Matches --color-void-black; the canvas clears to it so there is no seam. */
const VOID_BLACK = "#0B0C10";
const ASTRAL_GOLD = "#D4AF37";
const PARCHMENT = "#F8F9FA";

export interface HeroCanvasProps {
  children: ReactNode;
  /** Raised while a card is focused, so the pointer reads as interactive. */
  interactive?: boolean;
  className?: string;
}

/**
 * The R3F stage: camera, lighting, and nothing else. The deck is passed in as
 * children so this file owns rendering concerns and TarotDeck3D owns motion.
 *
 * Performance guardrails: DPR is capped at 2 (a 3x phone would otherwise render
 * ~2.5x the pixels for no visible gain), there is no post-processing, and
 * `frameloop` stays on "always" because every phase is time-driven.
 */
export default function HeroCanvas({
  children,
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
        scene.background = new THREE.Color(VOID_BLACK);
      }}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      {/* Soft fill so the void never reads as pure black... */}
      <ambientLight intensity={0.75} color={PARCHMENT} />
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
            intensity={1.1}
            color={ASTRAL_GOLD}
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
