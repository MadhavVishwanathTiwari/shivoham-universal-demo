"""Verify the built deck assets.

The likeliest bug in an atlas pipeline is off-by-one tile registration, which is
invisible in a file listing and obvious only once it's on screen. So we re-derive
each card's UV rect exactly the way the shader will, crop it back out, and
compare against the source scan.

Usage: python tools/verify_deck.py
"""

import json
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "public" / "models"
TEXTURES = ROOT / "public" / "textures"

# An absolute MSE threshold measures the WebP encoder, not the packing: a lone
# q82 tile already scores ~150 against its source on these noisy scans. So test
# registration two ways that are immune to codec loss —
#   1. the aligned crop must beat every +/-1px shift of itself
#   2. it must beat the neighbouring tile by a wide margin (catches off-by-one-slot)
NEIGHBOUR_RATIO = 0.5
fails = []


def check(label, ok, detail=""):
    print(f"  {'ok  ' if ok else 'FAIL'} {label}{'  ' + detail if detail else ''}")
    if not ok:
        fails.append(label)


def check_glb(path):
    b = path.read_bytes()
    magic, version, length = struct.unpack_from("<III", b, 0)
    check("glb header", magic == 0x46546C67 and version == 2 and length == len(b))
    jlen, jtype = struct.unpack_from("<II", b, 12)
    check("json chunk", jtype == 0x4E4F534A)
    g = json.loads(b[20:20 + jlen])
    blen, btype = struct.unpack_from("<II", b, 20 + jlen)
    check("bin chunk", btype == 0x004E4942)
    check("bufferView bounds",
          all(v["byteOffset"] + v["byteLength"] <= blen for v in g["bufferViews"]))
    check("no embedded textures", "images" not in g,
          "(atlas is loaded at runtime)")
    check("3 primitives, face/back/rim order",
          [m["name"] for m in g["materials"]] == ["face", "back", "rim"]
          and len(g["meshes"][0]["primitives"]) == 3)
    return g


def check_atlas(atlas, cards, src_key="src"):
    # Both encodings of a sheet are checked: the client picks between them at
    # runtime, so an AVIF that is missing or packed a slot off would black out
    # the deck for nearly every visitor while the WebP still looked fine here.
    src = atlas[src_key]
    if src is None:
        check(f"{atlas['src']} avif twin", False,
              "missing - build ran without ffmpeg on PATH")
        return

    sheet = Image.open(TEXTURES / Path(src).name).convert("RGB")
    check(f"{src} dimensions",
          sheet.size == (atlas["width"], atlas["height"]), str(sheet.size))
    check(f"{src} fits its tier",
          max(sheet.size) <= atlas["maxTextureSize"],
          f"limit {atlas['maxTextureSize']}")

    tw, th = atlas["tile"]
    cols, W, H = atlas["cols"], atlas["width"], atlas["height"]
    shifted, swapped, worst_ratio = [], [], 0.0

    def crop(x, y):
        return np.asarray(sheet.crop((x, y, x + tw, y + th)), dtype=float)

    for card in cards:
        # atlasIndex, never index: the sheet holds only the cards the hero
        # spreads, so a card's place in the 78-card deck no longer addresses a
        # tile. Getting this wrong is precisely the off-by-one-slot bug the
        # neighbour ratio below exists to catch.
        i = card["atlasIndex"]
        # exactly the arithmetic Deck.jsx feeds the shader
        off_u, off_v = (i % cols) * tw / W, (i // cols) * th / H
        su, sv = tw / W, th / H
        x0, y0 = round(off_u * W), round(off_v * H)

        want = np.asarray(
            Image.open(ROOT / "cards" / f"{card['id']}.jpg").convert("RGB")
            .resize((tw, th), Image.LANCZOS), dtype=float)
        mse = float(((crop(x0, y0) - want) ** 2).mean())

        best = min(float(((crop(x0 + dx, y0 + dy) - want) ** 2).mean())
                   for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                   if 0 <= x0 + dx and 0 <= y0 + dy
                   and x0 + dx + tw <= W and y0 + dy + th <= H)
        if mse > best + 1e-6:
            shifted.append(card["id"])

        j = (i + 1) % len(cards)
        other = crop((j % cols) * tw, (j // cols) * th)
        ratio = mse / max(float(((other - want) ** 2).mean()), 1e-6)
        worst_ratio = max(worst_ratio, ratio)
        if ratio > NEIGHBOUR_RATIO:
            swapped.append(card["id"])

    check(f"{src} sub-pixel alignment", not shifted,
          f"{len(shifted)} tiles beaten by a shifted crop" if shifted
          else "every tile beats its +/-1px shifts")
    check(f"{src} tile identity", not swapped,
          f"worst self/neighbour MSE ratio {worst_ratio:.3f}, limit {NEIGHBOUR_RATIO}")


def main():
    manifest = json.loads((MODELS / "manifest.json").read_text(encoding="utf-8"))
    cards = manifest["cards"]

    print("card.glb")
    check_glb(MODELS / "card.glb")

    print("\nmetadata")
    check("78 cards", len(cards) == 78, str(len(cards)))
    check("indices are dense and ordered",
          [c["index"] for c in cards] == list(range(len(cards))))
    check("every card named", all(c["name"] and c["name"] != c["id"] for c in cards))

    # The sheet is packed from this subset, and cardData.ts rebuilds HERO_CARDS
    # from it, so a gap here is a card the deck would try to draw with no tile.
    hero = [c for c in cards if c["atlasIndex"] is not None]
    check(f"{manifest['heroCount']} cards carry an atlasIndex",
          len(hero) == manifest["heroCount"], str(len(hero)))
    check("atlas slots are dense and ordered",
          [c["atlasIndex"] for c in hero] == list(range(len(hero))))
    check("atlas slots fit every tier",
          all(len(hero) <= a["cols"] * a["rows"] for a in manifest["atlases"]))

    print("\natlases")
    for atlas in manifest["atlases"]:
        for key in ("src", "srcAvif"):
            check_atlas(atlas, hero, key)

    print("\nbackside")
    strays = sorted(p.name for p in MODELS.glob("*.glb") if p.name != "card.glb")
    check("backside exists once", (TEXTURES / "back.webp").exists())
    check("backside avif twin", (TEXTURES / "back.avif").exists())
    check("no stale per-card GLBs", not strays,
          f"{len(strays)} left" if strays else "")

    print("\nFAILED: " + ", ".join(fails) if fails else "\nall checks passed")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
