/**
 * 管理贴图对象
 * @class
 * @private
 */
export default class GLTexture {
  protected _gl;
  private _glTexture;
  protected _config;
  protected _type;
  constructor(gl, config, type) {
    this._gl = gl;
    this._glTexture = gl.createTexture(); // WebGLTexture
    this._config = config;
    this._type = type;
  }

  /**
   * 内部的WebGLTexture对象
   * @readonly
   * @private
   */
  get glTexture() {
    return this._glTexture;
  }

  /**
   * 绑定到指定的 TEXTURE UNIT
   * @private
   */
  activeBinding(textureIndex) {
    const gl = this._gl;

    gl.activeTexture(gl.TEXTURE0 + textureIndex);
    gl.bindTexture(this._type, this._glTexture);
  }

  /**
   * 设置纹理参数
   * @private
   */
  setFilters() {
    const gl = this._gl;

    if (this._config._needUpdateFilers) {
      this._config._needUpdateFilers = false;
      gl.texParameteri(this._type, gl.TEXTURE_MAG_FILTER, this._config._filterMag);
      gl.texParameteri(this._type, gl.TEXTURE_MIN_FILTER, this._config._filterMin);
      gl.texParameteri(this._type, gl.TEXTURE_WRAP_S, this._config._wrapS);
      gl.texParameteri(this._type, gl.TEXTURE_WRAP_T, this._config._wrapT);
    }
  }

  /**
   * 生成纹理贴图
   * @private
   */
  generateMipmap() {
    if (this._config._canMipmap) {
      this._gl.generateMipmap(this._type);
    }
  }

  /**
   * 释放 GL 资源
   * @private
   */
  finalize() {
    const gl = this._gl;
    if (this._glTexture) {
      gl.deleteTexture(this._glTexture);
      this._glTexture = null;
    }
    this._config.resetState();
  }
}
