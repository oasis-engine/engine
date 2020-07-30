import { Event, EventDispatcher, Time } from "@alipay/o3-base";
import { ResourceManager } from "./AssetDesign/ResourceManager";
import { Canvas } from "./EngineDesign/Canvas";
import { HardwareRenderer } from "./EngineDesign/HardwareRenderer";
import { EngineFeature } from "./EngineFeature";
import { FeatureManager } from "./FeatureManager";
import { Scene } from "./Scene";
import { SceneManager } from "./SceneManager";

/** todo: delete */
const engineFeatureManager = new FeatureManager<EngineFeature>();

/**
 * 引擎。
 */
export class Engine extends EventDispatcher {
  /**
   * 当前创建对象所属的默认引擎对象。
   */
  static defaultCreateObjectEngine: Engine = null;

  static _lastCreateEngine: Engine = null;
  static _instanceIDCounter: number = 0;

  static _getDefaultEngine(): Engine {
    return Engine.defaultCreateObjectEngine || Engine._lastCreateEngine;
  }

  _hardwareRenderer: HardwareRenderer;

  private _canvas: Canvas;
  private _resourceManager: ResourceManager = new ResourceManager();
  private _sceneManager: SceneManager = new SceneManager();
  private _vSyncCount: number = 1;
  private _targetFrameRate: number = 60;
  private _time: Time = new Time();
  private _paused: boolean = true;
  private _requestId: number;
  private _timeoutId: number;
  private _loopCounter: number = 0;
  private _interval: number = 1000 / 60;

  /**
   * @internal
   */
  private _animate = () => {
    if (this._vSyncCount) {
      if (this._loopCounter++ % this._vSyncCount === 0) {
        this._tick();
        this._loopCounter = 0;
      }
      this._requestId = requestAnimationFrame(this._animate);
    } else {
      this._tick();
      this._timeoutId = window.setTimeout(this._animate, this._interval);
    }
  };

  /**
   * 渲染画布。
   */
  get canvas(): Canvas {
    return this._canvas;
  }

  /**
   * 资源管理器。
   */
  get resourceManager(): ResourceManager {
    return this._resourceManager;
  }

  /**
   * 场景管理器。
   */
  get sceneManager(): SceneManager {
    return this._sceneManager;
  }

  /**
   * 计时器。
   */
  get time(): Time {
    return this._time;
  }

  /**
   * 是否暂停。
   */
  get isPaused(): boolean {
    return this._paused;
  }

  /**
   * 垂直同步数量,表示执行一帧的垂直消隐数量,0表示关闭垂直同步。
   */
  get vSyncCount(): number {
    return this._vSyncCount;
  }

  set vSyncCount(value: number) {
    this._vSyncCount = Math.max(0, Math.floor(value));
  }

  /**
   * 目标帧率,vSyncCount = 0（即关闭垂直同步） 时生效。
   * 值越大，目标帧率越高。 Number.POSITIVE_INFINIT 表示无穷大目标帧率
   */
  get targetFrameRate(): number {
    return this._targetFrameRate;
  }

  set targetFrameRate(value: number) {
    value = Math.max(0.000001, value);
    this._targetFrameRate = value;
    this._interval = 1000 / value;
  }

  /**
   * 创建引擎。
   * @param canvas - 渲染画布
   * @param hardwareRenderer - 渲染器
   */
  constructor(canvas: Canvas, hardwareRenderer: HardwareRenderer) {
    super();
    // 加入 Feature 管理
    engineFeatureManager.addObject(this);
    this._sceneManager.activeScene = new Scene("", this);
    this._hardwareRenderer = hardwareRenderer;
    this._hardwareRenderer.init(canvas);
    this._canvas = canvas;
    Engine._lastCreateEngine = this;
  }

  /**
   * 暂停引擎循环。
   */
  pause(): void {
    this._paused = true;
    cancelAnimationFrame(this._requestId);
    clearTimeout(this._timeoutId);
  }

  /**
   * 恢复引擎循环。
   */
  resume(): void {
    if (!this._paused) return;
    this._paused = false;

    this._animate();
  }

  /**
   * 执行引擎循环。
   */
  run(): void {
    //  todo: delete
    engineFeatureManager.callFeatureMethod(this, "preLoad", [this]);
    this.resume();
    this.trigger(new Event("run", this));
  }

  /**
   * 销毁引擎。
   */
  destroy(): void {
    // -- event
    this.trigger(new Event("shutdown", this));
    engineFeatureManager.callFeatureMethod(this, "shutdown", [this]);

    // -- cancel animation
    this.pause();

    this._animate = null;

    this._sceneManager._scene.destroy();
    this._sceneManager = null;
    this._resourceManager.gc();
    this._resourceManager = null;

    this._canvas = null;

    this.features = [];
    this._time = null;

    // todo: delete
    (engineFeatureManager as any)._objects = [];
  }

  /**
   * @internal
   */
  private _tick(): void {
    const time = this._time;
    time.tick();
    const deltaTime = time.deltaTime;
    engineFeatureManager.callFeatureMethod(this, "preTick", [this, this._sceneManager._scene]);

    this._hardwareRenderer.beginFrame();

    const scene = this._sceneManager._scene;
    if (scene) {
      scene.update(deltaTime);
      scene.render();
      scene._componentsManager.callComponentDestory();
    }

    this._hardwareRenderer.endFrame();

    engineFeatureManager.callFeatureMethod(this, "postTick", [this, this._sceneManager._scene]);
  }

  //-----------------------------------------@deprecated-----------------------------------

  findFeature(Feature) {
    return engineFeatureManager.findFeature(this, Feature);
  }

  static registerFeature(Feature: new () => EngineFeature): void {
    engineFeatureManager.registerFeature(Feature);
  }

  features: EngineFeature[] = [];
}
