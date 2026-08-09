"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import {
  CARD_H,
  CARD_MODEL,
  CARD_T,
  CARD_W,
  HERO_CARDS,
  heroCards,
  uvRect,
} from "./cardData";
import { useDeckTexture } from "./useDeckTexture";

/* ------------------------------------------------------------------ tuning */

const DEAL_DURATION = 1.1; // seconds one card takes to travel out to the wave
const DEAL_STAGGER = 0.05; // gap between consecutive cards leaving the deck
const DEAL_BACK = 1.1; // easeOutBack tension — the snap at the end of the burst

const STACK_TILT = 0.3; // rad the resting deck leans, so you read its thickness

const WAVE_SPAN = 0.8; // fraction of the viewport width the wave occupies
const WAVE_AMP = 0.85; // vertical swing of the sine
const WAVE_Y = -0.42; // sits the ribbon below centre, clear of the headline

/**
 * Depth along the ribbon: a monotonic ramp with an undulation riding on it.
 *
 * INVARIANT: WAVE_LAYER > PI * WAVE_DEPTH.
 *
 *   dz/du = WAVE_LAYER + PI * WAVE_DEPTH * cos(u*PI + WAVE_PHASE)
 *         >= 1.1 - 0.691 = 0.409   ->  min per-card depth step 0.0195
 *
 * Break it and `pz` folds back on itself. There is no visual symptom — the
 * ribbon looks fine — but painter order stops being a function of card index,
 * and the raycast starts deciding hover on depth gaps of ~0.06 world units
 * between cards that overlap by four widths. Cards at a depth turning point
 * shrink to corner slivers and the tooltip flips between neighbours.
 * `arcPose` keeps the same property on mobile via a pure ramp.
 */
const WAVE_LAYER = 1.1; // monotonic depth ramp across the ribbon
const WAVE_DEPTH = 0.22; // the undulation riding on top of it
const WAVE_PHASE = 0.0; // 0 bulges the middle toward the camera

// Matches HeroCanvas's camera position.z. The depth ramp above pulls one side
// of the wave closer to the camera than the other, which perspective then
// magnifies unevenly — without correcting for it the ribbon reads visibly
// off-centre (wide gap on the far side, cards crowding the near edge) even
// though `px` is computed as a symmetric `c * span`. wavePose divides px by
// this to cancel that out.
const CAMERA_Z = 7.4;

// Sized so the outermost card's *rotated* silhouette still lands inside a 375px
// screen, while neighbours stay ~0.2 units apart — a ~45px wedge to tap.
const ARC_SPREAD = 0.18; // rad between neighbours in the mobile fan
const ARC_RADIUS = 0.44; // pivot distance, as a fraction of the viewport width
const ARC_CARD = 0.26; // a mobile card's width, as a fraction of the viewport
const ARC_LAYER = 0.36; // total depth ramp across the fan, so every card is tappable
const ARC_Y = -0.62; // drops the fan below the headline, which wraps tall on phones

const FLOAT_Y = 0.085; // idle bob amplitude
const FLOAT_RZ = 0.05; // idle roll amplitude
// Phase offset between neighbouring cards. Small on purpose: the ribbon should
// breathe as one object, and the relative drift between two neighbours is what
// moves the seam the pointer is resting on. 0.2 keeps that under ~2px; at 0.55
// it was ~6.5px, enough to feel like the hover was hunting.
const FLOAT_STEP = 0.2;

const FOCUS_Z = 1.85; // how far a focused card floats toward the camera
const FOCUS_Z_MOBILE = 2.3;
const FOCUS_PULL_X = 0.38; // how far it slides back toward the centre line
const FOCUS_PULL_Y = 0.45;
const FOCUS_SCALE = 1.2;
const FOCUS_DAMP = 7; // exponential damping rate for the focus transition
const MOBILE_FOCUS_Y = 0.75; // lift the card clear of the bottom sheet
const MOBILE_FIT = 0.62; // fraction of the viewport a focused card spans

const GLOW_INTENSITY = 30; // astral-gold point light behind the focused card

// CardTooltip's own box, so the anchor can be kept on screen. Keep in step with
// the `w-64` and the padding in CardTooltip.tsx.
const TIP_WIDTH = 256;
const TIP_HEIGHT = 180;
const TIP_MARGIN = 16;

/* ------------------------------------------------------------------- maths */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

/** Overshoots 1 before settling — the "snap" at the end of a dealt card. */
const easeOutBack = (x: number) =>
  1 + (DEAL_BACK + 1) * (x - 1) ** 3 + DEAL_BACK * (x - 1) ** 2;

