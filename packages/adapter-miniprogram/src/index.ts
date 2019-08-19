import atob from './atob';
import devicePixelRatio from './devicePixelRatio';
import document from './document';
import Element from './Element';
import Event from './Event';
import EventTarget from './EventTarget';
import HTMLCanvasElement from './HTMLCanvasElement';
import HTMLElement from './HTMLElement';
import HTMLMediaElement from './HTMLMediaElement';
import HTMLVideoElement from './HTMLVideoElement';
import Image from './Image';
import navigator from './navigator';
import Node from './Node';
import {requestAnimationFrame, cancelAnimationFrame} from './requestAnimationFrame';
import screen from './screen';
import XMLHttpRequest from './XMLHttpRequest';
import performance from './performance';

let window = {
  atob,
  devicePixelRatio,
  document,
  Element,
  Event,
  EventTarget,
  HTMLCanvasElement,
  HTMLElement,
  HTMLMediaElement,
  HTMLVideoElement,
  Image,
  navigator,
  Node,
  requestAnimationFrame,
  screen,
  XMLHttpRequest,
  performance,
  addEventListener(type, listener, options = {}) {
    document.addEventListener(type, listener, options);
  },
  removeEventListener(type, listener) {
    document.removeEventListener(type, listener);
  },
  dispatchEvent(event: Event) {
    document.dispatchEvent(event);
  },
};

export {
  window,
  atob,
  devicePixelRatio,
  document,
  Element,
  Event,
  EventTarget,
  HTMLCanvasElement,
  HTMLElement,
  HTMLMediaElement,
  HTMLVideoElement,
  Image,
  navigator,
  Node,
  requestAnimationFrame,
  cancelAnimationFrame,
  screen,
  XMLHttpRequest,
  performance,
}

export {
  registerCanvas,
} from './register';

export * from './EventIniter/index';
