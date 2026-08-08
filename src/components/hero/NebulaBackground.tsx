"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

/**
 * Noise domain units travelled per second. With the warp's own 0.11 factor this
 * crosses one noise cell in roughly 26 seconds — a slow breath, not a
 * screensaver. The nebula should never be the thing that catches your eye.
 */
const DRIFT_RATE = 0.35;
/** Fraction of the drift `gather` removes, so the backdrop settles as you scroll. */
const GATHER_SLOW = 0.6;

/**
 * fbm octaves, injected as a preprocessor constant rather than a uniform: a
 * uniform loop bound blocks unrolling on most drivers and costs more than the
 * octave it saves. Two is the documented escape hatch if a real device ever
 * profiles badly — dropping to 2 and deleting the domain warp roughly halves
 * the shader's cost, and both are one-line changes.
 */
const OCTAVES_DESKTOP = 3;
const OCTAVES_MOBILE = 2;

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // Straight to clip space: no projection, no model-view. The quad is therefore
  // exactly fullscreen at any aspect ratio with no viewport arithmetic, and z=1
  // parks it on the far plane. planeGeometry(2,2) already spans -1..1.
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = (octaves: number) => /* glsl */ `
#define OCTAVES ${octaves}

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform float uGather;

// Literal sRGB output values. three splices <tonemapping_fragment> and
// <colorspace_fragment> into its own built-in shaders, not into custom ones, so
// nothing converts these — what is written here is what lands on screen. That is
// deliberate: fog is also applied post-tonemap in sRGB, so C_INDIGO and
// THREE.Fog's colour are the *same* number rather than two values that have to
// be eyeballed into agreement.
const vec3 C_VOID   = vec3(0.039, 0.031, 0.078); // #0A0814  the void the billows fade into
const vec3 C_INDIGO = vec3(0.102, 0.078, 0.251); // #1A1440  the body — and the fog colour
const vec3 C_VIOLET = vec3(0.325, 0.196, 0.643); // #5332A4  the lit wisps
const vec3 C_GOLD   = vec3(0.831, 0.686, 0.216); // #D4AF37  astral-gold, additive ember only
const vec3 C_STAR   = vec3(0.780, 0.745, 0.949); // #C7BEF2  a violet-white

// Same shape as jitter() in TarotDeck3D. Fragment shaders compile at highp here,
// and the noise path's largest argument is floor(p * 26), which leaves ~11
// fractional mantissa bits. Only the dither below sees large arguments, and
// degraded precision there just means slightly worse dither.
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Value noise, not simplex: simplex costs ~40 ops against ~30 and buys only
// isotropy, which the domain warp and a low-contrast colour ramp destroy anyway.
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < OCTAVES; i++) {
    sum += vnoise(p) * amp;
    norm += amp;
    // Lacunarity is 2.03, not 2.0, and each octave is nudged off-grid: doubling
    // exactly re-aligns the value-noise lattice and prints a visible plaid.
    p = p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum / norm;
}

// Sparse soft points on a coarse cell grid — one hash per cell, so the whole
// field costs about as much as a single noise octave, and the early-out is
// warp-coherent at this scale. No spikes, no starfield: this is depth cueing
// behind a tarot spread, not astronomy.
float stars(vec2 p) {
  vec2 i = floor(p);
  float h = hash21(i + 31.4);
  if (h < 0.86) return 0.0;              // ~14% of cells hold a star
  vec2 f = fract(p) - 0.5;
  vec2 o = vec2(hash21(i + 7.1), hash21(i + 13.7)) - 0.5;
  float mag = (h - 0.86) / 0.14;         // spread the survivors across 0..1 brightness
  mag *= 0.75 + 0.25 * sin(uTime * 1.8 + h * 40.0);
  return smoothstep(0.055, 0.0, length(f - o * 0.7)) * mag;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // Two soft masses, not a uniform field: the nebula has a composition. The
  // bright one sits mid-right, beside the wave's far end; the dim one low-left,
  // under the gold DOM wash in HeroSection. The frame's top third is left dark
  // on purpose — the headline sits there.
  // The falloffs are long and overlapping: a tight mass reads as a spotlight
  // behind the deck rather than as cloud, because its own smoothstep edge
  // becomes the silhouette instead of the noise.
  float m1 = smoothstep(0.84, 0.10, length((p - vec2( 0.42, -0.12)) * vec2(0.85, 1.30)));
  float m2 = smoothstep(0.78, 0.12, length((p - vec2(-0.38, -0.30)) * vec2(0.80, 1.35)));
  float mass = m1 + m2 * 0.55;

  // The domain warp is where the billow comes from. Two bare noise samples buy
  // far more apparent structure per ALU than a fourth fbm octave would.
  vec2 q = vec2(
    vnoise(p * 1.9 + uTime * 0.11),
    vnoise(p * 1.9 + vec2(5.2, 1.3) - uTime * 0.08)
  );
  float n = fbm(p * 4.2 + q * 0.9);

  // The noise, not the mass, has to own the contrast — hence the small floor and
  // the >1 gain. The mass only says *where* there is cloud; how it breaks up into
  // wisps and voids is all n, and clipping at both ends is what makes the voids.
  // The gain is held low enough that d only grazes 1.0 at the very brightest.
  // Push it higher and large areas clamp to the same value, which paints flat
  // saturated plateaus — the field stops reading as cloud and starts reading as
  // blobs, because a plateau has an edge but no interior structure.
  float d = clamp(mass * (0.05 + n * 1.05), 0.0, 1.0);
  d *= mix(1.0, 0.55, uGather);          // the void closes in as the deck re-stacks

  /*
   * INVARIANT: behind the deck this must land on C_INDIGO, because that is also
   * THREE.Fog's colour. At screen centre-low (p ~ (0, -0.1)) mass ~ 0.61 and a
   * typical n ~ 0.48 give d ~ 0.51 — the first ramp has saturated and the second
   * has not started, so the backdrop there is exactly C_INDIGO. Move the masses
   * or these thresholds and the far cards stop dissolving into the backdrop:
   * too dark reads as silhouettes cut out of it, too bright reads as haloed.
   */
  vec3 col = mix(C_VOID, C_INDIGO, smoothstep(0.00, 0.48, d));
  // The violet ramp deliberately never completes — its top end sits past 1.0, so
  // even the brightest wisp lands short of full C_VIOLET. A saturating ramp
  // gives a solid violet core, which reads as a lamp behind the deck.
  col      = mix(col,    C_VIOLET, smoothstep(0.60, 1.15, d));

  // Gold is not a ramp stop — it is a small additive term gated to the hottest
  // wisps, so the backdrop quotes the brand accent instead of competing with it.
  float ember = smoothstep(0.80, 1.0, d);
  col += C_GOLD * ember * ember * 0.12;

  // Suppressed inside the bright masses. Physically backwards, compositionally
  // right: stars belong in the empty parts of the frame.
  col += C_STAR * stars(p * 26.0) * (1.0 - mass * 0.75) * 0.32;

  // A fullscreen dark gradient bands into visible contour rings on any 8-bit
  // display. three dithers its own materials for exactly this reason
  // (<dithering_fragment>); a custom ShaderMaterial does not get that chunk, so
  // it has to happen here. 1/255 of triangular-ish noise is enough.
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.0039;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface NebulaBackgroundProps {
  /** Scroll progress, read as data inside useFrame — never bound to the DOM. */
  gather: MotionValue<number>;
  isMobile: boolean;
  reducedMotion: boolean;
}

/**
 * The hero's backdrop: a fullscreen quad drawn before everything else, carrying
 * a slow violet nebula and a scatter of soft stars.
 *
 * This is a scene object, not a post-processing pass — it costs one draw call
 * and no render targets, which is what keeps HeroCanvas's "no post-processing"
 * guardrail true. Its colour is load-bearing rather than decorative: THREE.Fog
 * in HeroCanvas fogs the deck toward the same indigo this renders behind it, so
 * distant cards dissolve into the backdrop instead of sitting on top of it.
 */
export default function NebulaBackground({
  gather,
  isMobile,
  reducedMotion,
}: NebulaBackgroundProps) {
  const size = useThree((state) => state.size);

  /*
   * Rebuilt when the breakpoint settles, because OCTAVES is compiled in. That
   * happens for real: useIsMobile starts false and only resolves on the first
   * client effect, so a phone builds this twice and the first program would leak
   * without the disposal below.
   */
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: fragmentShader(isMobile ? OCTAVES_MOBILE : OCTAVES_DESKTOP),
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uGather: { value: 0 },
      },
      // The quad owns every pixel behind the deck and must never occlude it, so
      // it neither tests nor writes depth and is sorted first by renderOrder.
      depthTest: false,
      depthWrite: false,
      // Two triangles: backface culling buys nothing and costs an entire class
      // of "why is my background invisible" debugging.
      side: THREE.DoubleSide,
    });
  }, [isMobile]);

  useEffect(() => () => material.dispose(), [material]);

  // Only the ratio is used, so CSS pixels are fine — this exists to stop the
  // noise stretching with the window.
  useLayoutEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height);
  }, [material, size.width, size.height]);

  const clock = useRef(0);

  useFrame((_state, dt) => {
    const g = gather.get();
    /*
     * Accumulated rather than read from clock.elapsedTime: `gather` slows the
     * drift, and scaling an absolute elapsed time would make the nebula lurch
     * backwards as the multiplier changes. dt is clamped because a backgrounded
     * tab hands back one enormous frame on return. Freezing at 0 is also how
     * reduced motion is honoured — one mechanism instead of two, and the field
     * at t=0 is as valid as any other, so it needs no magic constant.
     */
    if (!reducedMotion) {
      clock.current += Math.min(dt, 0.05) * DRIFT_RATE * (1 - GATHER_SLOW * g);
    }
    material.uniforms.uTime.value = clock.current;
    material.uniforms.uGather.value = g;
  });

  return (
    /*
     * renderOrder puts this at the head of the opaque list. frustumCulled is off
     * on principle rather than necessity: three's bounds test is meaningless for
     * a mesh whose vertex shader ignores the projection matrix.
     *
     * If this ever profiles badly, the first thing to try is drawing it *last*
     * with depthTest on and LessEqualDepth, so the deck's depth writes early-z
     * reject the ~30% of fragments it covers. Not done by default: it trades a
     * subtle failure mode for a saving on a shader that is already cheap.
     */
    <mesh material={material} renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
