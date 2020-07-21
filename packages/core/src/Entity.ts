import { EventDispatcher } from "@alipay/o3-base";
import { mat4 } from "@alipay/o3-math";
import { Matrix4, Vector3, Vector4 } from "@alipay/o3-math/types/type";
import { Component } from "./Component";
import { ComponentsDependencies } from "./ComponentsDependencies";
import { DisorderedArray } from "./DisorderedArray";
import { Engine } from "./Engine";
import { Scene } from "./Scene";
import { Transform } from "./Transform";
import { UpdateFlag } from "./UpdateFlag";

/**
 * 节点类,可作为组件的容器。
 */
export class Entity extends EventDispatcher {
  public static _nodes: DisorderedArray<Entity> = new DisorderedArray();

  /**
   * 根据名字全局查找节点。
   * @param name - 名字
   * @returns 节点
   */
  static findByName(name: string): Entity {
    const { _nodes } = Entity;
    const nodes = _nodes._elements;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const nodeName = node.name;
      if (nodeName === name) {
        return node;
      }
    }
    return null;
  }

  /**
   * 根据路径全局查找节点，使用‘/’符号作为路径分割符。
   * @param path - 路径
   * @param scene - @deprecated 兼容参数
   * @returns 节点
   */
  static findByPath(path: string, scene: Scene /*@deprecated*/): Entity {
    const splits = path.split("/");
    const rootNode = scene.root;
    if (!rootNode) return null; //scene or scene.root maybe destroyed
    let node: Entity = rootNode;
    for (let i = 0, spitLength = splits.length; i < spitLength; ++i) {
      const split = splits[i];
      if (split) {
        node = Entity._findChildByName(node, split);
        if (!node) {
          return null;
        }
      }
    }
    return node;
  }

  /**
   * @internal
   */
  static _findChildByName(root: Entity, name: string): Entity {
    const children = root._children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.name === name) {
        return child;
      }
    }
    return null;
  }

  private static _traverseSetOwnerScene(node: Entity, scene: Scene): void {
    for (let i = node.childCount - 1; i >= 0; i--) {
      const child = node._children[i];
      child._scene = scene;
      this._traverseSetOwnerScene(child, scene);
    }
  }

  /* 名字。 */
  name: string;

  /* @internal */
  _isActiveInHierarchy: boolean = false;
  /* @internal */
  _components: Component[] = [];
  /* @internal */
  _children: Entity[] = [];
  /* @internal */
  _scene: Scene;
  /* @internal */
  _isRoot: boolean = false;

  private _engine: Engine;
  private _active: boolean = true;
  private _parent: Entity = null;
  private _activeChangedComponents: Component[];
  public readonly transform: Transform;

  /** @deprecated */
  private _invModelMatrix: Matrix4 = mat4.create();

  /**
   * 是否局部激活。
   */
  get isActive(): boolean {
    return this._active;
  }
  set isActive(value: boolean) {
    if (value !== this._active) {
      this._active = value;
      if (value) {
        const parent = this._parent;
        //CM:还需要判断场景是否激活,具体逻辑可为先判断parent是否为空,不为空判断parent._isActiveInHierarch，为空判断scene._isActive
        if ((parent && parent._isActiveInHierarchy) || this._isRoot) {
          this._processActive();
        }
      } else {
        if (this._isActiveInHierarchy) {
          this._processInActive();
        }
      }
    }
  }

  /**
   * 在层级中是否处于激活状态。
   */
  get isActiveInHierarchy(): boolean {
    return this._isActiveInHierarchy;
  }

  /**
   * 父节点。
   */
  get parent(): Entity {
    return this._parent;
  }

  set parent(node: Entity) {
    if (node !== this._parent) {
      const oldParent = this._parent;
      if (oldParent != null) {
        const oldParentChildren = oldParent._children;
        oldParentChildren.splice(oldParentChildren.indexOf(this), 1);
      }
      const newParent = (this._parent = node);
      if (newParent) {
        newParent._children.push(this);
        const parentScene = newParent._scene;
        if (this._scene !== parentScene) {
          this._scene = parentScene;
          Entity._traverseSetOwnerScene(this, parentScene);
        }

        if (newParent._isActiveInHierarchy) {
          !this._isActiveInHierarchy && this._active && this._processActive();
        } else {
          this._isActiveInHierarchy && this._processInActive();
        }
      } else {
        this._isActiveInHierarchy && this._processInActive();
        if (oldParent) {
          this._scene = null;
          Entity._traverseSetOwnerScene(this, null);
        }
      }
    }
    this._setTransformDirty();
  }

  /**
   * 子节点数量。
   */
  get childCount(): number {
    return this._children.length;
  }

  /**
   * 所属的场景对象。
   */
  get scene(): Scene {
    return this._scene;
  }

  /**
   * 所属引擎。
   */
  get engine(): Engine {
    return this._scene.engine;
  }

  /**
   * 创建一个节点。
   * @param name - 名字
   * @param engine - 所属Engine
   */
  constructor(name?: string, engine?: Engine) {
    super();
    Entity._nodes.add(this);
    this._engine = engine || Engine._getDefaultEngine();
    this.name = name;
    this.transform = this.addComponent(Transform);
    this._inverseWorldMatFlag = this.transform.registerWorldChangeFlag();
  }

  /**
   * //TODO:组件通常不带构造函数参数，日后需要移除
   * 根据组件类型添加组件。
   * @returns	组件实例
   */
  addComponent<T extends Component>(type: new (node: any, props?: object) => T, props: object = {}): T {
    ComponentsDependencies._addCheck(this, type);
    const component = new type(this, props);
    this._components.push(component);
    if (this._isActiveInHierarchy) {
      component._setActive(true);
    }
    return component;
  }

  /**
   * //TODO:组件通常不带构造函数参数，日后需要移除
   * 根据组件类型获取组件。
   * @returns	组件实例
   */
  getComponent<T extends Component>(type: new (node: Entity, props?: object) => T): T {
    for (let i = this._components.length - 1; i >= 0; i--) {
      const component = this._components[i];
      if (component instanceof type) {
        return component;
      }
    }
  }

  /**
   * //TODO:组件通常不带构造函数参数，日后需要移除
   * 根据组件类型获取组件集合。
   * @returns	组件实例集合
   */
  getComponents<T extends Component>(type: new (node: Entity, props?: object) => T, results: Array<T>): Array<T> {
    for (let i = this._components.length - 1; i >= 0; i--) {
      const component = this._components[i];
      if (component instanceof type) {
        results.push(component);
      }
    }
    return results;
  }

  /**
   * 添加子节点对象。
   * @param child - 子节点
   */
  addChild(child: Entity): void {
    child.parent = this;
  }

  /**
   * 删除子节点。
   * @param child - 子节点
   */
  removeChild(child: Entity): void {
    child.parent = null;
  }

  /**
   * 根据索引获取子节点。
   * @param index - 索引
   * @returns 节点
   */
  getChild(index: number): Entity {
    return this._children[index];
  }

  /**
   * 根据名字查找子节点。
   * @param name - 名字
   * @returns 节点
   */
  findByName(name: string): Entity {
    const children = this._children;
    const child = Entity._findChildByName(this, name);
    if (child) return child;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      const grandson = child.findByName(name);
      if (grandson) {
        return grandson;
      }
    }
    return null;
  }

  /**
   * 根据路径查找节点，使用‘/’符号作为路径分割符。
   * @param path - 路径
   * @returns 节点
   */
  findByPath(path: string): Entity {
    const splits = path.split("/");
    let node: Entity = this;
    for (let i = 0, length = splits.length; i < length; ++i) {
      const split = splits[i];
      if (split) {
        node = Entity._findChildByName(node, split);
        if (!node) {
          return null;
        }
      }
    }
    return node;
  }

  /**
   * 清空子节点。
   */
  clearChildren(): void {
    const children = this._children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      child._parent = null;
      child._isActiveInHierarchy && child._processInActive();
      child._scene = null; // must after child._processInActive()
      Entity._traverseSetOwnerScene(child, null);
    }
    children.length = 0;
  }

  /**
   * 克隆。
   * @returns 克隆的节点
   */
  clone(): Entity {
    const newNode = new Entity(this.name, this._engine);

    newNode._active = this._active;
    newNode._isActiveInHierarchy = this._isActiveInHierarchy; //克隆后仍属于相同父节点

    newNode.transform.localMatrix = this.transform.localMatrix;

    const children = this._children;
    for (let i = 0, len = this._children.length; i < len; i++) {
      const childNode = children[i];
      newNode.addChild(childNode.clone());
    }

    const abilityArray = this._components || [];
    const len = abilityArray.length;
    for (let i = 0; i < len; i++) {
      const ability = abilityArray[i];
      if (!(ability instanceof Transform)) {
        newNode.addComponent(ability.constructor as any, (ability as any)._props);
      }
    }

    return newNode;
  }

  /**
   * 销毁。
   */
  destroy(): void {
    const abilityArray = this._components;
    for (let i = abilityArray.length - 1; i >= 0; i--) {
      abilityArray[i].destroy();
    }
    this._components.length = 0;

    const children = this._children;
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].destroy();
    }
    this._children.length = 0;

    if (this._parent != null) {
      const parentChildren = this._parent._children;
      parentChildren.splice(parentChildren.indexOf(this), 1);
    }
    this._parent = null;
    Entity._nodes.delete(this);
  }

  /**
   * @internal
   */
  _removeComponent(component: Component): void {
    ComponentsDependencies._removeCheck(this, component.constructor as any);
    const components = this._components;
    components.splice(components.indexOf(component), 1);
  }

  private _setActiveComponents(isActive: boolean): void {
    const activeChangedComponents = this._activeChangedComponents;
    for (let i = 0, length = activeChangedComponents.length; i < length; ++i) {
      activeChangedComponents[i]._setActive(isActive);
    }
    this._scene._componentsManager.putActiveChangedTempList(activeChangedComponents);
    this._activeChangedComponents = null;
  }

  private _processActive(): void {
    if (this._activeChangedComponents) {
      throw "Note: can't set the 'main inActive node' active in hierarchy, if the operation is in main inActive node or it's children script's onDisable Event.";
    }
    this._activeChangedComponents = this._scene._componentsManager.getActiveChangedTempList();
    this._setActiveInHierarchy(this._activeChangedComponents);
    this._setActiveComponents(true);
  }

  private _processInActive(): void {
    if (this._activeChangedComponents) {
      throw "Note: can't set the 'main active node' inActive in hierarchy, if the operation is in main active node or it's children script's onEnable Event.";
    }
    this._activeChangedComponents = this._scene._componentsManager.getActiveChangedTempList();
    this._setInActiveInHierarchy(this._activeChangedComponents);
    this._setActiveComponents(false);
  }

  private _setActiveInHierarchy(activeChangedComponents: Component[]): void {
    this._isActiveInHierarchy = true;
    const components = this._components;
    for (let i = components.length - 1; i >= 0; i--) {
      activeChangedComponents.push(components[i]);
    }
    const children = this._children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child: Entity = children[i];
      child.isActive && child._setActiveInHierarchy(activeChangedComponents);
    }
  }

  private _setInActiveInHierarchy(activeChangedComponents: Component[]): void {
    this._isActiveInHierarchy = false;
    const components = this._components;
    for (let i = components.length - 1; i >= 0; i--) {
      activeChangedComponents.push(components[i]);
    }
    const children = this._children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child: Entity = children[i];
      child.isActive && child._setInActiveInHierarchy(activeChangedComponents);
    }
  }

  private _setTransformDirty() {
    if (this.transform) {
      this.transform._parentChange();
    } else {
      for (let i = 0, len = this._children.length; i < len; i++) {
        this._children[i]._setTransformDirty();
      }
    }
  }

  //--------------------------------------------TobeConfirmed-------------------------------------------------
  /**
   * 创建子节点
   * @param {string} name 子节点的名称
   * @return {Entity} 新创建的子节点对象
   */
  public createChild(name: string): Entity {
    const child = new Entity(name, this.engine);
    child.parent = this;
    return child;
  }

  //--------------------------------------------------------------deprecated----------------------------------------------------------------
  private _inverseWorldMatFlag: UpdateFlag;

  /**
   * @deprecated
   * 本节点的位置(Local Space)
   * @member {vec3}
   */
  get position(): Vector3 {
    return this.transform.position;
  }

  set position(val: Vector3) {
    this.transform.position = val;
  }

  /**
   * @deprecated
   * 本节点的世界坐标系位置
   * @member {vec3}
   */
  get worldPosition(): Vector3 {
    return this.transform.worldPosition;
  }

  set worldPosition(val: Vector3) {
    this.transform.worldPosition = val;
  }

  /** Property: 本节点的旋转四元数(Local Space)
   * @member {quat|Array}
   */
  get rotation(): Vector4 {
    return this.transform.rotationQuaternion;
  }

  set rotation(val: Vector4) {
    this.transform.rotationQuaternion = val;
  }

  /**
   * @deprecated
   * 本节点的缩放系数(Local Space)
   * @member {vec3}
   */
  get scale(): Vector3 {
    return this.transform.scale;
  }

  set scale(val: Vector3) {
    this.transform.scale = val;
  }

  /**
   * @deprecated
   * 取得World to Local矩阵
   * @return {mat4}
   */
  public getInvModelMatrix(): Matrix4 {
    if (this._inverseWorldMatFlag.flag) {
      mat4.invert(this._invModelMatrix, this.transform.worldMatrix);
      this._inverseWorldMatFlag.flag = false;
    }
    return this._invModelMatrix;
  }
}