const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;

/** Deterministic per-card jitter in [-1, 1] — a real deck is never square. */
const jitter = (i: number, salt: number) => {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

interface Pose {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
}

/**
 * Phase 0 — the deck. Every card at the origin, offset only by its own
 * thickness along the deck's normal, so 22 cards read as one solid stack.
 * Face-down: ry near PI puts the backside toward the camera.
 */
function stackPose(i: number, n: number, out: Pose) {
  const off = (i - (n - 1) / 2) * CARD_T;
  out.px = jitter(i, 1) * 0.006;
  out.py = jitter(i, 2) * 0.006 + off * Math.sin(STACK_TILT);
  out.pz = off * Math.cos(STACK_TILT);
  out.rx = -STACK_TILT;
  out.ry = Math.PI + 0.14;
  out.rz = jitter(i, 3) * 0.012;
}

/**
 * Phase 1/2 (desktop) — a 3D sine wave across the screen: one full period in Y,
 * and a depth ramp that sweeps the ribbon toward the camera as it crosses,
 * bulging in the middle, so it reads as 3D instead of lying flat. Cards stay
 * tilted back (negative rx) and splay with the wave (ry, rz) so no two catch the
 * key light at the same angle.
 *
 * `pz` is strictly increasing in `u` — see the WAVE_LAYER invariant. That is what
 * makes card i always draw behind card i+1, so every card keeps one clean
 * full-height strip to hover and the raycast winner never flips.
 */
function wavePose(i: number, n: number, span: number, out: Pose) {
  const u = n > 1 ? i / (n - 1) : 0.5;
  const c = u - 0.5;
  out.pz = c * WAVE_LAYER + Math.sin(u * Math.PI + WAVE_PHASE) * WAVE_DEPTH;
  out.px = (c * span * (CAMERA_Z - out.pz)) / CAMERA_Z;
  out.py = Math.sin(u * Math.PI * 2) * WAVE_AMP + WAVE_Y;
  out.rx = -0.2 + Math.sin(u * Math.PI * 2.4) * 0.1;
  out.ry = Math.PI + c * 0.95;
  out.rz = Math.sin(u * Math.PI * 2 + 0.35) * 0.3 + jitter(i, 4) * 0.05;
}

/**
 * Phase 1/2 (mobile) — a hand fan. Every card sits `r` from a pivot below the
 * screen and rotates by its own angle, which is what makes a fanned hand read as
 * fanned. The radius is a fraction of the viewport rather than a fixed distance,
 * so the fan is as wide as the phone is and never stretches off it. ARC_LAYER
 * ramps depth monotonically so each card keeps an exposed wedge to tap.
 */
function arcPose(i: number, n: number, viewWidth: number, out: Pose) {
  const a = (i - (n - 1) / 2) * ARC_SPREAD;
  const r = viewWidth * ARC_RADIUS;
  out.px = Math.sin(a) * r;
  out.py = (Math.cos(a) - 1) * r + ARC_Y;
  out.pz = (n > 1 ? i / (n - 1) : 0) * ARC_LAYER;
  out.rx = -0.12;
  out.ry = Math.PI + a * 0.3;
  out.rz = -a;
}

/* -------------------------------------------------------------- deck mesh */

/**
 * Merge the GLB's three primitives into one geometry with material groups.
 *
 * GLTFLoader turns each glTF primitive into a separate Mesh, but InstancedMesh
 * needs a single geometry — so we keep the shared attributes and concatenate the
 * three index buffers, one group per material (face / back / rim).
 */
function useCardGeometry() {
  const { scene } = useGLTF(CARD_MODEL);

  return useMemo(() => {
    const order = ["face", "back", "rim"];
    const parts: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) parts.push(o as THREE.Mesh);
    });
    parts.sort(
      (a, b) =>
        order.indexOf((a.material as THREE.Material).name) -
        order.indexOf((b.material as THREE.Material).name),
    );

    if (
      parts.length !== 3 ||
      parts.some((p, i) => (p.material as THREE.Material).name !== order[i])
    ) {
      throw new Error(
        `card.glb must expose primitives named ${order.join("/")} — rebuild with tools/build_deck.py`,
      );
    }

    const geometry = new THREE.BufferGeometry();
    for (const name of ["position", "normal", "uv"]) {
      geometry.setAttribute(name, parts[0].geometry.getAttribute(name));
    }

    const indices: number[] = [];
    let start = 0;
    parts.forEach((part, i) => {
      const arr = part.geometry.getIndex()!.array;
      for (let k = 0; k < arr.length; k++) indices.push(arr[k]);
      geometry.addGroup(start, arr.length, i);
      start += arr.length;
    });
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    const materials = parts.map(
      (p) => (p.material as THREE.MeshStandardMaterial).clone(),
    );
    return { geometry, materials };
  }, [scene]);
}

