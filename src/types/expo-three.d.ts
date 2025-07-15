declare module "expo-three" {
  import { Asset } from "expo-asset";
  import * as THREE from "three";

  export function loadTextureAsync(options: {
    asset: Asset;
  }): Promise<THREE.Texture>;
  export function loadTextureAsync(uri: string): Promise<THREE.Texture>;
  export function loadAsync(
    assetModule: any,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Texture>;
  export function loadCubeTextureAsync(options: {
    assetForNX: Asset;
    assetForNY: Asset;
    assetForNZ: Asset;
    assetForPX: Asset;
    assetForPY: Asset;
    assetForPZ: Asset;
  }): Promise<THREE.CubeTexture>;
}

