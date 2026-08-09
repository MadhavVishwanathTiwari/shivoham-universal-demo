# Tarot deck assets

Generated from `cards/` by `tools/build_deck.py`. Rebuild and verify with:

```bash
python tools/build_deck.py && python tools/verify_deck.py
```

| file | what |
|---|---|
| `models/card.glb` | the shared card mesh, **untextured** (8 KB) |
| `textures/hero-2100.webp` | the 22 trumps packed into one 2100×2400 sheet (1.5 MB / 995 KB AVIF) |
| `textures/hero-1788.webp` | same 22 at 1788×2044 for the 2048-limit tier (1.1 MB / 734 KB AVIF) |
| `textures/back.webp` | the backside, stored **once** (111 KB) |
| `models/manifest.json` | card metadata + atlas grid params |

A device fetches the mesh, **one** atlas, and the backside — 1.05 MB on the
common path. Both sheets ship as AVIF with a WebP twin; `build_deck.py` deletes
sheets from previous runs, so a renamed tier cannot leave orphans behind.

## Why an atlas

Shipping 78 textured GLBs cost 20.94 MB of download and ~356 MB of VRAM — and
~273 MB of that was the backside, allocated 78 separate times because it was
embedded in every file. Instanced off one atlas the whole deck is 3 draw calls,
2 textures, ~26 MB VRAM.

## Why 22 tiles and not 78

The hero spreads the Major Arcana only (`HERO_CARDS`): 78 cards across one screen
overlap to a ~12% sliver each, which neither showcases the art nor leaves a
hoverable target. The sheet used to carry all 78 anyway, so every visitor
downloaded and decoded 56 tiles nothing ever sampled.

Packing only what is drawn is also what paid for the tile size — see the note on
resolution below. `HERO_ARCANA` in `build_deck.py` is the single source of truth:
it stamps an `atlasIndex` on each card it selects, and `cardData.ts` rebuilds
`HERO_CARDS` from that field rather than re-filtering on arcana, so the list and
the sheet cannot drift apart.

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
   image and the atlas is packed with row 0 at the top. Sheets load through
   `ImageBitmapLoader` (`useDeckTexture.ts`), which decodes off the main thread;
   for an ImageBitmap source `Texture.flipY` is ignored, so orientation is set at
   bitmap creation via `imageOrientation`. `flipY = false` is kept on the texture
   anyway, and is also the fast upload path — `UNPACK_FLIP_Y_WEBGL` on an
   ImageBitmap makes the driver take a CPU copy, which would put the decode cost
   straight back on the main thread.
2. **Tile arithmetic lives in one place, and is keyed on `atlasIndex`.**
   `uvRect()` in `cardData.ts` is the definition; `verify_deck.py` re-derives
   tiles with the same formula and checks every tile beats its own ±1px shifts
   and its neighbour. Absolute image diffs do *not* work here — WebP q82 alone
   scores ~150 MSE on these noisy scans, which swamps a one-pixel error.
   A card's `index` (its place in the 78-card deck) is **not** its tile: since
   the sheet holds only the 22 trumps the two diverge, and passing `index` would
   sample the wrong art with nothing to flag it.

Atlases are NPOT, so mipmapping them needs WebGL2. Universal in practice; the
smaller sheet is the fallback.

## Single-card GLBs

`tools/build_card_glb.py [id ...]` writes self-contained per-card files to
`models/single/` for one-at-a-time moments (numerology reveal, OG images,
Blender). It embeds the face only — assign `back.webp` to material 1 at runtime.
Not the hero path.

## Resolution ceiling

The source scans are 350×600, and the top tier now packs them at exactly that —
dropping to 22 tiles freed enough of the 4096 budget to stop downsampling to
256×440. So the tiles are at the art's native resolution and the remaining
ceiling is in the scans themselves, not the pipeline.

It still matters, because a focused card is the one moment the art is shown
large: on a phone it spans ~62% of the viewport (`MOBILE_FIT`), i.e. ~480 device
px against a 350px tile. Sharper cards need better scans, not a bigger sheet.
