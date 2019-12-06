import { BufferUsage, DataType, DrawMode, UpdateType } from "@alipay/o3-base";
import { AssetObject } from "@alipay/o3-core";
import { BoundingSphere, OBB } from "@alipay/o3-bounding-info";

let primitiveID = 0;

/**
 * primitive(triangles, lines) data, vbo+indices, equal glTF meshes.primitives define
 * @class
 * @private
 */
export class Primitive extends AssetObject {
  public readonly id: number;
  public mode: number;
  public usage: number;
  public updateType: number;
  public updateRange: { byteOffset: number; byteLength: number };
  public vertexBuffers;
  public vertexAttributes;
  public vertexOffset;
  public vertexCount;
  public indexType;
  public indexCount;
  public indexBuffer;
  public indexOffset;
  public material;
  public targets;
  public boundingBox: OBB;
  public boundingSphere: BoundingSphere;
  public isInFrustum: boolean;

  /**
   * @constructor
   */
  constructor(name?) {
    super(name !== undefined ? name : "DEFAULT_PRIMITIVENAME_" + primitiveID);
    this.id = primitiveID++;
    this.mode = DrawMode.TRIANGLES; // draw mode, triangles, lines etc.
    this.usage = BufferUsage.STATIC_DRAW;
    this.updateType = UpdateType.UPDATE_ALL;
    this.updateRange = {
      byteOffset: -1,
      byteLength: 0
    };

    //-- 顶点数据
    this.vertexBuffers = []; // ArrayBuffer，一个Primitive可能包含1个或多个顶点缓冲
    this.vertexAttributes = {}; // vertex attributes: dict object, [senmatic]-->VertexAttribute
    this.vertexOffset = 0;
    this.vertexCount = 0;

    //-- index 数据，可能为null
    this.indexType = DataType.UNSIGNED_SHORT;
    this.indexCount = 0; // number of elements
    this.indexBuffer = null; // ArrayBuffer object
    this.indexOffset = 0;

    //--
    this.material = null; // default material objects
    this.targets = []; // MorphTarget array
    this.boundingBox = null;
    this.boundingSphere = null;
    this.isInFrustum = true;
  }

  /**
   * 添加一个顶点属性
   * @param {string} semantic
   * @param {number} size
   * @param {DataType} type
   * @param {boolean} normalized
   * @param {number} stride
   * @param {number} offset
   * @param {number} vertexBufferIndex
   */
  addAttribute(semantic, size, type, normalized, stride, offset, vertexBufferIndex) {
    this.vertexAttributes[semantic] = {
      semantic,
      size,
      type,
      normalized,
      stride,
      offset,
      vertexBufferIndex
    };
  }

  /**
   * 重置更新范围对象
   */
  resetUpdateRange() {
    this.updateRange.byteOffset = -1;
    this.updateRange.byteLength = 0;
  }
}
