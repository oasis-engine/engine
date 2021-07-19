import { Ray, Vector3 } from "@oasis-engine/math";
import { Scene } from "./Scene";
import { Layer } from "./Layer";
import { ColliderFeature } from "./collider";
import { Engine } from "./Engine";
import { Collider } from "./collider/Collider";

/**
 * The result of raycast test.
 */
export class HitResult {
  /** The collider that was hit. */
  collider: Collider = null;
  /** The hit point of the collider that was hit in world space. */
  point: Vector3 = new Vector3();
  /** The hit normal of the collider that was hit in world space. */
  normal: Vector3 = new Vector3();

  public distance: number;

  constructor(distance: number = Number.MAX_VALUE) {
    this.distance = distance;
  }
}

export class PhysicManager {
  _activeScene: Scene;

  /**
   * @internal
   */
  constructor(public readonly engine: Engine) {
    this._activeScene = engine.sceneManager.activeScene;
  }

  /**
   * Casts a ray through the Scene and returns the first hit.
   * @param ray - The ray
   * @param distance - The max distance the ray should check
   * @param layerMask- Layer mask that is used to selectively ignore Colliders when casting
   * @param outHitResult - If true is returned, outHitResult will contain more detailed collision information
   * @returns Returns true if the ray intersects with a Collider, otherwise false.
   */
  raycast(ray: Ray, distance: number, layerMask: Layer = Layer.Everything, outHitResult: HitResult): Boolean {
    const cf = this._activeScene.findFeature(ColliderFeature);
    const colliders = cf.colliders;

    let nearestHit = new HitResult(distance);
    const hit = new HitResult(distance);

    for (let i = 0, len = colliders.length; i < len; i++) {
      const collider = colliders[i];
      if (!collider.entity.isActiveInHierarchy) {
        continue;
      }

      if (!(collider.entity.layer & layerMask)) {
        continue;
      }

      if (collider._raycast(ray, hit)) {
        if (hit.distance < nearestHit.distance) {
          nearestHit = hit;
        }
      }
    }

    outHitResult = nearestHit;
    return true;
  }
}
