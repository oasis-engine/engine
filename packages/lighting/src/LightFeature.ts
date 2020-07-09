import { SceneFeature } from "@alipay/o3-core";
import { Logger } from "@alipay/o3-base";
import { Light } from "./Light";
import { AmbientLight } from "./AmbientLight";
import { DirectLight } from "./DirectLight";
import { PointLight } from "./PointLight";
import { SpotLight } from "./SpotLight";
import { AEnvironmentMapLight } from "./EnvironmentMapLight";

/**
 * 判断场景中是否有灯光
 * @returns {boolean}
 * @private
 */
export function hasLight() {
  return this.findFeature(LightFeature).visibleLights.length > 0;
}

/**
 * Scene Feature：在场景中添加灯光特性
 * @extends SceneFeature
 * @private
 */
export class LightFeature extends SceneFeature {
  private visibleLights: Light[];

  /**
   * 获取光源种类的相应数量
   * */
  get lightSortAmount(): {
    ambientLightCount: number;
    directLightCount: number;
    pointLightCount: number;
    spotLightCount: number;
    envMapLightCount: number;
    useDiffuseEnv: boolean;
    useSpecularEnv: boolean;
  } {
    let ambientLightCount = 0;
    let directLightCount = 0;
    let pointLightCount = 0;
    let spotLightCount = 0;
    let envMapLightCount = 0;
    let useDiffuseEnv = false;
    let useSpecularEnv = false;

    let lights = this.visibleLights;
    for (let i = 0, len = lights.length; i < len; i++) {
      const light = lights[i];
      if (light instanceof AmbientLight) {
        ambientLightCount++;
      } else if (light instanceof DirectLight) {
        directLightCount++;
      } else if (light instanceof PointLight) {
        pointLightCount++;
      } else if (light instanceof SpotLight) {
        spotLightCount++;
      } else if (light instanceof AEnvironmentMapLight) {
        envMapLightCount++;
        useDiffuseEnv = light.useDiffuseMap;
        useSpecularEnv = light.useSpecularMap;
      }
    }
    return {
      ambientLightCount,
      directLightCount,
      pointLightCount,
      spotLightCount,
      envMapLightCount,
      useDiffuseEnv,
      useSpecularEnv
    };
  }

  constructor() {
    super();
    this.visibleLights = [];
  }

  /**
   * 向当前场景注册一个灯光对象
   * @param {Light} light 灯光对象
   * @private
   */
  attachRenderLight(light: Light) {
    const index = this.visibleLights.indexOf(light);
    if (index == -1) {
      this.visibleLights.push(light);
    } else {
      Logger.warn("Light already attached.");
    }
  }

  /**
   * 从当前场景移除一个灯光对象
   * @param {Light} light 灯光对象
   * @private
   */
  detachRenderLight(light: Light) {
    const index = this.visibleLights.indexOf(light);
    if (index != -1) {
      this.visibleLights.splice(index, 1);
    }
  }

  /**
   * 将灯光数据绑定到指定的材质中（指定 Uniform 的值）
   * @param {Material} mtl 材质对象
   * @private
   */
  bindMaterialValues(mtl) {
    /**
     * ambientLight 和 envMapLight 在 scene 中只用最后一个
     * */
    let ambientLightCount = 0;
    let directLightCount = 0;
    let pointLightCount = 0;
    let spotLightCount = 0;
    let envMapLightCount = 0;

    let lights = this.visibleLights;
    for (let i = 0, len = lights.length; i < len; i++) {
      const light = lights[i];
      if (light instanceof AmbientLight) {
        light.bindMaterialValues(mtl, `u_ambientLight`);
        ambientLightCount++;
      } else if (light instanceof DirectLight) {
        light.bindMaterialValues(mtl, `u_directLights[${directLightCount++}]`);
      } else if (light instanceof PointLight) {
        light.bindMaterialValues(mtl, `u_pointLights[${pointLightCount++}]`);
      } else if (light instanceof SpotLight) {
        light.bindMaterialValues(mtl, `u_spotLights[${spotLightCount++}]`);
      } else if (light instanceof AEnvironmentMapLight) {
        light.bindMaterialValues(mtl, `u_envMapLight`);
        envMapLightCount++;
      }
    }
  }

  /**
   * 生成 Technique 所需的全部 uniform 定义
   */
  getUniformDefine() {
    let uniforms = {};
    let ambientLightCount = 0;
    let directLightCount = 0;
    let pointLightCount = 0;
    let spotLightCount = 0;
    let envMapLightCount = 0;

    let lights = this.visibleLights;
    for (let i = 0, len = lights.length; i < len; i++) {
      const light = lights[i];
      if (light instanceof AmbientLight && !ambientLightCount++) {
        uniforms = { ...uniforms, ...AmbientLight.getUniformDefine(`u_ambientLight`) };
      } else if (light instanceof DirectLight) {
        uniforms = { ...uniforms, ...DirectLight.getUniformDefine(`u_directLights[${directLightCount++}]`) };
      } else if (light instanceof PointLight) {
        uniforms = { ...uniforms, ...PointLight.getUniformDefine(`u_pointLights[${pointLightCount++}]`) };
      } else if (light instanceof SpotLight) {
        uniforms = { ...uniforms, ...SpotLight.getUniformDefine(`u_spotLights[${spotLightCount++}]`) };
      } else if (light instanceof AEnvironmentMapLight && !envMapLightCount++) {
        uniforms = { ...uniforms, ...AEnvironmentMapLight.getUniformDefine(`u_envMapLight`) };
      }
    }
    return uniforms;
  }
}
