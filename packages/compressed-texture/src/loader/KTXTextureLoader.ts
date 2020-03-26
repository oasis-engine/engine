import { Resource } from "@alipay/o3-loader";

import { KhronosTextureContainer } from "../KhronosTextureContainer";
import { CompressedTexture2D } from "../CompressedTexture2D";
/**
 * @private
 */
export class KTXTextureHandler {
  load(request, props, callback) {
    request.load("binary", props, function(err, buffer) {
      if (!err) {
        callback(null, buffer);
      } else {
        callback("Error loading KTXTexture from " + props.url);
      }
    });
  }

  open(resource: Resource) {
    if (KhronosTextureContainer.IsValid(resource.data)) {
      const ktx = new KhronosTextureContainer(resource.data, 1);
      const mipmaps = ktx.mipmaps(true);
      const texture = new CompressedTexture2D(resource.name, {
        mipmaps,
        internalFormat: ktx.glInternalFormat,
        width: ktx.pixelWidth,
        height: ktx.pixelHeight
      });
      resource.asset = texture;
    } else {
      throw new Error("texture missing KTX identifier");
    }
  }
}
