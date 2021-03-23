import { IClone } from "@oasis-engine/design";
import { Color } from "./Color";
import { Vector3 } from "./Vector3";

/**
 * Use SH3 to represent irradiance environment maps efficiently, allowing for interactive rendering of diffuse objects under distant illumination.
 * @remarks
 * https://graphics.stanford.edu/papers/envmap/envmap.pdf
 * http://www.ppsloan.org/publications/StupidSH36.pdf
 * https://google.github.io/filament/Filament.md.html#annex/sphericalharmonics
 */
export class SphericalHarmonics3 implements IClone {
  private static _basisFunction = [
    0.282095, //  1/2 * Math.sqrt(1 / PI)

    -0.488603, // -1/2 * Math.sqrt(3 / PI)
    0.488603, //  1/2 * Math.sqrt(3 / PI)
    -0.488603, // -1/2 * Math.sqrt(3 / PI)

    1.092548, //  1/2 * Math.sqrt(15 / PI)
    -1.092548, // -1/2 * Math.sqrt(15 / PI)
    0.315392, //  1/4 * Math.sqrt(5 / PI)
    -1.092548, // -1/2 * Math.sqrt(15 / PI)
    0.546274 //  1/4 * Math.sqrt(15 / PI)
  ];

  private static _convolutionKernel = [
    3.141593, //  PI
    2.094395, // (2 * PI) / 3,
    0.785398 //   PI / 4
  ];

  private static _tempColor = new Color();

  /**  The Y(0, 0) coefficient of the SH3. */
  y00: Color = new Color(0, 0, 0, 0);
  /**  The Y(1, -1) coefficient of the SH3. */
  y1_1: Color = new Color(0, 0, 0, 0);
  /**  The Y(1, 0) coefficient of the SH3. */
  y10: Color = new Color(0, 0, 0, 0);
  /**  The Y(1, 1) coefficient of the SH3. */
  y11: Color = new Color(0, 0, 0, 0);
  /**  The Y(2, -2) coefficient of the SH3. */
  y2_2: Color = new Color(0, 0, 0, 0);
  /**  The Y(2, -1) coefficient of the SH3. */
  y2_1: Color = new Color(0, 0, 0, 0);
  /**  The Y(2, 0) coefficient of the SH3. */
  y20: Color = new Color(0, 0, 0, 0);
  /**  The Y(2, 1) coefficient of the SH3. */
  y21: Color = new Color(0, 0, 0, 0);
  /**  The Y(2, 2) coefficient of the SH3. */
  y22: Color = new Color(0, 0, 0, 0);

  private _coefficients: Float32Array = new Float32Array(27);

  /**
   * Get pre-scaled coefficients used in shader.
   * @remarks
   * Convert radiance to irradiance with the A_l which is convoluted by the cosine lobe and pre-scale the basis function.
   * Reference equation [4,5,6,7,8,9] from https://graphics.stanford.edu/papers/envmap/envmap.pdf
   */
  get preScaledCoefficients(): Float32Array {
    const kernel = SphericalHarmonics3._convolutionKernel;
    const basis = SphericalHarmonics3._basisFunction;
    const data = this._coefficients;

    /**
     * 1.  L -> E
     * 2.  E * basis
     */

    // l0
    data[0] = this.y00.r * kernel[0] * basis[0];
    data[1] = this.y00.g * kernel[0] * basis[0];
    data[2] = this.y00.b * kernel[0] * basis[0];

    // l1
    data[3] = this.y1_1.r * kernel[1] * basis[1];
    data[4] = this.y1_1.g * kernel[1] * basis[1];
    data[5] = this.y1_1.b * kernel[1] * basis[1];
    data[6] = this.y10.r * kernel[1] * basis[2];
    data[7] = this.y10.g * kernel[1] * basis[2];
    data[8] = this.y10.b * kernel[1] * basis[2];
    data[9] = this.y11.r * kernel[1] * basis[3];
    data[10] = this.y11.g * kernel[1] * basis[3];
    data[11] = this.y11.b * kernel[1] * basis[3];

    // l2
    data[12] = this.y2_2.r * kernel[2] * basis[4];
    data[13] = this.y2_2.g * kernel[2] * basis[4];
    data[14] = this.y2_2.b * kernel[2] * basis[4];
    data[15] = this.y2_1.r * kernel[2] * basis[5];
    data[16] = this.y2_1.g * kernel[2] * basis[5];
    data[17] = this.y2_1.b * kernel[2] * basis[5];
    data[18] = this.y20.r * kernel[2] * basis[6];
    data[19] = this.y20.g * kernel[2] * basis[6];
    data[20] = this.y20.b * kernel[2] * basis[6];
    data[21] = this.y21.r * kernel[2] * basis[7];
    data[22] = this.y21.g * kernel[2] * basis[7];
    data[23] = this.y21.b * kernel[2] * basis[7];
    data[24] = this.y22.r * kernel[2] * basis[8];
    data[25] = this.y22.g * kernel[2] * basis[8];
    data[26] = this.y22.b * kernel[2] * basis[8];

    return data;
  }

  /**
   * Add radiance to the SH3 in specified direction.
   * @remarks
   * Implements `EvalSHBasis` from [Projection from Cube maps] in http://www.ppsloan.org/publications/StupidSH36.pdf.
   *
   * @param color - radiance color
   * @param direction - radiance direction
   */
  addRadiance(color: Color, direction: Vector3): void {
    const basis = SphericalHarmonics3._basisFunction;
    const tempColor = SphericalHarmonics3._tempColor;
    const { x, y, z } = direction;

    this.y00.add(Color.scale(color, basis[0], tempColor));

    this.y1_1.add(Color.scale(color, basis[1] * y, tempColor));
    this.y10.add(Color.scale(color, basis[2] * z, tempColor));
    this.y11.add(Color.scale(color, basis[3] * x, tempColor));

    this.y2_2.add(Color.scale(color, basis[4] * x * y, tempColor));
    this.y2_1.add(Color.scale(color, basis[5] * y * z, tempColor));
    this.y20.add(Color.scale(color, basis[6] * (3 * z * z - 1), tempColor));
    this.y21.add(Color.scale(color, basis[7] * x * z, tempColor));
    this.y22.add(Color.scale(color, basis[8] * (x * x - y * y), tempColor));
  }

  /**
   * Clear SH3 to zero.
   */
  clear(): void {
    this.y00.setValue(0, 0, 0, 0);
    this.y1_1.setValue(0, 0, 0, 0);
    this.y10.setValue(0, 0, 0, 0);
    this.y11.setValue(0, 0, 0, 0);
    this.y2_2.setValue(0, 0, 0, 0);
    this.y2_1.setValue(0, 0, 0, 0);
    this.y20.setValue(0, 0, 0, 0);
    this.y21.setValue(0, 0, 0, 0);
    this.y22.setValue(0, 0, 0, 0);
  }

  /**
   * @override
   */
  clone(): SphericalHarmonics3 {
    const v = new SphericalHarmonics3();
    return this.cloneTo(v);
  }

  /**
   * @override
   */
  cloneTo(out: SphericalHarmonics3): SphericalHarmonics3 {
    out.y00 = this.y00;
    out.y1_1 = this.y1_1;
    out.y10 = this.y10;
    out.y11 = this.y11;
    out.y2_2 = this.y2_2;
    out.y2_1 = this.y2_1;
    out.y20 = this.y20;
    out.y21 = this.y21;
    out.y22 = this.y22;
    return out;
  }
}
