import { assignmentClone } from "../../clone/CloneManager";
import { Component } from "../../Component";
import { Entity } from "../../Entity";
import { SpriteMaskLayer } from "../enums/SpriteMaskLayer";
import { Sprite } from "./Sprite";

/**
 * A component for masking Sprites.
 */
export class SpriteMask extends Component {
  @assignmentClone
  private _sprite: Sprite = null;
  @assignmentClone
  private _alphaCutoff: number = 1.0;
  @assignmentClone
  private _influenceLayers: SpriteMaskLayer = SpriteMaskLayer.Everything;

  /**
   * The Sprite used to define the mask.
   */
  get sprite(): Sprite {
    return this._sprite;
  }

  set sprite(value: Sprite) {

  }

  /**
   * The minimum alpha value used by the mask to select the area of influence defined over the mask's sprite. Value between 0 and 1.
   */
  get alphaCutoff(): number {
    return this._alphaCutoff;
  }

  set alphaCutoff(value: number) {

  }

  /**
   * The mask layers the sprite mask influence to.
   */
  get influenceLayers(): number {
    return this._influenceLayers;
  }

  set influenceLayers(value: number) {

  }

  /**
   * Create a sprite mask instance.
   * @param entity - Entity to which the sprite renderer belongs
   */
  constructor(entity: Entity) {
    super(entity);
  }
}
