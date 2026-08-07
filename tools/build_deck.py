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
from pathlib import Path

from PIL import Image

from card_mesh import CARD_H, CARD_T, CARD_W, build_glb

ROOT = Path(__file__).resolve().parent.parent
CARDS = ROOT / "cards"
MODELS = ROOT / "public" / "models"
TEXTURES = ROOT / "public" / "textures"

# (label, cols, rows, tile_w, tile_h, max_texture_size it targets)
# Grids are sized so the atlas clears the tier's texture limit: WebGL only
# guarantees 2048, so the mobile sheet must fit inside that on both axes.
TIERS = [
    ("deck-3328", 13, 6, 256, 440, 4096),   # 3328x2640, 78 slots exactly
    ("deck-1920", 12, 7, 160, 274, 2048),   # 1920x1918, 84 slots (6 spare)
]
BACK_SIZE = (512, 742)
WEBP_QUALITY = 82
KEYWORD_LIMIT = 4      # what a hover tooltip can show without wrapping to a wall


def load_meta():
    data = json.loads((ROOT / "tarot-images.json").read_text(encoding="utf-8"))
    return {c["img"]: c for c in data["cards"]}


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
    return out, sheet.size


def main():
    MODELS.mkdir(parents=True, exist_ok=True)
    TEXTURES.mkdir(parents=True, exist_ok=True)

    meta = load_meta()
    faces = sorted(CARDS.glob("*.jpg"), key=lambda p: p.name)

    mesh_bytes = build_glb("card", MODELS / "card.glb")

    back = Image.open(CARDS / "backside.jfif").convert("RGB")
    back = back.resize(BACK_SIZE, Image.LANCZOS)
    back.save(TEXTURES / "back.webp", "WEBP", quality=WEBP_QUALITY, method=6)
    back_bytes = (TEXTURES / "back.webp").stat().st_size

    atlases, base = [], mesh_bytes + back_bytes
    for label, cols, rows, tw, th, limit in TIERS:
        path, (w, h) = build_atlas(faces, label, cols, rows, tw, th)
        size = path.stat().st_size
        atlases.append({
            "src": f"/textures/{label}.webp",
            "width": w, "height": h,
            "cols": cols, "rows": rows,
            "tile": [tw, th],
            "maxTextureSize": limit,
            "bytes": size,
        })
        vram = w * h * 4 * 1.33 / 1024 ** 2
        print(f"{label:11} {w}x{h}  {size/1024:6.0f} KB file  ~{vram:5.1f} MB VRAM")

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
            "image": f"/cards/{path.name}",
        })

    manifest = {
        "model": "/models/card.glb",
        "back": "/textures/back.webp",
        "cardSize": [CARD_W, round(CARD_H, 6), CARD_T],
        "atlases": atlases,
        "cards": cards,
    }
    (MODELS / "manifest.json").write_text(json.dumps(manifest, indent=2),
                                          encoding="utf-8")

    print(f"\ncard.glb {mesh_bytes/1024:.1f} KB  back.webp {back_bytes/1024:.1f} KB")
    for a in atlases:
        # a device downloads the mesh, ONE atlas, and the backside — never both sheets
        print(f"{len(cards)} cards via {a['src']}: "
              f"{(base + a['bytes'])/1024/1024:.2f} MB over 3 requests")


if __name__ == "__main__":
    main()
