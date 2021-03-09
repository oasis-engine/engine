import { IPlatformPrimitive } from "@oasis-engine/design/types/renderingHardwareInterface/IPlatformPrimitive";
import { BoundingBox } from "@oasis-engine/math";
import { RefObject } from "../asset/RefObject";
import { Engine } from "../Engine";
import { Buffer } from "../graphic/Buffer";
import { BufferUtil } from "../graphic/BufferUtil";
import { IndexFormat } from "../graphic/enums/IndexFormat";
import { MeshTopology } from "../graphic/enums/MeshTopology";
import { IndexBufferBinding } from "../graphic/IndexBufferBinding";
import { SubMesh } from "../graphic/SubMesh";
import { VertexBufferBinding } from "../graphic/VertexBufferBinding";
import { VertexElement } from "../graphic/VertexElement";
import { ShaderProgram } from "../shader/ShaderProgram";
import { UpdateFlag } from "../UpdateFlag";

/**
 * Mesh.
 */
export class Mesh extends RefObject {
  /** Name. */
  name: string;
  /** Instanced count, disable instanced drawing when set zero. */
  instanceCount: number = 0;
  /** The bounding volume of the mesh. */
  readonly bounds: BoundingBox = new BoundingBox();

  _vertexElementMap: object = {};
  _glIndexType: number;
  _platformPrimitive: IPlatformPrimitive;

  private _vertexBufferBindings: VertexBufferBinding[] = [];
  private _indexBufferBinding: IndexBufferBinding = null;
  private _vertexElements: VertexElement[] = [];
  private _subMeshes: SubMesh[] = [];
  private _updateFlags: UpdateFlag[] = [];

  /**
   * Vertex buffer binding collection.
   */
  get vertexBufferBindings(): Readonly<VertexBufferBinding[]> {
    return this._vertexBufferBindings;
  }

  /**
   * Index buffer binding.
   */
  get indexBufferBinding(): IndexBufferBinding {
    return this._indexBufferBinding;
  }

  /**
   * Vertex element collection.
   */
  get vertexElements(): Readonly<VertexElement[]> {
    return this._vertexElements;
  }

  /**
   * First sub-mesh. Rendered using the first material.
   */
  get subMesh(): SubMesh | null {
    return this._subMeshes[0] || null;
  }

  /**
   * A collection of sub-mesh, each sub-mesh can be rendered with an independent material.
   */
  get subMeshes(): Readonly<SubMesh[]> {
    return this._subMeshes;
  }

  /**
   * Create emsh.
   * @param engine - Engine
   * @param name - Mesh name
   */
  constructor(engine: Engine, name?: string) {
    super(engine);
    this.name = name;
    this._platformPrimitive = this._engine._hardwareRenderer.createPlatformPrimitive(this);
  }

  /**
   * Set vertex buffer binding.
   * @param vertexBufferBindings - Vertex buffer binding
   * @param firstIndex - First vertex buffer index, the default value is 0
   */
  setVertexBufferBinding(vertexBufferBindings: VertexBufferBinding, firstIndex?: number): void;

  /**
   * Set vertex buffer binding.
   * @param vertexBuffer - Vertex buffer
   * @param stride - Vertex buffer data stride
   * @param firstIndex - First vertex buffer index, the default value is 0
   */
  setVertexBufferBinding(vertexBuffer: Buffer, stride: number, firstIndex?: number): void;

  setVertexBufferBinding(
    bufferOrBinding: Buffer | VertexBufferBinding,
    strideOrFirstIndex: number = 0,
    firstIndex: number = 0
  ): void {
    let binding = <VertexBufferBinding>bufferOrBinding;
    const isBinding = binding.buffer !== undefined;
    isBinding || (binding = new VertexBufferBinding(<Buffer>bufferOrBinding, strideOrFirstIndex));

    const bindings = this._vertexBufferBindings;
    bindings.length <= firstIndex && (bindings.length = firstIndex + 1);
    this._setVertexBufferBinding(isBinding ? strideOrFirstIndex : firstIndex, binding);
  }

  /**
   * Set vertex buffer binding.
   * @param vertexBufferBindings - Vertex buffer binding
   * @param firstIndex - First vertex buffer index, the default value is 0
   */
  setVertexBufferBindings(vertexBufferBindings: VertexBufferBinding[], firstIndex: number = 0): void {
    const bindings = this._vertexBufferBindings;
    const count = vertexBufferBindings.length;
    const needLength = firstIndex + count;
    bindings.length < needLength && (bindings.length = needLength);
    for (let i = 0; i < count; i++) {
      this._setVertexBufferBinding(firstIndex + i, vertexBufferBindings[i]);
    }
  }

