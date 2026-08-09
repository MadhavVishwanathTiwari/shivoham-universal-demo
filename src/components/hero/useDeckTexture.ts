import { use, useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  MANIFEST,
  avifSupported,
  pickAtlas,
  preferAvif,
  type Atlas,
} from "./cardData";

export interface DeckTextures {
  atlas: Atlas;
  face: THREE.Texture;
  back: THREE.Texture;
}

/**
 * Loads the face atlas + the single shared backside, picking the sheet this
 * GPU can actually sample.
 *
 * Both are configured with `flipY = false`. That is not cosmetic: the card mesh
 * comes from a GLB, whose UVs assume an unflipped image, and the atlas is packed
 * with row 0 at the top to match. Flip either one and every card samples a
 * neighbouring tile upside down.
 *
 * ImageBitmapLoader rather than TextureLoader, and that choice is the reason the
 * hero no longer stutters on load. TextureLoader goes through ImageLoader, i.e.
 * a plain `new Image()`, and the browser decodes that on the main thread at the
 * moment three uploads it — several megapixels of AVIF, synchronously, on the
 * same frame as the deck's shader compile. ImageBitmapLoader calls
 * `createImageBitmap()`, which decodes on the browser's image thread and hands
 * back something the GPU upload can consume directly.
 *
 * `flipY = false` is doing double duty here. Beyond the UV invariant above, it
 * is also the fast upload path: UNPACK_FLIP_Y_WEBGL on an ImageBitmap makes the
 * driver take a CPU copy to flip it, which would put the cost straight back on
 * the main thread and undo the whole change.
 */
export function useDeckTexture(): DeckTextures {
  const gl = useThree((s) => s.gl);
  const maxSize = gl.capabilities.maxTextureSize;
  const maxAniso = gl.capabilities.getMaxAnisotropy();

  const atlas = useMemo(() => pickAtlas(maxSize), [maxSize]);
  const avif = use(avifSupported);
  const [faceBitmap, backBitmap] = useLoader(
    THREE.ImageBitmapLoader,
    [
      preferAvif(atlas.src, atlas.srcAvif, avif),
      preferAvif(MANIFEST.back, MANIFEST.backAvif, avif),
    ],
    /*
     * Orientation has to be decided at bitmap creation: Texture.flipY and
     * Texture.premultiplyAlpha are both ignored for ImageBitmap sources, unlike
     * regular images where they apply on upload. "from-image" is the unrotated
     * pass-through for anything without an EXIF orientation tag, which the
     * atlases (ffmpeg/Pillow output) do not carry — so this is the same pixel
     * order TextureLoader produced, and the packing in build_deck.py still
     * holds.
     */
    (loader) =>
      loader.setOptions({
        imageOrientation: "from-image",
        premultiplyAlpha: "none",
      }),
  );

  const textures = useMemo(() => {
    const toTexture = (bitmap: ImageBitmap) => {
      const tex = new THREE.Texture(bitmap);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(4, maxAniso);
      tex.needsUpdate = true;
      return tex;
    };
    return { face: toTexture(faceBitmap), back: toTexture(backBitmap) };
  }, [faceBitmap, backBitmap, maxAniso]);

  /*
   * These are constructed, not loaded, so useLoader's cache does not own them
   * and nothing else will free them. The cached ImageBitmap survives — dispose
   * releases the GL texture, not the bitmap — so a remount rebuilds from it.
   */
  useEffect(
    () => () => {
      textures.face.dispose();
      textures.back.dispose();
    },
    [textures],
  );

  return useMemo(
    () => ({ atlas, face: textures.face, back: textures.back }),
    [atlas, textures],
  );
}