/** The vertex chunk that computes vMapUv, and our hook into it. */
const UV_VERTEX_CHUNK = "#include <uv_vertex>";

/**
 * Rewrite the face material's UVs per instance so each card samples its own
 * atlas tile. `aUv` is [offsetU, offsetV, scaleU, scaleV]; without this every
 * instance would draw the whole sheet.
 */
function patchFaceMaterial(material: THREE.MeshStandardMaterial, map: THREE.Texture) {
  material.map = map;
  material.onBeforeCompile = (shader) => {
    // onBeforeCompile runs *before* three resolves #include directives, so the
    // source is still chunk references — assert on the directive, not on the
    // vMapUv varying it expands to.
    if (!shader.vertexShader.includes(UV_VERTEX_CHUNK)) {
      throw new Error(
        `card face material: ${UV_VERTEX_CHUNK} not found — three's shader layout changed`,
      );
    }
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec4 aUv;")
      .replace(
        UV_VERTEX_CHUNK,
        // vMapUv is declared by <uv_pars_vertex> and assigned here; remapping it
        // into the instance's tile is what turns one atlas into 78 faces.
        `${UV_VERTEX_CHUNK}\n\tvMapUv = aUv.xy + vMapUv * aUv.zw;`,
      );
  };
  // the stock standard-material program is cached; force our variant
  material.customProgramCacheKey = () => "deck-atlas-uv";
  material.needsUpdate = true;
}

/* -------------------------------------------------------------- component */

export interface TarotDeck3DProps {
  /** Card pulled to the foreground: hover on desktop, tap on mobile. */
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  onTap: (index: number | null) => void;
  /** 0 -> 1 as the hero scrolls away; magnetically re-stacks the deck. */
  gather: MotionValue<number>;
  /** 0 -> 1 from the mobile drag gesture; fans the deck out. */
  fan: MotionValue<number>;
  /** Screen-space anchor for the HTML tooltip, in canvas CSS pixels. */
  tipX: MotionValue<number>;
  tipY: MotionValue<number>;
  isMobile: boolean;
  reducedMotion: boolean;
}

/**
 * All hero cards as a single InstancedMesh: 3 draw calls and 2 textures for the
 * whole spread. Every phase — deal, float, focus, gather — is one scalar per
 * card resolved in useFrame, so none of it costs a React render.
 */