  /**
   * Set index buffer binding.
   * @param buffer - Index buffer
   * @param format - Index buffer format
   */
  setIndexBufferBinding(buffer: Buffer, format: IndexFormat): void;

  /**
   * Set index buffer binding.
   * @param bufferBinding - Index buffer binding
   */
  setIndexBufferBinding(bufferBinding: IndexBufferBinding): void;

  setIndexBufferBinding(bufferOrBinding: Buffer | IndexBufferBinding, format?: IndexFormat): void {
    let binding = <IndexBufferBinding>bufferOrBinding;
    const isBinding = binding.buffer !== undefined;
    isBinding || (binding = new IndexBufferBinding(<Buffer>bufferOrBinding, format));
    this._indexBufferBinding = binding;
    this._glIndexType = BufferUtil._getGLIndexType(binding.format);
  }

  /**
   * Set vertex elements.
   * @param elements - Vertex element collection
   */
  setVertexElements(elements: VertexElement[]): void {
    this._clearVertexElements();
    for (let i = 0, n = elements.length; i < n; i++) {
      this._addVertexElement(elements[i]);
    }
  }

  /**
   * Add sub-mesh, each sub-mesh can correspond to an independent material.
   * @param start - Start drawing offset, if the index buffer is set, it means the offset in the index buffer, if not set, it means the offset in the vertex buffer
   * @param count - Drawing count, if the index buffer is set, it means the count in the index buffer, if not set, it means the count in the vertex buffer
   * @param topology - Drawing topology, default is MeshTopology.Triangles
   */
  addSubMesh(start: number, count: number, topology: MeshTopology = MeshTopology.Triangles): SubMesh {
    const subMesh = new SubMesh(start, count, topology);
    this._subMeshes.push(subMesh);
    return subMesh;
  }

  /**
   * Remove sub-mesh.
   * @param subMesh - Sub-mesh needs to be removed
   */
  removeSubMesh(subMesh: SubMesh): void {
    const subMeshes = this._subMeshes;
    const index = subMeshes.indexOf(subMesh);
    if (index !== -1) {
      subMeshes.splice(index, 1);
    }
  }

  /**
   * Clear all sub-mesh.
   */
  clearSubMesh(): void {
    this._subMeshes.length = 0;
  }

  /**
   * Register update flag, update flag will be true if the vertex element changes.
   * @returns Update flag
   */
  registerUpdateFlag(): UpdateFlag {
    return new UpdateFlag(this._updateFlags);
  }

  /**
   * @internal
   */
  _draw(shaderProgram: ShaderProgram, subMesh: SubMesh): void {
    this._platformPrimitive.draw(shaderProgram, subMesh);
  }

  /**
   * @override
   */
  _addRefCount(value: number): void {
    super._addRefCount(value);
    const vertexBufferBindings = this._vertexBufferBindings;
    for (let i = 0, n = vertexBufferBindings.length; i < n; i++) {
      vertexBufferBindings[i]._buffer._addRefCount(value);
    }
  }

  /**
   * @override
   * Destroy.
   */
  _onDestroy() {
    this._vertexBufferBindings = null;
    this._indexBufferBinding = null;
    this._vertexElements = null;
    this._vertexElementMap = null;
    this._platformPrimitive.destroy();
  }

  private _clearVertexElements(): void {
    this._vertexElements.length = 0;
    const vertexElementMap = this._vertexElementMap;
    for (var k in vertexElementMap) {
      delete vertexElementMap[k];
    }
  }

  private _addVertexElement(element: VertexElement): void {
    const { semantic } = element;
    this._vertexElementMap[semantic] = element;
    this._vertexElements.push(element);
    this._makeModified();
  }

  private _setVertexBufferBinding(index: number, binding: VertexBufferBinding): void {
    if (this._getRefCount() > 0) {
      const lastBinding = this._vertexBufferBindings[index];
      lastBinding && lastBinding._buffer._addRefCount(-1);
      binding._buffer._addRefCount(1);
    }
    this._vertexBufferBindings[index] = binding;
  }

  private _makeModified(): void {
    for (let i = this._updateFlags.length - 1; i >= 0; i--) {
      this._updateFlags[i].flag = true;
    }
  }
}
