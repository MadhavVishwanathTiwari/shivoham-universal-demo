"""Build the instanced-deck assets: one shared mesh + one atlas per device tier.

The hero draws all 78 cards, so per-card GLBs are the wrong shape — 78 textured
files cost ~21 MB of download and ~356 MB of VRAM (the backside alone gets
allocated 78 times). Instead we ship:

  public/models/card.glb        untextured rounded card, instanced 78x
  public/textures/deck-*.webp   every face packed into one atlas per tier
  public/textures/back.webp     the backside, exactly once
  public/models/manifest.json   card metadata + atlas grid params

Callers derive a card's UV rect from its `index` and the chosen atlas grid, so
there is one source of truth for the packing.

Usage: python tools/build_deck.py
"""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

from card_mesh import CARD_H, CARD_T, CARD_W, build_glb

ROOT = Path(__file__).resolve().parent.parent
CARDS = ROOT / "cards"
MODELS = ROOT / "public" / "models"
TEXTURES = ROOT / "public" / "textures"

# The hero spreads the 22 trumps and nothing else (see HERO_CARDS in
# cardData.ts), so the sheet holds 22 tiles rather than all 78. The 56 tiles it
# used to carry were downloaded and decoded by every visitor and sampled by
# nobody.
#
# That is also what pays for the tile size. The old top tier downsampled the
# 350x600 masters to 256x440 to fit 78 of them under the 4096 limit; 22 fit at
# full resolution with room to spare, so the sheet is now both smaller
# (2100x2400 = 5.0MP against 3328x2640 = 8.8MP) and sharper. It needed to be:
# a focused card on a phone spans ~62% of the viewport (MOBILE_FIT), i.e.
# ~480 device px against a 256px tile.
#
# (label, cols, rows, tile_w, tile_h, max_texture_size it targets)
# Grids clear the tier's texture limit on BOTH axes: WebGL only guarantees 2048.
TIERS = [
    ("hero-2100", 6, 4, 350, 600, 4096),   # 2100x2400, masters at native size
    ("hero-1788", 6, 4, 298, 511, 2048),   # 1788x2044, same grid inside 2048
]

# Which cards the hero spreads. This is the single source of truth: the atlas is
# packed from it and cardData.ts derives HERO_CARDS from the atlasIndex this
# stamps on each card. To spread the full deck, set this to None and rebuild —
# the grids above need to grow to match (78 tiles at 350x600 will not fit 4096).
HERO_ARCANA = "Major Arcana"
BACK_SIZE = (512, 742)
WEBP_QUALITY = 82
AVIF_CRF = 28          # measured knee: ~37% under WebP q82 with cleaner linework
KEYWORD_LIMIT = 4      # what a hover tooltip can show without wrapping to a wall


def load_meta():
    data = json.loads((ROOT / "tarot-images.json").read_text(encoding="utf-8"))
    return {c["img"]: c for c in data["cards"]}


def encode_avif(sheet, out):
    """AVIF via ffmpeg — Pillow only speaks AVIF with a plugin, and shelling out
    keeps the toolchain to one binary the repo already needs.

    Every sheet ships in BOTH formats. AVIF is ~37% smaller and is what almost
    every visitor gets, but a browser that cannot decode it would otherwise draw
    78 black cards, so the WebP stays as the fallback the client falls back to.
    """
    if not shutil.which("ffmpeg"):
        print(f"  ! ffmpeg not on PATH - skipping {out.name}, WebP fallback only")
        return None
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "sheet.png"
        sheet.save(src)
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(src),
             "-c:v", "libaom-av1", "-still-picture", "1", "-cpu-used", "6",
             "-crf", str(AVIF_CRF), "-pix_fmt", "yuv420p", str(out)],
            check=True,
        )
    return out