export default function TarotDeck3D({
  activeIndex,
  onHover,
  onTap,
  gather,
  fan,
  tipX,
  tipY,
  isMobile,
  reducedMotion,
}: TarotDeck3DProps) {
  const { geometry, materials } = useCardGeometry();
  const { atlas, face, back } = useDeckTexture();
  const size = useThree((s) => s.size);

  const cards = useMemo(() => heroCards(isMobile), [isMobile]);
  const count = cards.length;
  const mesh = useRef<THREE.InstancedMesh>(null);
  /**
   * A second, invisible InstancedMesh that owns all pointer events. It shares
   * `mesh`'s geometry but is driven by the *resting* pose only — laid out, but
   * with none of the idle float and none of the focus-pull applied.
   *
   * Raycasting the visible mesh directly created a feedback loop: hovering a
   * card pulls it toward screen centre (FOCUS_PULL_X/Y) and partway through its
   * reveal it is briefly edge-on to the camera (ry crossing PI/2), so the
   * animated hit target kept sliding or vanishing out from under a stationary
   * pointer. Hover drops, the card springs back, hover re-triggers — that loop
   * is the "wild jitter" this exists to kill, not the tap-target size. A
   * pointer-driven sim of this exact scene (float + focus dynamics + a sweep
   * across the ribbon) measured ~624 hover changes against an ideal of ~22;
   * decoupling the hit target to the resting pose brought that to ~21.
   */
  const hit = useRef<THREE.InstancedMesh>(null);
  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    [],
  );
  const glow = useRef<THREE.PointLight>(null);

  // scratch — reused every frame so the loop allocates nothing
  const scratch = useMemo(
    () => ({
      obj: new THREE.Object3D(),
      stack: {} as Pose,
      layout: {} as Pose,
      v: new THREE.Vector3(),
      /** per-card focus weight, eased independently so cards cross-fade */
      focus: new Float32Array(HERO_CARDS.length),
    }),
    [],
  );
  const startedAt = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);

  const uvAttribute = useMemo(() => {
    const data = new Float32Array(cards.length * 4);
    cards.forEach((card, i) => data.set(uvRect(atlas, card.atlasIndex), i * 4));
    return new THREE.InstancedBufferAttribute(data, 4);
  }, [atlas, cards]);

  const preparedMaterials = useMemo(() => {
    const [faceMat, backMat, rimMat] = materials;
    patchFaceMaterial(faceMat, face);
    backMat.map = back;
    backMat.needsUpdate = true;
    return [faceMat, backMat, rimMat];
  }, [materials, face, back]);

  useLayoutEffect(() => {
    geometry.setAttribute("aUv", uvAttribute);
    const m = mesh.current;
    if (!m) return;
    // Instance matrices change every frame, so a computed bounding sphere goes
    // stale immediately and three caches it forever. A generous manual one keeps
    // raycasting honest without recomputing 22 matrices per pointer move.
    m.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 24);
    if (hit.current) hit.current.boundingSphere = m.boundingSphere.clone();
  }, [geometry, uvAttribute]);

  const handleMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      // touch drives selection through onTap; a "hover" from a finger would
      // fight the drag gesture
      if (isMobile) return;
      e.stopPropagation();
      const id = e.instanceId ?? null;
      if (id !== hoverRef.current) {
        hoverRef.current = id;
        onHover(id);
      }
    },
    [isMobile, onHover],
  );

  const handleOut = useCallback(() => {
    if (isMobile) return;
    if (hoverRef.current !== null) {
      hoverRef.current = null;
      onHover(null);
    }
  }, [isMobile, onHover]);

  useFrame((state, dt) => {
    const m = mesh.current;
    const hitMesh = hit.current;
    if (!m || !hitMesh) return;

    const t = state.clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = t;
    const elapsed = t - startedAt.current;

    const { obj, stack, layout, v, focus } = scratch;

    // Phase 4 — scroll pulls everything back to the origin.
    const gathered = easeInOutCubic(clamp01(gather.get()));
    // Phase 1 (mobile) — the drag gesture is the deal.
    const fanned = clamp01(fan.get());

    const view = state.viewport.getCurrentViewport(state.camera, v.set(0, 0, 0));
    const span = view.width * WAVE_SPAN;
    // Cards are sized to the phone, not to the world: a 1-unit card on a 375px
    // screen is a third of its width before the fan has even opened.
    const baseScale = isMobile ? (view.width * ARC_CARD) / CARD_W : 1;

    // A focused card must fit the frame it is pulled into; on mobile that means
    // spanning the screen, which depends on the viewport at the focus depth.
    const focusZ = isMobile ? FOCUS_Z_MOBILE : FOCUS_Z;
    const focusView = state.viewport.getCurrentViewport(
      state.camera,
      v.set(0, 0, focusZ),
    );
    const focusScale = isMobile
      ? // fit the screen, but never end up smaller than the card already was:
        // on a short landscape phone the height clamp alone would shrink it
        Math.max(
          Math.min(
            (focusView.width * MOBILE_FIT) / CARD_W,
            (focusView.height * 0.5) / CARD_H,
          ),
          baseScale * 1.15,
        )
      : FOCUS_SCALE;

    let anchorX = 0;
    let anchorY = 0;
    let anchorZ = 0;
    let anchorW = 0;

    for (let i = 0; i < count; i++) {
      // ---- how far this card has travelled out of the deck
      let spread: number;
      if (isMobile) {
        spread = fanned;
      } else if (reducedMotion) {
        spread = 1;
      } else {
        const local = clamp01((elapsed - i * DEAL_STAGGER) / DEAL_DURATION);
        spread = easeOutBack(local);
      }
      spread *= 1 - gathered;

      stackPose(i, count, stack);
      if (isMobile) arcPose(i, count, view.width, layout);
      else wavePose(i, count, span, layout);

      let px = lerp(stack.px, layout.px, spread);
      let py = lerp(stack.py, layout.py, spread);
      let pz = lerp(stack.pz, layout.pz, spread);
      let rx = lerp(stack.rx, layout.rx, spread);
      let ry = lerp(stack.ry, layout.ry, spread);
      let rz = lerp(stack.rz, layout.rz, spread);

      // ---- The hit proxy gets the resting pose: laid out, but before the
      // float and the focus. See the <instancedMesh ref={hit}> below for why
      // the pointer must not be tested against the animated pose.
      obj.position.set(px, py, pz);
      obj.rotation.set(rx, ry, rz);
      obj.scale.setScalar(baseScale);
      obj.updateMatrix();
      hitMesh.setMatrixAt(i, obj.matrix);

      // ---- Phase 2, the float. Scaled by `spread` so a stacked deck sits still.
      if (!reducedMotion) {
        const idle = clamp01(spread);
        py += Math.sin(t * 0.9 + i * FLOAT_STEP) * FLOAT_Y * idle;
        rz += Math.sin(t * 0.7 + i * FLOAT_STEP * 0.75) * FLOAT_RZ * idle;
      }

      // ---- Phase 3, the focus.
      const want = i === activeIndex ? 1 : 0;
      focus[i] = damp(focus[i], want, FOCUS_DAMP, dt);
      // Gathering outranks focus. The pointer does not move while you scroll, so
      // a hovered card would otherwise hold its focus pose and refuse to return
      // to the deck with the rest of the spread.
      const f = focus[i] * (1 - gathered);
      let scale = baseScale;

      if (f > 0.001) {
        const tx = px * FOCUS_PULL_X;
        const ty = py * FOCUS_PULL_Y + (isMobile ? MOBILE_FOCUS_Y : 0);
        px = lerp(px, tx, f);
        py = lerp(py, ty, f);
        pz = lerp(pz, focusZ, f);
        // rotation goes to [0,0,0]: flat to the camera, and the 180deg of ry is
        // exactly the reveal — the face comes round as the card comes forward
        rx *= 1 - f;
        ry *= 1 - f;
        rz *= 1 - f;
        scale = lerp(baseScale, focusScale, f);

        if (f > anchorW) {
          anchorW = f;
          anchorX = px;
          anchorY = py;
          anchorZ = pz;
        }
      }

      obj.position.set(px, py, pz);
      obj.rotation.set(rx, ry, rz);
      obj.scale.setScalar(scale);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    hitMesh.instanceMatrix.needsUpdate = true;

    // ---- the astral-gold halo, sitting just behind the focused card
    if (glow.current) {
      glow.current.intensity = anchorW * GLOW_INTENSITY;
      glow.current.position.set(anchorX, anchorY, anchorZ - 0.55);
    }

    // ---- project the focused card's lower edge into screen space for the
    // HTML tooltip, which lives outside the canvas
    if (anchorW > 0.001) {
      v.set(anchorX, anchorY - CARD_H * 0.5 * focusScale - 0.18, anchorZ);
      v.project(state.camera);
      // Cards low in the wave would anchor the tooltip past the bottom edge, so
      // keep it inside the canvas; TIP_* are its own box, measured in CSS px.
      const px = (v.x * 0.5 + 0.5) * size.width;
      const py = (-v.y * 0.5 + 0.5) * size.height;
      const halfW = TIP_WIDTH / 2 + TIP_MARGIN;
      tipX.set(THREE.MathUtils.clamp(px, halfW, size.width - halfW));
      tipY.set(
        THREE.MathUtils.clamp(py, TIP_MARGIN, size.height - TIP_HEIGHT - TIP_MARGIN),
      );
    }
  });

  return (
    <>
      {/* Rendered, but takes no pointer events — see the `hit` proxy below. */}
      <instancedMesh
        ref={mesh}
        args={[geometry, preparedMaterials, count]}
        frustumCulled={false}
      />
      {/*
        Invisible; owns every pointer event. `visible={false}` skips the draw
        call (three.js still raycasts invisible meshes — that's not a bug being
        worked around, it's the mechanism this relies on), and R3F only
        raycasts objects that carry a handler, so the visible mesh above is
        never tested. Its per-instance matrices are the resting layout, written
        alongside `mesh`'s in the useFrame loop below.
      */}
      <instancedMesh
        ref={hit}
        args={[geometry, hitMaterial, count]}
        visible={false}
        frustumCulled={false}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onTap(e.instanceId ?? null);
        }}
        onPointerMissed={() => onTap(null)}
      />
      <pointLight
        ref={glow}
        color="#D4AF37"
        intensity={0}
        distance={9}
        decay={2}
      />
    </>
  );
}

useGLTF.preload(CARD_MODEL);
