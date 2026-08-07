"""Shared tarot card mesh + GLB writer.

One definition of the card geometry, used by both builders:
  * build_deck.py      -> a single untextured card.glb, instanced 78x at runtime
  * build_card_glb.py  -> optional one-off per-card GLBs with the art embedded

Geometry is a rounded-corner slab with three primitives (face / back / rim), in
that order, so the runtime can address them as material index 0 / 1 / 2.
"""

import io
import json
import math
import struct

from PIL import Image

CARD_W = 1.0            # world units
CARD_H = 600 / 350      # keep the scan's 7:12 aspect
# 78 cards stack to 0.39 units against a 1.0-wide card, matching a real deck
# (~25mm of card on a 63mm face). Do not raise this without re-checking the
# stacked-deck shot the hero opens on.
CARD_T = 0.005          # thickness
CARD_R = 0.055          # corner radius (~3.5mm on a 63mm card)
CORNER_SEG = 10         # arc segments per corner
# dull gold. glTF baseColorFactor is LINEAR, not sRGB — this is ~#b8964f on screen
RIM_COLOR = [0.48, 0.31, 0.09, 1.0]
RIM_METALLIC = 1.0      # it's a metal; dullness comes from roughness, not this
RIM_ROUGHNESS = 0.62    # scattered sheen instead of a mirror glint
FACE_ROUGHNESS = 0.55


def rounded_outline():
    """CCW points around a rounded rectangle, plus each point's outward normal."""
    w, h, r = CARD_W / 2, CARD_H / 2, CARD_R
    corners = [                       # (centre, start angle) walking CCW
        ((w - r, -(h - r)), -math.pi / 2),   # bottom-right
        ((w - r, h - r), 0.0),               # top-right
        ((-(w - r), h - r), math.pi / 2),    # top-left
        ((-(w - r), -(h - r)), math.pi),     # bottom-left
    ]
    pts, nrms = [], []
    for (cx, cy), a0 in corners:
        for i in range(CORNER_SEG + 1):
            a = a0 + (math.pi / 2) * (i / CORNER_SEG)
            nx, ny = math.cos(a), math.sin(a)
            pts.append((cx + nx * r, cy + ny * r))
            nrms.append((nx, ny, 0.0))
    return pts, nrms


def card_geometry():
    """Rounded-corner card: two capped faces + a smooth-shaded rim."""
    d = CARD_T / 2
    outline, out_nrm = rounded_outline()
    n = len(outline)

    pos, nrm, uv = [], [], []

    def face_uv(x, y, mirror):
        u = (x + CARD_W / 2) / CARD_W
        v = 1.0 - (y + CARD_H / 2) / CARD_H
        return (1.0 - u if mirror else u, v)

    def cap(z, normal, mirror, reverse):
        """Triangle fan over the outline. `reverse` flips winding for the back."""
        base = len(pos)
        pos.append((0.0, 0.0, z))
        nrm.append(normal)
        uv.append(face_uv(0.0, 0.0, mirror))
        for (x, y) in outline:
            pos.append((x, y, z))
            nrm.append(normal)
            uv.append(face_uv(x, y, mirror))
        idx = []
        for i in range(n):
            a, b = base + 1 + i, base + 1 + (i + 1) % n
            idx += [base, b, a] if reverse else [base, a, b]
        return idx

    front = cap(d, (0.0, 0.0, 1.0), False, False)
    back = cap(-d, (0.0, 0.0, -1.0), True, True)

    # rim: one ring of paired front/back verts carrying the outward normal, so
    # the corners shade as a continuous curve instead of faceted planes
    rim_base = len(pos)
    for (x, y), nv in zip(outline, out_nrm):
        for z in (d, -d):
            pos.append((x, y, z))
            nrm.append(nv)
            uv.append((0.0, 0.0))

    rim = []
    for i in range(n):
        af, ab = rim_base + 2 * i, rim_base + 2 * i + 1
        j = (i + 1) % n
        bf, bb = rim_base + 2 * j, rim_base + 2 * j + 1
        rim += [af, ab, bb, af, bb, bf]

    vbytes = b"".join(struct.pack("<3f", *p) for p in pos)
    nbytes = b"".join(struct.pack("<3f", *v) for v in nrm)
    tbytes = b"".join(struct.pack("<2f", *t) for t in uv)
    return len(pos), vbytes + nbytes + tbytes, (front, back, rim), \
        (len(vbytes), len(nbytes), len(tbytes))


