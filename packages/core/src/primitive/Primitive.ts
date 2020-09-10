import { AssetObject } from "../asset/AssetObject";
import { DrawMode } from "../base/Constant";
import { BoundingSphere } from "../bounding-info/BoudingSphere";
import { OBB } from "../bounding-info/OBB";
import { IndexBuffer, VertexBuffer, VertexElements } from "../geometry";
import { SemanticMap } from "./type";

// TODO Destroy VAO and Buffer，ref to rhi refactor

let primitiveID = 0;

/**
 * primitive(triangles, lines) data, vbo+indices, equal glTF meshes.primitives define
 * @private
 */
export class Primitive extends AssetObject {
  readonly id: number;
  mode: DrawMode = DrawMode.TRIANGLES;
  vertexAttributes: VertexElements = {};
  private _vertexBuffers: VertexBuffer[] = [];
  vertexCount: number = 0;

  indexBuffer: IndexBuffer;
  indexOffset: number = 0;
  indexCount: number = 0;

  material = null;
  materialIndex: number;
  targets: any[] = [];
  boundingBox: OBB = null;
  boundingSphere: BoundingSphere = null;
  isInFrustum: boolean = true;

  isInstanced: boolean = false;
  instancedCount: number;

  semanticIndexMap: SemanticMap = {};

  get attributes() {
    return this.vertexAttributes;
  }

  get vertexBuffers(): Readonly<VertexBuffer[]> {
    return this._vertexBuffers;
  }

  /**
   * @constructor
   */
  constructor(name?: string) {
    super();
    this.id = primitiveID++;
    this.name = name;
  }

  addVertexBuffer(vertexBuffer: VertexBuffer): void {
    const index = this.vertexBuffers.length;
    this._vertexBuffers.push(vertexBuffer);
    const elements = vertexBuffer.declaration.elements;
    for (let i = 0, n = elements.length; i < n; i++) {
      const element = elements[i];
      const { semantic, instanced } = element;
      this.vertexAttributes[semantic] = element;
      this.semanticIndexMap[semantic] = index;
      if (instanced) {
        this.isInstanced = true;
      }
    }
  }

  updateWeightsIndices(indices: number[]) {
    if (this.targets.length !== indices.length || indices.length === 0) {
      return;
    }
    for (let i = 0; i < indices.length; i++) {
      const currentIndex = indices[i];
      Object.keys(this.targets[i]).forEach((key: string) => {
        const semantic = this.targets[i][key].name;
        const index = this.targets[currentIndex][key].vertexBufferIndex;
        // this.updateAttribBufferIndex(semantic, index);
      });
    }
  }

  // updateAttribBufferIndex(semantic: string, index: number) {
  //   this.vertexAttributes[semantic].vertexBufferIndex = index;
  // }

  // /**
  //  * 通过 primitive 计算本地/世界坐标系的 min/max
  //  * @param {Matrix} modelMatrix - Local to World矩阵,如果传此值，则计算min/max时将考虑RTS变换，如果不传，则计算local min/max
  //  * @param {boolean} littleEndian - 是否以小端字节序读取，默认true
  //  * */
  // getMinMax(modelMatrix?: Matrix, littleEndian = true) {
  //   let {
  //     vertexCount,
  //     vertexBuffers,
  //     vertexAttributes: {
  //       POSITION: { size, offset, stride, vertexBufferIndex }
  //     }
  //   } = this;
  //   let arrayBuffer = vertexBuffers[vertexBufferIndex];
  //   if (!(arrayBuffer instanceof ArrayBuffer)) {
  //     arrayBuffer = arrayBuffer.buffer;
  //   }
  //   if (stride === 0) {
  //     stride = size * 4;
  //   }
  //   const dataView = new DataView(arrayBuffer, offset);

  //   let min = new Vector3(Infinity, Infinity, Infinity);
  //   let max = new Vector3(-Infinity, -Infinity, -Infinity);
  //   for (let i = 0; i < vertexCount; i++) {
  //     const base = offset + stride * i;
  //     const position = new Vector3(
  //       dataView.getFloat32(base, littleEndian),
  //       dataView.getFloat32(base + 4, littleEndian),
  //       dataView.getFloat32(base + 8, littleEndian)
  //     );
  //     modelMatrix && Vector3.transformCoordinate(position, modelMatrix, position);
  //     Vector3.min(min, position, min);
  //     Vector3.max(max, position, max);
  //   }

  //   return {
  //     min,
  //     max
  //   };
  // }

  destroy() {}

  reset() {
    this.mode = DrawMode.TRIANGLES;
    this.vertexAttributes = {};
    this._vertexBuffers = [];
    this.vertexCount = 0;

    this.indexBuffer = null;
    this.indexOffset = 0;
    this.indexCount = 0;

    this.material = null;
    this.materialIndex = null;
    this.targets = [];
    this.boundingBox = null;
    this.boundingSphere = null;
    this.isInFrustum = true;

    this.isInstanced = false;
    this.instancedCount = null;

    this.semanticIndexMap = {};
  }
}
