import { Logger, Primitive } from "@alipay/o3-core";
import { GLPrimitive } from "./GLPrimitive";
import { GLTechnique } from "./GLTechnique";
import { WebGLRenderer } from "./WebGLRenderer";

/**
 * 基于 VAO 的 GLPrimitive
 * */
export class GLVAOPrimitive extends GLPrimitive {
  private vao: Map<number, WebGLVertexArrayObject>;

  constructor(rhi: WebGLRenderer, primitive: Primitive) {
    super(rhi, primitive);
    this.vao = new Map();
  }

  /** 注册 VAO */
  private registerVAO(tech: GLTechnique) {
    const gl = this.rhi.gl;
    const vao = gl.createVertexArray();

    /** register VAO */
    gl.bindVertexArray(vao);

    const { indexBufferBinding } = this._primitive;
    if (indexBufferBinding) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferBinding.buffer._nativeBuffer);
    }
    this.bindBufferAndAttrib(tech);

    /** unbind */
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    this.disableAttrib();

    this.vao.set(tech.cacheID, vao);
  }

  /**
   * 使用 VAO 执行绘制操作
   * @param {GLTechnique} tech
   */
  draw(tech: GLTechnique) {
    const gl = this.rhi.gl;
    const primitive = this._primitive;

    /** render */
    if (!this.vao.has(tech.cacheID)) {
      this.registerVAO(tech);
    }
    const vao = this.vao.get(tech.cacheID);
    gl.bindVertexArray(vao);

    // draw
    const { _topology, indexBufferBinding, drawOffset, drawCount, instanceCount, _glIndexType } = primitive;
    if (!instanceCount) {
      if (indexBufferBinding) {
        gl.drawElements(_topology, drawCount, _glIndexType, drawOffset);
      } else {
        gl.drawArrays(_topology, drawOffset, drawCount);
      }
    } else {
      if (this.canUseInstancedArrays) {
        if (indexBufferBinding) {
          gl.drawElementsInstanced(_topology, drawCount, _glIndexType, drawOffset, instanceCount);
        } else {
          gl.drawArraysInstanced(_topology, drawOffset, drawCount, instanceCount);
        }
      } else {
        Logger.error("ANGLE_instanced_arrays extension is not supported");
      }
    }

    gl.bindVertexArray(null);
  }

  /**
   * 释放 GL 资源
   */
  finalize() {
    super.finalize();
    const gl = this.rhi.gl;
    // 释放 vao
    this.vao.forEach((vao) => {
      gl.deleteVertexArray(vao);
    });
  }
}
