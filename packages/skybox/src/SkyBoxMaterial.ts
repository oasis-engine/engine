import { DataType, RenderState, CompFunc } from "@alipay/o3-core";
import { Material, RenderTechnique } from "@alipay/o3-material";
import { Matrix } from "@alipay/o3-math";
import vs from "./skybox.vs.glsl";
import fs from "./skybox.fs.glsl";

/**
 * 天空盒材质
 * @class
 * @private
 */
export class SkyBoxMaterial extends Material {
  private _cacheMat1: Matrix;
  private _cacheMat2: Matrix;
  private modelMatrix: Matrix;

  constructor(name = SkyBoxMaterial.defaultName) {
    super(name);
  }

  public setModel(modelMatrix: Matrix) {
    this.modelMatrix = modelMatrix;
  }

  /**
   * 渲染前调用
   * @private
   */
  prepareDrawing(context, component) {
    if (this._technique === null) {
      this._generateTechnique();
    }

    if (!this._cacheMat1) {
      this._cacheMat1 = new Matrix();
      this._cacheMat2 = new Matrix();
    }
    const view = context.viewMatrix;
    const proj = context.projectionMatrix;

    Matrix.multiply(view, this.modelMatrix, this._cacheMat1);
    const e = this._cacheMat1.elements;
    e[12] = e[13] = e[14] = 0;
    Matrix.multiply(proj, this._cacheMat1, this._cacheMat2);
    this.setValue("u_mvpNoscale", this._cacheMat2);

    super.prepareDrawing(context, component, undefined);
  }

  /**
   * 创建Technique
   * @private
   */
  _generateTechnique() {
    const tech = new RenderTechnique(SkyBoxMaterial.techniqueName);
    tech.isValid = true;
    tech.uniforms = SkyBoxMaterial.techniqueConfig.uniforms;
    tech.attributes = SkyBoxMaterial.techniqueConfig.attributes;
    tech.states = SkyBoxMaterial.techniqueConfig.states;
    tech.vertexShader = SkyBoxMaterial.vertexShader;
    tech.fragmentShader = SkyBoxMaterial.fragmentShader;

    this._technique = tech;
  }

  static defaultName = "SKY_BOX_MATERIAL";
  static techniqueName = "SKY_BOX_TECHNIQUE";
  static vertexShader = vs;
  static fragmentShader = fs;
  static techniqueConfig = {
    attributes: {},
    uniforms: {
      u_mvpNoscale: {
        name: "u_mvpNoscale",
        type: DataType.FLOAT_MAT4
      },
      u_cube: {
        name: "u_cube",
        type: DataType.SAMPLER_CUBE
      }
    },
    states: {
      disable: [RenderState.CULL_FACE],
      functions: {
        depthFunc: CompFunc.LEQUAL
      }
    }
  };
}
