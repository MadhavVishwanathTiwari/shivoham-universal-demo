import { use, useMemo } from "react";
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
 */
export function useDeckTexture(): DeckTextures {
  const gl = useThree((s) => s.gl);
  const maxSize = gl.capabilities.maxTextureSize;
  const maxAniso = gl.capabilities.getMaxAnisotropy();

  const atlas = useMemo(() => pickAtlas(maxSize), [maxSize]);
  const avif = use(avifSupported);
  const [face, back] = useLoader(THREE.TextureLoader, [
    preferAvif(atlas.src, atlas.srcAvif, avif),
    preferAvif(MANIFEST.back, MANIFEST.backAvif, avif),
  ]);

  return useMemo(() => {
    for (const tex of [face, back]) {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(4, maxAniso);
      tex.needsUpdate = true;
    }
    return { atlas, face, back };
  }, [atlas, face, back, maxAniso]);
}