def jpeg_bytes(path, max_side=1024, quality=88):
    im = Image.open(path).convert("RGB")
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    return buf.getvalue()


def pad4(b, fill=b"\x00"):
    return b + fill * ((4 - len(b) % 4) % 4)


def build_glb(name, out_path, front_jpg=None, back_jpg=None):
    """Write a card GLB. Textures are optional — omit both for the shared mesh
    the instanced deck uses, where maps are assigned at runtime."""
    vcount, vertex_blob, (front_i, back_i, rim_i), (plen, nlen, _) = card_geometry()

    bin_parts, views, accessors = [], [], []
    offset = 0

    def add_view(data, target=None):
        nonlocal offset
        data = pad4(data)
        bin_parts.append(data)
        v = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target:
            v["target"] = target
        views.append(v)
        offset += len(data)
        return len(views) - 1

    # vertex attributes share one view per attribute
    pos_v = add_view(vertex_blob[:plen], 34962)
    nrm_v = add_view(vertex_blob[plen:plen + nlen], 34962)
    uv_v = add_view(vertex_blob[plen + nlen:], 34962)

    verts = [struct.unpack_from("<3f", vertex_blob, i * 12) for i in range(vcount)]
    mins = [min(v[i] for v in verts) for i in range(3)]
    maxs = [max(v[i] for v in verts) for i in range(3)]

    accessors.append({"bufferView": pos_v, "componentType": 5126, "count": vcount,
                      "type": "VEC3", "min": mins, "max": maxs})           # 0
    accessors.append({"bufferView": nrm_v, "componentType": 5126, "count": vcount,
                      "type": "VEC3"})                                      # 1
    accessors.append({"bufferView": uv_v, "componentType": 5126, "count": vcount,
                      "type": "VEC2"})                                      # 2

    prim_acc = []
    for idx in (front_i, back_i, rim_i):
        data = b"".join(struct.pack("<H", i) for i in idx)
        v = add_view(data, 34963)
        accessors.append({"bufferView": v, "componentType": 5123,
                          "count": len(idx), "type": "SCALAR"})
        prim_acc.append(len(accessors) - 1)

    images, textures = [], []
    for label, blob in (("front", front_jpg), ("back", back_jpg)):
        if blob is None:
            continue
        images.append({"bufferView": add_view(blob), "mimeType": "image/jpeg",
                       "name": label})
        textures.append({"source": len(images) - 1, "sampler": 0})

    def face_material(label, tex_index):
        pbr = {"metallicFactor": 0.0, "roughnessFactor": FACE_ROUGHNESS}
        if tex_index is not None:
            pbr["baseColorTexture"] = {"index": tex_index}
        return {"name": label, "pbrMetallicRoughness": pbr}

    front_tex = 0 if front_jpg is not None else None
    back_tex = (1 if front_jpg is not None else 0) if back_jpg is not None else None

    gltf = {
        "asset": {"version": "2.0", "generator": "shivoham tarot card builder"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": name}],
        "meshes": [{
            "name": name,
            "primitives": [
                {"attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                 "indices": prim_acc[i], "material": i} for i in range(3)
            ],
        }],
        "materials": [
            face_material("face", front_tex),
            face_material("back", back_tex),
            {"name": "rim", "pbrMetallicRoughness": {
                "baseColorFactor": RIM_COLOR, "metallicFactor": RIM_METALLIC,
                "roughnessFactor": RIM_ROUGHNESS}},
        ],
        "bufferViews": views,
        "accessors": accessors,
        "buffers": [{"byteLength": offset}],
    }
    if images:
        gltf["images"] = images
        gltf["textures"] = textures
        gltf["samplers"] = [{"magFilter": 9729, "minFilter": 9987,
                             "wrapS": 33071, "wrapT": 33071}]

    bin_chunk = pad4(b"".join(bin_parts))
    json_chunk = pad4(json.dumps(gltf, separators=(",", ":")).encode("utf-8"), b" ")

    glb = struct.pack("<III", 0x46546C67, 2,
                      12 + 8 + len(json_chunk) + 8 + len(bin_chunk))
    glb += struct.pack("<II", len(json_chunk), 0x4E4F534A) + json_chunk
    glb += struct.pack("<II", len(bin_chunk), 0x004E4942) + bin_chunk

    out_path.write_bytes(glb)
    return len(glb)
