# Tarot deck assets

Generated from `cards/` by `tools/build_deck.py`. Rebuild and verify with:

```bash
python tools/build_deck.py && python tools/verify_deck.py
```

| file | what |
|---|---|
| `models/card.glb` | the shared card mesh, **untextured** (8 KB) |
| `textures/deck-3328.webp` | 78 faces packed into one 3328×2640 sheet (2.8 MB) |
| `textures/deck-1920.webp` | same deck at 1920×1918 for the 2048-limit tier (1.1 MB) |
| `textures/back.webp` | the backside, stored **once** (111 KB) |
| `models/manifest.json` | card metadata + atlas grid params |

A device fetches the mesh, **one** atlas, and the backside: 2.94 MB on desktop,
1.25 MB on mobile.

## Why an atlas

The hero draws all 78 cards at once. Shipping 78 textured GLBs cost 20.94 MB of
download and ~356 MB of VRAM — and ~273 MB of that was the backside, allocated
78 separate times because it was embedded in every file. Instanced off one atlas
the whole deck is 3 draw calls, 2 textures, ~45 MB VRAM (~19 MB on mobile).

Measured in `tools/smoke.html`: `drawCalls 3, textures 2, geometries 1,
instances 78`.

## Geometry

Rounded-corner card, 1.0 × 1.714 × 0.005 world units — the 350×600 scan aspect,
corner radius 0.055 (the proportion of a 3.5 mm radius on a 63 mm card) over 10
segments. 178 verts / 176 triangles, three primitives **in this order**:

| primitive | material | map assigned at runtime |
|---|---|---|
| 0 | `face` | the atlas, offset per instance via the `aUv` attribute |
| 1 | `back` | `back.webp`, shared by every instance |
| 2 | `rim`  | none — dull gold `baseColorFactor [0.48, 0.31, 0.09]`, metallic 1.0, roughness 0.62 |

Thickness is deliberate: 78 × 0.005 = 0.39 units against a 1.0-wide card, which
is what a real deck looks like (~25 mm of card on a 63 mm face). The hero opens
on that stack, so don't raise it casually.

Note glTF base colour is **linear**, not sRGB — the rim factor is ~`#b8964f` on
screen. Dullness comes from roughness; lowering `RIM_METALLIC` turns the gold
into beige plastic.

## Two invariants that will silently corrupt the deck

1. **`flipY = false` on both textures.** The GLB's UVs assume an unflipped
   image and the atlas is packed with row 0 at the top. `TextureLoader` defaults
   to `flipY = true`, so it must be cleared explicitly (`useDeckTexture.js`).
2. **Tile arithmetic lives in one place.** `uvRect()` in `cardData.js` is the
   definition; `verify_deck.py` re-derives tiles with the same formula and
   checks every tile beats its own ±1px shifts and its neighbour. Absolute image
   diffs do *not* work here — WebP q82 alone scores ~150 MSE on these noisy
   scans, which swamps a one-pixel error.

Atlases are NPOT, so mipmapping them needs WebGL2. Universal in practice; the
smaller sheet is the fallback.

## Single-card GLBs

`tools/build_card_glb.py [id ...]` writes self-contained per-card files to
`models/single/` for one-at-a-time moments (numerology reveal, OG images,
Blender). It embeds the face only — assign `back.webp` to material 1 at runtime.
Not the hero path.

## Known limit

The source scans are 350×600. The atlas tiles are 256×440 (desktop), so nothing
is upscaled, but a card hovered at hero scale will read soft. That ceiling is in
the art, not the pipeline.
