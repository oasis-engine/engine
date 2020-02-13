import World from './World.js';
import AssetsLoader from './AssetsLoader.js';
import { vec3 } from '@alipay/o3-math';
import { ADirectLight } from '@alipay/o3-lighting';
import { AOrbitControls } from '@alipay/o3-orbit-controls';
import { AGeometryRenderer } from '@alipay/o3-geometry';
import { CuboidGeometry, CylinderGeometry } from '@alipay/o3-geometry-shape';
import { LambertMaterial } from '@alipay/o3-mobile-material';
import { Texture2D } from '@alipay/o3-material';
import { Node, NodeAbility } from '@alipay/o3-core';
import {
  AssetManager,
  ASpineRenderer
} from '@alipay/o3-spine';
import { spine } from '@alipay/spine-core';
import { AGPUParticleSystem } from '@alipay/o3-particle';

let assetManager;
let atlas;
let atlasLoader;

class rotate extends NodeAbility {
  update() {
    const now = Date.now() / 1000;
    this.node.setRotationAngles(0, Math.sin(now) * 180, 0);
  }
}

// const atlasFile =
// "https://gw.alipayobjects.com/os/Naya/b9db5199-3254-46a2-91b2-1759b2141b6c/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.atlas"
// const skeletonFile =
// "https://gw.alipayobjects.com/os/Naya/1fa818e4-4af4-4d70-8291-a1eb2d54db5b/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.json"
// const textureFile =
// "https://gw.alipayobjects.com/zos/Naya/e0d4fef1-9205-48a5-9e1d-9ac5f9c43959/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.png"
const atlasFile =
"https://gw.alipayobjects.com/os/Naya/ef7942c1-8159-4c2a-84f6-343218f3ab40/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.atlas"
const skeletonFile =
"https://gw.alipayobjects.com/os/Naya/ec763100-aeab-4c29-862e-8efc4897ea50/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.json"
const textureFile =
"https://gw.alipayobjects.com/zos/Naya/242f0ea2-a002-46a7-b3df-8fdbe19e20b1/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.png"

const canvas = document.getElementById('o3-demo');
const world = new World(canvas);
world.camera.createAbility(AOrbitControls, { canvas });
world.camera.position = [0, 0, 300];

const loader = new AssetsLoader();
loader.addAsset('model', {
  type: "gltf",
  url:
    "https://gw.alipayobjects.com/os/loanprod/c763bc03-2d3b-4c6a-bf3c-f6dce4571e3f/5e37c284932f32dd00533955/13261e302e3511d95065737482a53a29.gltf"
});

loader.load().then(res => {
  const nodes = res.asset.rootScene.nodes;
  const cat = new Node();
  nodes.forEach(n => {
    n.position = [0, 30, 0];
    n.scale = [50, 50, 50];
    cat.addChild(n);
  });
  cat.createAbility(rotate);
  world.addChild(cat);
  addLight();
  loadSpine();
  world.start();
});

function addLight() {
  const light = world.createChild('light');
  light.position = [3, 3, 5];
  light.setRotationAngles(30, 200, 0);
  light.createAbility(ADirectLight, {
    color: vec3.fromValues(1, 1, 1),
    intensity: 1.2,
  });
  const light2 = world.createChild('light');
  light2.position = [3, 3, -5];
  light2.createAbility(ADirectLight, {
    color: vec3.fromValues(1, 1, 1),
    intensity: 1.2,
  });
}

function loadSpine() {
  assetManager = new AssetManager();
  assetManager.loadText(skeletonFile);
  assetManager.loadTexture(textureFile);
  assetManager.loadText(atlasFile);
  requestAnimationFrame(load);
}

function load(name, scale) {
  if (assetManager.isLoadingComplete()) {
    atlas = new spine.TextureAtlas(assetManager.get(atlasFile), function(path) {
      return assetManager.get(textureFile);
    });
    atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    const skeletonJson = new spine.SkeletonJson(atlasLoader);

    skeletonJson.scale = 0.4;
    const skeletonData = skeletonJson.readSkeletonData(assetManager.get(skeletonFile));

    const skeletonNode = world.createChild("skeleton");

    const spineRenderer = skeletonNode.createAbility(ASpineRenderer, skeletonData);

    spineRenderer.state.setAnimation(0, "animation", true);

    skeletonNode.position = [-75, -60, 0];
  } else requestAnimationFrame(load);
}

function addParticle() {
  const node = world.createChild("particle");
  // 给节点绑定粒子发射器组件
  const particleComp = node.createAbility(AGPUParticleSystem);
  // 粒子发射参数
  const options = {
    position: [0, 1, 0],
    positionRandomness: [0, 0, 0],
    velocity: [0, 0, 0],
    velocityRandomness: [0.5, 0.5, 0.5],
    acceleration: [0, -0.05, 0],
    accelerationRandomness: [0, 0, 0],
    color: 0x125570,
    colorRandomness: 0.5,
    lifetime: 5,
    size:40,
    sizeRandomness: 0,
  };
  // 粒子发射器环境参数
  const config = {
    maxCount: 100,
    spawnCount: 5,
    direction: 'velocity',
    useOriginColor:false,
    options: options
  };
  particleComp.initialize(config);
  // 开始发射粒子
  particleComp.start();
}