def build_atlas(images, label, cols, rows, tw, th):
    """Pack faces left-to-right, top-to-bottom. Row 0 is the TOP row: textures
    are sampled with flipY=false (glTF convention), so UV v grows downward."""
    assert len(images) <= cols * rows, f"{label}: {len(images)} cards > {cols*rows} slots"
    sheet = Image.new("RGB", (cols * tw, rows * th), (0, 0, 0))
    for i, path in enumerate(images):
        tile = Image.open(path).convert("RGB").resize((tw, th), Image.LANCZOS)
        sheet.paste(tile, ((i % cols) * tw, (i // cols) * th))
    out = TEXTURES / f"{label}.webp"
    sheet.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
    avif = encode_avif(sheet, TEXTURES / f"{label}.avif")
    return out, avif, sheet.size


def main():
    MODELS.mkdir(parents=True, exist_ok=True)
    TEXTURES.mkdir(parents=True, exist_ok=True)

    meta = load_meta()
    faces = sorted(CARDS.glob("*.jpg"), key=lambda p: p.name)

    mesh_bytes = build_glb("card", MODELS / "card.glb")

    back = Image.open(CARDS / "backside.jfif").convert("RGB")
    back = back.resize(BACK_SIZE, Image.LANCZOS)
    back.save(TEXTURES / "back.webp", "WEBP", quality=WEBP_QUALITY, method=6)
    back_avif = encode_avif(back, TEXTURES / "back.avif")
    back_bytes = (back_avif or TEXTURES / "back.webp").stat().st_size

    cards = []
    for i, path in enumerate(faces):
        card = meta.get(path.name, {})
        # The hero tooltip shows a name + one line + a few keywords. Carry only
        # that here; the full readings stay in tarot-images.json rather than
        # riding along in the client bundle.
        light = (card.get("meanings") or {}).get("light") or []
        cards.append({
            "id": path.stem,
            "index": i,
            "name": card.get("name", path.stem),
            "arcana": card.get("arcana"),
            "suit": card.get("suit"),
            "number": card.get("number"),
            "keywords": (card.get("keywords") or [])[:KEYWORD_LIMIT],
            "essence": light[0] if light else "",
            # a slot in the atlas, or null for a card the hero never draws
            "atlasIndex": None,
        })

    # `index` is a card's place in the full 78-card deck; `atlasIndex` is its
    # slot in the sheet. They used to be the same number, which is exactly why
    # this is now explicit — the UV arithmetic may only ever use atlasIndex, and
    # a card without one has no tile to sample.
    hero = [c for c in cards if HERO_ARCANA is None or c["arcana"] == HERO_ARCANA]
    for slot, card in enumerate(hero):
        card["atlasIndex"] = slot
    hero_faces = [faces[c["index"]] for c in hero]

    atlases, base = [], mesh_bytes + back_bytes
    built = set()
    for label, cols, rows, tw, th, limit in TIERS:
        path, avif, (w, h) = build_atlas(hero_faces, label, cols, rows, tw, th)
        built.update({path.name} | ({avif.name} if avif else set()))
        size = path.stat().st_size
        avif_size = avif.stat().st_size if avif else 0
        atlases.append({
            "src": f"/textures/{label}.webp",
            "srcAvif": f"/textures/{label}.avif" if avif else None,
            "width": w, "height": h,
            "cols": cols, "rows": rows,
            "tile": [tw, th],
            "maxTextureSize": limit,
            # what a visitor actually downloads: AVIF where supported, else WebP
            "bytes": avif_size or size,
            "bytesWebp": size,
        })
        vram = w * h * 4 * 1.33 / 1024 ** 2
        saved = f"  avif {avif_size/1024:5.0f} KB (-{100*(1-avif_size/size):.0f}%)" if avif else ""
        print(f"{label:11} {w}x{h}  webp {size/1024:6.0f} KB{saved}  ~{vram:5.1f} MB VRAM")

    # Sheets from a previous run under a different label are dead weight that
    # nothing references and every deploy still carries — renaming a tier used to
    # silently leave 6.6 MB of orphans behind. Scoped to sheet files so the
    # backside, which is not a tier, survives.
    for stale in sorted(TEXTURES.glob("*-*.webp")) + sorted(TEXTURES.glob("*-*.avif")):
        if stale.name not in built:
            stale.unlink()
            print(f"  removed stale sheet {stale.name}")

    manifest = {
        "model": "/models/card.glb",
        "back": "/textures/back.webp",
        "backAvif": "/textures/back.avif" if back_avif else None,
        "cardSize": [CARD_W, round(CARD_H, 6), CARD_T],
        # how many of `cards` carry an atlasIndex; verify_deck.py asserts it
        "heroCount": len(hero),
        "atlases": atlases,
        "cards": cards,
    }
    (MODELS / "manifest.json").write_text(json.dumps(manifest, indent=2),
                                          encoding="utf-8")

    print(f"\ncard.glb {mesh_bytes/1024:.1f} KB  back.webp {back_bytes/1024:.1f} KB")
    for a in atlases:
        # a device downloads the mesh, ONE atlas, and the backside — never both sheets
        print(f"{len(hero)} of {len(cards)} cards via {a['src']}: "
              f"{(base + a['bytes'])/1024/1024:.2f} MB over 3 requests")


if __name__ == "__main__":
    main()
