import { AnimationClip, BufferMesh, Camera, EngineObject, Entity, Material, Skin, Texture2D } from "@oasis-engine/core";
import { IGLTF } from "./schema";

/**
 * Product after GLTF parser, usually, `defaultSceneRoot` is only needed to use.
 */
export class GLTFResource extends EngineObject {
  /** GLTF file url. */
  url: string;
  /** GLTF file content. */
  gltf: IGLTF;
  /** ArrayBuffer after BufferParser. */
  buffers: ArrayBuffer[];
  /** Oasis Texture2D after TextureParser. */
  textures?: Texture2D[];
  /** Oasis Material after MaterialParser. */
  materials?: Material[];
  /** Oasis BufferMesh after MeshParser. */
  meshes?: BufferMesh[][];
  /** Oasis Skin after SkinParser. */
  skins?: Skin[];
  /** Oasis AnimationClip after AnimationParser. */
  animations?: AnimationClip[];
  /** Oasis Entity after EntityParser. */
  entities: Entity[];
  /** Oasis Camera after SceneParser.  */
  cameras?: Camera[];
  /** Oasis RootEntities after SceneParser.  */
  sceneRoots: Entity[];
  /** Oasis RootEntity after SceneParser.  */
  defaultSceneRoot: Entity;
}