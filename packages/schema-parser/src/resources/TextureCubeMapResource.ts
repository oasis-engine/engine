import { SchemaResource } from "./SchemaResource";
import * as o3 from "@alipay/o3";
import { AssetConfig } from "../types";
import { Oasis } from "../Oasis";
import { compressedTextureLoadOrder } from "../utils";
import { ResourceManager, LoaderType } from "@alipay/o3";

const imageOrderMap = {
  px: 0,
  nx: 1,
  py: 2,
  ny: 3,
  pz: 4,
  nz: 5
};

export class TextureCubeMapResource extends SchemaResource {
  load(resourceManager: ResourceManager, assetConfig: AssetConfig, oasis: Oasis): Promise<TextureCubeMapResource> {
    return new Promise((resolve, reject) => {
      const imageUrls = [];
      let type = LoaderType.TextureCube;
      if (this.resourceManager.useCompressedTexture && assetConfig?.props?.compression?.compressions.length) {
        const rhi = oasis.engine._hardwareRenderer;
        const compressions = assetConfig.props.compression.compressions;
        compressions.sort((a: any, b: any) => {
          return compressedTextureLoadOrder[a.type] - compressedTextureLoadOrder[b.type];
        });
        for (let i = 0; i < compressions.length; i++) {
          const compression = compressions[i];
          if (compression.container === "ktx" && rhi.canIUse(o3.GLCapabilityType[compression.type])) {
            for (const key in compression.files) {
              if (compression.files.hasOwnProperty(key)) {
                const image = compression.files[key];
                imageUrls[imageOrderMap[key]] = image.url;
              }
            }
            console.warn(compression.type);
            type = LoaderType.KTXCube;
            break;
          }
        }
      }

      if (type === LoaderType.TextureCube) {
        for (const key in assetConfig.props.images) {
          if (assetConfig.props.images.hasOwnProperty(key)) {
            const image = assetConfig.props.images[key];
            imageUrls[imageOrderMap[key]] = image.url;
          }
        }
      }

      resourceManager
        .load({
          urls: imageUrls,
          type: type
        })
        .then((res) => {
          this._resource = res;
          resolve(this);
        });
    });
  }

  setMeta() {
    if (this.resource) {
      this.meta.name = this.resource.name;
    }
  }
}
