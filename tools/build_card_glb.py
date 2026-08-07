"""Build a self-contained .glb for individual cards, art embedded.

NOT the hero path — the hero draws all 78 cards and uses the instanced deck from
build_deck.py instead. Use this for the one-at-a-time moments (the numerology
reveal, an OG image, a Blender import) where a single file is more convenient
than an atlas lookup.

The backside is deliberately NOT embedded: it is identical across the deck, and
embedding it is what cost ~273 MB of VRAM when 78 of these were loaded at once.
Assign /textures/back.webp to material index 1 at runtime.

Usage:
  python tools/build_card_glb.py            # every card
  python tools/build_card_glb.py m00 s07    # just these
Output: public/models/single/<id>.glb
"""

import json
import sys
from pathlib import Path

from card_mesh import build_glb, jpeg_bytes

ROOT = Path(__file__).resolve().parent.parent
CARDS = ROOT / "cards"
OUT = ROOT / "public" / "models" / "single"


def main(argv):
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {c["img"]: c for c in json.loads(
        (ROOT / "tarot-images.json").read_text(encoding="utf-8"))["cards"]}

    wanted = set(argv) or None
    total = 0
    for path in sorted(CARDS.glob("*.jpg")):
        cid = path.stem
        if wanted and cid not in wanted:
            continue
        name = meta.get(path.name, {}).get("name", cid)
        size = build_glb(name, OUT / f"{cid}.glb", front_jpg=jpeg_bytes(path))
        total += size
        print(f"{cid:5} {name:<28} {size/1024:7.1f} KB")

    print(f"\n{total/1024:.0f} KB -> {OUT}")
    print("material 1 (back) is untextured — assign /textures/back.webp at runtime")


if __name__ == "__main__":
    main(sys.argv[1:])
