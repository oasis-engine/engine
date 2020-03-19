import { GLRenderHardware } from "./GLRenderHardware";
import { MultiRenderTarget } from "@alipay/o3-material";
import { GLCapabilityType } from "@alipay/o3-base";
import { GLTexture2D } from "./GLTexture2D";
import { GLRenderTarget } from "./GLRenderTarget";

export class GLMultiRenderTarget extends GLRenderTarget {
  private _glTextures: GLTexture2D[] = [];
  private buffers: number[] = [];

  constructor(rhi: GLRenderHardware, config: MultiRenderTarget) {
    super(rhi, config);

    this.activeRenderTarget();
    if (config.depthTexture) {
      this.glDepthTexture = this.initDepthTexture(config.depthTexture);
    }

    config.textures.forEach((texture, index) => {
      const glIndex = this.getAttachmentIndex(index);
      this._glTextures.push(this.initColorTexture(texture, glIndex));
      this.buffers.push(glIndex);
    });

    this.checkFrameBuffer();

    this.drawBuffers();
  }

  finalize() {
    super.finalize();
    const { gl } = this.rhi;
    this._glTextures.forEach(texture => {
      gl.deleteTexture(texture);
    });
    this._glTextures = [];
    this.buffers = [];
  }

  private getAttachmentIndex(index: number) {
    const gl = this.rhi.gl;
    return this.rhi.isWebGL2 ? gl[`COLOR_ATTACHMENT${index}`] : this.getExtention()[`COLOR_ATTACHMENT${index}_WEBGL`];
  }

  private drawBuffers() {
    if (this.rhi.isWebGL2) {
      (this.rhi.gl as WebGL2RenderingContext).drawBuffers(this.buffers);
    } else {
      this.getExtention().drawBuffersWEBGL(this.buffers);
    }
  }

  private getExtention(): WEBGL_draw_buffers {
    return this.rhi.requireExtension(GLCapabilityType.drawBuffers);
  }
}
