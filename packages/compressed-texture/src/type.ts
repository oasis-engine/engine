import { GLCompressedTextureInternalFormat } from "@alipay/o3-base";

export type CompressedTextureData = {
  internalFormat: GLCompressedTextureInternalFormat;
  width: number;
  height: number;
  mipmaps: Mipmap[];
};

export type CompressedCubeData = {
  internalFormat: number;
  width: number;
  height: number;
  mipmapsFaces: Mipmap[][];
};

export type Mipmap = {
  data: ArrayBuffer;
  width: number;
  height: number;
};
