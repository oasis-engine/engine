import { MathUtil } from "./MathUtil";
import { Matrix3x3 } from "./Matrix3x3";
import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

/**
 * 4x4矩阵。
 */
export class Matrix {
  /** @internal */
  private static readonly _tempVec30: Vector3 = new Vector3();
  /** @internal */
  private static readonly _tempVec31: Vector3 = new Vector3();
  /** @internal */
  private static readonly _tempVec32: Vector3 = new Vector3();
  /** @internal */
  private static readonly _tempVec33: Vector3 = new Vector3();
  /** @internal */
  private static readonly _tempMat30: Matrix3x3 = new Matrix3x3();
  /** @internal */
  private static readonly _tempMat40: Matrix = new Matrix();

  /** @internal 单位矩阵。*/
  static readonly _identity: Matrix = new Matrix(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  /**
   * 将两个矩阵相乘。
   * @param a - 左矩阵
   * @param b - 右矩阵
   * @param out - 矩阵相乘的结果
   */
  static multiply(a: Matrix, b: Matrix, out: Matrix): void {
    const ae = a.elements;
    const be = b.elements;
    const oe = out.elements;

    const a11 = ae[0],
      a12 = ae[1],
      a13 = ae[2],
      a14 = ae[3];
    const a21 = ae[4],
      a22 = ae[5],
      a23 = ae[6],
      a24 = ae[7];
    const a31 = ae[8],
      a32 = ae[9],
      a33 = ae[10],
      a34 = ae[11];
    const a41 = ae[12],
      a42 = ae[13],
      a43 = ae[14],
      a44 = ae[15];

    const b11 = be[0],
      b12 = be[1],
      b13 = be[2],
      b14 = be[3];
    const b21 = be[4],
      b22 = be[5],
      b23 = be[6],
      b24 = be[7];
    const b31 = be[8],
      b32 = be[9],
      b33 = be[10],
      b34 = be[11];
    const b41 = be[12],
      b42 = be[13],
      b43 = be[14],
      b44 = be[15];

    oe[0] = a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14;
    oe[1] = a12 * b11 + a22 * b12 + a32 * b13 + a42 * b14;
    oe[2] = a13 * b11 + a23 * b12 + a33 * b13 + a43 * b14;
    oe[3] = a14 * b11 + a24 * b12 + a34 * b13 + a44 * b14;

    oe[4] = a11 * b21 + a21 * b22 + a31 * b23 + a41 * b24;
    oe[5] = a12 * b21 + a22 * b22 + a32 * b23 + a42 * b24;
    oe[6] = a13 * b21 + a23 * b22 + a33 * b23 + a43 * b24;
    oe[7] = a14 * b21 + a24 * b22 + a34 * b23 + a44 * b24;

    oe[8] = a11 * b31 + a21 * b32 + a31 * b33 + a41 * b34;
    oe[9] = a12 * b31 + a22 * b32 + a32 * b33 + a42 * b34;
    oe[10] = a13 * b31 + a23 * b32 + a33 * b33 + a43 * b34;
    oe[11] = a14 * b31 + a24 * b32 + a34 * b33 + a44 * b34;

    oe[12] = a11 * b41 + a21 * b42 + a31 * b43 + a41 * b44;
    oe[13] = a12 * b41 + a22 * b42 + a32 * b43 + a42 * b44;
    oe[14] = a13 * b41 + a23 * b42 + a33 * b43 + a43 * b44;
    oe[15] = a14 * b41 + a24 * b42 + a34 * b43 + a44 * b44;
  }

  /**
   * 判断两个四维矩阵的值是否相等。
   * @param a - 左矩阵
   * @param b - 右矩阵
   * @returns 两个矩阵是否相等，是返回 true，否则返回 false
   */
  static equals(a: Matrix, b: Matrix): boolean {
    const ae = a.elements;
    const be = b.elements;

    return (
      MathUtil.equals(ae[0], be[0]) &&
      MathUtil.equals(ae[1], be[1]) &&
      MathUtil.equals(ae[2], be[2]) &&
      MathUtil.equals(ae[3], be[3]) &&
      MathUtil.equals(ae[4], be[4]) &&
      MathUtil.equals(ae[5], be[5]) &&
      MathUtil.equals(ae[6], be[6]) &&
      MathUtil.equals(ae[7], be[7]) &&
      MathUtil.equals(ae[8], be[8]) &&
      MathUtil.equals(ae[9], be[9]) &&
      MathUtil.equals(ae[10], be[10]) &&
      MathUtil.equals(ae[11], be[11]) &&
      MathUtil.equals(ae[12], be[12]) &&
      MathUtil.equals(ae[13], be[13]) &&
      MathUtil.equals(ae[14], be[14]) &&
      MathUtil.equals(ae[15], be[15])
    );
  }

  /**
   * 从四元数转换为一个4x4矩阵。
   * @param q - 四元数
   * @param out - 转换后的4x4矩阵
   */
  static fromQuat(q: Quaternion, out: Matrix): void {
    const oe = out.elements;
    const { x, y, z, w } = q;
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    oe[0] = 1 - yy - zz;
    oe[1] = yx + wz;
    oe[2] = zx - wy;
    oe[3] = 0;

    oe[4] = yx - wz;
    oe[5] = 1 - xx - zz;
    oe[6] = zy + wx;
    oe[7] = 0;

    oe[8] = zx + wy;
    oe[9] = zy - wx;
    oe[10] = 1 - xx - yy;
    oe[11] = 0;

    oe[12] = 0;
    oe[13] = 0;
    oe[14] = 0;
    oe[15] = 1;
  }

  /**
   * 通过指定旋转生成4x4矩阵。
   * @param r - 旋转角度
   * @param axis - 旋转轴
   * @param out - 指定旋转后矩阵
   */
  static fromRotation(r: number, axis: Vector3, out: Matrix): void {
    const oe = out.elements;
    let { x, y, z } = axis;
    let len = Math.sqrt(x * x + y * y + z * z);
    let s, c, t;

    if (Math.abs(len) < MathUtil.zeroTolerance) {
      return;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(r);
    c = Math.cos(r);
    t = 1 - c;

    // Perform rotation-specific matrix multiplication
    oe[0] = x * x * t + c;
    oe[1] = y * x * t + z * s;
    oe[2] = z * x * t - y * s;
    oe[3] = 0;

    oe[4] = x * y * t - z * s;
    oe[5] = y * y * t + c;
    oe[6] = z * y * t + x * s;
    oe[7] = 0;

    oe[8] = x * z * t + y * s;
    oe[9] = y * z * t - x * s;
    oe[10] = z * z * t + c;
    oe[11] = 0;

    oe[12] = 0;
    oe[13] = 0;
    oe[14] = 0;
    oe[15] = 1;
  }

  /**
   * 通过指定的旋转四元数,转换向量生成4x4矩阵。
   * @param q - 旋转四元数
   * @param v - 转换向量
   * @param out - 生成的4x4矩阵
   */
  static fromRotationTranslation(q: Quaternion, trans: Vector3, out: Matrix): void {
    const oe = out.elements;
    const { x, y, z, w } = q;
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    oe[0] = 1 - (yy + zz);
    oe[1] = xy + wz;
    oe[2] = xz - wy;
    oe[3] = 0;

    oe[4] = xy - wz;
    oe[5] = 1 - (xx + zz);
    oe[6] = yz + wx;
    oe[7] = 0;

    oe[8] = xz + wy;
    oe[9] = yz - wx;
    oe[10] = 1 - (xx + yy);
    oe[11] = 0;

    oe[12] = trans.x;
    oe[13] = trans.y;
    oe[14] = trans.z;
    oe[15] = 1;
  }

  /**
   * 通过指定的旋转四元数,转换向量,缩放向量生成4x4矩阵。
   * @param q - 旋转四元数
   * @param trans - 转换向量
   * @param s - 缩放向量
   * @param out - 生成的4x4矩阵
   */
  static fromRotationTranslationScale(q: Quaternion, trans: Vector3, s: Vector3, out: Matrix): void {
    const oe = out.elements;
    const { x, y, z, w } = q;
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    let sx = s.x;
    let sy = s.y;
    let sz = s.z;

    oe[0] = (1 - (yy + zz)) * sx;
    oe[1] = (xy + wz) * sx;
    oe[2] = (xz - wy) * sx;
    oe[3] = 0;

    oe[4] = (xy - wz) * sy;
    oe[5] = (1 - (xx + zz)) * sy;
    oe[6] = (yz + wx) * sy;
    oe[7] = 0;

    oe[8] = (xz + wy) * sz;
    oe[9] = (yz - wx) * sz;
    oe[10] = (1 - (xx + yy)) * sz;
    oe[11] = 0;

    oe[12] = trans.x;
    oe[13] = trans.y;
    oe[14] = trans.z;
    oe[15] = 1;
  }

  /**
   * 通过指定的旋转四元数,转换向量,缩放向量,原点向量生成4x4矩阵。
   * @param q - 旋转四元数
   * @param trans - 转换向量
   * @param s - 缩放向量
   * @param o - 原点向量
   * @param out - 生成的4x4矩阵
   */
  static fromRotationTranslationScaleOrigin(q: Quaternion, trans: Vector3, s: Vector3, o: Vector3, out: Matrix): void {
    const oe = out.elements;
    const { x, y, z, w } = q;
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    let sx = s.x;
    let sy = s.y;
    let sz = s.z;

    let ox = o.x;
    let oy = o.y;
    let oz = o.z;

    oe[0] = (1 - (yy + zz)) * sx;
    oe[1] = (xy + wz) * sx;
    oe[2] = (xz - wy) * sx;
    oe[3] = 0;

    oe[4] = (xy - wz) * sy;
    oe[5] = (1 - (xx + zz)) * sy;
    oe[6] = (yz + wx) * sy;
    oe[7] = 0;

    oe[8] = (xz + wy) * sz;
    oe[9] = (yz - wx) * sz;
    oe[10] = (1 - (xx + yy)) * sz;
    oe[11] = 0;

    oe[12] = trans.x + ox - (oe[0] * ox + oe[4] * oy + oe[8] * oz);
    oe[13] = trans.y + oy - (oe[1] * ox + oe[5] * oy + oe[9] * oz);
    oe[14] = trans.z + oz - (oe[2] * ox + oe[6] * oy + oe[10] * oz);
    oe[15] = 1;
  }

  /**
   * 通过指定缩放生成4x4矩阵。
   * @param s - 缩放向量
   * @param out - 指定缩放后矩阵
   */
  static fromScaling(s: Vector3, out: Matrix): void {
    const oe = out.elements;
    oe[0] = s.x;
    oe[1] = 0;
    oe[2] = 0;
    oe[3] = 0;

    oe[4] = 0;
    oe[5] = s.y;
    oe[6] = 0;
    oe[7] = 0;

    oe[8] = 0;
    oe[9] = 0;
    oe[10] = s.z;
    oe[11] = 0;

    oe[12] = 0;
    oe[13] = 0;
    oe[14] = 0;
    oe[15] = 1;
  }

  /**
   * 通过指定平移生成4x4矩阵。
   * @param trans - 平移向量
   * @param out - 指定平移后矩阵
   */
  static fromTranslation(trans: Vector3, out: Matrix): void {
    const oe = out.elements;
    oe[0] = 1;
    oe[1] = 0;
    oe[2] = 0;
    oe[3] = 0;

    oe[4] = 0;
    oe[5] = 1;
    oe[6] = 0;
    oe[7] = 0;

    oe[8] = 0;
    oe[9] = 0;
    oe[10] = 1;
    oe[11] = 0;

    oe[12] = trans.x;
    oe[13] = trans.y;
    oe[14] = trans.z;
    oe[15] = 1;
  }

  /**
   * 计算矩阵 a 的逆矩阵，并将结果输出到 out。
   * @param a - 矩阵
   * @param out - 逆矩阵
   */
  static invert(a: Matrix, out: Matrix): void {
    const ae = a.elements;
    const oe = out.elements;

    const a11 = ae[0],
      a12 = ae[1],
      a13 = ae[2],
      a14 = ae[3];
    const a21 = ae[4],
      a22 = ae[5],
      a23 = ae[6],
      a24 = ae[7];
    const a31 = ae[8],
      a32 = ae[9],
      a33 = ae[10],
      a34 = ae[11];
    const a41 = ae[12],
      a42 = ae[13],
      a43 = ae[14],
      a44 = ae[15];

    const b00 = a11 * a22 - a12 * a21;
    const b01 = a11 * a23 - a13 * a21;
    const b02 = a11 * a24 - a14 * a21;
    const b03 = a12 * a23 - a13 * a22;
    const b04 = a12 * a24 - a14 * a22;
    const b05 = a13 * a24 - a14 * a23;
    const b06 = a31 * a42 - a32 * a41;
    const b07 = a31 * a43 - a33 * a41;
    const b08 = a31 * a44 - a34 * a41;
    const b09 = a32 * a43 - a33 * a42;
    const b10 = a32 * a44 - a34 * a42;
    const b11 = a33 * a44 - a34 * a43;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1.0 / det;

    oe[0] = (a22 * b11 - a23 * b10 + a24 * b09) * det;
    oe[1] = (a13 * b10 - a12 * b11 - a14 * b09) * det;
    oe[2] = (a42 * b05 - a43 * b04 + a44 * b03) * det;
    oe[3] = (a33 * b04 - a32 * b05 - a34 * b03) * det;

    oe[4] = (a23 * b08 - a21 * b11 - a24 * b07) * det;
    oe[5] = (a11 * b11 - a13 * b08 + a14 * b07) * det;
    oe[6] = (a43 * b02 - a41 * b05 - a44 * b01) * det;
    oe[7] = (a31 * b05 - a33 * b02 + a34 * b01) * det;

    oe[8] = (a21 * b10 - a22 * b08 + a24 * b06) * det;
    oe[9] = (a12 * b08 - a11 * b10 - a14 * b06) * det;
    oe[10] = (a41 * b04 - a42 * b02 + a44 * b00) * det;
    oe[11] = (a32 * b02 - a31 * b04 - a34 * b00) * det;

    oe[12] = (a22 * b07 - a21 * b09 - a23 * b06) * det;
    oe[13] = (a11 * b09 - a12 * b07 + a13 * b06) * det;
    oe[14] = (a42 * b01 - a41 * b03 - a43 * b00) * det;
    oe[15] = (a31 * b03 - a32 * b01 + a33 * b00) * det;
  }

  /**
   * 计算观察矩阵。
   * @param eye - 观察者视点位置
   * @param center - 视点目标
   * @param up - 向上向量
   * @param out - 观察矩阵
   */
  static lookAt(eye: Vector3, center: Vector3, up: Vector3, out: Matrix): void {
    const oe = out.elements;
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    const eyex = eye.x;
    const eyey = eye.y;
    const eyez = eye.z;
    const upx = up.x;
    const upy = up.y;
    const upz = up.z;
    const centerx = center.x;
    const centery = center.y;
    const centerz = center.z;

    if (MathUtil.equals(eyex, centerx) && MathUtil.equals(eyey, centery) && MathUtil.equals(eyez, centerz)) {
      out.identity();
      return;
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }

    oe[0] = x0;
    oe[1] = y0;
    oe[2] = z0;
    oe[3] = 0;

    oe[4] = x1;
    oe[5] = y1;
    oe[6] = z1;
    oe[7] = 0;

    oe[8] = x2;
    oe[9] = y2;
    oe[10] = z2;
    oe[11] = 0;

    oe[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    oe[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    oe[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    oe[15] = 1;
  }

  /**
   * 计算观察矩阵。
   * @param eye - 观察者视点位置
   * @param target - 视点目标
   * @param up - 向上向量
   * @param out - 观察矩阵
   */
  static lookAtR(eye: Vector3, target: Vector3, up: Vector3, out: Matrix): void {
    const oe = out.elements;
    const xAxis: Vector3 = Matrix._tempVec30;
    const yAxis: Vector3 = Matrix._tempVec31;
    const zAxis: Vector3 = Matrix._tempVec32;
    const makeSafe: Vector3 = Matrix._tempVec33;

    Vector3.subtract(target, eye, zAxis);
    if (MathUtil.equals(zAxis.lengthSquared(), 0)) zAxis.z = 1;

    zAxis.normalize();
    // make safe
    up.normalize();
    Vector3.subtract(up, zAxis, makeSafe);
    const l = makeSafe.length();
    if (MathUtil.equals(l, 0) || MathUtil.equals(l, 2)) {
      zAxis.z += MathUtil.zeroTolerance;
      zAxis.normalize();
    }
    Vector3.cross(up, zAxis, xAxis);
    xAxis.normalize();
    Vector3.cross(zAxis, xAxis, yAxis);
    yAxis.normalize();

    oe[0] = xAxis.x;
    oe[1] = xAxis.y;
    oe[2] = xAxis.z;
    oe[3] = 0;

    oe[4] = yAxis.x;
    oe[5] = yAxis.y;
    oe[6] = yAxis.z;
    oe[7] = 0;

    oe[8] = zAxis.x;
    oe[9] = zAxis.y;
    oe[10] = zAxis.z;
    oe[11] = 0;

    oe[12] = eye.x;
    oe[13] = eye.y;
    oe[14] = eye.z;
    oe[15] = 1;
  }

  /**
   * 计算正交投影矩阵。
   * @param left - 视锥左边界
   * @param right - 视锥右边界
   * @param bottom - 视锥底边界
   * @param top - 视锥顶边界
   * @param near - 视锥近边界
   * @param far - 视锥远边界
   * @param out - 正交投影矩阵
   */
  static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number, out: Matrix): void {
    const oe = out.elements;
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    oe[0] = -2 * lr;
    oe[1] = 0;
    oe[2] = 0;
    oe[3] = 0;

    oe[4] = 0;
    oe[5] = -2 * bt;
    oe[6] = 0;
    oe[7] = 0;

    oe[8] = 0;
    oe[9] = 0;
    oe[10] = 2 * nf;
    oe[11] = 0;

    oe[12] = (left + right) * lr;
    oe[13] = (top + bottom) * bt;
    oe[14] = (far + near) * nf;
    oe[15] = 1;
  }

  /**
   * 计算透视投影矩阵。
   * @param fovy - 视角
   * @param aspect - 视图的宽高比
   * @param near - 近裁面
   * @param far - 远裁面
   * @param out - 透视投影矩阵
   */
  static perspective(fovy: number, aspect: number, near: number, far: number, out: Matrix): void {
    const oe = out.elements;
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    oe[0] = f / aspect;
    oe[1] = 0;
    oe[2] = 0;
    oe[3] = 0;

    oe[4] = 0;
    oe[5] = f;
    oe[6] = 0;
    oe[7] = 0;

    oe[8] = 0;
    oe[9] = 0;
    oe[10] = (far + near) * nf;
    oe[11] = -1;

    oe[12] = 0;
    oe[13] = 0;
    oe[14] = 2 * far * near * nf;
    oe[15] = 0;
  }

  /**
   * 将矩阵 a 按给定角度旋转，并将结果输出到 out。
   * @param m - 矩阵
   * @param r - 给定的旋转角度
   * @param axis - 旋转轴
   * @param out - 旋转后的矩阵
   */
  static rotate(m: Matrix, r: number, axis: Vector3, out: Matrix): void {
    let { x, y, z } = axis;
    let len = Math.sqrt(x * x + y * y + z * z);

    if (Math.abs(len) < MathUtil.zeroTolerance) {
      return;
    }

    const me = m.elements;
    const oe = out.elements;
    let s, c, t;

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(r);
    c = Math.cos(r);
    t = 1 - c;

    let a11 = me[0],
      a12 = me[1],
      a13 = me[2],
      a14 = me[3];
    let a21 = me[4],
      a22 = me[5],
      a23 = me[6],
      a24 = me[7];
    let a31 = me[8],
      a32 = me[9],
      a33 = me[10],
      a34 = me[11];

    // Construct the elements of the rotation matrix
    let b11 = x * x * t + c;
    let b12 = y * x * t + z * s;
    let b13 = z * x * t - y * s;
    let b21 = x * y * t - z * s;
    let b22 = y * y * t + c;
    let b23 = z * y * t + x * s;
    let b31 = x * z * t + y * s;
    let b32 = y * z * t - x * s;
    let b33 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    oe[0] = a11 * b11 + a21 * b12 + a31 * b13;
    oe[1] = a12 * b11 + a22 * b12 + a32 * b13;
    oe[2] = a13 * b11 + a23 * b12 + a33 * b13;
    oe[3] = a14 * b11 + a24 * b12 + a34 * b13;

    oe[4] = a11 * b21 + a21 * b22 + a31 * b23;
    oe[5] = a12 * b21 + a22 * b22 + a32 * b23;
    oe[6] = a13 * b21 + a23 * b22 + a33 * b23;
    oe[7] = a14 * b21 + a24 * b22 + a34 * b23;

    oe[8] = a11 * b31 + a21 * b32 + a31 * b33;
    oe[9] = a12 * b31 + a22 * b32 + a32 * b33;
    oe[10] = a13 * b31 + a23 * b32 + a33 * b33;
    oe[11] = a14 * b31 + a24 * b32 + a34 * b33;

    if (m !== out) {
      // If the source and destination differ, copy the unchanged last row
      oe[12] = me[12];
      oe[13] = me[13];
      oe[14] = me[14];
      oe[15] = me[15];
    }
  }

  /**
   * 将矩阵 a 按给定向量 v 缩放，并将结果输出到 out。
   * @param m - 矩阵
   * @param s - 缩放向量
   * @param out - 缩放后的矩阵
   */
  static scale(m: Matrix, s: Vector3, out: Matrix): void {
    const me = m.elements;
    const oe = out.elements;
    const { x, y, z } = s;

    oe[0] = me[0] * x;
    oe[1] = me[1] * x;
    oe[2] = me[2] * x;
    oe[3] = me[3] * x;

    oe[4] = me[4] * y;
    oe[5] = me[5] * y;
    oe[6] = me[6] * y;
    oe[7] = me[7] * y;

    oe[8] = me[8] * z;
    oe[9] = me[9] * z;
    oe[10] = me[10] * z;
    oe[11] = me[11] * z;

    oe[12] = me[12];
    oe[13] = me[13];
    oe[14] = me[14];
    oe[15] = me[15];
  }

  /**
   * 将矩阵 a 按给定向量 v 转换，并将结果输出到 out。
   * @param m - 矩阵
   * @param v - 转换向量
   * @param out - 转换后的结果
   */
  static translate(m: Matrix, v: Vector3, out: Matrix): void {
    const me = m.elements;
    const oe = out.elements;
    const { x, y, z } = v;

    if (m === out) {
      oe[12] = me[0] * x + me[4] * y + me[8] * z + me[12];
      oe[13] = me[1] * x + me[5] * y + me[9] * z + me[13];
      oe[14] = me[2] * x + me[6] * y + me[10] * z + me[14];
      oe[15] = me[3] * x + me[7] * y + me[11] * z + me[15];
    } else {
      const a11 = me[0],
        a12 = me[1],
        a13 = me[2],
        a14 = me[3];
      const a21 = me[4],
        a22 = me[5],
        a23 = me[6],
        a24 = me[7];
      const a31 = me[8],
        a32 = me[9],
        a33 = me[10],
        a34 = me[11];

      (oe[0] = a11), (oe[1] = a12), (oe[2] = a13), (oe[3] = a14);
      (oe[4] = a21), (oe[5] = a22), (oe[6] = a23), (oe[7] = a24);
      (oe[8] = a31), (oe[9] = a32), (oe[10] = a33), (oe[11] = a34);

      oe[12] = a11 * x + a21 * y + a31 * z + me[12];
      oe[13] = a12 * x + a22 * y + a32 * z + me[13];
      oe[14] = a13 * x + a23 * y + a33 * z + me[14];
      oe[15] = a14 * x + a24 * y + a34 * z + me[15];
    }
  }

  /**
   * 计算矩阵 a 的转置矩阵，并将结果输出到 out。
   * @param a - 矩阵
   * @param out - 转置矩阵
   */
  static transpose(a: Matrix, out: Matrix): void {
    const ae = a.elements;
    const oe = out.elements;

    if (out === a) {
      const a12 = ae[1];
      const a13 = ae[2];
      const a14 = ae[3];
      const a23 = ae[6];
      const a24 = ae[7];
      const a34 = ae[11];

      oe[1] = ae[4];
      oe[2] = ae[8];
      oe[3] = ae[12];

      oe[4] = a12;
      oe[6] = ae[9];
      oe[7] = ae[13];

      oe[8] = a13;
      oe[9] = a23;
      oe[11] = ae[14];

      oe[12] = a14;
      oe[13] = a24;
      oe[14] = a34;
    } else {
      oe[0] = ae[0];
      oe[1] = ae[4];
      oe[2] = ae[8];
      oe[3] = ae[12];

      oe[4] = ae[1];
      oe[5] = ae[5];
      oe[6] = ae[9];
      oe[7] = ae[13];

      oe[8] = ae[2];
      oe[9] = ae[6];
      oe[10] = ae[10];
      oe[11] = ae[14];

      oe[12] = ae[3];
      oe[13] = ae[7];
      oe[14] = ae[11];
      oe[15] = ae[15];
    }
  }

  /** 矩阵元素数组。 */
  elements: Float32Array = new Float32Array(16);

  /**
   * 创建4x4矩阵实例，默认创建单位矩阵，我们采用列矩阵。
   * @param m11 默认值 1 column 1, row 1
   * @param m12 默认值 0 column 1, row 2
   * @param m13 默认值 0 column 1, row 3
   * @param m14 默认值 0 column 1, row 4
   * @param m21 默认值 0 column 2, row 1
   * @param m22 默认值 1 column 2, row 2
   * @param m23 默认值 0 column 2, row 3
   * @param m24 默认值 0 column 2, row 4
   * @param m31 默认值 0 column 3, row 1
   * @param m32 默认值 0 column 3, row 2
   * @param m33 默认值 1 column 3, row 3
   * @param m34 默认值 0 column 3, row 4
   * @param m41 默认值 0 column 4, row 1
   * @param m42 默认值 0 column 4, row 2
   * @param m43 默认值 0 column 4, row 3
   * @param m44 默认值 1 column 4, row 4
   */
  constructor(
    m11: number = 1,
    m12: number = 0,
    m13: number = 0,
    m14: number = 0,
    m21: number = 0,
    m22: number = 1,
    m23: number = 0,
    m24: number = 0,
    m31: number = 0,
    m32: number = 0,
    m33: number = 1,
    m34: number = 0,
    m41: number = 0,
    m42: number = 0,
    m43: number = 0,
    m44: number = 1
  ) {
    const e: Float32Array = this.elements;

    e[0] = m11;
    e[1] = m12;
    e[2] = m13;
    e[3] = m14;

    e[4] = m21;
    e[5] = m22;
    e[6] = m23;
    e[7] = m24;

    e[8] = m31;
    e[9] = m32;
    e[10] = m33;
    e[11] = m34;

    e[12] = m41;
    e[13] = m42;
    e[14] = m43;
    e[15] = m44;
  }

  /**
   * 给矩阵设置值，并返回当前值。
   * @param m11
   * @param m12
   * @param m13
   * @param m14
   * @param m21
   * @param m22
   * @param m23
   * @param m24
   * @param m31
   * @param m32
   * @param m33
   * @param m34
   * @param m41
   * @param m42
   * @param m43
   * @param m44
   * @returns 当前矩阵
   */
  setValue(
    m11: number,
    m12: number,
    m13: number,
    m14: number,
    m21: number,
    m22: number,
    m23: number,
    m24: number,
    m31: number,
    m32: number,
    m33: number,
    m34: number,
    m41: number,
    m42: number,
    m43: number,
    m44: number
  ): Matrix {
    const e = this.elements;

    e[0] = m11;
    e[1] = m12;
    e[2] = m13;
    e[3] = m14;

    e[4] = m21;
    e[5] = m22;
    e[6] = m23;
    e[7] = m24;

    e[8] = m31;
    e[9] = m32;
    e[10] = m33;
    e[11] = m34;

    e[12] = m41;
    e[13] = m42;
    e[14] = m43;
    e[15] = m44;

    return this;
  }

  /**
   * 创建一个新的四维矩阵，并用当前矩阵值初始化。
   * @returns 一个新的矩阵，并且拷贝当前矩阵的值
   */
  clone(): Matrix {
    const e = this.elements;
    let ret = new Matrix(
      e[0],
      e[1],
      e[2],
      e[3],
      e[4],
      e[5],
      e[6],
      e[7],
      e[8],
      e[9],
      e[10],
      e[11],
      e[12],
      e[13],
      e[14],
      e[15]
    );
    return ret;
  }

  /**
   * 将当前矩阵值拷贝给 out 矩阵。
   * @param out - 目标矩阵
   */
  cloneTo(out: Matrix): void {
    const e = this.elements;
    const oe = out.elements;

    oe[0] = e[0];
    oe[1] = e[1];
    oe[2] = e[2];
    oe[3] = e[3];

    oe[4] = e[4];
    oe[5] = e[5];
    oe[6] = e[6];
    oe[7] = e[7];

    oe[8] = e[8];
    oe[9] = e[9];
    oe[10] = e[10];
    oe[11] = e[11];

    oe[12] = e[12];
    oe[13] = e[13];
    oe[14] = e[14];
    oe[15] = e[15];
  }

  /**
   * 将当前矩阵乘以给定的向量 a，并返回当前矩阵。
   * @param b - 给定的向量，右操作数
   * @returns 当前矩阵
   */
  multiply(b: Matrix): Matrix {
    Matrix.multiply(this, b, this);
    return this;
  }

  /**
   * 计算4x4矩阵的行列式。
   * @returns 当前矩阵的行列式
   */
  determinant(): number {
    const e = this.elements;

    const a11 = e[0],
      a12 = e[1],
      a13 = e[2],
      a14 = e[3];
    const a21 = e[4],
      a22 = e[5],
      a23 = e[6],
      a24 = e[7];
    const a31 = e[8],
      a32 = e[9],
      a33 = e[10],
      a34 = e[11];
    const a41 = e[12],
      a42 = e[13],
      a43 = e[14],
      a44 = e[15];

    const b00 = a11 * a22 - a12 * a21;
    const b01 = a11 * a23 - a13 * a21;
    const b02 = a11 * a24 - a14 * a21;
    const b03 = a12 * a23 - a13 * a22;
    const b04 = a12 * a24 - a14 * a22;
    const b05 = a13 * a24 - a14 * a23;
    const b06 = a31 * a42 - a32 * a41;
    const b07 = a31 * a43 - a33 * a41;
    const b08 = a31 * a44 - a34 * a41;
    const b09 = a32 * a43 - a33 * a42;
    const b10 = a32 * a44 - a34 * a42;
    const b11 = a33 * a44 - a34 * a43;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  }

  /**
   * 将矩阵分解为平移向量、旋转四元数、缩放向量。
   * @param pos - 平移向量
   * @param q - 旋转四元数
   * @param s - 缩放向量
   */
  decompose(pos: Vector3, q: Quaternion, s: Vector3): void {
    const t: Matrix = Matrix._tempMat40;
    this.cloneTo(t);
    const te = t.elements;

    pos.x = te[12];
    pos.y = te[13];
    pos.z = te[14];

    let sx = Math.sqrt(te[0] * te[0] + te[1] * te[1] + te[2] * te[2]);
    const sy = Math.sqrt(te[4] * te[4] + te[5] * te[5] + te[6] * te[6]);
    const sz = Math.sqrt(te[8] * te[8] + te[9] * te[9] + te[10] * te[10]);

    if (
      Math.abs(sx) < MathUtil.zeroTolerance ||
      Math.abs(sy) < MathUtil.zeroTolerance ||
      Math.abs(sz) < MathUtil.zeroTolerance
    ) {
      // TODO
    } else {
      // if determine is negative, we need to invert one scale
      const det = t.determinant();
      if (det < 0) sx = -sx;

      // scale the rotation part
      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;

      te[0] *= invSX;
      te[1] *= invSX;
      te[2] *= invSX;

      te[4] *= invSY;
      te[5] *= invSY;
      te[6] *= invSY;

      te[8] *= invSZ;
      te[9] *= invSZ;
      te[10] *= invSZ;
    }

    const m3: Matrix3x3 = Matrix._tempMat30;
    Matrix3x3.fromMat4(t, m3);
    Quaternion.rotationMat3(m3, q);

    s.x = sx;
    s.y = sy;
    s.z = sz;
  }

  /**
   * 从矩阵中返回表示旋转的四元数。
   * @param a - 转换矩阵
   * @param out - 表示旋转的四元数
   * @returns 当前矩阵的旋转四元数
   */
  getRotation(out: Quaternion): Quaternion {
    const e = this.elements;
    let trace = e[0] + e[5] + e[10];
    let S = 0;

    if (trace > MathUtil.zeroTolerance) {
      S = Math.sqrt(trace + 1.0) * 2;
      out.w = 0.25 * S;
      out.x = (e[6] - e[9]) / S;
      out.y = (e[8] - e[2]) / S;
      out.z = (e[1] - e[4]) / S;
    } else if (e[0] > e[5] && e[0] > e[10]) {
      S = Math.sqrt(1.0 + e[0] - e[5] - e[10]) * 2;
      out.w = (e[6] - e[9]) / S;
      out.x = 0.25 * S;
      out.y = (e[1] + e[4]) / S;
      out.z = (e[8] + e[2]) / S;
    } else if (e[5] > e[10]) {
      S = Math.sqrt(1.0 + e[5] - e[0] - e[10]) * 2;
      out.w = (e[8] - e[2]) / S;
      out.x = (e[1] + e[4]) / S;
      out.y = 0.25 * S;
      out.z = (e[6] + e[9]) / S;
    } else {
      S = Math.sqrt(1.0 + e[10] - e[0] - e[5]) * 2;
      out.w = (e[1] - e[4]) / S;
      out.x = (e[8] + e[2]) / S;
      out.y = (e[6] + e[9]) / S;
      out.z = 0.25 * S;
    }

    return out;
  }

  /**
   * 从矩阵中返回缩放向量。
   * @param out - 缩放向量
   * @returns 当前矩阵的缩放向量
   */
  getScaling(out: Vector3): Vector3 {
    const e = this.elements;
    const m11 = e[0],
      m12 = e[1],
      m13 = e[2];
    const m21 = e[4],
      m22 = e[5],
      m23 = e[6];
    const m31 = e[8],
      m32 = e[9],
      m33 = e[10];

    out.x = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out.y = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out.z = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

    return out;
  }

  /**
   * 从矩阵中返回转换向量。
   * @param out - 转换向量
   * @returns 当前矩阵的转换向量
   */
  getTranslation(out: Vector3): Vector3 {
    const e = this.elements;

    out.x = e[12];
    out.y = e[13];
    out.z = e[14];

    return out;
  }

  /**
   * 将矩阵设置为单位矩阵。
   * @returns 当前矩阵
   */
  identity(): Matrix {
    const e = this.elements;

    e[0] = 1;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;

    e[4] = 0;
    e[5] = 1;
    e[6] = 0;
    e[7] = 0;

    e[8] = 0;
    e[9] = 0;
    e[10] = 1;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    return this;
  }

  /**
   * 计算当前矩阵的逆矩阵，并返回。
   * @returns 当前矩阵
   */
  invert(): Matrix {
    Matrix.invert(this, this);
    return this;
  }

  /**
   * 将当前矩阵按给定角度旋转，并返回。
   * @param r - 给定的旋转角度
   * @param axis - 旋转轴
   * @returns 当前矩阵
   */
  rotate(r: number, axis: Vector3): Matrix {
    Matrix.rotate(this, r, axis, this);
    return this;
  }

  /**
   * 将当前矩阵按给定向量 v 缩放，并返回。
   * @param s
   * @returns 当前矩阵
   */
  scale(s: Vector3): Matrix {
    Matrix.scale(this, s, this);
    return this;
  }

  /**
   * 将当前矩阵按给定向量 v 转换，并返回。
   * @param v - 转换向量
   * @returns 当前矩阵
   */
  translate(v: Vector3): Matrix {
    Matrix.translate(this, v, this);
    return this;
  }

  /**
   * 计算当前矩阵的转置矩阵，并返回。
   * @returns 当前矩阵
   */
  transpose(): Matrix {
    Matrix.transpose(this, this);
    return this;
  }
}
